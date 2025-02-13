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


# ✅ PostgreSQL 연결 설정
DB_URI = os.getenv("DATABASE_URL")
db = SQLDatabase.from_uri(DB_URI)



# ✅ PostgreSQL용 SQL 실행 도구 정의
@tool
def list_tables_tool() -> str:
    """환자정보에 대한 질문을 할때 데이터베이스의 모든 테이블 목록을 반환"""
    return str(db.get_usable_table_names())

@tool
def get_schema_tool(table_name: str) -> str:
    """특정 테이블의 스키마(DDL)를 반환"""
    return db.get_table_info([table_name])

@tool
def db_query_tool(query: str) -> str:
    """PostgreSQL 데이터베이스에서 SQL 쿼리를 실행하고 결과 반환"""
    try:
        result = db.run(query)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"



    # Research Agent 생성
sql_agent = create_react_agent(ChatOpenAI(model="gpt-4o-mini"), tools=[list_tables_tool, get_schema_tool, db_query_tool])

# research node 생성
sql_node = functools.partial(agent_node, agent=sql_agent, name="SQLagent")

# sql_node(
#     {
#         "messages": [
#             HumanMessage(content="환자정보에서 유동원의 주소 알려주세요.")
#         ]
#     }
# )
