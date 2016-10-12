from django import template

register = template.Library()


@register.filter(is_safe=True)
def call(obj, method_name):
    method = getattr(obj, method_name)
    if '__callArg' in obj.__dict__:
        ret = method(*obj.__callArg)
        del obj.__callArg
        return ret
    return method()


@register.filter(is_safe=True)
def args(obj, arg):
    if '__callArg' not in obj.__dict__:
        obj.__callArg = []
    obj.__callArg += [arg]
    return obj
