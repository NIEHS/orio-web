import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';

import ScatterplotModal from './ScatterplotModal';
import SortVectorScatterplotModal from './SortVectorScatterplotModal';
import Loader from './Loader';


class AnalysisOverview{

    constructor(el) {
        this.el = el;

        this.analysisOverviewInitURL = function(id) {
            return (`/dashboard/api/analysis/${id}/analysis_overview/`);
        };
    }

    renderHeatmapContainer(){
        // create heatmap
        this.heatmap = $('<div id="heatmap">')
            .css({
                height: '80%',
                width: '60%',
                position: 'absolute',
                left: '40%',
                top: '20%',
            }).appendTo(this.el);
    }

    drawHeatmap(data) {
        this.loadingSpinner.fadeOut();

        var sort_vector = window.sort_vector,
            heatmap = this.heatmap,
            height = heatmap.height(),
            width = heatmap.width(),
            cell_height = height/data.rows.length,
            cell_width = width/data.col_names.length,
            colorScale = d3.scale.linear()
                .domain([-1, 0, 1])
                .range(['blue', 'white', 'red']);

        var showTooltip = function (d, i, j) {
            d3.select(this)
                .style('stroke', 'black')
                .style('stroke-width', '1');

            $(this).tooltip({
                container: 'body',
                title: `${data.col_names[i]}<br/>${data.rows[j].row_name}<br/>${d.toFixed(2)}`,
                html: true,
                animation: false,
            }).tooltip('show');
        };

        var hideTooltip = function () {
            $(this)
                .tooltip('destroy');
            d3.select(this)
                .style('stroke', 'none');
        };

        var showScatterplot = function(d, i, j){
            var modalTitle = $('#ind_heatmap_modal_title'),
                modalBody = $('#ind_heatmap_modal_body');

            $('#flcModal')
                .one('show.bs.modal', function(){
                    modalTitle.html('');
                    modalBody.html('');
                })
                .one('shown.bs.modal', function(){
                    var modal;
                    if (window.sort_vector) {
                        modal = new SortVectorScatterplotModal(
                            sort_vector, data.col_names[i],
                            data.rows[j].row_id, data.rows[j].row_name,
                            modalTitle, modalBody
                        );
                    } else {
                        modal = new ScatterplotModal(
                            data.col_ids[i], data.rows[j].row_id,
                            data.col_names[i], data.rows[j].row_name,
                            modalTitle, modalBody
                        );
                    }
                    modal.render();
                }).modal('show');
        };

        d3.select(heatmap.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .append('g')
            .selectAll('g')
            .data(data.rows)
            .enter()
            .append('g')
            .selectAll('rect')
            .data((d) => d.row_data)
            .enter()
            .append('rect')
            .text((d) => d)
            .attr('x', (d,i,j) => i * cell_width)
            .attr('y', (d,i,j) => j * cell_height)
            .attr('width', cell_width)
            .attr('height', cell_height)
            .style('fill', (d) => colorScale(d))
            .style('cursor', 'pointer')
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip)
            .on('click', showScatterplot);

        $('[data-toggle="tooltip"]').tooltip();
    }

    writeColNames(data) {
        // remove existing
        this.el.find('#vert_names').remove();

        // create new
        var vert = $('<div id="vert_names">')
            .css({
                'position': 'absolute',
                'left': '40%',
                'top': '1%',
                'overflow': 'visible',
                'height': '18%',
                'width': '60%',
            }).appendTo(this.el);

        var height = vert.height(),
            width = vert.width(),
            ncols = data.col_names.length,
            svg;

        data = _.map(data.col_names, function(d, i){
            let name = d,
                x = (((0.5 / ncols) * width) + i * (width / ncols)),
                transform = `rotate(90 ${(((0.5/ncols)*width) + i*(width/ncols))},0)`;
            return {name, x, transform};
        });

        svg = d3.select(vert.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        svg.append('g')
            .selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text((d)=>d.name)
            .attr('x', (d)=>d.x)
            .attr('y', 0)
            .attr('transform', (d)=>d.transform);
    }

    writeRowNames(data) {

        this.el.find('#row_names').remove();

        var row_names = $('<div id="row_names">')
            .css({
                position: 'absolute',
                left: '21%',
                top: '20%',
                overflow: 'hidden',
                height: '80%',
                width: '18%',
            }).appendTo(this.el);

        //Draw SVGs
        var height = row_names.height(),
            width = row_names.width(),
            row_number = data.rows.length;

        var svg = d3.select(row_names.get(0))
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        data = _.map(data.rows, function(d, i){
            let name = d.row_name,
                y = (((0.5 / row_number) * height) + i * (height / row_number));
            return {name, y};
        });

        svg.append('g')
            .selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'heatmapLabelText')
            .text((d) => d.name)
            .attr('x', 0)
            .attr('y', (d) => d.y);
    }

