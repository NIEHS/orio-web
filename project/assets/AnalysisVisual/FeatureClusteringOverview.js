import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';


class FeatureClusteringOverview{

    constructor(el_1, el_2, data) {
        this.el_1 = el_1;
        this.el_2 = el_2;
        this.matrix_names = data['matrix_names'];
        this.feature_clusters = data['feature_clusters'];
        this.feature_vectors = data['feature_vectors'];
        this.feature_columns = data['feature_columns'];
        this.dendrogram = data['dendrogram'];
        this.matrix_names = data['matrix_names'];
        this.matrix_ids = data['matrix_ids'];
        this.cluster_medoids = data['cluster_medoids'];
        this.cluster_members = data['cluster_members'];
        this.feature_names = data['feature_names'];
        this.feature_cluster_members = data['feature_cluster_members'];

        this.colors = [
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

        var cluster_medoids = this.cluster_medoids,
            matrix = _.object(data['matrix_ids'], data['matrix_names']);
        this.col_names = _.map(this.cluster_members, function(d, i){
            let name = (d.length > 1)?
                    `(${d.length}) ${matrix[cluster_medoids[i]]}`:
                    matrix[cluster_medoids[i]];

            return name;
        });
    }

    drawHeatmap(k) {
        // remove existing heatmap
        this.el_1.find('#heatmap').remove();

        // create heatmap
        var heatmap = $('<canvas id="heatmap"></canvas>')
            .prop({
                'height': 0.80 * this.el_1.height(),
                'width': 0.60 * this.el_1.width(),
            })
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '20%',
            })
            .appendTo(this.el_1);

        // add column tooltips
        this.el_1.find('#heatmap_col_tooltips').remove();

        var heatmap_col_tooltips = $('<div id="heatmap_col_tooltips">')
            .css({
                'height': '80%',
                'width': '60%',
                'position': 'absolute',
                'left': '40%',
                'top': '20%',
            }).appendTo(this.el_1);

        // remove existing cluster bars
        this.el_1.find('#heatmap_clusters').remove();

        // add cluster bars
        var heatmap_clusters = $('<div id="heatmap_clusters">')
            .css({
                'height': '80%',
                'width': '2%',
                'position': 'absolute',
                'left': '37%',
                'top': '20%',
            }).appendTo(this.el_1);

        var clusterKUrl = function(id, k, dim_x, dim_y) {
                let params = $.param({
                    k, dim_x, dim_y,
                });
                return `/dashboard/api/analysis/${id}/k_clust_heatmap/?` + params;
            },
            url = clusterKUrl(window.analysisObjectID, k, heatmap.width(), heatmap.height());

        $.get(url, this.drawHeatmapWithData.bind(this));

