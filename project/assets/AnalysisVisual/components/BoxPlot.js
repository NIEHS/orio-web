import _ from 'underscore';
import React from 'react';
import d3 from 'd3';

import Axis from './Axis';
import Outliers from './Outliers';
import Whiskers from './Whiskers';
import Boxes from './Boxes';


class BoxPlot extends React.Component {

    render(){
        var max_value = -Infinity,
            min_value = Infinity,
            data = this.props.data,
            margins = {
                left: 100,
                bottom: 60,
                top: 10,
            },
            h = this.props.height - margins.bottom - margins.top,
            w = this.props.width - margins.left;

        _.each(data, (v, k)=>{
            let local_max = v.max,
                local_min = v.min,
                max_outlier = d3.max(v.outliers),
                min_outlier = d3.min(v.outliers.filter((d)=>d>0));

            if (local_max > max_value) {
                max_value = local_max;
            }
            if (max_outlier > max_value) {
                max_value = max_outlier;
            }

            if (local_min > 0 && local_min < min_value) {
                min_value = local_min;
            }
            if (min_outlier < min_value) {
                min_value = min_outlier;
            }

        });
        min_value = Math.max(min_value, 1);

        var x = d3.scale.ordinal()
            .domain(Object.keys(this.props.data))
            .rangeBands([margins.left, w + margins.left],0.2,0.2);

        var y = d3.scale.log()
            .domain([min_value, max_value])
            .range([h, 0])
            .nice()
            .clamp(true);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        if (typeof Math.log10 !== 'function') { // For IE
            Math.log10 = function (x) { return Math.log(x) / Math.LN10; };
        }
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(Math.ceil(Math.log10(y.domain()[1]) - Math.log10(y.domain()[0])));

        return (
            <div className="BoxPlot" style={{height: this.props.height, width: this.props.width}}>
                <svg height={this.props.height} width={this.props.width}>
                    <g transform={`translate(0,${margins.top})`}>
                    <Boxes
                        data={this.props.data}
                        cluster_id={this.props.cluster_id}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    <Whiskers
                        data={this.props.data}
                        cluster_id={this.props.cluster_id}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    <Outliers
                        data={this.props.data}
                        cluster_id={this.props.cluster_id}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    </g>
                    <Axis
                        h={h}
                        margins={margins}
                        axis={xAxis}
                        axisType="x"
                        />
                    <Axis
                        h={h}
                        margins={margins}
                        axis={yAxis}
                        axisType="y"
                        />
                </svg>
            </div>
        );
    }
}

BoxPlot.propTypes = {
    data: React.PropTypes.object,
    index: React.PropTypes.number,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    cluster_id: React.PropTypes.number,
};

export default BoxPlot;
