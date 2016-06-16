import $ from 'jquery';
import d3 from 'd3';
import _ from 'underscore';


class IndividualHeatmap {

    constructor (id, matrix_names, matrix_ids, heatmap_name, modal_title, modal_body, sort_vector) {
        this.id = id;
        this.matrix_names = matrix_names;
        this.matrix_ids = matrix_ids;
        this.heatmap_name = heatmap_name;
        this.modal_title = modal_title;
        this.modal_body = modal_body;
        this.selected_sort = null;
        this.sort_vector = sort_vector;

        this.matrices = _.zip(this.matrix_ids, this.matrix_names);

        this.modal_dim = {
            'x': 0,
            'y': 0,
            'h': this.modal_body.height(),
            'w': this.modal_body.width(),
        };
        this.heatmap_dim = {
            'x': 0.4 * this.modal_dim.w,
            'y': 0.1 * this.modal_dim.h,
            'h': parseInt(0.85 * this.modal_dim.h),
            'w': parseInt(0.55 * this.modal_dim.w),
        };
        this.meta_dim = {
            'x': 0,
            'y': 0.05 * this.modal_dim.h,
            'h': 0.25 * this.modal_dim.h,
            'w': 0.4 * this.modal_dim.w,
        };
        this.quartile_dim = {
            'x': 0,
            'y': 0.35 * this.modal_dim.h,
            'h': 0.25 * this.modal_dim.h,
            'w': 0.4 * this.modal_dim.w,
        };
        this.sort_dim = {
            'x': 0.05 * this.modal_dim.w,
            'y': 0.68 * this.modal_dim.h,
            'h': 0.15 * this.modal_dim.h,
            'w': 0.335 * this.modal_dim.w,
        };
    }

    displayQuartilePValue(p) {
        this.modal_body.find('#quartile_pval').remove();
        $(`<p id="quartile_pval">p-value = ${p.toExponential(2)}</p>`)
            .css({
                'position': 'absolute',
                'left': 0.11 * this.modal_dim.w,
                'top': this.quartile_dim.y + 0.02 * this.modal_dim.h,
                'height': this.quartile_dim.h,
                'width': this.quartile_dim.w,
            })
            .appendTo(this.modal_body);
    }

    createResortOptions() {
        var self = this;
        //Remove heatmap div if there; append heatmap div
        this.modal_body.find('#select_list').remove();

        $('<h4>')
            .text('Feature list order')
            .css({
                'position': 'absolute',
                'top': this.sort_dim.y - 0.05 * this.modal_dim.h,
                'left': this.sort_dim.x,
            })
            .appendTo(this.modal_body);

        var select_list = $('<select>')
            .attr({
                'size': '12',
            })
            .css({
                'height': this.sort_dim.h,
                'width': this.sort_dim.w,
                'font-size': '8px',
                'position': 'absolute',
                'top': this.sort_dim.y,
                'left': this.sort_dim.x,

            })
            .appendTo(this.modal_body);

        var options = this.matrices;
        if (this.sort_vector) {
            options.unshift(['Sort vector order','Sort vector order']);
        }
        options.unshift(['Feature list order', 'Feature list order']);

        d3.select(select_list.get(0))
            .selectAll('option')
            .data(this.matrices)
            .enter()
            .append('option')
            .text(function(d) {return d[1];})
            .attr('value', function(d) {return d[0];});

        this.modal_body.find('#displayCorrelations').remove();

        $('<button>')
            .text('Reorder heatmap')
            .attr({
                'id': 'displayCorrelations',
                'class': 'btn btn-primary',
            })
            .css({
                'width': this.sort_dim.w,
                'position': 'absolute',
                'top': this.sort_dim.y + 0.16 * this.modal_dim.h,
                'left': this.sort_dim.x,
            })
            .appendTo(this.modal_body)
            .click(function(){
                if (select_list.val() == 'Feature list order') {
                    self.renderSorted(self.heatmap_dim.w, self.heatmap_dim.h, 0, 0);
                } else if (select_list.val() == 'Sort vector order') {
                    self.renderSorted(self.heatmap_dim.w, self.heatmap_dim.h, 1, 0);
                } else {
                    self.renderSorted(self.heatmap_dim.w, self.heatmap_dim.h, 0, select_list.val());
                }
            });
    }

