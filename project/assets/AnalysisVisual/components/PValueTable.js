import React from 'react';


class PValueTable extends React.Component {

    render() {
        var makeHeader = function(x, i) {
            return <th className="pTh" key={i}>{x}</th>;
        };
        var makeRow = function(x, i) {
            return <td className="pTd" key={i}>{parseFloat(x).toPrecision(2)}</td>;
        };

        var rows = [],
            clusters = this.props.data['clusters'],
            p_values = this.props.data['p_values'];

        var header = (<tr><th className="pTh"></th>{clusters.map(makeHeader)}</tr>);

        for (let index in p_values) {
            rows.push(
                <tr className="pTr" key={index}>
                    <th className="pTh">{clusters[index]}</th>
                    {p_values[index].map(makeRow)}
                </tr>
            );
        }

        return (
            <div>
                <p>Pairwise p-values from Mann-Whitney test:</p>
                <table className="pTable">
                    <tbody>{header}{rows}</tbody>
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
