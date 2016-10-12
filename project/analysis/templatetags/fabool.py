from django import template
from django.utils.safestring import mark_safe


register = template.Library()


@register.filter(is_safe=True)
def fabool(bool_):
    """Return a font-awesome boolean checkbox icon."""
    if bool_:
        txt = "<i class='fa fa-check-square-o' title'checked'></i>"
    else:
        txt = "<i class='fa fa-square-o' title='un-checked'></i>"
    return mark_safe(txt)