    drawQuartiles(quartile_averages, bin_labels) {

        this.modal_body.find('#quartile_plot').remove();
        var quartile_plot = $('<div id="quartile_plot"></div>')
            .css({
                'position': 'absolute',
                'left': this.quartile_dim.x,
                'top': this.quartile_dim.y,
                'height': this.quartile_dim.h,
                'width': this.quartile_dim.w,
            })
            .appendTo(this.modal_body);


        this.modal_body.find('#quartile_label').remove();
        var quartile_label = $('<div id="quartile_label"></div>')
            .css({
                'position': 'absolute',
                'left': this.quartile_dim.x + 0.05 * this.modal_dim.w,
                'top': this.quartile_dim.y - 0.02 * this.modal_dim.h,
                'height': 0.02 * this.modal_dim.h,
                'width': 0.3 * this.modal_dim.w,
            })
            .appendTo(this.modal_body);

        quartile_label.append('<p>Quartiles, bin averages:</p>');

        this.modal_body.find('#quartile_legend').remove();
        var quartile_legend = $('<div id="quartile_legend"></div>')
            .css({
                'position': 'absolute',
                'left': this.quartile_dim.x + 0.1 * this.modal_dim.w,
                'top': this.quartile_dim.y + 0.25 * this.modal_dim.h,
                'height': 0.05 * this.modal_dim.h,
                'width': 0.3 * this.modal_dim.w,
            })
            .appendTo(this.modal_body);


        var height = quartile_plot.height(),
            width = quartile_plot.width(),
            legend_height = quartile_legend.height(),
            legend_width = quartile_legend.width(),
            margins = {
                'top': 0.1 * height,
                'bottom': 0.15 * height,
                'left': 0.25 * width,
                'right': 0.05 * width,
            },
            colors = ['red', 'orange', 'blue', 'black'];

        var legend = d3.select(quartile_legend.get(0))
            .append('svg')
            .attr('height', legend_height)
            .attr('width', legend_width)
            .style('overflow', 'visible');

        legend.append('g')
            .selectAll('rect')
            .data(colors)
            .enter()
            .append('rect')
            .attr('x', function(d,i) { return (i * (legend_width/5)); })
            .attr('y', 1*legend_height/4)
            .attr('width', '10')
            .attr('height', '10')
            .style('fill', function(d) {return d;});

        legend.append('g')
            .selectAll('text')
            .data(colors)
            .enter()
            .append('text')
            .text(function(d, i) { return i;})
            .attr('x', function(d, i) {return (i * (legend_width/5)) + 20;})
            .attr('y', 2.25*legend_height/4)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'left');

        var row_number = bin_labels.length-1;
        var window_values = [];

        for (var i in bin_labels) {
            var val_1 = parseInt(bin_labels[i].split(':')[0]),
                val_2 = parseInt(bin_labels[i].split(':')[1]);
            window_values.push((val_1 + val_2)/2);
        }

        var max_value = Math.max(...[].concat.apply([],quartile_averages));

        var y = d3.scale.linear()
            .domain([0, max_value])
            .range([(height - margins.top - margins.bottom), 0]);
        var x = d3.scale.linear()
            .domain([parseInt(bin_labels[0].split(':')[0]), parseInt(bin_labels[bin_labels.length-1].split(':')[1])])
            .range([0, (width - margins.left - margins.right)]);

