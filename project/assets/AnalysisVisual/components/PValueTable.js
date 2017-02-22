import _ from 'underscore';
import React from 'react';


class PValueTable extends React.Component {

    displayPValue(val){
        var float = parseFloat(val);
        return (float < 2.2e-16) ? ('< 2.2e-16') : ('' + float.toPrecision(2));
    }

    getHeaderText(d){
        return parseInt(d)? `Cluster #${d}`: d;
    }

    renderHeaderTh(d, i){
        return <th key={i}>{this.getHeaderText(d)}</th>;
    }

    renderRowTd(d, i){
        return <td key={i}>{this.displayPValue(d)}</td>;
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
