import React from 'react';


class Boxes extends React.Component{

    render(){
        var self = this;

        var data = this.props.data,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var boxes = data_array.map(function(d,i) {

            var cluster = Object.keys(self.props.data)[i],
                color = (cluster == self.props.cluster_id) ? 'red' : 'black';

            return (
                <g key={i}>
                    <rect
                        x={self.props.x(Object.keys(self.props.data)[i])}
                        y={self.props.y(d.q3)}
                        height={self.props.y(d.q1) - self.props.y(d.q3)}
                        width={cell_width}
                        fill="none"
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i]) + cell_width}
                        y1={self.props.y(d.q2)}
                        y2={self.props.y(d.q2)}
                        stroke={color}
                    />
                </g>
            );
        });
        return <g>{boxes}</g>;
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
