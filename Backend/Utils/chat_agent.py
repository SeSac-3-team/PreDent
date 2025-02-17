from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_teddynote import logging
from langchain_core.tools import tool

import os
import functools
from langgraph.prebuilt import create_react_agent

load_dotenv(dotenv_path="myapp/.env")
logging.langsmith("LangGraph")

code_system_prompt = """
    당신은 친절한 AI 챗봇입니다.
    {patname}가 인사를 하면 친절하게 응답하세요.
    그러나 치과 상담에 관련된 질문에 대해서만 답변해야 하며, 
    치과 상담과 관련 없는 질문에 대해서는 "알 수 없는 질문입니다"라고 응답하세요.
"""

# LLM 모델 생성 (temperature 조절 추가)
chat_model = ChatOpenAI(model="gpt-4o-mini", temperature=1.0)  # temperature 값을 1.0로 설정 (엄격한 응답)

# Research Agent 생성
chat_agent = create_react_agent(
    chat_model,
    tools=[],
    prompt=code_system_prompt,
)

