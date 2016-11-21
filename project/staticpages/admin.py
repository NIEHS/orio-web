from django.contrib import admin

from . import models


class PageAdmin(admin.ModelAdmin):
    readonly_fields = (
        'lookup_name',
    )

    list_display = (
        'lookup_name',
        'title',
        'created',
        'last_updated',
    )

admin.site.register(models.Page, PageAdmin)
