from myuser.models import User
from analysis import forms

import pytest


@pytest.mark.django_db
def test_me():
    u = User()
    data = {
        'public': 'on',
        'genome_assembly': '1',
        'bin_number': '12',
        'datasets_json': '',
        'name': "' OR SLEEP(10)#",
        'bin_size': 'CHSuser',
        'anchor': '1',
        'csrfmiddlewaretoken': 'Mvp7CMZPTaQB00quWnqKHSV6i1xG8SZW',
        'bin_start': 'CHSuser',
        'description': 'CHSuser',
        'feature_list': '',
        'sort_vector': '',
    }
    form = forms.AnalysisForm(data=data, owner=u)
    assert form.is_valid() is False
