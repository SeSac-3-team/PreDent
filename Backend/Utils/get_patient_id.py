import os
import psycopg2
from dotenv import load_dotenv
from PreDent.Frontend.src.pages.InfoFormPage.jsx import name

load_dotenv()

# ✅ PostgreSQL 연결 설정
DB_URI = os.getenv("DATABASE_URL")

# ✅ 특정 patname에 해당하는 patid 가져오기
def get_patient_id(patname):
    try:
        conn = psycopg2.connect(DB_URI)
        cursor = conn.cursor()
        query = "SELECT patid FROM patient WHERE patname = %s;"
        cursor.execute(query, (patname,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result[0] if result else None
    except Exception as e:
        print(f"Database error: {e}")
        return None

# 예제 실행
patid = get_patient_id("유동원")
print(patid)


print(name)