import $ from 'jquery';
import d3 from 'd3';
import {interpolateInferno} from 'd3-scale';

import {heatmapColorScale} from './utils';


class HeatmapLegend {

    constructor($parent, scale){
        this.$parent = $parent;
        this.scale = scale;
    }

    render(){

        var height = this.$parent.height(),
            width = this.$parent.width(),
            legend_lines = heatmapColorScale.ticks(5),
            gradient = heatmapColorScale.ticks(20),
            cellWidth = width/gradient.length,
            svg;

        svg = d3.select(this.$parent.get(0))
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        svg.append('g')
            .selectAll('rect')
            .data(gradient)
            .enter()
            .append('rect')
            .attr('width', cellWidth)
            .attr('height', 0.5 * height)
            .attr('x', (d, i) => i*cellWidth)
            .attr('y', 0.5 * height)
            .attr('fill', (d) => interpolateInferno(heatmapColorScale(d)))
            .each(function(d){
                $(this).tooltip({
                    container: 'body',
                    title: d,
                    animation: false,
                });
            });

        svg.append('g')
            .selectAll('line')
            .data(legend_lines)
            .enter()
            .append('line')
            .attr('x1', (d, i)=>i*0.25*width)
            .attr('x2', (d, i)=>i*0.25*width)
            .attr('y1', 0.3 * height)
            .attr('y2', 0.5 * height)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        svg.append('g')
            .selectAll('text')
            .data(legend_lines)
            .enter()
            .append('text')
            .text((d) => d)
            .attr('x', (d, i) => i*0.25*width)
            .attr('y', 0.25*height)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .style('text-anchor', 'middle');

        this.$parent.find('[data-toggle="tooltip"]').tooltip();
    }

    unrender(){
        this.$parent.find('[data-toggle="tooltip"]').tooltip('destroy');
        this.$parent.empty();
    }
}

export default HeatmapLegend;
