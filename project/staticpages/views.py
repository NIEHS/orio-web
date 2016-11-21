from . import models


class PageTemplateMixin:
    template_object_name = None

    def get_context_data(self, **kwargs):
         context = super().get_context_data(**kwargs)

        if self.template_object_name is None:
            raise NotImplementedError('Requires template name')

        obj, _ = models.Page.objects\
            .get_or_create(lookup_name=self.template_object_name)

        context['template'] = obj

        return context
