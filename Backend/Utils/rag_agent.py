import functools
from unittest import result
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain import hub

from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_teddynote import logging
from Utils.store_vectors_Db import vectorstore
from langchain_teddynote.tools.tavily import TavilySearch


# 환경 변수 로드
load_dotenv(dotenv_path="myapp/.env")

logging.langsmith("LangGraph")

# 벡터 검색 기능 정의
@tool
def search_vectorstore(query: str):
    """치과 비용 정보를 검색하는 벡터스토어 검색 도구"""
    retriever = vectorstore.as_retriever(search_kwargs={'k': 3})
    # Deprecated된 get_relevant_documents 대신 invoke 메서드 사용   
    results = retriever.invoke(query)
    return results

@tool
def web_search(query:str):
    """치과 비용 정보를 검색하는 웹 검색 도구"""
    tavily_tool = TavilySearch(max_results=5)
    results = tavily_tool.invoke(query)
    return results


code_system_prompt = """
{search_vectorstore}를 사용해 진료비를 검색합니다. 
{search_vectorstore}에서 찾을 수 없는 경우에만 {web_search}에서 검색하여 답변합니다.
"""

# RAG Agent 생성
rag_agent = create_react_agent(ChatOpenAI(model="gpt-4o"), tools=[search_vectorstore,web_search], prompt=code_system_prompt)
