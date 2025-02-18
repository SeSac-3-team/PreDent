from django.http import JsonResponse
from dotenv import load_dotenv
from Utils.vas import vas_cal
from Utils.presum import get_presum
from Utils.medicert import save_medicert
from Utils.gpt import agent_response
from Utils.patient_info import patient_info
import asyncio
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from Utils.update_patient_info import update_patient_info
from Utils.get_existing_patient import get_existing_patient
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
import json

load_dotenv(dotenv_path="myapp/.env")
# Create your views here.

def vas_response(request, input_string):
	response = vas_cal(input_string)
	return JsonResponse({'vas' : str(response)})

def presum_response(request, input_string):
	response = get_presum(input_string)
	return JsonResponse(response)

@api_view(['POST'])
def medicert_save(request):
    data = request.data
    try:
        save_medicert(data)
        return Response({"message": "데이터 저장 성공"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def chatbot_response(request):
    """
    Django 뷰 함수 - 사용자 질문과 환자 ID를 (JSON 바디로부터) 입력받아,
    자세한 프롬프트를 구성하고 LLM의 응답을 반환합니다.

    기대하는 JSON 입력 형식:
    {
        "answer": "사용자 질문",
        "patid": "환자 ID"
    }
    """
    answer = request.data.get("answer")
    patid = request.data.get("patid")
    
    if not answer or not patid:
        return Response({"error": "Missing answer or patid"}, status=400)

    prompt = (
    (
    "아래 정보를 참고하여, 한국어로 친절하고 자세한 답변을 작성해 주세요:\n\n"
    "1) 환자 이름이 확인될 경우, 예) \"{patname}님\"과 같이 존칭을 사용하세요.\n"
    "2) 치과 관련 질문이라면, 전문적인 지식을 바탕으로 이해하기 쉽게 설명해주세요.\n"
    "3) 환자 ID \"{patid}\"는 사용자가 명시적으로 요청하지 않는 한 언급하지 마세요.\n"
    "4) 환자 이름이 'Unknown'인 경우, '환자 정보가 확인되지 않습니다.'라고 안내해 주세요.\n\n"
    f"환자 ID: {patid}\n"
    f"사용자 질문: {answer}"
)
)
    # agent_response가 (prompt, patid)를 요구한다면:
    response_text = agent_response(prompt, patid)
    return Response({"answer": str(response_text)})

@api_view(['POST'])
def save_patient_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_patient_id = patient_info(data)  # 새로 생성된 PID 받기

            return JsonResponse({
                "success": True,
                "patient_id": new_patient_id,
                "message": "환자 정보가 성공적으로 저장되었습니다."
            }, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    
@api_view(['POST','PATCH'])
def update_patient(request):
    data = request.data
    try:
        update_patient_info(data)
        return Response({"message": "데이터 업데이트 성공"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
def existing_patient_view(request):
    try:
        response = get_existing_patient(request)  # request._request 대신 request 사용 권장
        # 만약 get_existing_patient 내부에서 환자를 찾지 못하면 {found: False}를 반환하도록 수정
        return response  
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON format"}, status=status.HTTP_400_BAD_REQUEST)
    
@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({"csrfToken": get_token(request)})

