import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';


class SortVectorScatterplotModal {

    constructor (sort_vector, bin, idy, namey, modal_title, modal_body) {
        this.sort_vector = sort_vector;
        this.bin = bin;
        this.idy = idy;
        this.namex = 'Sort vector';
        this.namey = namey;
        this.modal_title = modal_title;
        this.modal_body = modal_body;
    }

    binNamesUrl() {
        return window.binNamesUrl;
    }

    datasetUrl(column) {
        return `${window.sortVectorScatterplotURL}?idy=${this.idy}&column=${column}`;
    }

    renderHeader(){
        let Header = function(){
            return <p>Scatterplot comparison</p>;
        };
        ReactDOM.render(
            <Header />,
            this.modal_title.get(0)
        );
    }

    renderBody(data){

        var Body = function(){
            return (
                <div>
                    <div id="inputForm" className="form-group">
                        <label>Select bin</label>
                        <select className="form-control" id="selector">
                        </select>
                    </div>
                    <div id="visual"></div>
                </div>
            );
        };

        ReactDOM.render(
            <Body />,
            this.modal_body.get(0)
        );
    }

    renderBinSelector(){
        this.selector = this.modal_body.find('#selector');
        var bin = this.bin;
        d3.json(this.binNamesUrl(), (err, data) => {
            this.selector
                .empty()
                .html(data.map((d)=>`<option value="${d}">${d}</option>`))
                .val(bin);
        });
        this.selector
            .on('change', this.getScatterplotData.bind(this));
    }

    getScatterplotData(){
        let column = this.selector.val();
        if (column == null) {
            column = this.bin;
        }
        d3.csv(
            this.datasetUrl(column),
            this.dataConversion,
            (err, data) => this.renderScatterplot(data)
        );
    }

    renderScatterplot(data) {
        /*
        Render scatterplot. Note logscale; values of 0 are rendered to 1.
        */

        // Add sort vector values to data
        for (var i = 0; i < data.length; i++) {
            data[i]['x'] = this.sort_vector[i];
        }

        // DOM objects
        var $parent = this.modal_body,
            $form = this.modal_body.find('#inputForm'),
            $visual = this.modal_body.find('#visual');

        // constants
        var margin = {top: 20, right: 40, bottom: 50, left: 80},
            width = $visual.width() - margin.left - margin.right,
            height = $parent.height() - $form.height() - margin.top - margin.bottom;

        // (optionally) existing d3 components
        var isNew = (_.isUndefined(this.pltSvg)),
            svg = this.pltSvg || null,
            x = this.pltXScale || d3.scale.log().range([0, width]),
            y = this.pltYScale || d3.scale.log().range([height, 0]),
            xAxis = this.pltXAxis || null,
            yAxis = this.pltYAxis || null;

        // build scatterplot
        x.domain([1, d3.max(data, (d) => d.x)])
          .clamp(true)
          .nice();

        y.domain([1, d3.max(data, (d) => d.y)])
            .clamp(true)
            .nice();

        if (typeof Math.log10 !== 'function') { // For IE
            Math.log10 = function (x) { return Math.log(x) / Math.LN10; };
        }

        xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(Math.ceil(Math.log10(x.domain()[1])), ',d')
            .tickSize(6, 0);

        yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(Math.ceil(Math.log10(y.domain()[1])), ',d')
            .tickSize(6, 0);

        if (isNew){
            svg = d3.select($visual[0]).append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${ margin.left}, ${margin.top})`);

            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                .append('text')
                .attr('class', 'label')
                .attr('x', width)
                .attr('y', -6)
                .style('text-anchor', 'end')
                .text(this.namex);

            svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                .attr('class', 'label')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text(this.namey);

            svg.append('g')
                .attr('class', 'gdot');

            svg.select('.gdot')
                .selectAll('.dot')
                .data(data)
                .enter().append('circle')
                .attr('class', 'dot')
                .attr('r', 3.5)
                .attr('cx', (d) => x(d.x))
                .attr('cy', (d) => y(d.y))
                .style('fill', '#4682B4')
                .style('fill-opacity', 0.5)
                .on('mouseover', function(d){
                    let txt = `${d.label}<br>x: ${d.x}<br>y: ${d.y}`;
                    $(this).tooltip({
                        container: 'body',
                        title: txt,
                        html: true,
                        animation: false,
                    }).tooltip('show');
                })
                .on('mouseoff', function(d){
                    $(this).tooltip('destroy');
                });

        } else {
            //update

            let axisDuration = 500;

            svg.selectAll('.y')
               .transition()
               .duration(axisDuration)
               .call(yAxis.scale(y));

            svg.selectAll('.x')
               .transition()
               .duration(axisDuration)
               .call(xAxis.scale(x));

            svg.selectAll('.gdot')
               .transition()
               .delay(axisDuration * 0.8)
               .duration(300)
               .style('opacity', 0)
               .each('end', function(){
                    svg.selectAll('circle')
                        .data(data)
                        .attr('cx', (d) => x(d.x))
                        .attr('cy', (d) => y(d.y));
               })
               .transition()
               .duration(800)
               .style('opacity', 1);

        }

        _.extend(this, {
            pltSvg: svg,
            pltXScale: x,
            pltYScale: y,
            pltXAxis: xAxis,
            pltYAxis: yAxis,
        });
    }

    dataConversion(d) {
        return {
            label: d.label,
            x: +d.x,
            y: +d.y,
        };
    }

    render() {
        this.renderHeader();
        this.renderBody();
        this.renderBinSelector();
        this.getScatterplotData();
    }

}

export default SortVectorScatterplotModal;
