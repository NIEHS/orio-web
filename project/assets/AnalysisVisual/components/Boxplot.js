import _ from 'underscore';
import React from 'react';
import d3 from 'd3';

import Axis from './Axis';
import Outliers from './Outliers';
import Whiskers from './Whiskers';
import Boxes from './Boxes';


class BoxPlot extends React.Component {

    render(){
        var max_value = 0,
            data = this.props.data,
            margins = {
                left: 100,
                bottom: 60,
            },
            h = this.props.height - margins.bottom,
            w = this.props.width - margins.left;

        _.each(data, (v, k)=>{
            let local_max = v.max,
                max_outlier = d3.max(v.outliers);
            if (local_max > max_value) {
                max_value = local_max;
            }
            if (max_outlier > max_value) {
                max_value = max_outlier;
            }
        });

        var x = d3.scale.ordinal()
            .domain(Object.keys(this.props.data))
            .rangeBands([margins.left, w + margins.left],0.2,0.2);

        var y = d3.scale.linear()
            .domain([-0.2*max_value, 1.2*max_value])
            .range([h, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        return (
            <div className="BoxPlot" style={{height: this.props.height, width: this.props.width}}>
                <p>Read coverage values at clusters:</p>
                <svg height={this.props.height} width={this.props.width}>
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
