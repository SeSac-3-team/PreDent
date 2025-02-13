from django.http import JsonResponse
from Utils.update_patient_info import update_patient_info
from myapp.models import Patient
import json

def get_existing_patient(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # JSON 데이터 로드
            name = data.get("name")
            phone = data.get("phone")

            # DB에서 환자 조회 (Patient 모델 사용)
            try:
                patient = Patient.objects.get(patname=name, patpnum=phone)
                return JsonResponse({"found": True, "patient_id": patient.patid}, status=200)
            except Patient.DoesNotExist:
                return JsonResponse({"found": False, "error": "Patient not found"}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)