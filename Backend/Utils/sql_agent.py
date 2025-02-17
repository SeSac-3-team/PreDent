from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_teddynote import logging
from langchain_community.utilities import SQLDatabase
from langchain_core.tools import tool

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
    """환자정보에 대한 질문을 할때 데이터베이스의 테이블 반환"""
    return db.get_usable_table_names()  # 전체 테이블 목록을 가져옵니다.


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
    
code_system_prompt = """
사용자의 질문에 SQL 쿼리를 활용하여 답변하세요.
"""

    # Research Agent 생성
sql_agent = create_react_agent(ChatOpenAI(model="gpt-4o"), tools=[list_tables_tool, get_schema_tool, db_query_tool],
                                state_modifier=code_system_prompt,)


