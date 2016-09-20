import _ from 'underscore';
import React from 'react';


class PValueTable extends React.Component {

    renderHeaderTh(d, i){
        return <th key={i}>{d}</th>;
    }

    renderRowTd(d, i){
        return <td key={i}>{parseFloat(d).toPrecision(2)}</td>;
    }

    renderRow(d, i){
        return <tr key={i}>
            <th>{d[0]}</th>
            {d[1].map(this.renderRowTd.bind(this))}
        </tr>;
    }

    render(){

        let row_data = _.zip(
            this.props.data.clusters,
            this.props.data.p_values
        );

        return (
            <div>
                <p><b>Pairwise <i>p</i>-values from Mann-Whitney test:</b></p>
                <table className="table table-condensed table-striped">
                    <thead>
                        <tr>
                        <th></th>
                        {this.props.data.clusters.map(this.renderHeaderTh)}
                        </tr>
                    </thead>
                    <tbody>
                        {row_data.map(this.renderRow.bind(this))}
                    </tbody>
                </table>
            </div>
        );
    }
}

PValueTable.propTypes = {
    data: React.PropTypes.object,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
};

export default PValueTable;
