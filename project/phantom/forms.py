from django import forms

from .constants import FORMAT_CHOICES


class RasterizeForm(forms.Form):
    format = forms.ChoiceField(choices=FORMAT_CHOICES)
    content = forms.CharField()
    width = forms.IntegerField(min_value=300)
    height = forms.IntegerField(min_value=300)
