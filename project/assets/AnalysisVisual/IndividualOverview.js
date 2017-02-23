import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';
import {interpolateInferno} from 'd3-scale';
import {interpolateRdYlBu} from 'd3-scale-chromatic';

import SaveAsImage from './components/SaveAsImage';
import {heatmapColorScale} from './utils';
import HeatmapLegend from './HeatmapLegend';
import IndividualHeatmap from './IndividualHeatmap';
import Loader from './Loader';


class IndividualOverview {

    constructor(el, analysis_id) {
        this.el = el;
        this.id = window.analysisObjectID;
        this.renderDownloadBtn();
    }

    renderDownloadBtn(){
        let dl = $('<div>').css({
            float: 'right',
            'padding-top': '5px',
        }).insertAfter(this.el);
        ReactDOM.render(<SaveAsImage content={this.el.get(0)} />, dl.get(0));
    }

    individualOverviewInitURL(id) {
        return `/dashboard/api/analysis/${id}/individual_overview/`;
    }

    dscFullRowValueURL(id, row_name) {
        return `/dashboard/api/analysis/${id}/dsc_full_row_value/?row=${row_name}`;
    }

    renderFiltering(){
        let div = this.selector_div;

        // check to make sure this only occurs if div is empty
        if (div.children().length>0){
            return;
        }

        let select = $('<select id="select_list" size="12" class="form-control col-sm-12 ids_selector">'),
            filterList = function(e){
                let v = e.target.value.toLowerCase(),
                    names = window.matrix_names;

                if (v.length>0){
                    names = names.filter((d) => d.toLowerCase().indexOf(v)>=0);
                }

                select
                    .empty()
                    .html(names.map((d)=> `<option value="${d}">${d}</option>`))
            };

        // show input search
        let inp = $('<input class="form-control col-sm-12" placeholder="Filter data list">')
            .appendTo(div)
            .on('input', filterList);

        // show select list
        this.select_list = select
            .appendTo(div)
            .change(this.displayCorrelations.bind(this));

        // trigger input change to populate list
        inp.trigger('input');

        // show detail button
        $('<button type="button" class="btn btn-primary btn-block">Display individual heatmap</button>')
            .appendTo(div)
            .click(this.displayIndividualHeatmap.bind(this));

        $(select.find('option:first'))
            .prop('selected', true);

    }

