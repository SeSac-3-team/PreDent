from django.shortcuts import render
from django.http import JsonResponse
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv
from Utils.gpt import agent_response
import asyncio


load_dotenv(dotenv_path="myapp/.env")
# Create your views here.

def hello(request):
    return JsonResponse(request, {'message' : 'hello'})

def image_response(request):
    imageUrl = 'https://png.pngtree.com/thumb_back/fh260/background/20230609/pngtree-three-puppies-with-their-mouths-open-are-posing-for-a-photo-image_2902292.jpg'
    return render(request, 'image_test.html', {'image_response' : imageUrl})

def greeting(request, input_string):
    return JsonResponse({'greeting' : f'Hello, {input_string}!'})

# OpenAI API 키 설정

def chatbot_response(request, input_string):
    """Django 뷰 함수 - 사용자의 질문을 받고 응답을 반환"""
    response = asyncio.run(agent_response(input_string))  # 비동기 함수 실행
    return JsonResponse({'answer': str(response)})