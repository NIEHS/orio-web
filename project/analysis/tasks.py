from datetime import timedelta
from celery.utils.log import get_task_logger
from celery.decorators import task, periodic_task
from celery import group, chain
from django.apps import apps
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist


logger = get_task_logger(__name__)


def gm(name):
    # shortcut to get model from analysis application
    return apps.get_model('analysis', name)


@task()
def raise_error():
    """DEBUG task added to ensure that celery errors are handled correctly."""
    raise NotImplementedError('Successful raising of error')


@task(bind=True)
def execute_analysis(self, analysis_id, silent):
    """Run all feature-list count matrix in parallel."""
    try:
        analysis = gm('Analysis').objects.get(id=analysis_id)
    except ObjectDoesNotExist:
        return

    EncodeDataset = gm('EncodeDataset')
    ads_qs = analysis.analysisdatasets_set.all()\
        .prefetch_related('dataset', 'dataset__encodedataset', 'dataset__userdataset')
    task1 = group([
        execute_count_matrix.si(
            analysis.id,
            ads.id,
            isinstance(ads.dataset.subclass, EncodeDataset),
            ads.dataset.subclass.id)
        for ads in ads_qs
    ])

    # after completion, build combinatorial result and save
    task2 = execute_matrix_combination.si(analysis_id, silent)

    # chain tasks to be performed serially
    return chain(task1, task2)()


@task()
def execute_count_matrix(analysis_id, ads_id, is_encode, dataset_id):
    """Execute each count matrix."""
    try:
        analysis = gm('Analysis').objects.get(id=analysis_id)
        ads = gm('AnalysisDatasets').objects.get(id=ads_id)
        if is_encode:
            dataset = gm('EncodeDataset').objects.get(id=dataset_id)
        else:
            dataset = gm('UserDataset').objects.get(id=dataset_id)
    except ObjectDoesNotExist:
        return

    FeatureListCountMatrix = gm('FeatureListCountMatrix')
    ads.count_matrix = FeatureListCountMatrix.execute(analysis, dataset)
    ads.save()


@task()
def execute_matrix_combination(analysis_id, silent):
    """Save results from matrix combination."""
    try:
        analysis = gm('Analysis').objects.get(id=analysis_id)
    except ObjectDoesNotExist:
        return
    analysis.output = analysis.execute_mat2mat()
    analysis.end_time = timezone.now()
    analysis.save()
    if not silent:
        analysis.send_completion_email()


@task()
def download_dataset(id_):
    dd = gm('DatasetDownload').objects.get(id=id_)
    dd.download()


@task()
def analysis_zip(id_, to_email_address):
    analysis = gm('Analysis').objects.get(id=id_)
    analysis.create_zip(to_email_address)


@periodic_task(run_every=timedelta(hours=1))
def remove_expired_download_links():
    gm('TemporaryDownload').remove_expired()
