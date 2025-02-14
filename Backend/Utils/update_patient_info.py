from django.db import connection
import json

def update_patient_info(data):
    # patient_id가 반드시 전달되어야 함 (클라이언트에서 기존 환자 조회 후 확보한 값)
    patient_id = data.get('patient_id')
    if not patient_id:
        print("[ERROR] patient_id가 전달되지 않았습니다.")
        return {"status": "error", "message": "Patient ID is required for update."}

    # 업데이트할 필드 값들
    patpurpose = data.get('purpose')
    agree      = bool(data.get('agree'))

    print(f"""[INFO] 재진 환자 정보 업데이트 요청 (patient_id: {patient_id}):
        purpose: {patpurpose},
        agree: {agree}
    """)

    # 기존 환자의 이름과 전화번호는 변경하지 않으므로, patient_id를 통해 기존 값을 가져와서
    # 새 방문 기록을 추가합니다.
    insert_visit_query = """
        UPDATE patient
        SET patpurpose = %s, agree = %s
        WHERE patid = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(insert_visit_query, [patpurpose, agree, patient_id])

    print(f"[SUCCESS] 방문 기록이 업데이트되었습니다. (PID: {patient_id})")
    return {"status": "success", "message": "Visit record updated successfully."}