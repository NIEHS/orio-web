import React from 'react';


class Outliers extends React.Component {

    render() {
        var self = this;

        var data = this.props.data,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var outliers = [];
        data_array.map(function(d,i) {

            var cluster = Object.keys(self.props.data)[i],
                color = (cluster == self.props.cluster_id) ? 'red' : 'black';

            for (let index in d.outliers) {
                outliers.push(
                    <circle
                        key={i + '-' + index}
                        cx={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        cy={self.props.y(d.outliers[index])}
                        r={0.05*cell_width}
                        fill="none"
                        stroke={color}
                    />
                );
            }
        });
        return <g>{outliers}</g>;
    }
}

Outliers.propTypes = {
    data: React.PropTypes.object,
    cluster_id: React.PropTypes.number,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    x: React.PropTypes.func,
    y: React.PropTypes.func,
};

export default Outliers;
