from django.contrib import admin
from .models import Habit, HabitCompletion, Reminder, UserProfile


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'category', 'difficulty', 'streak', 'total_completions', 'created_at']
    list_filter = ['category', 'difficulty', 'target', 'created_at']
    search_fields = ['name', 'description', 'user__username']
    ordering = ['-created_at']


@admin.register(HabitCompletion)
class HabitCompletionAdmin(admin.ModelAdmin):
    list_display = ['habit', 'date', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['habit__name']
    ordering = ['-date']


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ['habit', 'user', 'time', 'days', 'is_active', 'created_at']
    list_filter = ['is_active', 'days', 'created_at']
    search_fields = ['habit__name', 'user__username', 'message']
    ordering = ['time']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'timezone', 'notifications_enabled', 'created_at']
    list_filter = ['notifications_enabled', 'created_at']
    search_fields = ['user__username', 'user__email']
