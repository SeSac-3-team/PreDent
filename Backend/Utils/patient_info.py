# yourapp/utils/Patient.py
from django.db import connection

def patient_info(data):
    # 요청으로 들어온 데이터를 파싱합니다.
    patname    = data.get('name')
    patgend    = data.get('gender')
    patpnum    = data.get('phone')
    patbirth   = data.get('birth')
    patadrs    = data.get('address')
    patpurpose = data.get('purpose')
    agree      = data.get('agree')
    
    # agree 값을 boolean으로 변환 (0은 False, 1은 True)
    agree = bool(agree)

    # 데이터 로그 확인.
    print(f"""test :
        name: {patname},
        gender: {patgend},
        ph_number: {patpnum},
        address: {patadrs},
        purpose: {patpurpose},
        agree: {agree},
        birth: {patbirth},
    """)

    # SQL 쿼리를 사용하여 DB에 저장 (형식은 DB형식과 통일)
    query = """

        INSERT INTO patient 
        (patname, patgend, patpnum, patadrs, patpurpose, agree, patbirth)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [
            patname, 
            patgend,
            patpnum,
            patadrs,
            patpurpose,
            agree,
            patbirth,
        ])

