from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import BaseMessage
import operator
from typing import Sequence, Annotated, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_teddynote.messages import random_uuid

from Utils.sql_agent import sql_node
from Utils.rag_agent import rag_node
from Utils.chat_agent import chat_node

# ✅ Load environment variables
import os
from dotenv import load_dotenv
load_dotenv()

# ✅ Initialize memory checkpointing
from langchain_teddynote import logging
from langchain_teddynote.graphs import visualize_graph
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

logging.langsmith("LangGraph")

DB_URI = os.getenv("DATABASE_URL")

# ✅ PostgreSQL 기반 체크포인트 저장소 초기화
async def get_checkpointer():
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        return checkpointer

# 상태 정의
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]  # 메시지
    next: str  # 다음으로 라우팅할 에이전트

# ✅ 멤버 Agent 목록 정의
members = ["SQLagent", "RAGagent", "CHATagent"]
options_for_next = ["FINISH"] + members  # FINISH 포함

# ✅ Supervisor의 응답 모델 (RouteResponse)
class RouteResponse(BaseModel):
    
    next: Literal[*options_for_next]  # 다음 실행할 Agent

# ✅ Define system prompt
system_prompt = (
    "You are a supervisor tasked with managing a conversation between the"
    " following workers: {members}. Given the following user request,"
    " classify the intent as one of the following:"
    " - If the request is related to patient information, choose SQLagent."
    " - If the request is related to cost, choose RAGagent."
    " - If the request requires retrieving patient information before answering a cost-related question, first choose SQLagent, then choose RAGagent."
    " When finished, respond with FINISH."
)

# ✅ ChatPromptTemplate 생성
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        (
            "system",
            "Given the conversation above, who should act next? "
            "Or should we FINISH? Select one of: {options}",
        ),
    ]
).partial(options=str(options_for_next), members=", ".join(members))

# ✅ LLM Initialization
llm = ChatOpenAI(model="gpt-4o", temperature=0)


# Supervisor Agent 생성
def supervisor_agent(state):

    # 프롬프트와 LLM을 결합하여 체인 구성
    supervisor_chain = prompt | llm.with_structured_output(RouteResponse)
    # Agent 호출
    return supervisor_chain.invoke(state)

# ✅ LangGraph Workflow 생성
workflow = StateGraph(AgentState)

# ✅ Define Nodes
workflow.add_node("SQLagent", sql_node)
workflow.add_node("RAGagent", rag_node)
workflow.add_node("CHATagent", chat_node)
workflow.add_node("Supervisor", supervisor_agent)

# ✅ Agent → Supervisor 이동
for member in members:
    workflow.add_edge(member, "Supervisor")

# ✅ Supervisor가 조건에 따라 다음 Agent 선택
conditional_map = {k: k for k in members}
conditional_map["FINISH"] = END


def get_next(state):
    return state["next"]

# ✅ Supervisor → 다음 Agent (조건부 경로 설정)
workflow.add_conditional_edges("Supervisor", get_next, conditional_map)


# ✅ 시작점 설정
workflow.add_edge(START, "Supervisor")

# ✅ 그래프 컴파일 (PostgreSQL 체크포인트 적용)
async def compile_graph():
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        return workflow.compile(checkpointer=checkpointer)

# ✅ 실행 함수 (Supervisor 호출)
async def agent_response(input_string: str):
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        graph = workflow.compile(checkpointer=checkpointer)
    
        thread_id = str(6)  # thread_id를 문자열로 변환

        config = RunnableConfig(recursion_limit=10, configurable={"thread_id": thread_id})
        response = ""

        async for result in graph.astream({"messages": [HumanMessage(content=input_string)], "executed_agents": []}, config=config):
            human_messages = [msg for node in result.values() for msg in node.get("messages", []) if isinstance(msg, HumanMessage)]
            if human_messages:
                response = human_messages[-1].content  # 최종 응답 저장

        return response