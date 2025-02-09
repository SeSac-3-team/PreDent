from django.shortcuts import render
from django.http import JsonResponse
from dotenv import load_dotenv

load_dotenv(dotenv_path="myapp/.env")
# Create your views here.

def hello(request):
    return JsonResponse(request, {'message' : 'hello'})
