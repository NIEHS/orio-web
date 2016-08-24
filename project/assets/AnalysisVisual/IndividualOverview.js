import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';
import {interpolateInferno} from 'd3-scale';

import {heatmapColorScale} from './utils';
import HeatmapLegend from './HeatmapLegend';
import IndividualHeatmap from './IndividualHeatmap';
import Loader from './Loader';


class IndividualOverview {

    constructor(el, analysis_id) {
        this.el = el;
        this.id = window.analysisObjectID;
    }

    individualOverviewInitURL(id) {
        return `/dashboard/api/analysis/${id}/individual_overview/`;
    }

    dscFullRowValueURL(id, row_name) {
        return `/dashboard/api/analysis/${id}/dsc_full_row_value/?row=${row_name}`;
    }

    renderSelectList() {
        var select_list = this.select_list,
            el = this.el,
            input = this.input,
            selectable,
            addOptions = function(el, option_array) {
                var select = el.find('#select_list');
                select.empty()
                    .html(option_array.map((d)=>{
                        return `<option value="${d}">${d}</option>`;
                    }).join(''));
            },
            showMatches = function() {
                let value = this.value.toLowerCase();
                if (value === '') {
                    selectable = window.matrix_names;
                } else {
                    selectable = $.grep(window.matrix_names, function(n) {
                        return (n.toLowerCase().includes(value));
                    });
                }
                addOptions(el, selectable);
            };

        select_list
            .change(this.displayCorrelations.bind(this));

        addOptions(this.el, window.matrix_names);

        select_list[0].selectedIndex = 0;

        input
            .on('input', showMatches);

        this.displayCorrelations();
    }

    addDisplayButton() {
        this.button.click(
            this.displayIndividualHeatmap.bind(this));
    }

    renderCorrelations(selected, row_data){
        var cp = this.el.find('#correlation_plot'),
            num = row_data.length - 1,
            entry_length = 6,
            margin = {top: 10, right: 10, bottom: 0, left: 0},
            offset = {top: 0, right: 10, bottom: 320, left: 50},
            width = (num*entry_length > cp.width())
                ? (num*entry_length - margin.left - margin.right)
                : (cp.width() - margin.left - margin.right),
            height = cp.height();

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
            .attr('dx', '-6px')
            .attr('dy', '-6px');

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
            .style('fill', (d) => interpolateInferno(heatmapColorScale(d[1])))
            .attr('x', (d) => x(d[0]) + 2)
            .attr('width', x.rangeBand() - 4)
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
        var cp = this.cp,
            selected = this.el.find('#select_list').find('option:selected').text(),
            url = this.dscFullRowValueURL(this.id, selected);

        new Loader(cp);
        $.get(url, this.renderCorrelations.bind(this, selected));
    }

    displayIndividualHeatmap () {
        var name = this.el.find('#select_list').find('option:selected').text(),
            modalTitle = $('#ind_heatmap_modal_title'),
            modalBody = $('#ind_heatmap_modal_body'),
            onModalShowing = function(){
                modalTitle.html('');
                modalBody.html('');
            },
            onModalShown = function(){
                var individual_heatmap = new IndividualHeatmap(
                    window.name_to_id[name],
                    window.matrix_names,
                    window.matrix_ids,
                    name,
                    modalTitle,
                    modalBody,
                    window.sort_vector
                );
                individual_heatmap.render();
            };

        $('#flcModal')
            .one('show.bs.modal', onModalShowing)
            .one('shown.bs.modal', onModalShown)
            .modal('show');
    }

    drawLegend() {
        let hl = new HeatmapLegend(this.legend);
        hl.render();
    }

    renderContainers(){
        this.el.css('position', 'relative');
        this.el.empty();

        this.select_list = $('<select id="select_list" class="layouts">')
            .attr({
                size: '12',
            })
            .css({
                'font-size': '8px',
                height: '55%',
                width: '30%',
                position: 'absolute',
                top: '20%',
            })
            .appendTo(this.el);

        this.input = $('<input class="layouts">')
            .attr({
                type: 'text',
                id: 'search_field',
                placeholder: 'Filter data list',
                outerWidth: '30%',
                outerHeight: '15%',
            }).css({
                position: 'absolute',
                left: '0%',
                top: '0%',
                width: '30%',
                height: '15%',
                overflow: 'scroll',
            })
            .appendTo(this.el);

        this.button = $('<button>Display individual heatmap</button>')
            .attr({
                type: 'button',
                class: 'btn btn-primary layouts',
            }).css({
                position: 'absolute',
                left: '0%',
                top: '80%',
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
                left: '75%',
                top: '0%',
                overflow: 'visible',
                height: '5%',
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
                this.renderSelectList();
                this.addDisplayButton();
                this.drawLegend();
            };

        this.renderContainers();
        $.get(url, cb.bind(this));
    }

}

export default  IndividualOverview;
