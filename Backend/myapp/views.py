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

load_dotenv(dotenv_path="myapp/.env")
# Create your views here.

def vas_response(request, input_string):
	response = vas_cal(input_string)
	return JsonResponse({'vas' : str(response)})

def presum_response(request, input_string):
	response = get_presum(input_string)
	return JsonResponse({'presum' : str(response)})

@api_view(['POST'])
def medicert_save(request):
    data = request.data
    try:
        save_medicert(data)
        return Response({"message": "데이터 저장 성공"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def chatbot_response(request, input_string):
    """Django 뷰 함수 - 사용자의 질문을 받고 응답을 반환"""
    response = asyncio.run(agent_response(input_string))  # 비동기 함수 실행
    return JsonResponse({'answer': str(response)})

@api_view(['POST'])
def save_patient(request):
    data = request.data
    try:
        patient_info(data)
        return Response({"message": "데이터 저장 성공"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)