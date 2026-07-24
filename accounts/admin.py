from django.contrib import admin

from .models import MessageSupport


@admin.register(MessageSupport)
class MessageSupportAdmin(admin.ModelAdmin):
    list_display = ("nom", "email", "sujet", "date_envoi", "traite")
    list_filter = ("sujet", "traite")
    search_fields = ("nom", "email", "message")
