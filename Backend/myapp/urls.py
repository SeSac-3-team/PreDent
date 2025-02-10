from django.urls import path
from . import views

urlpatterns = [
    path('', views.hello, name='hello'),
    path('image/', views.image_response, name='imageUrl'),
    path('greeting/<str:input_string>', views.greeting),
    path("chat/<str:input_string>", views.chatbot_response, name="input_string")
]