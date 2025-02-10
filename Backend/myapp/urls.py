from django.urls import path
from . import views

urlpatterns = [
    path("vas/<str:input_string>", views.vas_response, name="input_string"),
    path("presum/<str:input_string>", views.presum_response, name="input_string"),
    path('save-object/', views.medicert_save, name='save_medicert'),    
    path("chat/<str:input_string>", views.chatbot_response, name="input_string")
]