    writeDendrogram(data) {
        this.el.find('#dendrogram').remove();

        var dendro = $('<div id="dendrogram">')
            .css({
                position: 'absolute',
                left: '0%',
                top: '20%',
                overflow: 'hidden',
                height: '80%',
                width: '20%',
            }).appendTo(this.el);

        var height = dendro.height(),
            width = dendro.width();

        var icoords = data.icoord,
            dcoords = data.dcoord,
            x_max = d3.max(_.flatten(dcoords), Number),
            y_max = d3.max(_.flatten(icoords), Number),
            x_min = d3.min(_.flatten(dcoords), Number),
            y_min = d3.min(_.flatten(icoords), Number),
            x_rng = x_max - x_min,
            y_rng = y_max - y_min,
            nleaves = data.leaves.length,
            leafHeight = ((0.5/nleaves)*height),
            totHeight = height*((nleaves-1)/nleaves),
            line_coords, svg;

        line_coords = _.chain(icoords)
            .map(function(ic, i){
                let dc = dcoords[i];
                return _.map([0, 1, 2], function(j){
                    return {
                        y1: leafHeight+((ic[j]-y_min)/y_rng)*totHeight,
                        y2: leafHeight+((ic[j+1]-y_min)/y_rng)*totHeight,
                        x1: width-((dc[j]-x_min)/x_rng)*width*0.9,
                        x2: width-((dc[j+1]-x_min)/x_rng)*width*0.9,
                    };
                });
            })
            .flatten()
            .value();

        svg = d3.select(dendro.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        svg.append('g')
            .selectAll('line')
            .data(line_coords)
            .enter()
            .append('line')
            .attr('class', 'dendroLine')
            .attr('x1', (d)=>d.x1)
            .attr('x2', (d)=>d.x2)
            .attr('y1', (d)=>d.y1)
            .attr('y2', (d)=>d.y2);
    }

    drawLegend() {
        // remove existing
        this.el.find('#legend').remove();

        // create new
        var legend = $('<div id="legend">')
            .css({
                position: 'absolute',
                left: '5%',
                top: '8%',
                overflow: 'visible',
                height: '5%',
                width: '20%',
            }).appendTo(this.el);

        var height = legend.height(),
            width = legend.width(),
            legend_lines = [
                {text: '-1', position: 0},
                {text: '0', position: 0.5 * width},
                {text: '1', position: width},
            ],
            svg, gradient;

        svg = d3.select(legend.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        gradient = svg
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
            .attr('stop-color', 'blue');

        gradient
            .append('stop')
            .attr('offset', '0.5')
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

        svg.append('g')
            .selectAll('line')
            .data(legend_lines)
            .enter()
            .append('line')
            .attr('x1', (d)=>d.position)
            .attr('x2', (d)=>d.position)
            .attr('y1', 0.3 * height)
            .attr('y2', 0.5 * height)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('g')
            .selectAll('text')
            .data(legend_lines)
            .enter()
            .append('text')
            .text((d)=>d.text)
            .attr('x', (d)=>d.position)
            .attr('y', 0.25*height)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'middle');
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
        var url = this.analysisOverviewInitURL(window.analysisObjectID),
            cb = function(data) {
                window.sort_vector = data.sort_vector;
                this.drawHeatmap(data.dscRepData);
                this.writeRowNames(data.dscRepData);
                this.writeColNames(data.dscRepData);
                this.writeDendrogram(data.dendrogram);
            };

        this.renderHeatmapContainer();
        this.renderLoader();
        this.drawLegend();
        $.get(url, cb.bind(this));
    }
}


export default AnalysisOverview;
