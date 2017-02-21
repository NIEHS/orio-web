import _ from 'underscore';
import $ from 'jquery';
import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

import Loader from './Loader';
import SaveAsImage from './components/SaveAsImage';


class ScatterplotModal {

    constructor (idx, idy, namex, namey, modal_title, modal_body) {
        this.idx = idx;
        this.idy = idy;
        this.namex = namex;
        this.namey = namey;
        this.modal_title = modal_title;
        this.modal_body = modal_body;

        this.renderDownloadBtn();
    }

    binNamesUrl() {
        return window.binNamesUrl;
    }

    datasetUrl(column) {
        return `${window.scatterplotURL}?` +
            $.param({idx: this.idx, idy: this.idy, column});
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
                <div id="inputForm" className='container-fluid'>
                    <div className='row well well-sm'>
                        <form className="form-horizontal">
                            <label className='col-sm-3 control-label png-remove'>Select bin:</label>
                            <div className='col-sm-9'>
                                <select className="form-control" id="selector"></select>
                            </div>
                        </form>
                    </div>
                    <div id="scmvisual"></div>
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
        d3.json(this.binNamesUrl(), (err, data) => {
            this.selector
                .empty()
                .html(data.map((d)=>`<option value="${d}">${d}</option>`))
                .val(data[0]);
        });
        this.selector
            .on('change', this.getScatterplotData.bind(this));
    }

    renderLoader(){
        var par = this.modal_body.find('#scmvisual');
        new Loader(par);
        this.loadingSpinner = par.find('.loadingSpinner');
        this.loadingSpinner.css({
            position: 'absolute',
            left: '50%',
            top: '15%',
        });
    }

    getScatterplotData(){
        let column = this.selector.val();
        this.loadingSpinner.fadeIn();
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

        this.loadingSpinner.fadeOut();

        // DOM objects
        var $parent = this.modal_body,
            $form = this.modal_body.find('#inputForm'),
            $visual = this.modal_body.find('#scmvisual');

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
                .style('fill', '#cc4248')
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

    renderDownloadBtn(){
        let dl = $('<div class="download-button">').css({
            float: 'right',
            'margin-right': '20px',
            'margin-top': '-40px',
        }).insertAfter(this.modal_body);
        ReactDOM.render(<SaveAsImage content={this.modal_body} />, dl.get(0));
    }

    render() {
        this.renderHeader();
        this.renderBody();
        this.renderBinSelector();
        this.renderLoader();
        this.getScatterplotData();
    }

}

export default ScatterplotModal;
