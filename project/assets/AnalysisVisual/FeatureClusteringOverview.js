import $ from 'jquery';
import d3 from 'd3';

import Loader from './Loader';
import FeatureClusterDetailModal from './FeatureClusterDetailModal';


const LABEL_COLORS = [
    '#a50026',
    '#e0f3f8',
    '#d73027',
    '#abd9e9',
    '#f46d43',
    '#74add1',
    '#fdae61',
    '#4575b4',
    '#fee090',
    '#313695',
];

class FeatureClusteringOverview{

    constructor(el) {
        this.el = el;
        this.id = window.analysisObjectID;
        this.colors = LABEL_COLORS;
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

        var scale_y =  data['display_data'].length < heatmap.height()
            ? heatmap.height() / data['display_data'].length
            : 1;
        var scale_x =  data['display_data'][0].length < heatmap.width()
            ? heatmap.width() / data['display_data'][0].length
            : 1;
        context.scale(scale_x, scale_y);

        for (var i in data['display_data']) {
            for (var j in data['display_data'][i]) {
                context.fillStyle=colorScale(data['display_data'][i][j]);
                context.fillRect(j,i,1,1);
            }
        }

        var height = heatmap_col_tooltips.height(),
            width = heatmap_col_tooltips.width(),
            col_number = data['col_names'].length;

        var cell_width = width/col_number;
        var svg = d3.select(heatmap_col_tooltips.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

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
            .attr('x', (d, i) => (i * cell_width))
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

            },
            handleMouseOut = function () {
                $(this).tooltip('hide');
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
            .attr('x', 0)
            .attr('y', (d) => (d.cume/entry_count)*heatmap_clusters.height())
            .attr('width', heatmap_clusters.width())
            .attr('height', (d) => (d.entry/entry_count)*heatmap_clusters.height())
            .style('fill', (d, i) => colors[i])
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut)
            .on('click', (d, i) => new FeatureClusterDetailModal(
                $('#flcModal'), d, parseInt(this.id), cluster_sizes.length, i+1));
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
            width = dendro.width(),
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
            .attr('width', width)
            .attr('height', height);

        svg.append('g')
            .selectAll('line')
            .data(line_coords)
            .enter()
            .append('line')
            .attr('class', 'dendroLine')
            .attr('x1', (d) => d.x1)
            .attr('x2', (d) => d.x2)
            .attr('y1', (d) => d.y1)
            .attr('y2', (d) => d.y2);
    }

    writeVertNames(col_names) {
        //Draw SVGs
        var vert = this.vert,
            height = vert.height(),
            width = vert.width(),
            col_number = col_names.length;

        var svg = d3.select(vert.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        svg.append('g')
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
            };

        select_list
            .change(resetDisplayFlags);

        addOptions(this.el, d3.range(2,11));
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

        graph.append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'end')
            .attr('y', (1/8) * $graph.width())
            .attr('dy', '0.75em')
            .attr('x', -(1/7) * $graph.height())
            .attr('transform', 'rotate(-90)')
            .text('Upper quartile-normalized counts');

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
            'left': (1/4)*this.graph.width(),
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
        var legend = this.legend,
            height = legend.height(),
            width = legend.width();

        var svg = d3.select(legend.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        var gradient = svg
            .append('linearGradient')
            .attr('y1', '0')
            .attr('y2', '0')
            .attr('x1', '0')
            .attr('x2', width)
            .attr('id', 'gradient')
            .attr('gradientUnits', 'userSpaceOnUse');

        gradient
            .append('stop')
            .attr('offset', '0')
            .attr('stop-color', 'white');

        gradient
            .append('stop')
            .attr('offset', '1')
            .attr('stop-color', '#cc4248');

        svg.append('rect')
            .attr('width', width)
            .attr('height', 0.2 * height)
            .attr('x', '0')
            .attr('y', 0.5 * height)
            .attr('fill', 'url(#gradient)')
            .attr('stroke', 'black')
            .attr('stroke-width', '1');

        var legend_lines = [
            {text: '0', position: 0},
            {text: 'Upper Quartile', position: width},
        ];

        svg.append('g')
            .selectAll('line')
            .data(legend_lines)
            .enter()
            .append('line')
            .attr('x1', function(d) {return d.position;})
            .attr('x2', function(d) {return d.position;})
            .attr('y1', 0.3 * height)
            .attr('y2', 0.5 * height)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('g')
            .selectAll('text')
            .data(legend_lines)
            .enter()
            .append('text')
            .text(function(d) { return d.text;})
            .attr('x', function(d) {return d.position;})
            .attr('y', 0.25*height)
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
                left: '10%',
                top: '2%',
                overflow: 'visible',
                height: '10%',
                width: '40%',
            }).appendTo(this.el);

        this.vert = $('<div id="vert_names" class="layouts">')
            .css({
                position: 'absolute',
                left: '10%',
                top: '13%',
                overflow: 'hidden',
                height: '8%',
                width: '40%',
            }).appendTo(this.el);

        this.heatmapDiv = $('<div class="layouts">')
            .css({
                position: 'absolute',
                left: '10%',
                top: '22%',
                height: '60%',
                width: '40%',
            })
            .appendTo(this.el);

        this.heatmap_col_tooltips = $('<div id="heatmap_col_tooltips" class="layouts">')
            .css({
                height: '60%',
                width: '40%',
                position: 'absolute',
                left: '10%',
                top: '22%',
            }).appendTo(this.el);

        this.heatmap_clusters = $('<div id="heatmap_clusters" class="layouts">')
            .css({
                height: '60%',
                width: '2%',
                position: 'absolute',
                left: '7%',
                top: '22%',
            }).appendTo(this.el);

        this.legend = $('<div id="heatmap_legend" class="layouts">')
            .css({
                position: 'absolute',
                left: '20%',
                top: '86%',
                overflow: 'visible',
                height: '5%',
                width: '20%',
            }).appendTo(this.el);

        this.graph = $('<div id="graph" class="layouts">')
            .css({
                height: '50%',
                width: '50%',
                position: 'absolute',
                left: '50%',
                top: '20%',
            }).appendTo(this.el);

        this.select_list_div = $('<div id="k_prompt" class="layouts">')
            .css({
                height: '8%',
                width: '22%',
                position: 'absolute',
                top: '14%',
                left: '64%',
            })
            .appendTo(this.el)
            .append('<label>Select k-value:</label>');

        this.select_list = $('<select id="select_k" class="layouts">')
            .css({
                position: 'absolute',
                width: '80px',
                top: '14.2%',
                left: '85%',
            })
            .appendTo(this.el);

        this.centroid_legend_header = $('<div id="centroid_legend_header" class="layouts">')
            .css({
                height: '5%',
                width: '40%',
                position: 'absolute',
                top: '72%',
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
                height: '8%',
                width: '40%',
            }).appendTo(this.el);
    }

    renderLoader(){
        var par = this.el;
        new Loader(par);
        this.loadingSpinner = par.find('.loadingSpinner');
        this.loadingSpinner.css({
            position: 'absolute',
            left: '50%',
            top: '35%',
            'z-index': 10,
            'background': 'white',
            'border': '2px solid gray',
            'border-radius': '10px',
            'padding': '1em',
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
            };

        this.loadingSpinner.show();
        $.get(url, callback.bind(this));
    }
}


export default FeatureClusteringOverview;