        var line = d3.svg.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);});

        var graph = d3.select(quartile_plot.get(0))
            .append('svg:svg')
            .attr('height', height)
            .attr('width', width)
            .append('svg:g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        var xAxis = d3.svg.axis().scale(x).ticks(4).tickSubdivide(true);
        graph.append('svg:g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (height - margins.top - margins.bottom) + ')')
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(2).orient('left');
        graph.append('svg:g')
            .attr('class', 'y axis')
            .call(yAxisLeft);

        for (var i = 0; i < quartile_averages.length; i++) {
            var scatter = [],
                line_color = colors[i];
            for (var j = 0; j < quartile_averages[i].length; j++) {
                scatter.push([window_values[j], quartile_averages[i][j]]);
            }
            graph.append('svg:path').attr('d', line(scatter))
                .style('stroke', line_color);
        }
    }

    drawMetaPlot(averages, bin_labels) {
        var modal_body = this.modal_body;

        modal_body.find('#metaplot_label').remove();

        var metaplot_label = $('<div id="metaplot_label">')
            .css({
                'position': 'absolute',
                'left': this.meta_dim.x + 0.05 * this.modal_dim.w,
                'top': this.meta_dim.y - 0.02 * this.modal_dim.h,
                'height': this.meta_dim.h - 0.23 * this.modal_dim.h,
                'width': this.meta_dim.w,
            })
            .appendTo(modal_body);

        metaplot_label.append('<p>Bin averages:</p>');

        modal_body.find('#metaplot').remove();

        var metaplot = $('<div id="metaplot"></div>')
            .css({
                'position': 'absolute',
                'left': this.meta_dim.x,
                'top': this.meta_dim.y,
                'height': this.meta_dim.h,
                'width': this.meta_dim.w,
            })
            .appendTo(modal_body);

        var height = metaplot.height(),
            width = metaplot.width(),
            margins = {
                'top': 0.1 * height,
                'bottom': 0.15 * height,
                'left': 0.25 * width,
                'right': 0.05 * width,
            };

        var row_number = bin_labels.length-1,
            window_values = [];

        for (var i in bin_labels) {
            var val_1 = parseInt(bin_labels[i].split(':')[0]),
                val_2 = parseInt(bin_labels[i].split(':')[1]);
            window_values.push((val_1 + val_2)/2);
        }

        var scatter = [];
        for (var i = 0; i < window_values.length; i++) {
            scatter.push([window_values[i], averages[i]]);
        }

        var y = d3.scale.linear()
            .domain([0, d3.max(averages)])
            .range([(height - margins.top - margins.bottom), 0]);
        var x = d3.scale.linear()
            .domain([bin_labels[0].split(':')[0], bin_labels[bin_labels.length-1].split(':')[1]])
            .range([0, (width - margins.left - margins.right)]);

        var line = d3.svg.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);});

        var graph = d3.select(metaplot.get(0))
            .append('svg:svg')
            .attr('height', height)
            .attr('width', width)
            .append('svg:g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        var xAxis = d3.svg.axis().scale(x).ticks(4).tickSubdivide(true);
        graph.append('svg:g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (height - margins.top - margins.bottom) + ')')
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(2).orient('left');
        graph.append('svg:g')
            .attr('class', 'y axis')
            .call(yAxisLeft);

        graph.append('svg:path').attr('d', line(scatter));
    }

    drawHeatmapHeader(data) {
        var modal_body = this.modal_body;

        modal_body.find('#heatmap_header').remove();
        var heatmap_header = $('<div id=\'heatmap_header\'></div>')
            .css({
                'height': this.heatmap_dim.y,
                'width': this.heatmap_dim.w,
                'position': 'absolute',
                'left': this.heatmap_dim.x,
                'top': 0,
            })
            .appendTo(modal_body);

        var range_start = parseInt(data[0].split(':')[0]),
            range_end = parseInt(data[data.length-1].split(':')[1]),
            zero_position = heatmap_header.width()/(range_end-range_start)*(0-range_start);

        var svg = d3.select(heatmap_header.get(0))
            .append('svg')
            .attr('height', heatmap_header.height())
            .attr('width', heatmap_header.width())
            .style('overflow', 'visible');

        var header_lines = [
            {text: range_start, position: 0},
            {text: range_end, position: heatmap_header.width()},
            {text: '0', position: zero_position},
        ];

        svg.append('g')
            .selectAll('line')
            .data(header_lines)
            .enter()
            .append('line')
            .attr('x1', function(d) {return d.position;})
            .attr('x2', function(d) {return d.position;})
            .attr('y1', 0.6*heatmap_header.height())
            .attr('y2', 0.9*heatmap_header.height())
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('line')
            .attr('x1', 0)
            .attr('x2', heatmap_header.width())
            .attr('y1', 0.9*heatmap_header.height())
            .attr('y2', 0.9*heatmap_header.height())
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('g')
            .selectAll('text')
            .data(header_lines)
            .enter()
            .append('text')
            .text(function(d) { return d.text;})
            .attr('x', function(d) {return d.position;})
            .attr('y', 0.45*heatmap_header.height())
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'middle');
    }

    drawHeatmap(data, norm_val) {
        var sigmoid = function(i, median) {
            return (1 + ((i - median)/(1 + Math.abs(i - median))));
        };

        var modal_body = this.modal_body;

        modal_body.find('#heatmap_canvas').remove();
        var heatmap_canvas = $('<canvas id="heatmap_canvas"></canvas>')
            .prop({
                'height': this.heatmap_dim.h,
                'width': this.heatmap_dim.w,
            })
            .css({
                'position': 'absolute',
                'left': this.heatmap_dim.x,
                'top': this.heatmap_dim.y,
            })
            .appendTo(modal_body);

        var context = document.getElementById('heatmap_canvas')
            .getContext('2d');

        var colorScale = d3.scale.linear()
            .domain([
                norm_val.lower_quartile,
                norm_val.median,
                norm_val.upper_quartile,
            ])
            .clamp(false)
            .range([
                '#fee5d9',
                '#fcae91',
                '#fb6a4a',
            ]);

        for (var i in data) {
            for (var j in data[i]) {
                context.fillStyle=colorScale(data[i][j]);
                context.fillRect(j,i,1,1);
            }
        }
    }

    render() {
        this.modal_title.html(this.heatmap_name);
        this.createResortOptions();
        this.renderSorted(this.heatmap_dim.w, this.heatmap_dim.h, 0, 0);
    }

    renderSorted(dim_x, dim_y, analysis_sort, sort_id) {
        var sortedUrl = function(id, dim_x, dim_y) {
            return (
                `/dashboard/api/`+
                `feature-list-count-matrix/${id}/`+
                `sorted_render/`+
                `?dim_x=${dim_x}`+
                `&dim_y=${dim_y}`+
                `&analysis_sort=${analysis_sort}`+
                `&sort_id=${sort_id}`
            );
        };

        var self = this;
        $.get(sortedUrl(this.id, dim_x, dim_y),
            function(data) {
                self.drawHeatmap(data.smoothed_data, data.norm_val);
                self.drawHeatmapHeader(data.bin_labels);
                self.drawMetaPlot(data.bin_averages, data.bin_labels);
                self.drawQuartiles(data.quartile_averages, data.bin_labels);
                self.displayQuartilePValue(data.ad_results.pvalue);
        });
    }
}

export default IndividualHeatmap;
