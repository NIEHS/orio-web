import _ from 'underscore';
import React from 'react';


class Boxes extends React.Component{

    renderBox(data, i){
        var key = data[0],
            d = data[1],
            color = (key == this.props.cluster_id) ? '#d13c4b' : 'black',
            cell_width = this.props.x.rangeBand();

        return <g key={i}>
            <rect
                x={this.props.x(Object.keys(this.props.data)[i])}
                y={this.props.y(d.q3)}
                height={this.props.y(d.q1) - this.props.y(d.q3)}
                width={cell_width}
                fill={color}
                stroke={color}
                style={{fillOpacity: 0.25}}
            />
            <line
                x1={this.props.x(Object.keys(this.props.data)[i])}
                x2={this.props.x(Object.keys(this.props.data)[i]) + cell_width}
                y1={this.props.y(d.q2)}
                y2={this.props.y(d.q2)}
                stroke={color}
            />
        </g>;
    }

    render(){
        var data = _.pairs(this.props.data);
        return <g>{data.map(this.renderBox.bind(this))}</g>;
    }
}

Boxes.propTypes =  {
    data: React.PropTypes.object,
    cluster_id: React.PropTypes.number,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    x: React.PropTypes.func,
    y: React.PropTypes.func,
};

export default Boxes;
