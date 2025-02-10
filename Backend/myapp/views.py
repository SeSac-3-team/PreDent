from django.shortcuts import render
from django.http import JsonResponse
from dotenv import load_dotenv
from Utils.vas import vas_cal
from Utils.presum import get_presum
from Utils.medicert import save_medicert
from Utils.gpt import agent_response
import asyncio


load_dotenv(dotenv_path="myapp/.env")
# Create your views here.

def vas_response(request, input_string):
	response = vas_cal(input_string)
	return JsonResponse({'vas' : str(response)})

def presum_response(request, input_string):
	response = get_presum(input_string)
	return JsonResponse({'presum' : str(response)})

def medicert_save(request):
	response = save_medicert(request)
	return response

def chatbot_response(request, input_string):
    """Django 뷰 함수 - 사용자의 질문을 받고 응답을 반환"""
    response = asyncio.run(agent_response(input_string))  # 비동기 함수 실행
    return JsonResponse({'answer': str(response)})