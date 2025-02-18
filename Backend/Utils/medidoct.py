from django.db import connection
from django.utils import timezone

def fetch_today_medicerts():
    """
    오늘 날짜에 해당하는 사전 문진 기록 중, 사이드바에 표시할 최소 정보만 DB에서 가져옵니다.
    """
    today = timezone.now().date()
    with connection.cursor() as cursor:
        query = """
            SELECT 
                m.mecid,
                p.patname,
                p.patgend
            FROM medicert m
            JOIN patient p ON m.patid = p.patid
            WHERE DATE(m.created) = %s
        """
        cursor.execute(query, [today])
        rows = cursor.fetchall()

    records = []
    for row in rows:
        records.append({
            "mecid": row[0],
            "patient": {
                "patname": row[1],
                "patgend": row[2],
            }
        })
    return records

def fetch_medicert_detail(mecid):
    """
    특정 mecid에 해당하는 사전 문진 상세 정보를 DB에서 가져옵니다.
    """
    with connection.cursor() as cursor:
        query = """
            SELECT 
                m.mecid, m.vas_scale, m.predicted_disease, m.created,
                p.patid, p.patname, p.patgend, p.patpurpose, p.patbirth,
                m.symptom_description, m.symptom_duration, m.symptom_area,
                m.tooth_mobility, m.pain_type, m.gum_swelling
            FROM medicert m
            JOIN patient p ON m.patid = p.patid
            WHERE m.mecid = %s
        """
        cursor.execute(query, [mecid])
        row = cursor.fetchone()

    if not row:
        return None

    record = {
        "mecid": row[0],
        "vas_scale": row[1],
        "predicted_disease": row[2],
        "created": row[3],
        "patient": {
            "patid": row[4],
            "patname": row[5],
            "patgend": row[6],
            "patpurpose": row[7],
            "patbirth": row[8],
        },
        "symptom_description": row[9],
        "symptom_duration": row[10],
        "symptom_area": row[11],
        "tooth_mobility": row[12],
        "pain_type": row[13],
        "gum_swelling": row[14],
    }
    return record
