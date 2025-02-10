from django.urls import path
from . import views

urlpatterns = [
    path("vas/<str:input_string>", views.vas_response, name="vas_response"),
    path("presum/<str:input_string>", views.presum_response, name="presum_response"),
    path("save-object/", views.medicert_save, name="medicert_save"),    
    path("chat/<str:input_string>", views.chatbot_response, name="chatbot_response"),
]