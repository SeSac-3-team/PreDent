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
from typing import Dict, Any
import asyncio

from Utils.sql_agent import sql_node
from Utils.rag_agent import rag_node
from Utils.chat_agent import chat_node  # ✅ 일반적인 질문에 답변하는 Agent 추가

# ✅ Load environment variables
import os
from dotenv import load_dotenv
load_dotenv()

# ✅ Initialize memory checkpointing
from langchain_teddynote import logging
from langchain_teddynote.graphs import visualize_graph
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import Graph

logging.langsmith("LangGraph")

DB_URI = os.getenv("DATABASE_URL")

# ✅ PostgreSQL 기반 체크포인트 저장소 초기화
async def get_checkpointer():
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        return checkpointer

# ✅ 데이터 정리 함수 (오래된 체크포인트 삭제)
async def cleanup_old_checkpoints():
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        async with checkpointer.conn.cursor() as cursor:
            await cursor.execute("""
                WITH RankedCheckpoints AS (
    SELECT 
        checkpoint_id,
        ROW_NUMBER() OVER (
            ORDER BY checkpoint_ns DESC, checkpoint_id DESC
        ) AS rn
    FROM public.checkpoints
)
DELETE FROM public.checkpoints
USING RankedCheckpoints
WHERE public.checkpoints.checkpoint_id = RankedCheckpoints.checkpoint_id
AND RankedCheckpoints.rn > 30;
            """)

# 상태 정의
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]  # 메시지
    next: str  # 다음으로 라우팅할 에이전트

# ✅ 멤버 Agent 목록 정의
members = ["SQLagent", "RAGagent","CHATagent" ]
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
    " - If the request is a general inquiry, choose CHATagent."
    " You must select at least one agent before finishing."
)

# ✅ ChatPromptTemplate 생성
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        (
            "system",
            "Given the conversation above, who should act next? "
            "Or should we FINISH? Select one of: {options}. After at least one agent has acted, you may select FINISH.",
        ),
    ]
).partial(options=str(options_for_next), members=", ".join(members))

# ✅ LLM Initialization
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Supervisor Agent 생성
def supervisor_agent(state):
    supervisor_chain = prompt | llm.with_structured_output(RouteResponse)
    response = supervisor_chain.invoke(state)
    return response

# ✅ LangGraph Workflow 생성
workflow = StateGraph(AgentState)

# ✅ Define Nodes
workflow.add_node("SQLagent", sql_node)
workflow.add_node("RAGagent", rag_node)
workflow.add_node("CHATagent", chat_node)  # ✅ 일반적인 질문을 위한 Agent 추가
workflow.add_node("Supervisor", supervisor_agent)

# ✅ Agent → Supervisor 이동
for member in members:
    if member != "CHATagent":
        workflow.add_edge(member, "Supervisor")

conditional_map = {k: k for k in members}
conditional_map["FINISH"] = END

def get_next(state):
    next_agent = state["next"]
    if next_agent == "FINISH" and not state.get("executed_agents", []):
        return "CHATagent"
    return next_agent

workflow.add_conditional_edges("Supervisor", get_next, conditional_map)
workflow.add_edge(START, "Supervisor")
workflow.add_edge("CHATagent", END)

# ✅ 그래프 컴파일 (PostgreSQL 체크포인트 적용)
async def compile_graph():
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        return workflow.compile(checkpointer=checkpointer)

# ✅ 실행 함수 (Supervisor 호출)
async def agent_response(input_string: str):
    await cleanup_old_checkpoints()  # ✅ 실행 전 오래된 체크포인트 정리
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        graph = workflow.compile(checkpointer=checkpointer)
        img_data = graph.get_graph().draw_mermaid_png()
        with open("mermaid_graph.png", "wb") as f:
            f.write(img_data)
        thread_id = str(1115)
        config = RunnableConfig(recursion_limit=10, configurable={"thread_id": thread_id})
        response = ""
        checkpoint_tuples = []
        async for result in graph.astream({"messages": [HumanMessage(content=input_string)], "executed_agents": []}, config=config):
            human_messages = [msg for node in result.values() for msg in node.get("messages", []) if isinstance(msg, HumanMessage)]
            if human_messages:
                response = human_messages[-1].content
            checkpoint_tuples.extend([c async for c in checkpointer.alist(config)])
        # print("Checkpoint Tuples:", checkpoint_tuples)
        return response
