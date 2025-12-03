from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Habit, HabitCompletion, Reminder, UserProfile



# ==========================================================
# USER SERIALIZER
# ==========================================================
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email",
            "first_name", "last_name",
            "full_name", "avatar_url", "date_joined"
        ]
        read_only_fields = ["id", "date_joined"]

    def get_full_name(self, obj):
        return obj.first_name or obj.username

    def get_avatar_url(self, obj):
        profile = getattr(obj, "userprofile", None)
        if profile and profile.avatar:
            request = self.context.get("request")
            url = profile.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None



# ==========================================================
# PROFILE UPDATE
# ==========================================================
class ProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    avatar = serializers.ImageField(required=False)

    def update(self, user, validated_data):
        profile, _ = UserProfile.objects.get_or_create(user=user)

        if "name" in validated_data:
            user.first_name = validated_data["name"]

        if "email" in validated_data:
            user.email = validated_data["email"]

        user.save()

        if "avatar" in validated_data:
            profile.avatar = validated_data["avatar"]
            profile.save()

        return user



# ==========================================================
# REGISTER
# ==========================================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2", "name"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        name = validated_data.pop("name", "")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=name
        )

        UserProfile.objects.create(user=user)
        return user



# ==========================================================
# LOGIN
# ==========================================================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()



# ==========================================================
# HABIT COMPLETION
# ==========================================================
class HabitCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitCompletion
        fields = ["id", "date", "created_at"]
        read_only_fields = ["id", "created_at"]



# ==========================================================
# HABIT SERIALIZER (READ)
# ==========================================================
class HabitSerializer(serializers.ModelSerializer):
    completions = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            "id", "name", "description", "icon", "color", "target",
            "frequency", "category", "difficulty",
            "image", "image_url",
            "reminder", "notes",
            "streak", "total_completions",
            "last_completed", "created_at",
            "completions"
        ]
        read_only_fields = [
            "id", "streak", "total_completions",
            "last_completed", "created_at"
        ]

    def get_completions(self, obj):
        return list(obj.completions.values_list("date", flat=True))

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None



# ==========================================================
# HABIT CREATE + UPDATE (WRITE)
# ==========================================================
class HabitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = [
            "name", "description", "icon", "color", "target",
            "frequency", "category", "difficulty",
            "image", "reminder", "notes"
        ]



# ==========================================================
# REMINDER SERIALIZER
# ==========================================================
class ReminderSerializer(serializers.ModelSerializer):
    habit_name = serializers.CharField(source="habit.name", read_only=True)
    habit_icon = serializers.CharField(source="habit.icon", read_only=True)

    class Meta:
        model = Reminder
        fields = [
            "id", "habit", "habit_name", "habit_icon",
            "time", "days", "custom_days",
            "message", "is_active", "created_at"
        ]
        read_only_fields = ["id", "created_at"]



# ==========================================================
# TOGGLE COMPLETION
# ==========================================================
class ToggleCompletionSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)



# ==========================================================
# AI SUGGESTION SERIALIZER (Optional)
# ==========================================================
class AIInsightSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField()
    category = serializers.CharField()
    icon = serializers.CharField()
    habit_name = serializers.CharField(required=False)
    action = serializers.CharField(required=False)
