import json
from pygments import highlight
from pygments.lexers import JsonLexer
from pygments.formatters import HtmlFormatter

from django.utils.safestring import mark_safe


def pretty_json(json_dict):
    """
    Return dict as an html snipped of formatted JSON w/ syntax highlighting.

    Adapted from:
        http://www.pydanny.com/pretty-formatting-json-django-admin.html
    """
    formatter = HtmlFormatter(style='colorful')
    json_str = json.dumps(json_dict, sort_keys=True, indent=2)
    response = highlight(json_str, JsonLexer(), formatter)
    style = '<style>{0}</style><br>'.format(formatter.get_style_defs())
    return mark_safe(style + response)
