import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';
import {interpolateInferno} from 'd3-scale';
import {interpolateRdYlBu} from 'd3-scale-chromatic';
import React from 'react';
import ReactDOM from 'react-dom';

import {heatmapColorScale} from './utils';
import ScatterplotModal from './ScatterplotModal';
import SortVectorScatterplotModal from './SortVectorScatterplotModal';
import HeatmapLegend from './HeatmapLegend';
import Loader from './Loader';
import SaveAsImage from './components/SaveAsImage';


class AnalysisOverview{

    constructor(el) {
        this.el = el;

        this.analysisOverviewInitURL = function(id) {
            return (`/dashboard/api/analysis/${id}/analysis_overview/`);
        };

        this.renderDownloadBtn();
    }

    renderDownloadBtn(){
        let dl = $('<div>').css({
            float: 'right',
            'padding-top': '5px',
        }).insertAfter(this.el);

        ReactDOM.render(<SaveAsImage content={this.el.get(0)} />, dl.get(0));
    }

    renderContainers(){

        this.el.css('position', 'relative');
        this.el.empty();

        this.heatmap = $('<div id="heatmap" class="layouts">')
            .css({
                height: '80%',
                width: '60%',
                position: 'absolute',
                left: '40%',
                top: '20%',
            }).appendTo(this.el);

        this.vert = $('<div id="vert_names" class="layouts">')
            .css({
                position: 'absolute',
                left: '40%',
                top: '1%',
                overflow: 'visible',
                height: '18%',
                width: '60%',
            }).appendTo(this.el);

        this.dendro = $('<div id="dendrogram" class="layouts">')
            .css({
                float: 'left',
                position: 'absolute',
                left: '0%',
                top: '20%',
                overflow: 'hidden',
                height: '80%',
                width: '20%',
            }).appendTo(this.el);

        this.row_names = $('<div id="row_names" class="layouts">')
            .css({
                position: 'absolute',
                left: '21%',
                top: '20%',
                overflow: 'hidden',
                height: '80%',
                width: '18%',
            }).appendTo(this.el);

        this.legend = $('<div id="legend" class="layouts">')
            .css({
                position: 'absolute',
                left: '8%',
                top: '0%',
                overflow: 'visible',
                height: '20%',
                width: '20%',
            }).appendTo(this.el);

    }

    drawHeatmap(data) {
        this.loadingSpinner.fadeOut();

        var sort_vector = window.sort_vector,
            heatmap = this.heatmap,
            height = heatmap.height(),
            width = heatmap.width(),
            cell_height = height/data.rows.length,
            cell_width = width/data.col_names.length;

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
            .style('fill', (d) => interpolateRdYlBu(heatmapColorScale(-d)))
            .style('cursor', 'pointer')
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip)
            .on('click', showScatterplot);

        $('[data-toggle="tooltip"]').tooltip();
    }

    writeColNames(data) {

        var vert = this.vert,
            height = vert.height(),
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
        //Draw SVGs
        var row_names = this.row_names,
            height = row_names.height(),
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
        var dendro = this.dendro,
            height = dendro.height(),
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
        let hl = new HeatmapLegend(this.legend, "Spearman's ρ");
        hl.render();
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

    render(){
        var url = this.analysisOverviewInitURL(window.analysisObjectID),
            cb = function(data) {
                window.sort_vector = data.sort_vector;
                this.drawHeatmap(data.dscRepData);
                this.writeRowNames(data.dscRepData);
                this.writeColNames(data.dscRepData);
                this.writeDendrogram(data.dendrogram);
            };

        this.renderContainers();
        this.renderLoader();
        this.drawLegend();
        $.get(url, cb.bind(this));
    }
}


export default AnalysisOverview;
