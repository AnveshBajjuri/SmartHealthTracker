from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


# =====================================================
# HABIT MODEL
# =====================================================
class Habit(models.Model):

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    CATEGORY_CHOICES = [
        ('health', 'Health'),
        ('fitness', 'Fitness'),
        ('learning', 'Learning'),
        ('mindfulness', 'Mindfulness'),
        ('productivity', 'Productivity'),
        ('social', 'Social'),
        ('creativity', 'Creativity'),
        ('finance', 'Finance'),
        ('other', 'Other'),
    ]

    TARGET_CHOICES = [
        ('Daily', 'Daily'),
        ('Weekly', 'Weekly'),
        ('Weekdays', 'Weekdays'),
        ('Weekends', 'Weekends'),
        ('Custom', 'Custom'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    
    icon = models.CharField(max_length=10, default='🎯')
    color = models.CharField(max_length=20, default='orange')

    target = models.CharField(max_length=20, choices=TARGET_CHOICES, default='Daily')
    frequency = models.PositiveIntegerField(default=1)

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='health')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')

    image = models.ImageField(upload_to='habits/', blank=True, null=True)
    
    reminder = models.TimeField(blank=True, null=True)
    notes = models.TextField(blank=True, default='')

    # Stats
    streak = models.PositiveIntegerField(default=0)
    total_completions = models.PositiveIntegerField(default=0)
    last_completed = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


    # =====================================================
    # Calculate Streak Function
    # =====================================================
    def calculate_streak(self):
        completions = list(self.completions.order_by('-date').values_list('date', flat=True))
        if not completions:
            return 0

        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        latest = completions[0]
        if latest not in [today, yesterday]:
            return 0

        streak = 1
        for i in range(1, len(completions)):
            prev = completions[i-1]
            current = completions[i]
            if (prev - current).days == 1:
                streak += 1
            else:
                break

        return streak



# =====================================================
# HABIT COMPLETION MODEL
# =====================================================
class HabitCompletion(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='completions')
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['habit', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.habit.name} - {self.date}"



# =====================================================
# REMINDER MODEL
# =====================================================
class Reminder(models.Model):

    DAYS_CHOICES = [
        ('everyday', 'Everyday'),
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends'),
        ('custom', 'Custom'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='reminders', blank=True, null=True)

    time = models.TimeField()
    days = models.CharField(max_length=20, choices=DAYS_CHOICES, default='everyday')
    custom_days = models.JSONField(default=list, blank=True)

    message = models.CharField(max_length=200, blank=True, default='')
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['time']

    def __str__(self):
        return f"{self.habit.name if self.habit else 'General'} @ {self.time}"


# =====================================================
# USER PROFILE
# =====================================================
class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='userprofile'     # ✔ FIXED! must match serializer
    )

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    timezone = models.CharField(max_length=50, default='UTC')
    notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
