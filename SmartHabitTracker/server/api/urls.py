from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'habits', views.HabitViewSet, basename='habit')
router.register(r'reminders', views.ReminderViewSet, basename='reminder')

urlpatterns = [

    # ROUTER ENDPOINTS (Habits + Reminders)
    path('', include(router.urls)),

    # AUTH ENDPOINTS
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),

    # PROFILE (GET + PATCH)
    path('profile/', views.profile_view, name='profile'),

    # AI Suggestions → FIXED for frontend
    path('ai/', views.ai_suggestions_view, name='ai-root'),
    path('ai/suggestions/', views.ai_suggestions_view, name='ai-suggestions'),
]