        _.extend(this, {
            heatmap_col_tooltips,
            heatmap_clusters,
        });
    }

    drawHeatmapWithData(data) {
        var canvas = document.getElementById('heatmap').getContext('2d'),
            height = this.heatmap_col_tooltips.height(),
            width = this.heatmap_col_tooltips.width(),
            col_number = this.col_names.length,
            cell_width = width/col_number,
            entry_count = 0,
            total_size = d3.sum(_.values(data['cluster_sizes'])),
            clusters = [],
            colorScale = d3.scale.linear()
                .domain([0, 1])
                .range(['white', 'red']),
            showDatasectRectangle = function(d) {
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
            hideDatasetRectangle = function () {
                d3.select(this)
                    .style('stroke', 'none');
            },
            showClusterDetails = function (d, i) {
                d3.select(this)
                    .style('stroke', 'black')
                    .style('stroke-width', '1');

                $(this).tooltip({
                    container: 'body',
                    title: `Cluster ${d.index}<br/>${d.size} entries`,
                    html: true,
                    animation: false,
                }).tooltip('show');
            },
            hideClusterDetails = function() {
                d3.select(this)
                    .style('stroke', 'none');
            },
            i, j;

        // create cluster-size details
        _.each(data['cluster_sizes'], (size, i) => {
            var d = {
                index: parseInt(i) + 1,
                size: size,
                x: 0,
                y: entry_count / total_size * this.heatmap_clusters.height(),
                width: this.heatmap_clusters.width(),
                height: size / total_size * this.heatmap_clusters.height(),
                fill: this.colors[i],
            };
            entry_count += size;
            clusters.push(d);
        });

        // draw canvas heatmap
        for (i in data['display_data']) {
            for (j in data['display_data'][i]) {
                canvas.fillStyle = colorScale(data['display_data'][i][j]);
                canvas.fillRect(j, i, 1, 1);
            }
        }

        // draw rectangles around each dataset/dataset cluster
        d3.select(this.heatmap_col_tooltips.get(0))
            .append('svg')
                .attr('height', height)
                .attr('width', width)
            .append('g')
            .selectAll('rect')
            .data(this.col_names)
            .enter()
            .append('rect')
                .text((d) => d)
                .attr('x', (d, i) => (i * cell_width))
                .attr('y', 0)
                .attr('width', cell_width)
                .attr('height', height)
                .style('fill', 'transparent')
                .on('mouseover', showDatasectRectangle)
                .on('mouseout', hideDatasetRectangle);

        // draw cluster-detail rectangles
        d3.select(this.heatmap_clusters.get(0))
            .append('svg')
                .attr('height', this.heatmap_clusters.height())
                .attr('width', this.heatmap_clusters.width())
            .append('g')
            .selectAll('rect')
            .data(clusters)
            .enter()
            .append('rect')
                .attr('x', (d) => d.x)
                .attr('y', (d) => d.y)
                .attr('width', (d) => d.width)
                .attr('height', (d) => d.height)
                .style('fill', (d) => d.fill)
                .on('mouseover', showClusterDetails)
                .on('mouseout', hideClusterDetails);

        // globally enable tooltips
        $('[data-toggle="tooltip"]').tooltip();
    }

    drawDendrogram() {
        this.el_1.find('#dendrogram').remove();

        var dendro = $('<div id="dendrogram">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '0%',
                'overflow': 'visible',
                'height': '10%',
                'width': '60%',
            }).appendTo(this.el_1);

        var line_coords = [],
            x_max = parseFloat(Math.max(...[].concat.apply([], this.dendrogram['icoord']))),
            y_max = parseFloat(Math.max(...[].concat.apply([], this.dendrogram['dcoord']))),
            x_min = parseFloat(Math.min(...[].concat.apply([], this.dendrogram['icoord']))),
            y_min = parseFloat(Math.min(...[].concat.apply([], this.dendrogram['dcoord']))),
            height = dendro.height(),
            width = dendro.width(),
            ceiling = 0.05*dendro.height(),
            leaf_num = this.dendrogram['leaves'].length,
            icoords = this.dendrogram['icoord'],
            dcoords = this.dendrogram['dcoord'],
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
            .attr('x1', function(d) { return d.x1; })
            .attr('x2', function(d) { return d.x2; })
            .attr('y1', function(d) { return d.y1; })
            .attr('y2', function(d) { return d.y2; });
    }

    writeVertNames() {
        // remove existing
        this.el_1.find('#vert_names').remove();

        // create new
        var vert = $('<div id="vert_names">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '11%',
                'overflow': 'hidden',
                'height': '8%',
                'width': '60%',
            }).appendTo(this.el_1);

        //Draw SVGs
        var height = vert.height(),
            width = vert.width(),
            row_number = this.cluster_members.length,
            cluster_medoids = this.cluster_medoids,
            matrix_names = this.matrix_names;

        var svg = d3.select(vert.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        svg.append('g')
            .selectAll('text')
            .data(this.col_names)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text(function(d) {return d;})
            .attr('x', function(d,i) {
                return (((0.5 / row_number) * width) + i * (width / row_number));
            })
            .attr('y', 0)
            .attr('transform', function(d,i) {
                var rot = (((0.5/row_number)*width) + i*(width/row_number));
                return 'rotate(90 ' + rot + ',0)';
            });
    }

    makeKSelect() {
        function addOptions(el_1, option_array) {
            var select = el_1.find('#select_k');

            select.empty();

            d3.select(select.get(0))
                .selectAll('option')
                .data(d3.keys(option_array))
                .enter()
                .append('option')
                .text(function(d) {return d;})
                .attr('value', function(d) {return d;});
        }

        //Add text
        this.el_1.find('#k_prompt').remove();
        var select_list = $('<div id="k_prompt">Select k-value:</div>')
            .css({
                'height': '8%',
                'width': '20%',
                'position': 'absolute',
                'top': '20%',
                'left': '0%',
            })
            .appendTo(this.el_1);

        //Remove heatmap div if there; append heatmap div
        this.el_1.find('#select_k').remove();
        var self = this;
        var select_list = $('<select id="select_k"></select>')
            .css({
                'height': '8%',
                'width': '6%',
                'position': 'absolute',
                'top': '20%',
                'left': '24%',
            })
            .change(function() {
                self.drawHeatmap(this.value);
                self.drawClusterSelect(this.value);
                self.drawFeatureSelect(this.value, '--');
                self.drawCentroidPlot(this.value, null);
                self.drawCentroidPlotLegend(this.value);
            })
            .appendTo(this.el_1);

        addOptions(this.el_1, this.feature_clusters);
        select_list[0].selectedIndex = 0;
    }

    drawClusterSelect(k) {

        //Add text
        this.el_1.find('#cluster_prompt').remove();
        var select_list = $('<div id="cluster_prompt">Select cluster:</div>')
            .css({
                'height': '8%',
                'width': '20%',
                //'font-size': '12px',
                'position': 'absolute',
                'top': '30%',
                'left': '0%',
            })
            .appendTo(this.el_1);

        this.el_1.find('#select_cluster').remove();
        var self = this;
        var select_list = $('<select id="select_cluster"></select>')
            .css({
                'height': '8%',
                'width': '6%',
                //'font-size': '12px',
                'position': 'absolute',
                'top': '30%',
                'left': '24%',
            })
            .change(function() {
                self.drawFeatureSelect(k, this.value);
                self.drawCentroidPlot(k, null);
            })
            .appendTo(this.el_1);

        var cluster_range = d3.range(k);
        for (var i=0; i<cluster_range.length; i++) {
            cluster_range[i] += 1;
        }
        cluster_range.unshift('--');
        d3.select(select_list.get(0))
            .selectAll('option')
            .data(cluster_range)
            .enter()
            .append('option')
            .text(function(d) {return d;})
            .attr('value', function(d) {return d;});
    }

    drawFeatureSelect(k,cluster) {
        function addOptions(select, option_array) {
            select.empty();
            d3.select(select.get(0))
                .selectAll('option')
                .data(option_array)
                .enter()
                .append('option')
                .text(function(d) {return d;})
                .attr('value', function(d) {return d;});
        }

        function drawPointer(feature, k) {
            function getIndex(feature) {
                var feature_index = 0;
                for (var i in feature_cluster_members[k]) {
                    for (var j in feature_cluster_members[k][i]) {
                        if (feature == feature_cluster_members[k][i][j]) {
                            return feature_index;
                        }
                        feature_index += 1;
                    }
                }
            }
            var total_feature_num = feature_names.length;
            var feature_index = getIndex(feature);
            var total_height = 0.8 * el_1.height();
            var pointer_height = (feature_index/total_feature_num)*total_height + 0.2 * el_1.height();

            var offset = {
                'top': 0.01 * el_1.height(),
                'left': 0.02 * el_1.width(),
            };


            var point_1 = (0) + ',' + (pointer_height - offset.top),
                point_2 = (offset.left) + ',' + (pointer_height),
                point_3 = (0) + ',' + (pointer_height + offset.top);
            var points = point_1 + ' ' + point_2 + ' ' + point_3;

            el_1.find('#pointer').remove();
            var pointer = $('<div id="pointer">')
                .css({
                    'position': 'absolute',
                    'left': '35%',
                    'top': '0%',
                    'overflow': 'visible',
                    'height': '110%',
                    'width': offset.left,
                }).appendTo(el_1);
            d3.select(pointer.get(0))
                .append('svg')
                .attr('height', pointer.height())
                .attr('width', pointer.width())
                .append('polygon')
                .attr('points', points)
                .style('fill', 'black')
                .style('position', 'absolute');
        }

        var features = [];
        var feature_names = this.feature_names;
        var feature_cluster_members = this.feature_cluster_members;
        var el_1 = this.el_1;
        //Add text
        this.el_1.find('#feature_prompt').remove();
        this.el_1.find('#pointer').remove();
        var feature_prompt = $('<div id="feature_prompt">Select feature from cluster:</div>')
            .css({
                'height': '8%',
                'width': '20%',
                //'font-size': '12px',
                'position': 'absolute',
                'top': '40%',
                'left': '0%',
            })
            .appendTo(this.el_1);

        this.el_1.find('#select_feature').remove();
        var features = [];
        var self = this;
        var select_list = $('<select id="select_feature"></select>')
            .attr({
                'size': '12',
            })
            .css({
                'height': '45%',
                'width': '30%',
                'font-size': '12px',
                'position': 'absolute',
                'top': '55%',
                'left': '0%',
            })
            .change(function() {
                drawPointer(this.value, k);
                self.drawCentroidPlot(k, this.value);
            })
            .appendTo(this.el_1);

        if (k) {
            if (cluster == '--') {
                var features = this.feature_names;
            } else {
                var features = this.feature_cluster_members[k][cluster];
            }
        }
        addOptions(select_list, features);

        this.el_1.find('#feature_search_field').remove();

        $('<input id="feature_search_field"></input>')
            .attr({
                'type': 'text',
                'id': 'search_field',
                'placeholder': 'Filter feature list',
                'outerWidth': '30%',
                'outerHeight': '8%',
            }).css({
                'position': 'absolute',
                'left': '0%',
                'top': '45%',
                'width': '30%',
                'height': '8%',
                'overflow': 'scroll',
            })

            .on('input', function() {
                var selectable;
                let value = this.value.toLowerCase();
                if (value === '') {
                    selectable = features;
                } else {
                    selectable = $.grep(features, function(n) {
                        return (n.toLowerCase().includes(value));
                    });
                }
                addOptions(select_list, selectable);
            })

            .appendTo(this.el_1);
    }

    drawCentroidPlot(k, feature) {
        this.el_2.find('#centroid_plot').remove();
        $('<div id="centroid_plot">')
            .css({
                'height': '80%',
                'width': '70%',
                'position': 'absolute',
                'left': '30%',
                'top': '0%',
                'overflow': 'scroll',
            }).appendTo(this.el_2);

        $('<div id="graph">')
            .css({
                'height': '100%',
                'width': '100%',
                'position': 'absolute',
                'left': '0%',
                'top': '0%',
            }).appendTo(this.el_2.find('#centroid_plot'));

        var offset = {
            'top': (1/7)*this.el_2.find('#centroid_plot').height(),
            'bottom': (1/7)*this.el_2.find('#centroid_plot').height(),
            'left': (1/7)*this.el_2.find('#centroid_plot').width(),
            'right': 0,
        };

        var plot_max = 0;
        for (var cluster = 0; cluster < this.feature_clusters[k]['centroids'].length; cluster++) {
            for (var i = 0; i < this.feature_clusters[k]['centroids'][cluster].length; i++) {
                if (parseFloat(this.feature_clusters[k]['centroids'][cluster][i]) > plot_max) {
                    plot_max = parseFloat(this.feature_clusters[k]['centroids'][cluster][i]);
                }
            }
        }
        if (feature) {
            var feature_data = this.feature_vectors[this.feature_names.indexOf(feature)];
            for (var i = 0; i < feature_data.length; i++) {
                if (parseFloat(feature_data[i]) > plot_max) {
                    plot_max = parseFloat(feature_data[i]);
                }
            }
        }

        var graph = d3.select(this.el_2.find('#graph').get(0)).append('svg')
            .attr('width', this.el_2.find('#centroid_plot').width())
            .attr('height', this.el_2.find('#centroid_plot').height())
            .append('g');

        var col_names = this.col_names;
        var y = d3.scale.linear()
            .domain([0,plot_max])
            .range([this.el_2.find('#centroid_plot').height() - offset.bottom, offset.top]);
        var x = d3.scale.ordinal()
            .domain(this.col_names)
            .rangePoints([offset.left,this.el_2.find('#centroid_plot').width() - offset.right], 1);
        var line = d3.svg.line()
            .x(function(d,i) {
                return x(col_names[i]);
            })
            .y(function(d) {
                return y(d);
            });
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .outerTickSize(0)
            .tickFormat('');
        var xGrid = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .outerTickSize(0)
            .innerTickSize(-(this.el_2.find('#centroid_plot').height() - offset.top - offset.bottom))
            .tickFormat('');
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        graph.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (this.el_2.find('#centroid_plot').height() - offset.bottom) + ')')
            .call(xAxis);

        graph.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (this.el_2.find('#centroid_plot').height() - offset.bottom) + ')')
            .style('stroke-dasharray', ('3, 3'))
            .call(xGrid);

        graph.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + offset.left + ',0)')
            .call(yAxis);

        var colors = this.colors;
        graph.append('g')
            .selectAll('path')
            .data(this.feature_clusters[k]['centroids'])
            .enter()
            .append('path')
            .attr('d', function(d) {return line(d);})
            .style('stroke', function(d,i) {return colors[i];})
            .style('fill', 'none')
            .style('stroke-width', '3');

        if (feature) {
            var feature_data = this.feature_vectors[this.feature_names.indexOf(feature)];
            graph.append('path')
                .attr('d', function(d) {return line(feature_data);})
                .style('stroke', 'black')
                .style('fill', 'none')
                .style('stroke-width', '3');
        }

        // remove existing
        this.el_2.find('#vert_names').remove();

        // create new
        var vert = $('<div id="vert_names">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '72%',
                'overflow': 'hidden',
                'height': '28%',
                'width': '60%',
            }).appendTo(this.el_2);

        //Draw SVGs
        var height = vert.height(),
            width = vert.width(),
            row_number = this.cluster_members.length,
            cluster_medoids = this.cluster_medoids,
            matrix_names = this.matrix_names;

        var svg = d3.select(vert.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        svg.append('g')
            .selectAll('text')
            .data(this.col_names)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text(function(d) { return d;})
            .attr('x', function(d,i) {
                return (((0.5 / row_number) * width) + i * (width / row_number));
            })
            .attr('y', 0)
            .attr('transform', function(d,i) {
                var rot = (((0.5/row_number)*width) + i*(width/row_number));
                return 'rotate(90 ' + rot + ',0)';
            });
    }

    drawHeatmapLegend() {
        // remove existing
        this.el_1.find('#heatmap_legend').remove();

        // create new
        var legend = $('<div id="heatmap_legend">')
            .css({
                'position': 'absolute',
                'left': '5%',
                'top': '8%',
                'overflow': 'visible',
                'height': '5%',
                'width': '20%',
            }).appendTo(this.el_1);

        var height = legend.height(),
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
            .attr('stop-color', 'red');

        svg.append('rect')
            .attr('width', width)
            .attr('height', 0.5 * height)
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
        this.el_2.find('#centroid_legend_header').remove();
        $('<div id="centroid_legend_header">Centroid:</div>')
            .css({
                'height': '10%',
                'width': '10%',
                //'font-size': '12px',
                'position': 'absolute',
                'top': '10%',
                'left': '20%',
            })
            .appendTo(this.el_2);

        this.el_2.find('#centroid_legend').remove();
        var legend = $('<div id="centroid_legend">')
            .css({
                'position': 'absolute',
                'left': '20%',
                'top': '20%',
                'overflow': 'visible',
                'height': '40%',
                'width': '10%',
            }).appendTo(this.el_2);

        var centroid_list = d3.range(k);
        var colors = this.colors;

        var svg = d3.select(legend.get(0))
            .append('svg')
            .attr('width', legend.width())
            .attr('height', legend.height())
            .style('overflow', 'visible');

        svg.append('g')
            .selectAll('rect')
            .data(centroid_list)
            .enter()
            .append('rect')
            .text( function(d) { return d; } )
            .attr('x', function(d,i) { return (Math.floor(i / 5) * (legend.width()*0.5)); })
            .attr('y', function(d,i) { return ((i % 5) * (legend.height()*0.2)); })
            .attr('width', legend.width()*0.1)
            .attr('height', legend.width()*0.1)
            .style('fill', function(d, i) { return colors[i]; });

        svg.append('g')
            .selectAll('text')
            .data(centroid_list)
            .enter()
            .append('text')
            .text( function(d) { return d+1; } )
            .attr('x', function(d,i) { return (Math.floor(i / 5) * (legend.width()*0.5)); })
            .attr('y', function(d,i) { return ((i % 5) * (legend.height()*0.2)); })
            .attr('width', legend.width()*0.3)
            .attr('height', legend.width()*0.2)
            .attr('dx', legend.width()*0.2)
            .attr('dy', '0.7em');
            // .attr('transform', 'translate(' + (legend.width()*0.2) + ',0)');
    }

    render() {
        this.drawHeatmap(2);
        this.drawClusterSelect(2);
        this.drawFeatureSelect(2, '--');
        this.drawCentroidPlot(2, null);
        this.drawCentroidPlotLegend(2);

        this.makeKSelect();
        this.drawDendrogram();
        this.writeVertNames();
        this.drawHeatmapLegend();
    }
}


export default FeatureClusteringOverview;
