import _ from 'underscore';
import React from 'react';


class Outliers extends React.Component {

    renderOutliers(data, idx){
        var cell_width = this.props.x.rangeBand(),
            key = data[0],
            d = data[1],
            color = (key == this.props.cluster_id) ? 'red' : 'black';

        return d.outliers.map((d, i)=>{
            return <circle
                key={i + '-' + idx}
                cx={this.props.x(key) + 0.5 * cell_width}
                cy={this.props.y(d)}
                r={0.05 * cell_width}
                fill="none"
                stroke={color}
            />;
        });
    }

    render() {
        let outliers = _.chain(this.props.data)
            .pairs()
            .map(this.renderOutliers.bind(this))
            .flatten()
            .value();

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
