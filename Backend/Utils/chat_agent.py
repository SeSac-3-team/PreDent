from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_teddynote import logging
from langchain_community.utilities import SQLDatabase
from langchain_core.tools import tool
from Utils.agent_node import agent_node

import os
import functools
from langgraph.prebuilt import create_react_agent


load_dotenv(dotenv_path="myapp/.env")
logging.langsmith("LangGraph")


code_system_prompt = """
    당신은 친절한 AI 챗봇입니다.
"""


    # Research Agent 생성
chat_agent = create_react_agent(ChatOpenAI(model="gpt-4o-mini"),tools=[],state_modifier=code_system_prompt,)

# research node 생성
chat_node = functools.partial(agent_node, agent=chat_agent, name="CHATagent")