    renderCorrelations(selected, row_data){
        var cp = this.el.find('#correlation_plot'),
            num = row_data.length - 1,
            // entry_length = 20,
            margin = {top: 10, right: 10, bottom: 0, left: 20},
            offset = {top: 0, right: 20, bottom: 160, left: 100},
            // width = (num*entry_length > cp.width())
            //     ? (num*entry_length - margin.left - margin.right)
            //     : (cp.width() - margin.left - margin.right),
            width = cp.width() - margin.left - margin.right,
            height = cp.height();

        this.removeLoader();
        cp.empty();

        var sortable = [];
        for (let i = 0; i < window.col_names.length; i++) {
            if (selected !== window.col_names[i]) {
                sortable.push([window.col_names[i], row_data[i]]);
            }
        }

        if (window.sort_vector == null){
            sortable.sort(function(a, b) {return Math.abs(b[1]) - Math.abs(a[1]);});
        }

        cp.empty();
        var graph = d3.select(cp.get(0)).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        var x = d3.scale.ordinal()
            .domain(sortable.map((d) => d[0]))
            .rangeBands([0, width - offset.left - offset.right]);

        var y = d3.scale.linear()
            .domain([-1, 1])
            .range([height - offset.top - offset.bottom, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .outerTickSize(0);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        // add x-axis
        graph.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(${offset.left},${height-offset.bottom-offset.top})`)
            .call(xAxis)
            .style('fill', 'none')
            .selectAll('text')
            .style('fill', 'black')
            .attr('font-size', '12px')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-90)' )
            .attr('dx', '-10px')
            .attr('dy', '-6px');

        graph.append('text')
            .text('Spearman\'s \u03C1')
            .attr('transform', 'rotate(-90)' )
            .attr('dx', -height * 0.4)
            .attr('dy', '50px');

        // add y-axis
        graph.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${offset.left-5},0)`)
            .style('fill', 'none')
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .call(yAxis)
            .selectAll('text')
            .attr('font-size','12px')
            .style('fill', 'black')
            .style('stroke', 'none');

        // add reference lines
        graph.append('g')
            .attr('transform', `translate(${offset.left},${offset.top})`)
            .selectAll('line')
            .data([-1, -0.5, 0, 0.5, 1])
            .enter()
            .append('line')
            .attr('x1', x.rangeExtent()[0])
            .attr('x2', x.rangeExtent()[1])
            .attr('y1', (d) => y(d))
            .attr('y2', (d) => y(d))
            .style('stroke', '#c5c5c5')
            .style('stroke-width', 2)
            .style('stroke-dasharray', (d) => (d % 1 === 0)? 'none': '5,5');

        // add data
        graph.append('g')
            .attr('transform', `translate(${offset.left},${offset.top})`)
            .selectAll('rect')
            .data(sortable)
            .enter()
            .append('rect')
            .style('fill', (d) => interpolateRdYlBu(heatmapColorScale(-d[1])))
            .attr('x', (d) => x(d[0]) + 2)
            .attr('width', x.rangeBand() - 1)
            .attr('y', (d) => y(Math.max(0, d[1])))
            .attr('height', (d) => Math.abs(y(0) - y(d[1])))
            .each(function(d){
                $(this).tooltip({
                    container: 'body',
                    title: `${d[0]}<br/>${d[1].toFixed(2)}`,
                    html: true,
                    animation: false,
                });
            });
    }

    displayCorrelations(){
        var selected = this.el.find('#select_list').find('option:selected').text(),
            url = this.dscFullRowValueURL(this.id, selected);

        this.renderLoader();
        $.get(url, this.renderCorrelations.bind(this, selected));
    }

    renderLoader(){
        var par = this.el;
        new Loader(par);
        this.loadingSpinner = par.find('.loadingSpinner');
        this.loadingSpinner.css({
            position: 'absolute',
            left: '65%',
            top: '8%',
            'z-index': 10,
            'background': 'white',
            'border': '2px solid gray',
            'border-radius': '10px',
            'padding': '1em',
        });
    }

    removeLoader(){
        this.loadingSpinner.remove();
    }

    displayIndividualHeatmap () {
        var name = this.el.find('#select_list').find('option:selected').text(),
            modalTitle = $('#ind_heatmap_modal_title'),
            modalBody = $('#ind_heatmap_modal_body'),
            heatmap,
            onModalShowing = function(){
                modalTitle.html('');
                modalBody.html('');
            },
            onModalShown = function(){
                heatmap = new IndividualHeatmap(
                    window.name_to_id[name],
                    window.matrix_names,
                    window.matrix_ids,
                    name,
                    modalTitle,
                    modalBody,
                    window.sort_vector,
                    window.analysisObjectID,
                );
                heatmap.render();
            },
            onModalHidden = function(){
                heatmap.unrender();
            };

        $('#flcModal')
            .one('show.bs.modal', onModalShowing)
            .one('shown.bs.modal', onModalShown)
            .one('hidden.bs.modal', onModalHidden)
            .modal('show');
    }

    renderLegend() {
        let hl = new HeatmapLegend(this.legend, 'Spearman\'s \u03C1');
        hl.render();
    }

    renderContainers(){
        this.el.css('position', 'relative');
        this.el.empty();

        this.selector_div = $('<div>').css({
            position: 'absolute',
            top: '20%',
            height: '80%',
            width: '30%',
        }).appendTo(this.el);

        this.cp = $('<div id="correlation_plot" class="layouts">')
            .css({
                height: '95%',
                width: '68%',
                position: 'absolute',
                left: '32%',
                top: '5%',
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

    render() {
        var url = this.individualOverviewInitURL(this.id),
            cb = function(data) {
                window.col_names = data['col_names'],
                window.matrix_names = data['matrix_names'],
                window.matrix_ids = data['matrix_IDs'],
                window.sort_vector = data['sort_vector'];
                window.name_to_id = _.object(data['matrix_names'], data['matrix_IDs']);
                this.renderFiltering();
                this.displayCorrelations();
                this.renderLegend();
            };

        this.renderContainers();
        $.get(url, cb.bind(this));
    }

}

export default  IndividualOverview;
