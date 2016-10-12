from django import template

register = template.Library()


@register.filter(is_safe=True)
def filesize(value):
    """
    Return human-readable filesize string.

    Adapted from https://djangosnippets.org/snippets/1866/
    """
    if value is None:
        return '-'

    if value < 512000:
        value = value / 1024.0
        ext = 'kb'
    elif value < 4194304000:
        value = value / 1048576.0
        ext = 'mb'
    else:
        value = value / 1073741824.0
        ext = 'gb'
    return '%s %s' % (str(round(value, 2)), ext)
