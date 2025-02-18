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

from langchain_openai import ChatOpenAI

from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver


from Utils.sql_agent import sql_agent
from Utils.rag_agent import rag_agent
from Utils.chat_agent import chat_agent

patid = 54
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
checkpointer.setup()

# We will use this model for both the conversation and the summarization
model = ChatOpenAI(model="gpt-4o-mini")
supervisor_model = ChatOpenAI(model="gpt-4o", temperature=0)


members = ["SQLnode", "RAGnode","CHATnode"]
options = members + ["FINISH"]

system_prompt = (
    "You are a supervisor tasked with managing a conversation between the"
    f" following workers: {members}. Given the following user request,"
    " respond with the worker to act next. Each worker will perform a"
    " task and respond with their results and status."
    " - If the request is related to patient information, choose SQLagent."
    " - If the request pertains to dental information, such as clinic details, treatment costs, or materials, select RAGagent."    
    " - If the request requires retrieving patient information before answering a cost-related question, first choose SQLagent, then choose RAGagent."
    " - If the request is a general inquiry, choose CHATagent."
    " When finished, respond with FINISH."
)

class Router(TypedDict):
    """Worker to route to next. If no workers needed, route to FINISH."""

    next: Literal[*options]

def supervisor_node(state: State) -> Command[Literal[*members, "__end__"]]:

    messages = [
        {"role": "system", "content":  system_prompt},
    ] + state["messages"]

    response = supervisor_model.with_structured_output(Router).invoke(messages)
    goto = response["next"]

    if goto == "FINISH" and not state.get("excuted_agents",[]):
        goto = "CHATnode"
    elif goto == "FINISH":
        goto = END

    return Command(goto=goto, update={"next": goto})

def sql_node(state: State) -> Command[Literal["supervisor"]]:
    
    result = sql_agent.invoke(state)
    return Command(
        update={
            "messages": [
                HumanMessage(content=result["messages"][-1].content, name="SQLnode")
            ],
            "excuted_agents": state.get("excuted_agents", []) + [str(sql_node)]
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
            "excuted_agents": state.get("excuted_agents", []) + [str(rag_node)]
        },
        goto="supervisor",
    )

def chat_node(state: State) -> Command[Literal[END]]:
    result = chat_agent.invoke(state)
    return Command(
        update={
            "messages": [
                HumanMessage(content=result["messages"][-1].content, name="CHATnode")
            ]
            
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
    patid를 사용하여 public.patient 테이블에서 patname을 조회한 후,
    결과 메시지를 생성하여 supervisor 노드로 전달합니다.
    """
    patid = state["patid"]
    query = "SELECT patname FROM public.patient WHERE patid = %s"
    patname = "Unknown"  # 조회 결과가 없을 경우 기본값

    # 데이터베이스 연결 풀(pool)을 사용하여 쿼리 실행
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (patid,))
            row = cur.fetchone()
            if row:
                patname = row[0]

    # 조회된 환자 이름을 메시지로 작성합니다.
    message = HumanMessage(content=f"Patient ID: {patid}\nPatient Name: {patname}", name="PatientLookupNode")
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

def agent_response(input_string):
    
    
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