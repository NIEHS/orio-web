import os

from django.db import models
from django.conf import settings
from django.contrib.auth import models as auth_models
from django.utils import timezone


class UserManager(auth_models.BaseUserManager):

    use_in_migrations = True

    def create_user(self, email, password=None, **extra):
        return self._create_user(email, password, False, False, **extra)

    def create_superuser(self, email, password, **extra):
        return self._create_user(email, password, True, True, **extra)

    def _create_user(self, email, password, is_staff, is_superuser, **extra):
        now = timezone.now()
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            is_active=True,
            is_staff=is_staff,
            is_superuser=is_superuser,
            date_joined=now,
            **extra
        )
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(auth_models.AbstractBaseUser):
    objects = UserManager()
    email = models.EmailField('email address', unique=True, db_index=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    @property
    def path(self):
        return os.path.join(settings.USERDATA_PATH, str(self.id))

    @property
    def files(self):
        return os.listdir(self.path)

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return auth_models._user_has_perm(self, perm, obj=obj)

    def has_module_perms(self, module):
        return auth_models._user_has_module_perms(self, module)
