from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_teddynote import logging
from langchain_community.utilities import SQLDatabase
from langchain_core.tools import tool
from Utils.agent_node import agent_node

import os
import functools
from langgraph.prebuilt import create_react_agent


load_dotenv()
logging.langsmith("LangGraph")


code_system_prompt = """
    당신은 유저의 일반적인 질문에 대해 답변을 제공하는 AI 챗봇입니다.
"""


    # Research Agent 생성
chat_agent = create_react_agent(ChatOpenAI(model="gpt-4o-mini"),tools=[],state_modifier=code_system_prompt,)

# research node 생성
chat_node = functools.partial(agent_node, agent=chat_agent, name="CHATagent")