import json
from pygments import highlight
from pygments.lexers import JsonLexer
from pygments.formatters import HtmlFormatter

from django.utils.safestring import mark_safe


def prettyJSON(jsonDict):
    # Adapted from:
    #   http://www.pydanny.com/pretty-formatting-json-django-admin.html
    formatter = HtmlFormatter(style='colorful')
    jsonStr = json.dumps(jsonDict, sort_keys=True, indent=2)
    response = highlight(jsonStr, JsonLexer(), formatter)
    style = '<style>{0}</style><br>'.format(formatter.get_style_defs())
    return mark_safe(style + response)
