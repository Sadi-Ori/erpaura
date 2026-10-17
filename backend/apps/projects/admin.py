from django.contrib import admin
from .models import Project, Task, Timesheet


class TaskInline(admin.TabularInline):
    model = Task
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'status', 'progress_percentage', 'budget', 'spent', 'start_date', 'due_date')
    list_filter = ('status', 'start_date')
    search_fields = ('code', 'title')
    inlines = [TaskInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'priority', 'status', 'assigned_to', 'estimated_hours', 'logged_hours', 'due_date')
    list_filter = ('priority', 'status', 'project')
    search_fields = ('title', 'assigned_to')


@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ('worker_name', 'task', 'work_date', 'hours')
    list_filter = ('work_date',)
    search_fields = ('worker_name', 'task__title')
