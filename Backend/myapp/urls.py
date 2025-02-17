from django.urls import path
from . import views

urlpatterns = [
    path("vas/<str:input_string>", views.vas_response, name="vas_response"),
    path("presum/<str:input_string>", views.presum_response, name="presum_response"),
    path("save-object/", views.medicert_save, name="medicert_save"),    
    path("chat/", views.chatbot_response, name="chatbot_response"),
    path('save_patient/', views.save_patient_view, name='save_patient'),
    path('update_patient/', views.update_patient, name='update_patient'),
    path('get_existing_patient/', views.existing_patient_view, name='get_existing_patient'),
    path('csrf/', views.csrf_token_view, name='csrf_token')
]