from django.contrib import admin
from .models import Project, Milestone, Task, TaskChecklist, TaskComment, Timesheet, Issue


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ('title', 'assigned_to', 'priority', 'status', 'due_date')


class MilestoneInline(admin.TabularInline):
    model = Milestone
    extra = 0
    fields = ('title', 'due_date', 'status', 'progress_percentage')


class TaskChecklistInline(admin.TabularInline):
    model = TaskChecklist
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'category', 'status', 'health_status', 'progress_percentage', 'manager_name', 'due_date')
    list_filter = ('status', 'health_status', 'category')
    search_fields = ('code', 'title', 'manager_name')
    inlines = [MilestoneInline, TaskInline]


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'due_date', 'status', 'progress_percentage')
    list_filter = ('status',)
    search_fields = ('title', 'project__title')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'milestone', 'assigned_to', 'priority', 'status', 'due_date')
    list_filter = ('status', 'priority', 'task_type')
    search_fields = ('title', 'assigned_to', 'project__title')
    inlines = [TaskChecklistInline]


@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ('worker_name', 'task', 'work_date', 'hours', 'total_cost', 'approval_status')
    list_filter = ('approval_status', 'is_billable', 'work_date')
    search_fields = ('worker_name', 'task__title')


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'severity', 'status', 'reported_by', 'assigned_to', 'created_at')
    list_filter = ('severity', 'status')
    search_fields = ('title', 'project__title')
