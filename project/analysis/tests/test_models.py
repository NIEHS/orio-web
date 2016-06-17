from analysis import models


def test_bad_urls():
    x = models.DatasetDownload.check_valid_url('http://www.kelev.biz')
    assert x[0] is False
