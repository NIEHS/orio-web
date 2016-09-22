import d3 from 'd3';
import _ from 'underscore';
import React from 'react';


class Outliers extends React.Component {

    renderOutliers(data, idx){
        var cell_width = this.props.x.rangeBand(),
            key = data[0],
            d = data[1],
            color = (key == this.props.cluster_id) ? '#d13c4b' : 'black',
            jitter = d3.random.normal(0, cell_width*0.03);

        return d.outliers.map((d, i)=>{
            return <circle
                key={i + '-' + idx}
                cx={this.props.x(key) + 0.5 * cell_width + jitter()}
                cy={this.props.y(d)}
                r={Math.max(0.01 * cell_width, 4)}
                fill="none"
                stroke={color}
                fill={color}
                style={{opacity: 0.30}}>
                <title>{d}</title>
            </circle>;
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
