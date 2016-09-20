import React from 'react';


class Whiskers extends  React.Component{

    render() {
        var self = this;

        var data = this.props.data,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var whiskers = data_array.map(function(d,i) {

            var cluster = Object.keys(self.props.data)[i],
                color = (cluster == self.props.cluster_id) ? 'red': 'black';

            return (
                <g key={i}>
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i])+cell_width}
                        y1={self.props.y(d.min)}
                        y2={self.props.y(d.min)}
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        x2={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        y1={self.props.y(d.max)}
                        y2={self.props.y(d.q3)}
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        x2={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        y1={self.props.y(d.min)}
                        y2={self.props.y(d.q1)}
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i])+cell_width}
                        y1={self.props.y(d.max)}
                        y2={self.props.y(d.max)}
                        stroke={color}
                    />
                </g>
            );
        });
        return <g>{whiskers}</g>;
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
