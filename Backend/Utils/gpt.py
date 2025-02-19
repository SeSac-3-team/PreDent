from typing import Literal, Sequence
from urllib import response
from typing_extensions import TypedDict

import os
from dotenv import load_dotenv

from langgraph.graph import MessagesState, END
from langgraph.types import Command 
from langchain_core.messages import SystemMessage, RemoveMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import MessagesState, StateGraph, START, END
from langchain_core.messages import HumanMessage
import psycopg

from langchain_openai import ChatOpenAI

from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver


from Utils.sql_agent import sql_agent
from Utils.rag_agent import rag_agent
from Utils.chat_agent import chat_agent

# memory = MemorySaver()
load_dotenv(dotenv_path="myapp/.env")

DB_URI = os.getenv("DATABASE_URL")
# We will add a `summary` attribute (in addition to `messages` key,
# which MessagesState already has)
class State(MessagesState):
    summary: str
    next: str
    excuted_agents: Sequence[str]
    patid: str  # 사용자 고유 식별자 추가

connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
}

pool = ConnectionPool(
    conninfo=DB_URI,
    max_size=20,
    kwargs=connection_kwargs,
)

checkpointer = PostgresSaver(pool)
try:
    checkpointer.setup()
except psycopg.errors.DuplicateColumn:
    print("task_path 컬럼이 이미 존재합니다. 마이그레이션을 건너뜁니다.")

# We will use this model for both the conversation and the summarization
model = ChatOpenAI(model="gpt-3.5-turbo")
supervisor_model = ChatOpenAI(model="gpt-4o", temperature=0)


members = ["SQLnode", "RAGnode","CHATnode"]
options = members + ["FINISH"]

system_prompt = ("""
You are a supervisor tasked with managing a conversation between the following workers: {members}.  
Your role is to determine which worker should act next based on the user request.  
Each worker will perform a task and respond with their results and status.  

**Agent Selection Criteria:**  
- If the request involves **사전문진 (pre-consultation) or 예약 (reservation)** → Assign **SQLnode**.  
- If the request involves **비용 (costs)** → Assign **RAGnode**.  
- If the request involves **dental information or general inquiries** → Assign **CHATnode**.  

**Additional Rules:**  
- If the request requires **multiple agents**, assign the most relevant agent first and wait for their response before assigning another.  
- Once all necessary tasks are completed, respond with **FINISH**.  
"""

)

class Router(TypedDict):
    """Worker to route to next. If no workers needed, route to FINISH."""

    next: Literal[*options]

def supervisor_node(state: State) -> Command[Literal[*members, "__end__"]]:
    messages = [
        {"role": "system", "content": system_prompt},
    ] + state["messages"]

    response = supervisor_model.with_structured_output(Router).invoke(messages)
    goto = response["next"]

    executed = state.get("excuted_agents", [])

    # 이미 실행된 에이전트(goto)가 있으면 FINISH로 보냄
    if goto in executed:
        goto = "FINISH"

    if goto == "FINISH":
        # 아직 아무 에이전트도 실행되지 않은 경우에는 CHATnode로 가도록 처리
        if not executed:
            goto = "CHATnode"
        else:
            goto = END

    return Command(goto=goto, update={"next": goto})


def sql_node(state: State) -> Command[Literal["supervisor"]]:
    
    result = sql_agent.invoke(state)
    return Command(
        update={
            "messages": [
                HumanMessage(content=result["messages"][-1].content, name="SQLnode")
            ],
            "excuted_agents": state.get("excuted_agents", []) + ["SQLnode"]
        },
        goto="supervisor",
    )

def rag_node(state: State) -> Command[Literal["supervisor"]]:
    result = rag_agent.invoke(state)
    return Command(
        update={
            "messages": [
                HumanMessage(content=result["messages"][-1].content, name="RAGnode")
            ],
            "excuted_agents": state.get("excuted_agents", []) + ["RAGnode"]
        },
        goto="supervisor",
    )

def chat_node(state: State) -> Command[Literal[END]]:
    result = chat_agent.invoke(state)
    return Command(
        update={
            "messages": [
                HumanMessage(content=result["messages"][-1].content, name="CHATnode")
            ],
            "excuted_agents": state.get("excuted_agents", []) + ["CHATnode"]
        },
        goto=END,
    )

