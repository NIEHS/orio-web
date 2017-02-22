import _ from 'underscore';
import React from 'react';

import {
    displayPValue,
} from '../utils';

class PValueTable extends React.Component {

    getHeaderText(d){
        return parseInt(d)? `Cluster #${d}`: d;
    }

    renderHeaderTh(d, i){
        return <th key={i}>{this.getHeaderText(d)}</th>;
    }

    renderRowTd(d, i){
        return <td key={i}>{displayPValue(d)}</td>;
    }

    renderRow(d, i){
        return <tr key={i}>
            <th>{this.getHeaderText(d[0])}</th>
            {d[1].map(this.renderRowTd.bind(this))}
        </tr>;
    }

    render(){

        let row_data = _.zip(
            this.props.data.clusters,
            this.props.data.p_values
        );

        return <table className="table table-condensed table-striped">
            <thead>
                <tr>
                <th></th>
                {this.props.data.clusters.map(this.renderHeaderTh.bind(this))}
                </tr>
            </thead>
            <tbody>
                {row_data.map(this.renderRow.bind(this))}
            </tbody>
        </table>;
    }
}

PValueTable.propTypes = {
    data: React.PropTypes.object.isRequired,
};

export default PValueTable;
