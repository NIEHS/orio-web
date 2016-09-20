import $ from 'jquery';
import React from 'react';

import PValueTable from './PValueTable';
import BoxPlot from './BoxPlot';


class ClusterQuant extends React.Component {

    constructor() {
        super();
        this.state = {
            col_names: null,
            selected_col: null,
            box_plot_data: null,
            mw_values: null,
        };
    }

    componentDidMount() {
        console.log(this.props);
        let url = `/dashboard/api/analysis/${this.props.analysis_id}/fc_vector_col_names/`;
        $.get(url, (d) => {
            this.setState({
                col_names: d,
            });
        });
    }

    renderSelectList() {
        var makeOption = function(x, i) {
            return <option key={i} value={i}>{x}</option>;
        };

        if (this.state.col_names == null) {
            return false;
        }

        return (
            <div>
                <select id="col_select" className="clustQuantSelect">{this.state.col_names.map(makeOption)}</select>
            </div>
        );
    }

    renderSelectButton() {
        return(
            <div>
                <button
                    type="button"
                    className="btn btn-primary clustQuantButton"
                    onClick={this.handleSelectClick.bind(this)}>Display box plot</button>
            </div>
        );
    }

    handleSelectClick() {
        var index = $('#col_select option:selected').val(),
            url = `/dashboard/api/analysis/${this.props.analysis_id}/clust_boxplot/?k=${this.props.k}&index=${index}`;

        $.get(url, (d)=>{
            this.setState({
                selected_col: parseInt(index),
                box_plot_data: d[0],
                mw_values: d[1],
            });
        });
    }

    renderCharts(height, width) {
        if (this.state.selected_col == null) {
            return false;
        }

        var box_height = 200;
        var pval_height = 200;

        return (
            <div className="ClustCharts" style={{height: box_height, width: width}}>
                <BoxPlot
                    data={this.state.box_plot_data}
                    height={box_height}
                    width={width}
                    cluster_id={this.props.cluster_id}/>
                <PValueTable
                    data={this.state.mw_values}
                    height={pval_height}
                    width={width}/>
            </div>
        );
    }

    render() {
        var width = $('#ind_heatmap_modal_body').width();
        return (
            <div className="ClustQuant">
                {this.renderSelectList()}
                {this.renderSelectButton()}
                {this.renderCharts(400,width)}
            </div>
        );
    }
}

ClusterQuant.propTypes = {
    analysis_id: React.PropTypes.number.isRequired,
    k: React.PropTypes.number.isRequired,
    cluster_id: React.PropTypes.number,
};

export default ClusterQuant;


