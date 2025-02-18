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
    대화 흐름을 고려하여 
    전반적인 치과 상담과 이빨, 치아에 관련된 질문에 대해서 답변하며 , 
    관련 없는 질문이 들어온다면 치과 상담에 기반하여 답변을 해주세요.
"""

# LLM 모델 생성 (temperature 조절 추가)
chat_model = ChatOpenAI(model="gpt-4o", temperature=1.0)  # temperature 값을 1.0로 설정 (유연한 응답)

# Research Agent 생성
chat_agent = create_react_agent(
    chat_model,
    tools=[],
    prompt=code_system_prompt,
)

