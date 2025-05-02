from django.contrib import admin
from django.urls import path, include

from .views import *

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path("login/",login,name="login"),
    path("register/",registration,name="registration"),
    path("predict/",predict, name="predict"),
    path("user-appointments/<str:user_id>",user_appointments,name="user-appointments"),
    path("appointments/",appointments,name="appointments"),
     path('send-appointment/', submit_appointment, name='send_appointment'),
    path("get_patients/",patients,name="get_patients"),
    path("get_metrics/<str:user_id>/",get_user_metrics,name="get_metrics"),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('get_users/',get_users,name="get_users"),
    path('assign_provider/',assign_provider,name='assign_provider'),
    path('add_staff/', add_staff, name='add_staff'),
    path('patient-details/<str:pk>/', patient_details, name='patient-details'),
    path('patients/', provider_patients, name='provider_patients'),
    path('send-notification/',send_notification,name="send-notification"),
    path('send-report/',send_reports,name="send-report"),
    path('reports/provider/<int:provider_id>/',get_reports_by_provider),
    # path('reports/<int:report_id>/pdf/', download_report_pdf),
    path('reports/<int:report_id>/word/', download_report_word),
    path('appointments/', appointments, name='appointments'),
    path('appointments/<str:pk>/status/', update_appointment, name='appointments'),
    path('provider_stats/', provider_stats, name='provider_stats'),
    path('patient-appointments/',patient_appointments,name="patient-appointments"),
    path('patient-reports/',patient_reports,name="patient-reports"),
    path('admin-stats/',admin_stats,name="admin-stats"),
    path('admin-analytics/',admin_analytics,name="admin-analytics"),
    path('notifications/',get_notifications,name="notifications"),
    path('profile/',profile,name="profile"),
    path('change-password/',change_password,name="change-password"),
]
