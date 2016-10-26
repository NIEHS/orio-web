import $ from 'jquery';
import d3 from 'd3';

import Loader from './Loader';
import FeatureClusterDetailModal from './FeatureClusterDetailModal';
import {interpolateRdYlBu} from 'd3-scale-chromatic';
import {interpolateSpectral} from 'd3-scale-chromatic';

import {heatmapColorScale} from './utils';


class FeatureClusteringOverview{

    constructor(el) {
        this.el = el;
        this.id = window.analysisObjectID;
        this.colors = this.getColors();
        window.clustHeatmapOffset = {left:60};
    }

    getColors(){
        var label_vals = [1, 0, 0.9, 0.1, 0.8, 0.2, 0.7, 0.3, 0.6, 0.4];
        return label_vals.map((d) => interpolateSpectral(d));
    }

    featureClusteringOverviewInitURL(id) {
        return `/dashboard/api/analysis/${id}/feature_clustering_overview/`;
    }

    fcFeatureDataURL(id, feature_name) {
        return `/dashboard/api/analysis/${id}/feature_data/?feature=${feature_name}`;
    }

    getClusterKUrl(id, k, dim_x, dim_y) {
        return `/dashboard/api/analysis/${id}/k_clust_heatmap/?` +
            $.param({k, dim_x, dim_y});
    }

    renderHeatmap(heatmap, data){

        this.loadingSpinner.fadeOut();

        var colors = this.colors,
            context = heatmap.get(0).getContext('2d'),
            heatmap_col_tooltips = this.heatmap_col_tooltips,
            heatmap_clusters = this.heatmap_clusters;

        heatmap_col_tooltips.empty();
        heatmap_clusters.empty();

        var colorScale = d3.scale.linear()
            .domain([0, 1])
            .range(['white', '#cc4248']);

        var display_width = heatmap.width() - window.clustHeatmapOffest.left;

        context.translate(window.clustHeatmapOffest.left,0);
        var scale_y =  data['display_data'].length < heatmap.height()
            ? heatmap.height() / data['display_data'].length
            : 1;
        var scale_x =  data['display_data'][0].length < display_width
            ? display_width / data['display_data'][0].length
            : 1;
        context.scale(scale_x, scale_y);

        for (var i in data['display_data']) {
            for (var j in data['display_data'][i]) {
                context.fillStyle=interpolateRdYlBu(heatmapColorScale(-data['display_data'][i][j]))
                context.fillRect(j,i,1,1);
            }
        }

        var height = heatmap_col_tooltips.height(),
            width = heatmap_col_tooltips.width() - window.clustHeatmapOffset.left,
            col_number = data['col_names'].length;

        var cell_width = width/col_number;
        var svg = d3.select(heatmap_col_tooltips.get(0))
            .append('svg')
            .attr('height', heatmap_col_tooltips.height())
            .attr('width', heatmap_col_tooltips.width());

        var handleHeatmapMouseOver = function(d) {
                d3.select(this)
                    .style('stroke', 'black')
                    .style('stroke-width', '1');

                $(this).tooltip({
                    container: 'body',
                    title: d,
                    html: true,
                    animation: false,
                }).tooltip('show');
            },
            handleHeatmapMouseOut = function () {
                d3.select(this)
                    .style('stroke', 'none');
            };

        svg.append('g')
            .selectAll('rect')
            .data(data['col_names'])
            .enter()
            .append('rect')
            .text((d) => d)
            .attr('x', (d, i) => (i * cell_width + window.clustHeatmapOffset.left))
            .attr('y', 0)
            .attr('width', cell_width)
            .attr('height', height)
            .style('fill', 'transparent')
            .on('mouseover', handleHeatmapMouseOver)
            .on('mouseout', handleHeatmapMouseOut);

        $('[data-toggle="tooltip"]').tooltip();

        var handleMouseOver = function (d, i) {
                $(this).tooltip({
                    container: 'body',
                    title: `Cluster ${(i+1)}<br/>${d.entry} entries<br/>(click to show details)`,
                    html: true,
                    animation: false,
                }).tooltip('show');

                d3.select(this)
                    .style('fill', d3.hsl(colors[i]).brighter(1))
                    .style('cursor', 'pointer');
            },
            handleMouseOut = function (d, i) {
                $(this).tooltip('hide');

                d3.select(this)
                    .style('fill', colors[i]);
            };

        var cluster_sizes = [],
            entry_count = 0;

        for (i in data['cluster_sizes']) {
            cluster_sizes.push({'entry':data['cluster_sizes'][i], 'cume':entry_count});
            entry_count += data['cluster_sizes'][i];
        }

        svg = d3.select(heatmap_clusters.get(0))
            .append('svg')
            .attr('height', heatmap_clusters.height())
            .attr('width', heatmap_clusters.width());

        svg.append('g')
            .selectAll('rect')
            .data(cluster_sizes)
            .enter()
            .append('rect')
            .attr('class', 'cluster_bar')
            .attr('x', window.clustHeatmapOffset.left - 24)
            .attr('y', (d) => (d.cume/entry_count)*heatmap_clusters.height())
            .attr('width', 16)
            .attr('height', (d) => (d.entry/entry_count)*heatmap_clusters.height())
            .style('fill', (d, i) => colors[i])
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut)
            .on('click', (d, i) => new FeatureClusterDetailModal(
                $('#flcModal'), d, parseInt(this.id), cluster_sizes.length, i+1));

