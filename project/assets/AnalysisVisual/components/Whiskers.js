import _ from 'underscore';
import React from 'react';


class Whiskers extends  React.Component{

    renderWhisker(data, i){
        var key = data[0],
            d = data[1],
            cell_width = this.props.x.rangeBand(),
            color = (key == this.props.cluster_id) ? 'red': 'black';

        return (
            <g key={i}>
                <line
                    x1={this.props.x(Object.keys(this.props.data)[i])}
                    x2={this.props.x(Object.keys(this.props.data)[i])+cell_width}
                    y1={this.props.y(d.min)}
                    y2={this.props.y(d.min)}
                    stroke={color}
                />
                <line
                    x1={this.props.x(Object.keys(this.props.data)[i])+0.5*cell_width}
                    x2={this.props.x(Object.keys(this.props.data)[i])+0.5*cell_width}
                    y1={this.props.y(d.max)}
                    y2={this.props.y(d.q3)}
                    stroke={color}
                />
                <line
                    x1={this.props.x(Object.keys(this.props.data)[i])+0.5*cell_width}
                    x2={this.props.x(Object.keys(this.props.data)[i])+0.5*cell_width}
                    y1={this.props.y(d.min)}
                    y2={this.props.y(d.q1)}
                    stroke={color}
                />
                <line
                    x1={this.props.x(Object.keys(this.props.data)[i])}
                    x2={this.props.x(Object.keys(this.props.data)[i])+cell_width}
                    y1={this.props.y(d.max)}
                    y2={this.props.y(d.max)}
                    stroke={color}
                />
            </g>
        );
    }

    render() {
        var whiskers = _.pairs(this.props.data);
        return <g>{whiskers.map(this.renderWhisker.bind(this))}</g>;
    }
}

Whiskers.propTypes = {
    data: React.PropTypes.object,
    cluster_id: React.PropTypes.number,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    x: React.PropTypes.func,
    y: React.PropTypes.func,
};

export default Whiskers;
