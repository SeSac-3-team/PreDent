
import functools
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from Utils.agent_node import agent_node
from langchain_teddynote import logging
from Utils.store_vectors_Db import vectorstore

# 환경 변수 로드
load_dotenv()

logging.langsmith("LangGraph")

# 벡터 검색 기능 정의
@tool
def search_vectorstore(query: str):
    """치과 진료비 정보를 검색하는 벡터스토어 검색 도구"""
    retriever = vectorstore.as_retriever()
    results = retriever.get_relevant_documents(query)
    return results

code_system_prompt = """
치과 진료비에 대한 질문을 할떄 반환
"""

# RAG Agent 생성
rag_agent = create_react_agent(ChatOpenAI(model="gpt-4o-mini"), tools=[search_vectorstore],state_modifier=code_system_prompt,
)

rag_node = functools.partial(agent_node, agent=rag_agent, name="RAGagent")

# # 검색 요청 실행
# rag_node(
#     {
#         "messages": [
#             HumanMessage(content="RAG 검색을 수행하여 임플란트 진료비 알려주세요.")
#         ]
#     }
# )
