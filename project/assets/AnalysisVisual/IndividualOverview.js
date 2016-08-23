import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';
import {interpolateInferno} from 'd3-scale';

import {heatmapColorScale} from './utils';
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
        var selectable,
            el = this.el,
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

        //Remove heatmap div if there; append heatmap div
        this.el.find('#select_list').remove();
        var select_list = $('<select id="select_list"></select>')
            .attr({
                'size': '12',
            })
            .css({
                'height': '55%',
                'width': '30%',
                'font-size': '8px',
                'position': 'absolute',
                'top': '20%',
            })
            .change(this.displayCorrelations.bind(this))
            .appendTo(this.el);

        addOptions(this.el, window.matrix_names);

        select_list[0].selectedIndex = 0;

        this.el.find('#search_field').remove();

        $('<input>')
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
            .on('input', showMatches)
            .appendTo(el);
        this.displayCorrelations();
    }

    addDisplayButton() {
        this.el.find('#display_heatmap').remove();
        $('<button>Display individual heatmap</button>')
            .attr({
                type: 'button',
                class: 'btn btn-primary',
            }).css({
                position: 'absolute',
                left: '0%',
                top: '80%',
                width: '30%',
            }).click(
                this.displayIndividualHeatmap.bind(this)
            ).appendTo(this.el);
    }

    renderCorrelations(selected, row_data){
        var cp = this.el.find('#correlation_plot'),
            num = row_data.length - 1,
            entry_length = 6,
            margin = {top: 0, right: 0, bottom: 20, left: 0},
            offset = {top: 20, right: 0, bottom: 100, left: 40},
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

        var $graph = $('<div id="graph">')
            .css({
                'height': height,
                'width': width,
                'position': 'absolute',
                'left': '0%',
                'top': margin.top,
            }).appendTo(cp);

        var graph = d3.select($graph.get(0)).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g');

        var x = d3.scale.ordinal()
            .domain(sortable.map(function(d) {return d[0];}))
            .rangeBands([6,width - offset.left - offset.right]);

        var y = d3.scale.linear()
            .domain([-1,1])
            .range([height - offset.top - offset.bottom,0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .outerTickSize(0);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        var handleMouseOver = function (d) {
            $(this).tooltip({
                container: 'body',
                title: `${d[0]}<br/>${d[1].toFixed(2)}`,
                html: true,
                animation: false,
            }).tooltip('show');
        };

        var lines = [-1, 0, 1];

        graph.append('g')
            .selectAll('rect')
            .data(sortable)
            .enter()
            .append('rect')
            .style('fill', (d) => interpolateInferno(heatmapColorScale(d[1])))
            .attr('x', (d) => offset.left + x(d[0]))
            .attr('width', x.rangeBand() - 2)
            .attr('y', (d) => offset.top + y(Math.max(0,d[1])))
            .attr('height', (d) => Math.abs(y(0) - y(d[1])));

        graph.append('g')
            .selectAll('rect')
            .data(sortable)
            .enter()
            .append('rect')
            .style('fill', 'transparent')
            .attr('x', (d) => offset.left + x(d[0]))
            .attr('width', x.rangeBand() - 2)
            .attr('y', offset.top)
            .attr('height', y(-1))
            .on('mouseover', handleMouseOver);

        $('[data-toggle="tooltip"]').tooltip();

        graph.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(${offset.left},${height - offset.bottom})`)
            .call(xAxis)
            .style('fill', 'none')
            .selectAll('text')
            .style('fill', 'black')
            .attr('font-size', '8px')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-90)' )
            .attr('dx', '-8px')
            .attr('dy', '-8px');

        graph.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${offset.left},${offset.top})`)
            .style('fill', 'none')
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .call(yAxis)
            .selectAll('text')
            .attr('font-size','8px')
            .style('fill', 'black')
            .style('stroke', 'none');

        graph.append('g')
            .selectAll('line')
            .data(lines)
            .enter()
            .append('line')
            .attr('x1', offset.left)
            .attr('x2', width - offset.right)
            .attr('y1', (d) => offset.top + y(d))
            .attr('y2', (d) => offset.top + y(d))
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .style('stroke-dasharray', (d) => {return (d===0)? 'none': '5,5';});
    }

    displayCorrelations(){
        this.el.find('#correlation_plot').remove();
        var $cp = $('<div id="correlation_plot">')
            .css({
                height: '100%',
                width: '68%',
                position: 'absolute',
                left: '32%',
                top: '0%',
                overflow: 'hide',
                display: 'flex',
                'flex-direction': 'column',
                'justify-content': 'center',
            }).appendTo(this.el);

        var selected = this.el.find('#select_list').find('option:selected').text(),
            url = this.dscFullRowValueURL(this.id, selected);

        new Loader($cp);
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
            };

        $.get(url, cb.bind(this));
    }

}

export default  IndividualOverview;
