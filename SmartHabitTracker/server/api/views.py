from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random

from .models import Habit, HabitCompletion, Reminder, UserProfile
from .serializers import (
    RegisterSerializer, LoginSerializer,
    HabitSerializer, HabitCreateSerializer,
    ReminderSerializer, ToggleCompletionSerializer
)

# ==========================================================
# REGISTER
# ==========================================================
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name or user.username,
                "createdAt": user.date_joined.isoformat()
            },
            "token": token.key
        }, status=201)


# ==========================================================
# LOGIN
# ==========================================================
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if not user:
            return Response({"success": False, "error": "Invalid email or password"}, status=401)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name or user.username,
                "createdAt": user.date_joined.isoformat()
            },
            "token": token.key
        })


# ==========================================================
# LOGOUT
# ==========================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except:
        pass

    return Response({"success": True})


# ==========================================================
# PROFILE (GET + PATCH + AVATAR UPLOAD)
# ==========================================================
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    # ---------- GET ----------
    if request.method == "GET":
        avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None

        return Response({
            "id": request.user.id,
            "email": request.user.email,
            "name": request.user.first_name or request.user.username,
            "createdAt": request.user.date_joined.isoformat(),
            "avatar": avatar_url,
            "avatar_url": avatar_url
        })

    # ---------- PATCH ----------
    name = request.data.get("name")
    email = request.data.get("email")

    if name:
        request.user.first_name = name
    if email:
        request.user.email = email
    request.user.save()

    # ---------- PATCH ----------
    if request.method == "PATCH":
        # allow form-data (for avatar) or JSON body
        name = request.data.get("name")
        email = request.data.get("email")
        tz = request.data.get("timezone")
        notifications = request.data.get("notifications_enabled")

        # update User fields
        if name:
            request.user.first_name = name
        if email:
            request.user.email = email
        request.user.save()

        # update profile fields
        if tz:
            profile.timezone = tz
        if notifications is not None:
            # handle string booleans from form-data
            if isinstance(notifications, str):
                notifications_value = notifications.lower() in ("1","true","yes","on")
            else:
                notifications_value = bool(notifications)
            profile.notifications_enabled = notifications_value
        profile.save()


    # Avatar upload
    if "avatar" in request.FILES:
        profile.avatar = request.FILES["avatar"]
        profile.save()

    avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None

    return Response({
        "success": True,
        "id": request.user.id,
        "email": request.user.email,
        "name": request.user.first_name or request.user.username,
        "createdAt": request.user.date_joined.isoformat(),
        "avatar": avatar_url,
        "avatar_url": avatar_url
    })


# ==========================================================
# HABITS (CRUD + IMAGE UPLOAD + TOGGLE COMPLETION)
# ==========================================================
class HabitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return HabitCreateSerializer
        return HabitSerializer

    # ---------- CREATE ----------
    def create(self, request, *args, **kwargs):
        serializer = HabitCreateSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        habit = serializer.save(user=request.user)

        return Response(HabitSerializer(habit, context={"request": request}).data)

    # ---------- UPDATE ----------
    def update(self, request, *args, **kwargs):
        habit = self.get_object()
        serializer = HabitCreateSerializer(
            habit,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        habit = serializer.save()

        return Response(HabitSerializer(habit, context={"request": request}).data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    # ---------- TOGGLE COMPLETION ----------
    @action(detail=True, methods=["POST"])
    def toggle_completion(self, request, pk=None):
        habit = self.get_object()
        serializer = ToggleCompletionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data.get("date") or timezone.now().date()

        completion, created = HabitCompletion.objects.get_or_create(habit=habit, date=date)

        if not created:
            completion.delete()
            action = "uncompleted"
        else:
            action = "completed"

        habit.total_completions = habit.completions.count()
        habit.streak = habit.calculate_streak()
        habit.save()

        return Response({
            "action": action,
            "habit": HabitSerializer(habit, context={"request": request}).data,
            "completions": list(habit.completions.values_list("date", flat=True))
        })

    # ---------- GET ALL COMPLETIONS ----------
    @action(detail=False, methods=["GET"])
    def completions(self, request):
        out = {}
        for h in self.get_queryset():
            out[h.id] = list(h.completions.values_list("date", flat=True))
        return Response(out)


# ==========================================================
# REMINDERS
# ==========================================================
class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["POST"])
    def toggle(self, request, pk=None):
        reminder = self.get_object()
        reminder.is_active = not reminder.is_active
        reminder.save()
        return Response({"is_active": reminder.is_active})


# ==========================================================
# AI SUGGESTIONS
# ==========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_suggestions_view(request):
    habits = Habit.objects.filter(user=request.user)
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)

    personalized = []

    for h in habits:
        week_count = h.completions.filter(date__gte=week_ago).count()
        rate = round(week_count / 7 * 100)

        if rate == 100:
            personalized.append({
                "title": f'"{h.name}" is on fire! 🔥',
                "description": "Perfect week!",
                "icon": "award",
                "category": "Celebration",
            })
        elif rate == 0 and h.total_completions == 0:
            personalized.append({
                "title": f'Start "{h.name}" today',
                "description": "Start with 2 minutes only.",
                "icon": "rocket",
                "category": "Getting Started",
            })
        elif rate < 40:
            personalized.append({
                "title": f'"{h.name}" needs attention',
                "description": f"Your weekly completion is {rate}%",
                "icon": "target",
                "category": "Improvement",
            })
        else:
            personalized.append({
                "title": f'"{h.name}" is improving!',
                "description": f"Keeping momentum ({rate}%)",
                "icon": "zap",
                "category": "Motivation",
            })

    base = [
        {"title": "Start Small", "description": "Small steps win.", "icon": "layers", "category": "Strategy"},
        {"title": "Never Miss Twice", "description": "Avoid breaking the chain.", "icon": "clock", "category": "Consistency"},
        {"title": "Reward Yourself", "description": "Celebrate progress!", "icon": "star", "category": "Psychology"},
    ]

    random.shuffle(base)

    return Response({
        "personalized_tips": personalized[:4],
        "suggestions": base[:6]
    })
