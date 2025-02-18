
import functools
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain import hub


from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_teddynote import logging
from Utils.store_vectors_Db import vectorstore

# 환경 변수 로드
load_dotenv(dotenv_path="myapp/.env")

logging.langsmith("LangGraph")

# 벡터 검색 기능 정의
@tool
def search_vectorstore(query: str):
    """치과 정보를 검색하는 벡터스토어 검색 도구"""
    retriever = vectorstore.as_retriever()
    results = retriever.get_relevant_documents(query)
    return results

code_system_prompt =  "치과 정보를 검색하는 벡터스토어 검색 도구"


# RAG Agent 생성
rag_agent = create_react_agent(ChatOpenAI(model="gpt-4o"), tools=[search_vectorstore],prompt=code_system_prompt)

