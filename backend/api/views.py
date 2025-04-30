from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import *
import json
import os
import joblib
import pandas as pd
import numpy as np
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.http import require_GET
from django.http import HttpResponse
from django.utils.timezone import make_aware, is_naive
from django.utils import timezone
from django.db.models.functions import TruncDate
from django.db.models import Count
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncDay, TruncWeek
from django.db.models import Count, Q, F, FloatField, ExpressionWrapper

# Define path to models folder in STATIC_ROOT
models_folder = os.path.join(settings.STATIC_ROOT, 'models')
xgb_model = joblib.load(os.path.join(models_folder, 'xgb_risk_alert_model.pkl'))
label_encoder = joblib.load(os.path.join(models_folder, 'label_encoder.pkl'))
scaler = joblib.load(os.path.join(models_folder, 'scaler.pkl'))


@csrf_exempt
def login(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            #get user profile
            profile = Profile.objects.get(user=user)
            print("returning data")
            return JsonResponse({
                "id": user.id,
                "name": user.username,
                "email": user.email,
                "role": profile.role,  
            })
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)


@csrf_exempt
def registration(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            username = data.get('username')
            phone_num = data.get('phone')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role', 'mother')

            if not email or not password:
                return JsonResponse({'error': 'Email and password are required.'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already exists.'}, status=400)

            user = User.objects.create(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=make_password(password),
            )
            print("user saved")

            # Assuming you have a Profile model
            profile = Profile.objects.create(
                user=user,
                role='mother',
                phone_number= phone_num,
            )

            return JsonResponse({'message': 'User registered successfully'}, status=201)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)

@csrf_exempt
def predict(request):
    print("submission")
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
        
        # Assume you have the input data in a variable called 'wearable_input'
        wearable_input = [data['age'], data['systolicBP'], data['diastolicBP'], data['bs'], data['bodyTemp'], data['heartRate']]

        # Convert input data to a DataFrame with proper column names
        columns = ['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate']
        input_df = pd.DataFrame([wearable_input], columns=columns)

        # Scale the input data
        scaled_data = scaler.transform(input_df)

        # Predict the risk level
        prediction = xgb_model.predict(scaled_data)
        predicted_risk = label_encoder.inverse_transform(prediction)[0]

        # Display the result
        print(f"Predicted Risk Level: {predicted_risk}")
        
        user = User.objects.get(id=data['user_id'])
        
        if predicted_risk == 0:
            risk = "high"
        elif predicted_risk == 1:
            risk = "mid"
        else:
            risk= "safe"
        
        HealthMetrics.objects.create(
            user = user,
            age = data['age'],
            systolic_bp = data['systolicBP'],
            diastolic_bp = data['diastolicBP'],
            bs = data['bs'],
            body_temp = data['bodyTemp'],
            heartrate = data['heartRate'],
            predicted_risk = risk,
        )
        
        
        
        
        
        return JsonResponse({'risk': risk})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    

@csrf_exempt
def appointments(request):
    print("submission")
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
        
        date = data.get('date')
        time = data.get('time')
        type = data.get('type')
        status = data.get('status')
        notes = data.get('notes')
        
        risk = "submitted"  # or "high", based on the prediction logic
        return JsonResponse({'risk': risk})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_user_metrics(request, user_id):
    # fetch all metrics for this user, newest first
    metrics_qs = HealthMetrics.objects.filter(user__id=user_id).order_by('-id')

    # serialize full list
    data = list(metrics_qs.values(
        'id',
        'age',
        'systolic_bp',
        'diastolic_bp',
        'bs',
        'body_temp',
        'heartrate',
        'predicted_risk',
        'date',
    ))

    # pick off the very first (newest) record, if any
    latest = None
    if metrics_qs.exists():
        m = metrics_qs.first()
        latest = {
            'heartrate': m.heartrate,
            'blood_pressure': f"{m.systolic_bp}/{m.diastolic_bp}",
            'glucose': m.bs,
            'temperature': m.body_temp,
            'date': m.date.isoformat(),
        }

    return JsonResponse({
        'metrics': data,
        'latest': latest
    })

@csrf_exempt
def submit_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Extract values from the JSON payload
            patient_id = data.get('patient_id')
            date = data.get('date')
            time = data.get('time')
            appointment_type = data.get('type')
            status = data.get('status')
            notes = data.get('notes')
            print("User id", patient_id)
            user =  User.objects.get(id=patient_id)
            
            
            Appointments.objects.create(
                user = user,
                date=date,
                time = time,
                type = appointment_type,
                notes = notes,
            )

            # For now, just echo the received data
            response_data = {
                'message': 'Appointment received successfully',
                'appointment': {
                    'patient_id': patient_id,
                    'date': date,
                    'time': time,
                    'type': appointment_type,
                    'status': status,
                    'notes': notes,
                }
            }

            return JsonResponse(response_data, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    
@csrf_exempt
def user_appointments(request, user_id):
    appointments = Appointments.objects.filter(user__id=user_id)
    data = [
        {
            "id": appointment.id,
            "date": appointment.date,
            "time": appointment.time,
            "type": appointment.type,
            "notes": appointment.notes,
        }
        for appointment in appointments
    ]
    return JsonResponse({"data": data}, safe=False)

@csrf_exempt
def patients(request):
    patients= Profile.objects.filter(role= 'mother')
    
    data = [
        {
            "id": patient.user.id,
            "full_name":f'{patient.user.first_name} {patient.user.last_name}',
            "due_date": "17:01:03",
            "last_visit": "17:01:03",
            "email": patient.user.email,
            "phone_number": "0773029088"
        }
        for patient in patients
    ]
    
    return JsonResponse({"data":data},safe=False)




@csrf_exempt
def get_appointments(request):
    appointments = Appointments.objects.all()
    data = [
        {
            "id": appointment.id,
            "date": appointment.date,
            "time": appointment.time,
            "type": appointment.type,
            "notes": appointment.notes,
        }
        for appointment in appointments
    ]
    return JsonResponse({"data": data}, safe=False)

@csrf_exempt
def get_stats(request):
    appointments = Appointments.objects.all().count()
    
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def get_users(request):
    # Use select_related to optimize DB queries for related User objects
    new_maternals_qs = Profile.objects.filter(role='mother', provider__isnull=True).select_related('user')
    assigned_maternals_qs = Profile.objects.filter(role='mother', provider__isnull=False).select_related('user', 'provider')
    healthcare_providers_qs = Profile.objects.filter(role='provider').select_related('user')
    staff = Profile.objects.filter(role__in=['admin', 'provider']).select_related('user')

    def get_full_name(user):
        if user:
            return f"{user.first_name} {user.last_name}".strip()
        return ""

    new_maternals = [
        {
            "id": maternal.id,
            "user_id": maternal.user_id,
            "user_full_name": f'{maternal.user.first_name} {maternal.user.last_name}',
            "role": maternal.role,
            "phone": maternal.phone_number,
            "email": maternal.user.email,
            "provider": None
        }
        for maternal in new_maternals_qs
    ]
    
    staff_data = [
        {
            "id": s.id,
            "user_id": s.user.id,
            "first_name": s.user.first_name,
            "last_name": s.user.last_name,
            "email": s.user.email,
            "phone": s.phone_number,
            "role": s.role
        }
        for s in staff
    ]
    
    healthcare_providers = [
        {
            "id": provider.id,
            "user_id": provider.user_id,
            "user_full_name": f'{provider.user.first_name} {provider.user.last_name}',
            "role": provider.role,
        }
        for provider in healthcare_providers_qs
    ]


    assigned_maternals = [
        {
            "id": maternal.id,
            "user_id": maternal.user_id,
            "user_full_name": f'{maternal.user.first_name} {maternal.user.last_name}',
            "role": maternal.role,
            "phone": maternal.phone_number,
            "email": maternal.user.email,
            "provider_full_name": get_full_name(maternal.provider)
        }
        for maternal in assigned_maternals_qs
    ]


    data = {
        "new_maternals": new_maternals,
        "assigned_maternals": assigned_maternals,
        "staff":staff_data,
        "healthcare_providers": healthcare_providers,
    }

    return JsonResponse({"data": data}, safe=False)



@csrf_exempt
def assign_provider(request):
    
    data = json.loads(request.body)
    patient_id = data.get('patient_id')
    provider_id = data.get('provider_id')

    if not patient_id or not provider_id:
        return JsonResponse({'error': 'patient_id and provider_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient = Profile.objects.get(id=patient_id)
        provider = Profile.objects.get(id=provider_id)

        print(provider.user)
        

        patient.provider = provider.user
        patient.save()

        return JsonResponse({'message': 'Provider assigned successfully.'}, status=status.HTTP_200_OK)

    except Profile.DoesNotExist:
        return JsonResponse({'error': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Provider not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
def add_staff(request):
    data = json.loads(request.body)
    
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone_number = data.get('phone_number')  # optional depending on your model
    role = data.get('role')
    password = data.get('password')

    if  not email or not password or not role:
        return JsonResponse({'error': 'Username, email, password, and role are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        print("before")
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        print("adding user")
        
        user = User.objects.create(first_name=first_name,last_name=last_name, email=email, password=password)
        user.save()
        
        print("user",user)
        
        user_profile = Profile.objects.create(
            user = user,
            role = role,
            phone_number = phone_number,
        )
        
        user_profile.save()

        return JsonResponse({'message': 'Staff member added successfully.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#view to get patients assigned for the provider 
@csrf_exempt
@require_GET
def provider_patients(request):
    provider_id = request.GET.get('provider_id')

    if not provider_id:
        return JsonResponse({"error": "Missing provider_id"}, status=400)

    try:
        provider = User.objects.get(id=provider_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "Provider not found"}, status=404)

    patients = Profile.objects.filter(provider=provider)

    assigned_patients = [
        {
            "id": patient.id,
            "user_id": patient.user_id,
            "user_full_name": f'{patient.user.first_name} {patient.user.last_name}',
            "role": patient.role,
            "phone": patient.phone_number,
            "email": patient.user.email,
        }
        for patient in patients
    ]

    return JsonResponse({"assigned_patients": assigned_patients}, safe=False, status=200)

@csrf_exempt
def patient_details(request, pk):
    print("getting patient data")
    try:
        profile = Profile.objects.get(id=pk)
        medical = MedicalHistory.objects.filter(user__id=profile.user.id).first()
        metrics = HealthMetrics.objects.filter(user__id=profile.user.id).order_by('-id')

        patient_metrics = list(metrics.values(
            'id', 'age', 'systolic_bp', 'diastolic_bp', 'bs', 'body_temp', 'heartrate', 'date'
        ))

        data = {
            "id": profile.id,
            "name": f"{profile.user.first_name} {profile.user.last_name}",
            "email": profile.user.email,
            "phone": profile.phone_number,
            "dueDate": str(profile.due_date),
            "bloodType": profile.blood_type,
            "medicalHistory": {
                "conditions": medical.conditions.split(',') if medical else [],
                "medications": medical.medications.split(',') if medical else [],
                "allergies": medical.allergies.split(',') if medical else [],
            },
            "patient_metrics":  patient_metrics,
        }
        
        return JsonResponse(data, safe=False)

    except Profile.DoesNotExist:
        return JsonResponse({"error": "Patient not found"}, status=404)
    
@csrf_exempt
def send_notification(request):
    print("in send notification")
    data = json.loads(request.body)
    try:
        print(data['user'])
        user_profile = Profile.objects.get(id=data['user'])
        user = User.objects.get(id=user_profile.user.id)
        provider = User.objects.get(id=data['provider'])
        message = data['message']

        Notifications.objects.create(user=user, provider=provider, message=message)

        return JsonResponse({'status': 'success'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
def send_reports(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)

    try:
        data = json.loads(request.body)

        
        provider_id = data.get('provider_id')
        patient_id = data.get('patient_id')
        notes = data.get('notes')
        recommendations = data.get('recommendations')
        next_appointment = data.get('next_appointment')

        provider = User.objects.get(id=provider_id)
        patient_profile = Profile.objects.get(id=patient_id)
        patient = User.objects.get(id=patient_profile.user.id)

        # Save the report
        report = Reports.objects.create(
            provider=provider,
            patient=patient,
            notes=notes,
            recommendations=recommendations,
            next_appointment=next_appointment,
        )

        return JsonResponse({'status': 'success', 'report_id': report.id}, status=201)

    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Profile.DoesNotExist:
        return JsonResponse({'error': 'Profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
    
@csrf_exempt
def get_reports_by_provider(request, provider_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    try:
        reports = Reports.objects.filter(provider__id=provider_id).select_related('patient')
        print(reports)
        report_data = [
            {
                'id': report.id,
                'patient': f'{report.patient.first_name} {report.patient.last_name}',
                'notes': report.notes,
                'recommendations': report.recommendations,
                'next_appointment': report.next_appointment,
                'created_at': report.created_at,
            }
            for report in reports
        ]
        return JsonResponse({'reports': report_data}, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
from docx import Document

def download_report_word(request, report_id):
    try:
        report = Reports.objects.select_related('patient').get(id=report_id)

        document = Document()
        document.add_heading('Medical Report', 0)
        document.add_paragraph(f'Patient: {report.patient.get_full_name()}')
        document.add_paragraph(f'Notes: {report.notes}')
        document.add_paragraph(f'Recommendations: {report.recommendations}')
        document.add_paragraph(f'Next Appointment: {str(report.next_appointment)}')

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename=report_{report.id}.docx'
        document.save(response)
        return response
    except Reports.DoesNotExist:
        return JsonResponse({'error': 'Report not found'}, status=404)


from django.utils.dateparse import parse_datetime

@csrf_exempt
def appointments(request):
    if request.method == "GET":
        provider_id = request.GET.get("provider_id")
        if not provider_id:
            return JsonResponse({"error": "Missing provider_id"}, status=400)

        data = Appointments.objects.filter(provider__id=provider_id).select_related('patient')
        response = [
            {
                "id": appt.id,
                "patient": f'{appt.patient.first_name} {appt.patient.last_name}',
                "phone": appt.patient.profile.phone if hasattr(appt.patient, 'profile') else "",
                "time": appt.time.isoformat(),
                "type": appt.type,
                "status": appt.status,
            }
            for appt in data
        ]
        return JsonResponse(response, safe=False)

    elif request.method == "POST":
        try:
            body = json.loads(request.body)
            print("posted data", body)
            patient_id = body.get("patientId")
            provider_id = body.get("providerId")
            time = parse_datetime(body.get("time"))
            if time and is_naive(time):
                time = make_aware(time)
            appt_type = body.get("type")
            notes = body.get("notes")

            if not all([patient_id, provider_id, time, appt_type]):
                return JsonResponse({"error": "Missing required fields"}, status=400)

            patient = User.objects.get(id=patient_id)
            provider = User.objects.get(id=provider_id)

            appointment = Appointments.objects.create(
                patient=patient,
                provider=provider,
                time=time,
                type=appt_type,
                status="Scheduled",
                notes = notes,
            )
            
            print("succesfully saved")
            
            
            return JsonResponse({
                "message": "Appointment created successfully",
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def update_appointment(request, pk):
    if request.method != "PUT":
        return JsonResponse({"error": "Only PUT method allowed"}, status=405)

    try:
        data = json.loads(request.body)
        status = data.get("status")

        if not status:
            return JsonResponse({"error": "Status is required"}, status=400)

        appointment = Appointments.objects.get(id=pk)
        appointment.status = status
        appointment.save()

        return JsonResponse({
            "message": "Appointment status updated successfully",
            "appointment": {
                "id": appointment.id,
                "status": appointment.status
            }
        }, status=200)

    except Appointments.DoesNotExist:
        return JsonResponse({"error": "Appointment not found"}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def provider_stats(request):
    provider_id = request.GET.get('provider_id')

    if not provider_id:
        return JsonResponse({"error": "Missing provider_id"}, status=400)

    try:
        provider = User.objects.get(id=provider_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "Provider not found"}, status=404)
    
    print("done")
    # Total patients under the provider
    total_patients = Profile.objects.filter(provider=provider).count()

    # Today's appointments for the provider
    today = timezone.now().date()
    today_appointments_count = Appointments.objects.filter(provider=provider, time__date=today).count()

    # Total reports written by the provider
    total_reports = Reports.objects.filter(provider=provider).count()
    
    #Critical appointments
    total_critical = Appointments.objects.filter(provider=provider,type="Emergency").count()
    
    print("done")

    # Upcoming appointments
    now = timezone.now()
    upcoming = Appointments.objects.filter(provider=provider, time__gt=now).select_related('patient', 'provider')
    
    print("done")
    
    upcoming_data = [
        {
            "id": appt.id,
            "patient": f"{appt.patient.first_name} {appt.patient.last_name}",
            "provider": f"{appt.provider.first_name} {appt.provider.last_name}" if appt.provider else None,
            "time": appt.time.isoformat(),
            "type": appt.type,
            "status": appt.status,
        }
        for appt in upcoming
    ]

    # Appointment type breakdown
    checkup_appointments = Appointments.objects.filter(provider=provider, type="Checkup").count()
    follow_up_appointments = Appointments.objects.filter(provider=provider, type="Follow-up").count()
    emergency_appointments = Appointments.objects.filter(provider=provider, type="Emergency").count()  # if you add Emergency
    
    print("done")

    # Appointment status counts
    scheduled_count = Appointments.objects.filter(provider=provider, status="Scheduled").count()
    completed_count = Appointments.objects.filter(provider=provider, status="Completed").count()
    cancelled_count = Appointments.objects.filter(provider=provider, status="Cancelled").count()
    rescheduled_count = Appointments.objects.filter(provider=provider, status="Rescheduled").count()
    
    print("done")

    # Weekly appointments: Monday–Friday
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=4)
    
    print("done")

    weekly_appointments = (
        Appointments.objects
        .filter(provider=provider, time__date__range=(start_of_week, end_of_week))
        .annotate(day=TruncDate('time'))
        .values('day')
        .annotate(total=Count('id'))
        .order_by('day')
    )
    
    print("done")

    # Populate 0 for days with no appointments
    weekly_summary = {
        str(start_of_week + timedelta(days=i)): 0 for i in range(5)
    }
    print("done")
    for item in weekly_appointments:
        weekly_summary[str(item['day'])] = item['total']
        
    last_appointment = Appointments.objects.filter(provider=provider).order_by('-time').first()
    
    last_report = Reports.objects.filter(provider=provider).order_by('-created_at').first()
        

    return JsonResponse({
        "total_patients": total_patients,
        "today_appointments": today_appointments_count,
        "total_reports": total_reports,
        "total_critical":total_critical,
        "upcoming_appointments": upcoming_data,
        "appointments_by_type": {
            "Checkup": checkup_appointments,
            "Follow-up": follow_up_appointments,
            "Emergency": emergency_appointments,
        },
        "appointments_by_status": {
            "Scheduled": scheduled_count,
            "Completed": completed_count,
            "Cancelled": cancelled_count,
            "Rescheduled": rescheduled_count,
        },
        "weekly_summary": weekly_summary,
    }, status=200)
    
@csrf_exempt
@require_GET
def patient_appointments(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'Missing user_id parameter'}, status=400)

    qs = (
        Appointments.objects
        .filter(patient__id=user_id)
        .select_related('provider')
        .order_by('time')
    )

    data = []
    for appt in qs:
        # split the single DateTimeField into separate date and time strings:
        dt = appt.time  # a Python datetime.datetime
        data.append({
            'id': appt.id,
            'date': dt.date().isoformat(),                        
            'time': dt.time().strftime('%H:%M:%S'),               
            'type': appt.type,
            'status': appt.status,
            'notes': appt.notes or '',
            'provider': {
                'id': appt.provider.id,
                'name': f"{appt.provider.first_name} {appt.provider.last_name}",
            }
        })

    return JsonResponse({'data': data}, status=200)

@csrf_exempt
@require_GET
def patient_reports(request):
    # Validate and retrieve patient user_id
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'Missing user_id parameter'}, status=400)

    # Query all reports for this patient, include provider to avoid extra queries
    qs = (
        Reports.objects
        .filter(patient__id=user_id)
        .select_related('provider')
        .order_by('-created_at')
    )

    # Serialize reports into JSON-friendly format
    data = []
    for r in qs:
        data.append({
            'id': r.id,
            'created_at': r.created_at.isoformat(),
            'notes': r.notes,
            'recommendations': r.recommendations,
            'next_appointment': r.next_appointment.isoformat(),
            'provider': {
                'id': r.provider.id if r.provider else None,
                'name': f"{r.provider.first_name} {r.provider.last_name}" if r.provider else None,
            }
        })

    return JsonResponse({'data': data}, status=200)

def format_recent_time(dt):
    now = timezone.now()
    if dt.date() == now.date():
        return dt.strftime("Today at %I:%M %p")
    elif dt.date() == (now - timedelta(days=1)).date():
        return dt.strftime("Yesterday at %I:%M %p")
    else:
        return dt.strftime("%b %d, %Y at %I:%M %p")


@csrf_exempt
@require_GET
def admin_stats(request):
    total_patients = Profile.objects.filter(role="mother").count()
    
    now = timezone.now()
    pending_appointments = Appointments.objects.filter(time__gt=now).count()
    critical_alerts = 3  # Static for now

    total_providers = Profile.objects.filter(role="provider").count()

    appointment_trends = list(Appointments.objects.annotate(
        period=TruncMonth('time')
    ).values('period').annotate(
        total=Count('id')
    ).order_by('period'))

    last_patient = Profile.objects.filter(role="mother").order_by('-id').first()
    last_provider = Profile.objects.filter(role="provider").order_by('-id').first()

    last_patient_time = format_recent_time(last_patient.user.date_joined) if last_patient else None
    last_provider_time = format_recent_time(last_provider.user.date_joined) if last_provider else None

    return JsonResponse({
        "total_patients": total_patients,
        "pending_appointments": pending_appointments,
        "critical_alerts": critical_alerts,
        "total_providers": total_providers,
        "appointment_trends": appointment_trends,
        "last_patient": {
            "name": last_patient.user.get_full_name() if last_patient else None,
            "joined": last_patient_time
        },
        "last_provider": {
            "name": last_provider.user.get_full_name() if last_provider else None,
            "joined": last_provider_time
        }
    })
    
@csrf_exempt
@require_GET
def admin_analytics(request):
    risk_cases = 3  # Hardcoded or calculate if needed

    total_providers = Profile.objects.filter(role="provider").count()
    total_appointments = Appointments.objects.all().count()
    total_reports = Reports.objects.all().count()

    # Build provider_stats: for each provider calculate total and completed appointments
    provider_stats = []
    providers = Profile.objects.filter(role='provider')
    for prof in providers:
        user = prof.user
        # all appointments made by this provider
        total = Appointments.objects.filter(provider=user).count()
        # completed appointments by this provider
        completed = Appointments.objects.filter(provider=user, status='Completed').count()
        # compute rate
        rate = (completed / total * 100) if total > 0 else 0.0
        provider_stats.append({
            "name": f'{user.first_name} {user.last_name}',
            "total_appointments": total,
            "completed_appointments": completed,
            "completion_rate": round(rate, 2)
        })

    # Get last provider added
    last_provider = Profile.objects.filter(role="provider").order_by('-id').first()
    last_provider_data = {
        "name": last_provider.user.username,
        "joined": format_recent_time(last_provider.user.date_joined)
    } if last_provider else None

    # Get last report generated
    last_report = Reports.objects.all().order_by('-id').first()
    last_report_data = {
        "patient": last_report.patient.username,
        "provider": last_report.provider.username if last_report.provider else None,
        "time": format_recent_time(last_report.created_at)
    } if last_report else None

    # Get last appointment generated
    last_appointment = Appointments.objects.all().order_by('-id').first()
    last_appointment_data = {
        "patient": last_appointment.patient.username,
        "provider": last_appointment.provider.username if last_appointment.provider else None,
        "time": format_recent_time(last_appointment.created_at)
    } if last_appointment else None

    # Risk Cases Trend (predicted_risk="high" grouped by date)
    risk_trend = (
        HealthMetrics.objects
        .filter(predicted_risk="high")
        .annotate(period=TruncDate('date'))
        .values('period')
        .annotate(total=Count('id'))
        .order_by('period')
    )
    risk_case_trends = [
        {
            'period': item['period'].strftime('%Y-%m-%d'),
            'total': item['total']
        }
        for item in risk_trend
    ]

    return JsonResponse({
        "risk_cases": risk_cases,
        "total_providers": total_providers,
        "total_appointments": total_appointments,
        "total_reports": total_reports,
        "provider_stats": provider_stats,
        "last_provider": last_provider_data,
        "last_report": last_report_data,
        "last_appointment": last_appointment_data,
        "risk_case_trends": risk_case_trends
    })
