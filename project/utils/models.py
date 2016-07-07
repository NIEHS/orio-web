import os
import uuid

from django.db.models import FilePathField
from django.core.files.storage import FileSystemStorage


class ReadOnlyFileSystemStorage(FileSystemStorage):

    @classmethod
    def create_store(cls, location):
        return cls(location=location)

    def save(self, name, content, max_length=None):
        raise NotImplementedError()

    def delete(self, name):
        raise NotImplementedError()


def get_random_filename(root):
    # get new, unused, random filename
    while True:
        fn = os.path.abspath(
            os.path.join(
                root, "{}.txt".format(uuid.uuid4())
            )
        )
        if not os.path.exists(fn):
            break
    return fn


class DynamicFilePathField(FilePathField):

    def __init__(self, verbose_name=None, name=None, path='', match=None,
                 recursive=False, allow_files=True, allow_folders=False, **kwargs):
        self.path, self.match, self.recursive = path, match, recursive
        if callable(self.path):
            self.pathfunc, self.path = self.path, self.path()
        self.allow_files, self.allow_folders = allow_files, allow_folders
        kwargs['max_length'] = kwargs.get('max_length', 100)
        super(FilePathField, self).__init__(verbose_name, name, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(DynamicFilePathField, self).deconstruct()
        if hasattr(self, "pathfunc"):
            kwargs['path'] = self.pathfunc
        return name, path, args, kwargs
