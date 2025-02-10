from django.db import connection

def save_medicert(data):
    # 요청으로 들어온 데이터를 파싱합니다.
    vas_scale = data.get('vas_scale')
    pre_diagnosis = data.get('pre_diagnosis')
    patid = data.get('patid')
    symptom_description = data.get('증상 내용')
    symptom_duration = data.get('증상 기간')
    symptom_area = data.get('증상 부위')
    tooth_mobility = data.get('치아 흔들림 여부')
    pain_type = data.get('통증 유형')
    gum_swelling = data.get('잇몸 부기 여부')

    # 필요한 경우, 데이터를 전처리하거나 로깅할 수 있습니다.
    print(f"""test :
        vas_scale: {vas_scale},
        pre_diagnosis: {pre_diagnosis},
        patid: {patid},
        symptom_description: {symptom_description},
        symptom_duration: {symptom_duration},
        symptom_area: {symptom_area},
        tooth_mobility: {tooth_mobility},
        pain_type: {pain_type},
        gum_swelling: {gum_swelling}
    """)

    # SQL 쿼리를 사용하여 DB에 저장하는 로직
    query = """
        INSERT INTO medicert 
        (vas_scale, pre_diagnosis, patid, symptom_description, symptom_duration, symptom_area, tooth_mobility, pain_type, gum_swelling)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [
            vas_scale, 
            pre_diagnosis,
            patid,
            symptom_description,
            symptom_duration,
            symptom_area,
            tooth_mobility,
            pain_type,
            gum_swelling,
        ])