        svg.append('text')
            .text('Clusters')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(24,${0.5*height}) rotate(-90)`);
    }

    drawHeatmap(k) {
        var heatmapDiv = this.heatmapDiv,
            url = this.getClusterKUrl(window.analysisObjectID, k, heatmapDiv.width(), heatmapDiv.height());

        heatmapDiv.empty();
        let heatmap = $('<canvas>')
            .prop({
                'height': heatmapDiv.height(),
                'width': heatmapDiv.width(),
            }).appendTo(heatmapDiv);

        window.clustHeatmapOffest = {left: 60};

        $.get(url, this.renderHeatmap.bind(this, heatmap));
    }

    drawDendrogram(data) {
        var dendro = this.dendro,
            line_coords = [],
            x_max = parseFloat(Math.max(...[].concat.apply([], data['icoord']))),
            y_max = parseFloat(Math.max(...[].concat.apply([], data['dcoord']))),
            x_min = parseFloat(Math.min(...[].concat.apply([], data['icoord']))),
            y_min = parseFloat(Math.min(...[].concat.apply([], data['dcoord']))),
            height = dendro.height(),
            width = dendro.width() - window.clustHeatmapOffset.left,
            ceiling = 0.05*dendro.height(),
            leaf_num = data['leaves'].length,
            icoords = data['icoord'],
            dcoords = data['dcoord'],
            leafHeight = ((0.5/leaf_num)*width);

        for(var i=0; i<icoords.length; i++){
            for(var j=0; j<3; j++){
                line_coords.push({
                    y1: height-((parseFloat(dcoords[i][j])-y_min)/(y_max-y_min))*(height-ceiling),
                    y2: height-((parseFloat(dcoords[i][j+1])-y_min)/(y_max-y_min))*(height-ceiling),
                    x1: leafHeight+((parseFloat(icoords[i][j])-x_min)/(x_max-x_min))*(width*((leaf_num-1)/leaf_num)),
                    x2: leafHeight+((parseFloat(icoords[i][j+1])-x_min)/(x_max-x_min))*(width*((leaf_num-1)/leaf_num)),
                });
            }
        }

        var svg = d3.select(dendro.get(0))
            .append('svg')
            .attr('width', dendro.width())
            .attr('height', dendro.height());

        svg.append('g')
            .selectAll('line')
            .data(line_coords)
            .enter()
            .append('line')
            .attr('class', 'dendroLine')
            .attr('x1', (d) => window.clustHeatmapOffset.left + d.x1)
            .attr('x2', (d) => window.clustHeatmapOffset.left + d.x2)
            .attr('y1', (d) => d.y1)
            .attr('y2', (d) => d.y2);
    }

    writeVertNames(col_names) {
        //Draw SVGs
        var vert = this.vert,
            height = vert.height(),
            width = vert.width() - window.clustHeatmapOffset.left,
            col_number = col_names.length;

        var svg = d3.select(vert.get(0))
            .append('svg')
            .attr('height', vert.height())
            .attr('width', vert.width());

        svg.append('g')
            .attr('transform', `translate(${window.clustHeatmapOffset.left},0)`)
            .selectAll('text')
            .data(col_names)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text((d) => d)
            .attr('x', (d,i) => {
                return (((0.5 / col_number) * width) + i * (width / col_number));
            })
            .attr('y', 0)
            .attr('transform', (d,i) => {
                var rot = (((0.5/col_number)*width) + i*(width/col_number));
                return `rotate(90 ${rot},0)`;
            });
    }

    makeKSelect() {
        function addOptions(el_1, option_array) {
            var select = el_1.find('#select_k');

            select.empty();

            d3.select(select.get(0))
                .selectAll('option')
                .data(option_array)
                .enter()
                .append('option')
                .text((d) => d)
                .attr('value', (d) => d);
        }

        var self = this,
            select_list = this.select_list,
            resetDisplayFlags = function() {
                window.show_centroid = [];
                d3.range(parseInt(this.value)).forEach(function(i) {
                    window.show_centroid.push(true);
                });
                self.loadingSpinner.show();
                self.drawHeatmap(this.value);
                self.drawCentroidPlot(this.value, null);
                self.drawCentroidPlotLegend(this.value);
                self.populateClusterSelect(this.value);
            };

        select_list
            .change(resetDisplayFlags);

        addOptions(this.el, d3.range(2,11));
        select_list[0].selectedIndex = 0;
    }

    populateClusterSelect(k) {
        function addOptions(el_1, option_array) {
            var select = el_1.find('#select_cluster');

            select.empty();

            d3.select(select.get(0))
                .selectAll('option')
                .data(option_array)
                .enter()
                .append('option')
                .text((d) => d)
                .attr('value', (d) => d);
        }

        var self = this,
            select_list = this.clust_select_list;

        addOptions(this.el, d3.range(1,parseInt(k)+1));
        select_list[0].selectedIndex = 0;
    }

    renderCentroidPlot(offset, k, centroids, col_names, feature_data){

        var plot_max = 0;
        for (var cluster in centroids[k]) {
            centroids[k][cluster].forEach( function(value) {
                if ((parseFloat(value) > plot_max) & window.show_centroid[cluster-1]) {
                    plot_max = parseFloat(value);
                }
            });
        }

        if (feature_data) {
            for (var i = 0; i < feature_data.length; i++) {
                if (parseFloat(feature_data[i]) > plot_max) {
                    plot_max = parseFloat(feature_data[i]);
                }
            }
        }

        if (plot_max < 1) { plot_max = 1;}

        let $graph = this.graph;

        $graph.empty();
        var graph = d3.select($graph.get(0)).append('svg')
            .attr('width', $graph.width())
            .attr('height', $graph.height())
            .append('g');

        var y = d3.scale.linear()
            .domain([0,plot_max])
            .range([$graph.height() - offset.bottom, offset.top]);

        var x = d3.scale.ordinal()
            .domain(window.matrix_names)
            .rangePoints([offset.left, $graph.width() - offset.right], 1);

        var line = d3.svg.line()
            .x((d,i) => x(window.matrix_names[i]))
            .y((d) => y(d));

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .outerTickSize(0);

        var xGrid = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .outerTickSize(0)
            .innerTickSize(-($graph.height() - offset.top - offset.bottom))
            .tickFormat('');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        graph.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${$graph.height() - offset.bottom})`)
            .call(xAxis)
            .selectAll('text')
                .style('text-anchor', 'end')
                .style('font-size', '8px')
                .attr('dx', '-1.6em')
                .attr('dy', '-0.8em')
                .attr('transform', 'rotate(-90)');

        graph.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${$graph.height() - offset.bottom})`)
            .style('stroke-dasharray', ('3, 3'))
            .call(xGrid);

        graph.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${offset.left},0)`)
            .call(yAxis);

        var _text = ['Upper quartile-normalized', 'counts'];
        graph.append('g')
            .selectAll('text')
            .data(_text)
            .enter()
            .append('text')
            .text((d) => d)
            .attr('class', 'y label')
            .attr('text-anchor', 'middle')
            .attr('transform', (d,i) => {
                return `translate(${offset.left-52+(i*12)}, ${0.4*$graph.height()}) rotate(-90)`
            });

        var colors = this.colors;
        graph.append('g')
            .selectAll('path')
            .data(d3.values(centroids[k]))
            .enter()
            .append('path')
            .attr('d', (d) => line(d))
            .style('stroke', (d,i) => {
                return (window.show_centroid[i])? colors[i]: 'none';
            })
            .style('fill', 'none')
            .style('stroke-width', '3');

        if (feature_data) {
            graph.append('path')
                .attr('d', line(feature_data))
                .style('stroke', 'black')
                .style('fill', 'none')
                .style('stroke-width', '3');
        }

        var cell_width = (
            ($graph.width() - offset.left - offset.right) /
            window.matrix_names.length
        );

        var h = $graph.height() - offset.top - offset.bottom;

        var showTooltip = function (d) {
                d3.select(this)
                    .style('stroke', 'black')
                    .style('stroke-width', '1');

                $(this).tooltip({
                    container: 'body',
                    title: d,
                    html: true,
                    animation: false,
                }).tooltip('show');
            },
            hideToolTip = function () {
                d3.select(this)
                    .style('stroke', 'none');
            };

        graph.append('g')
            .selectAll('rect')
            .data(window.matrix_names)
            .enter()
            .append('rect')
            .text((d) => d)
            .attr('x', (d, i) => (offset.left + i * cell_width))
            .attr('y', offset.top)
            .attr('width', cell_width)
            .attr('height', h)
            .style('fill', 'transparent')
            .on('mouseover', showTooltip)
            .on('mouseout', hideToolTip);
    }

    drawCentroidPlot(k, feature_name) {
        var offset = {
            'top': (1/20)*this.graph.height(),
            'bottom': (3/10)*this.graph.height(),
            'left': 80,
            'right': 0,
        };

        if (feature_name) {
            var url = this.fcFeatureDataURL(this.id, feature_name),
                callback = function(data) {
                    this.renderCentroidPlot(offset, k, window.centroids, window.matrix_names, data);
                };
            $.get(url, callback.bind(this));
        } else {
            this.renderCentroidPlot(offset,k, window.centroids, window.matrix_names, null);
        }
    }

    drawHeatmapLegend() {

        var legendScale = d3.scale.linear()
            .domain([0, 1])
            .range([0, 1]);

        var legend = this.legend,
            height = legend.height(),
            width = legend.width(),
            legend_text = ['0','Upper quartile'],
            gradient = legendScale.ticks(20),
            cellWidth = width/gradient.length,
            svg;

        svg = d3.select(legend.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        svg.append('text')
            .text(this.title)
            .attr('x', 0.5 * width)
            .attr('y', 0.15 * height)
            .attr('text-anchor', 'middle');

        svg.append('g')
            .selectAll('rect')
            .data(gradient)
            .enter()
            .append('rect')
            .attr('width', cellWidth)
            .attr('height', 0.15 * height)
            .attr('x', (d, i) => i*cellWidth)
            .attr('y', 0.5 * height)
            .attr('fill', (d) => interpolateRdYlBu(heatmapColorScale(-d)));

        svg.append('g')
            .selectAll('line')
            .data(legend_text)
            .enter()
            .append('line')
            .attr('x1', (d, i)=>i*1*width)
            .attr('x2', (d, i)=>i*1*width)
            .attr('y1', 0.45 * height)
            .attr('y2', 0.5 * height)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('g')
            .selectAll('text')
            .data(legend_text)
            .enter()
            .append('text')
            .text((d) => d)
            .attr('x', (d, i) => i*1*width)
            .attr('y', 0.4*height)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'middle');
    }

    drawCentroidPlotLegend(k) {
        var legend = this.centroid_legend,
            centroid_list = d3.range(k),
            colors = this.colors;

        legend.empty();
        var svg = d3.select(legend.get(0))
            .append('svg')
            .attr('width', legend.width())
            .attr('height', legend.height())
            .style('overflow', 'visible');

        var drawCentroidPlot = this.drawCentroidPlot.bind(this),
            handleClick = function(d, i) {
                if (d3.select(this).style('fill-opacity') == 1) {
                    d3.select(this).style('fill-opacity', 0);
                    window.show_centroid[i] = false;
                } else {
                    d3.select(this).style('fill-opacity', 1);
                    window.show_centroid[i] = true;
                }
                drawCentroidPlot(k, window.plot_feature_name);
            };

        svg.append('g')
            .selectAll('rect')
            .data(centroid_list)
            .enter()
            .append('rect')
            .text((d) => d)
            .attr('x', (d,i) => ((i % 5) * (legend.width()*0.2)))
            .attr('y', (d,i) => (Math.floor(i / 5) * (legend.height()*0.6)))
            .attr('width', legend.width()*0.08)
            .attr('height', legend.height()*0.4)
            .style('fill', (d, i) => colors[i])
            .style('stroke', (d, i) => colors[i])
            .style('cursor', 'pointer')
            .on('click', handleClick);

        svg.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(centroid_list)
            .enter()
            .append('text')
            .text((d) => d+1)
            .attr('x', (d,i) => ((i % 5) * (legend.width()*0.2)))
            .attr('y', (d,i) => (Math.floor(i / 5) * (legend.height()*0.6)))
            .attr('width', legend.width()*0.3)
            .attr('height', legend.width()*0.2)
            .attr('dx', legend.width()*0.12)
            .attr('dy', '1.2em');
    }

    renderContainers(){
        this.el.css('position', 'relative');
        this.el.empty();

        this.dendro = $('<div id="dendrogram" class="layouts">')
            .css({
                position: 'absolute',
                left: '0%',
                top: '2%',
                overflow: 'visible',
                height: '10%',
                width: '50%',
            }).appendTo(this.el);

        this.vert = $('<div id="vert_names" class="layouts">')
            .css({
                position: 'absolute',
                left: '0%',
                top: '13%',
                overflow: 'hidden',
                height: '8%',
                width: '50%',
            }).appendTo(this.el);

        this.heatmapDiv = $('<div class="layouts">')
            .css({
                position: 'absolute',
                left: '0%',
                top: '22%',
                height: '60%',
                width: '50%',
            })
            .appendTo(this.el);

        this.heatmap_col_tooltips = $('<div id="heatmap_col_tooltips" class="layouts">')
            .css({
                height: '60%',
                width: '50%',
                position: 'absolute',
                left: '0%',
                top: '22%',
            }).appendTo(this.el);

        this.heatmap_clusters = $('<div id="heatmap_clusters" class="layouts">')
            .css({
                height: '60%',
                width: window.clustHeatmapOffset.left,
                position: 'absolute',
                left: '0%',
                top: '22%',
            }).appendTo(this.el);

        this.legend = $('<div id="heatmap_legend" class="layouts">')
            .css({
                position: 'absolute',
                left: window.clustHeatmapOffset.left + 0.15 * (this.el.width() - window.clustHeatmapOffset.left),
                top: '82%',
                overflow: 'visible',
                height: '20%',
                width: 0.20 * (this.el.width() - window.clustHeatmapOffset.left),
            }).appendTo(this.el);

        this.graph = $('<div id="graph" class="layouts">')
            .css({
                height: '50%',
                width: '48%',
                position: 'absolute',
                left: '52%',
                top: '16%',
            }).appendTo(this.el);

        this.select_list_div = $('<div align="right" id="k_prompt" class="layouts">')
            .css({
                height: '8%',
                width: '100px',
                position: 'absolute',
                top: '0%',
                left: 0.52 * this.el.width(),
            })
            .appendTo(this.el)
            .append('text')
            .text('k:')
            .css('font-weight', 'bold');

        this.select_list = $('<select id="select_k" class="layouts">')
            .css({
                position: 'absolute',
                width: '50px',
                top: '0.2%',
                left: 0.52 * this.el.width() + 110,
            })
            .appendTo(this.el);

        this.centroid_legend_header = $('<div id="centroid_legend_header" class="layouts">')
            .css({
                height: '5%',
                width: '40%',
                position: 'absolute',
                top: '69%',
                left: '60%',
            })
            .appendTo(this.el)
            .append('<label>Centroid:</label>');

        this.centroid_legend = $('<div id="centroid_legend" class="layouts">')
            .css({
                position: 'absolute',
                left: '60%',
                top: '76%',
                overflow: 'visible',
                height: '16%',
                width: '40%',
            }).appendTo(this.el);

        this.clust_select_list_div = $('<div align="right" id="cluster_prompt" class="layouts">')
            .css({
                height: '8%',
                width: '100px',
                position: 'absolute',
                top: '6%',
                left: 0.52 * this.el.width(),
            })
            .appendTo(this.el)
            .append('text')
            .text('Cluster:')
            .css('font-weight', 'bold');

        this.clust_select_list = $('<select id="select_cluster" class="layouts">')
            .css({
                position: 'absolute',
                width: '50px',
                top: '6.2%',
                left: 0.52 * this.el.width() + 110,
            })
            .appendTo(this.el);

        $('<button type="button" class="btn btn-primary btn-block">Display cluster<br>detail</button>')
            .css({
                position: 'absolute',
                left: 0.52 * this.el.width() + 180,
                width: 0.52 * this.el.width() - 200,
                height: '12%',
                padding: 0,
            })
            .appendTo(this.el)
            .click(function () {
                new FeatureClusterDetailModal(
                    $('#flcModal'),
                    null,
                    parseInt(window.analysisObjectID),
                    parseInt($('#select_k option:selected').text()),
                    parseInt($('#select_cluster option:selected').text())
                );
            });
    }

    renderLoader(){
        new Loader(this.el);
        this.loadingSpinner = this.el.find('.loadingSpinner');
        this.loadingSpinner.css({
            position: 'absolute',
            left: '50%',
            top: '35%',
            'z-index': 10,
            background: 'white',
            border: '2px solid gray',
            'border-radius': '10px',
            padding: '1em',
        });
    }

    render() {
        window.show_centroid = [true, true];

        this.renderContainers();
        this.renderLoader();
        this.makeKSelect();
        this.drawHeatmapLegend();

        var url = this.featureClusteringOverviewInitURL(this.id),
            callback = function(data) {
                window.matrix_names = data['matrix_names'];
                window.centroids = data['fcCentroids'];
                this.drawDendrogram(data['dendrogram']);
                this.writeVertNames(window.matrix_names);
                this.drawHeatmap(2);
                this.drawCentroidPlot(2, null);
                this.drawCentroidPlotLegend(2);
                this.populateClusterSelect(2);
            };

        this.loadingSpinner.show();
        $.get(url, callback.bind(this));
    }
}


export default FeatureClusteringOverview;