def summarize_conversation(state: State):
    """
    대화 상태를 확인하여 메시지 수가 6개를 초과하면 대화를 요약하고,
    그렇지 않으면 END를 반환합니다.
    """
    messages = state["messages"]

    # 메시지가 6개보다 많으면 대화를 요약합니다.
    if len(messages) > 6:
        # 기존 요약이 있는지 확인합니다.
        summary = state.get("summary", "")
        if summary:
            # If a summary already exists, we use a different system prompt
            # to summarize it than if one didn't
            summary_message = (
                f"This is summary of the conversation to date: {summary}\n\n"
                "Extend the summary by taking into account the new messages above:"
            )
        else:
            summary_message = "Create a summary of the conversation above:"

        messages = state["messages"] + [HumanMessage(content=summary_message)]
        response = model.invoke(messages)
        # We now need to delete messages that we no longer want to show up
        # I will delete all but the last two messages, but you can change this
        delete_messages = [RemoveMessage(id=m.id) for m in state["messages"][:-2]]
        return {"summary": response.content, "messages": delete_messages}
        
    # 메시지가 6개 이하이면 종료합니다.
    return {"messages": messages}

def patient_lookup_node(state: State):
    """
    patid를 사용하여 public.patient 테이블에서 patname, patpurpose를 조회하고,
    patpurpose가 '치료'인 경우에만 public.medicert 테이블에서 predicted_disease를 조회한 후,
    결과 메시지를 생성하여 supervisor 노드로 전달합니다.
    """
    patid = state["patid"]
    query_patient = "SELECT patname, patpurpose FROM public.patient WHERE patid = %s"
    query_medicert = "SELECT predicted_disease FROM public.medicert WHERE patid = %s"
    patname = "Unknown"            # 기본값
    patpurpose = "Unknown"         # 기본값
    predicted_disease = "Unknown"  # 기본값

    # 데이터베이스 연결 풀(pool)을 사용하여 쿼리 실행
    with pool.connection() as conn:
        with conn.cursor() as cur:
            # 환자 정보 조회
            cur.execute(query_patient, (patid,))
            row = cur.fetchone()
            if row:
                patname, patpurpose = row

                # patpurpose가 '치료'인 경우에만 예측된 질병 조회
                if patpurpose == "치료":
                    cur.execute(query_medicert, (patid,))
                    med_row = cur.fetchone()
                    if med_row:
                        predicted_disease = med_row[0]
                    else:
                        predicted_disease = "No prediction"
                else:
                    predicted_disease = "Not applicable"

    # 조회된 정보를 메시지로 작성합니다.
    message = HumanMessage(
        content=f"patid: {patid}\npatname: {patname}\npatpurpose: {patpurpose}\npredicted_disease: {predicted_disease}",
        name="PatientLookupNode"
    )
    return Command(
        update={
            "messages": [message],
        },
    )

# Define a new graph
workflow = StateGraph(State)

# Define the conversation node and the summarize node
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("SQLnode", sql_node)
workflow.add_node("RAGnode", rag_node)
workflow.add_node("CHATnode", chat_node)

workflow.add_node("summarize_conversation", summarize_conversation)
workflow.add_node("PatientLookupNode", patient_lookup_node)


# Set the entrypoint as conversation
workflow.add_edge(START, "summarize_conversation")

# We now add a conditional edge

workflow.add_edge( "summarize_conversation", "PatientLookupNode")
workflow.add_edge( "PatientLookupNode", "supervisor")

# Finally, we compile it!
app = workflow.compile(checkpointer=checkpointer)

def print_update(update):
    for k, v in update.items():
        # 'messages' 키가 있으면 해당 메시지들을 출력합니다.
        for m in v.get("messages", []):
            m.pretty_print()
        # 'summary' 키가 있으면 출력합니다.
        if "summary" in v:
            print(v["summary"])

img_data = app.get_graph().draw_mermaid_png()
# PNG 파일로 저장
with open("mermaid_graph.png", "wb") as f:
    f.write(img_data)

def agent_response(input_string, patid):
    """
    patid(환자 식별자)와 유저 입력을 받아서
    1) 대화 메시지에 추가
    2) StateGraph(app)를 stream_mode='updates'로 실행
    3) 최종 메시지(가장 마지막 메시지)를 리턴
    """

    config = {"configurable": {"thread_id": str(patid)}}

    input_message = HumanMessage(content=input_string)
    input_message.pretty_print()

    for event in app.stream({"messages": [input_message],"excuted_agents":[],"patid": str(patid)}, config, stream_mode="updates"):
        print_update(event)

    messages = app.get_state(config).values["messages"]

    # 메시지 목록 반환
    for message in messages:
        message.pretty_print()
    
    return message.content
