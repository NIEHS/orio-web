import abc
from collections import OrderedDict
import numpy as np
from matplotlib.colors import rgb2hex, Normalize
from bokeh.models import HoverTool, FactorRange
from bokeh.plotting import figure, ColumnDataSource
from bokeh.embed import _get_components
from bokeh.resources import CDN
import seaborn as sns


class Chart(object):

    def __init__(self, data, tools="save", *args, **kwargs):
        self.plot = figure(tools=tools, toolbar_location="right")
        self.data = data
        self.set_data()
        self.set_metadata()

    @abc.abstractmethod
    def set_data(self):
        raise NotImplementedError()

    @abc.abstractmethod
    def set_metadata(self):
        raise NotImplementedError()

    def as_json(self, resource=CDN):
        all_models, plots, plot_info, divs = _get_components(self.plot, resource)
        return {
            "all_models": all_models,
            "plots": plots,
            "info": plot_info,
        }


class Heatmap(Chart):

    def __init__(self, data, *args, **kwargs):
        kwargs["tools"] = "reset,wheel_zoom,box_zoom,save,hover"
        return super(Heatmap, self).__init__(data, *args, **kwargs)

    def get_palette(self):
        return sns.diverging_palette(220, 20, sep=20, as_cmap=True)

    def get_gradient(self, arr):

        # normalize dataset
        normalizer = Normalize()
        norm_arr = normalizer(arr).tolist()

        # get color pallete
        palette = self.get_palette()
        rgbs = palette(norm_arr)

        # convert rgb to HEX and return gradient
        gradient = np.zeros(arr.size, dtype="S7")
        for i, rbg in enumerate(rgbs):
            gradient[i] = rgb2hex(rbg)

        return gradient

    def set_data(self):
        matrix = self.data.get('matrix')
        shape = matrix.shape
        xvals = ["x{}".format(i+1) for i in xrange(shape[0])]
        yvals = ["y{}".format(i+1) for i in xrange(shape[1])]
        xs = np.tile(xvals, shape[1])
        ys = np.repeat(yvals, shape[0])
        vals = matrix.ravel()
        colors = self.get_gradient(vals)

        source = ColumnDataSource(
            data=dict(
                xs=xs.tolist(),
                ys=ys.tolist(),
                colors=colors.tolist(),
                val=vals.tolist()))

        self.plot.x_range = FactorRange(factors=xvals)
        self.plot.y_range = FactorRange(factors=list(reversed(yvals)))

        self.plot.rect("xs", "ys", 1, 1, source=source, color="colors")

        hover = self.plot.select(dict(type=HoverTool))
        hover.tooltips = OrderedDict([
            ('value', '@val'),
            ('color', '@colors'),
        ])

    def set_metadata(self):
        self.plot.plot_width = 1000
        self.plot.plot_height = 200

        # self.plot.responsive = True
        self.plot.webgl = True

        self.plot.toolbar_location = "right"

        self.plot.grid.grid_line_color = None

        self.plot.axis.axis_line_color = None
        self.plot.axis.major_tick_line_color = None
        self.plot.axis.major_label_text_font_size = "0.5em"
        self.plot.axis.major_label_standoff = 3
        self.plot.axis.visible = None

        self.plot.xaxis.major_label_orientation = np.pi/4
