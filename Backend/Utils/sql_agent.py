from click import prompt
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_teddynote import logging
from langchain_community.utilities import SQLDatabase
from langchain_core.tools import tool

import os
from langgraph.prebuilt import create_react_agent

load_dotenv(dotenv_path="myapp/.env")
logging.langsmith("LangGraph")

# ✅ PostgreSQL 연결 설정
DB_URI = os.getenv("DATABASE_URL")
db = SQLDatabase.from_uri(DB_URI)

# 허용된 patid (예: 로그인한 사용자에 따른 값)


@tool
def list_tables_tool() -> str:
    """환자정보에 대한 질문을 할때 데이터베이스의 테이블 반환"""
    return db.get_usable_table_names()  # 전체 테이블 목록을 가져옵니다.

@tool
def get_schema_tool(table_name: str) -> str:
    """특정 테이블의 스키마(DDL)를 반환"""
    return db.get_table_info([table_name])

@tool
def db_query_tool(query: str,patid: str) -> str:
    """
    PostgreSQL 데이터베이스에서 SQL 쿼리를 실행하고 결과 반환.
    이 도구는 사용자가 patid({patid}) 외의 데이터에 접근하지 못하도록 합니다.
    """

    
    # SQL 쿼리를 소문자로 변환하여 간단히 검사합니다.
    lower_query = query.lower().strip()

    # SELECT, UPDATE, DELETE 등 환자 데이터에 접근할 수 있는 쿼리의 경우 patid 조건 확인
    if lower_query.startswith(("select", "update", "delete", "insert")):
        # patid 컬럼이 언급된 경우: 올바른 patid 조건이 포함되어 있는지 확인합니다.
        if "patid" in lower_query:
            # 간단한 문자열 검색으로 ALLOWED_PATID 조건이 포함되었는지 체크합니다.
            if f"patid = {patid}" not in query and f"patid={patid}" not in lower_query:
                return (
                    f"Error: 허용되지 않은 patid 데이터에 접근하려고 시도하였습니다. "
                    f"사용 가능한 patid는 {patid} 입니다."
                )
        else:
            # patid 조건이 없으면 모든 환자 데이터를 조회할 위험이 있으므로 차단합니다.
            return (
                f"Error: 환자 데이터를 조회할 때는 반드시 patid 조건을 명시해야 합니다. "
                f"사용 가능한 patid는 {patid} 입니다."
            )

    try:
        result = db.run(query)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"

code_system_prompt = """
사용자의 질문에 SQL 쿼리를 활용하여 답변하세요.
단, 사용자 본인의 patid({patid}) 외의 데이터에는 접근하지 않도록 patid 조건을 반드시 포함해야 합니다.
"""

# Research Agent 생성
sql_agent = create_react_agent(
    ChatOpenAI(model="gpt-4o"),
    tools=[list_tables_tool, get_schema_tool, db_query_tool],
    prompt=code_system_prompt,
)
