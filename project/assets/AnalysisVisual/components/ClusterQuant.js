import $ from 'jquery';
import React from 'react';

import Loader from './Loader';
import PValueTable from './PValueTable';
import BoxPlot from './BoxPlot';


class ClusterQuant extends React.Component {

    constructor() {
        super();
        this.state = {
            isLoading: false,
            col_names: null,
            selected_col: null,
            box_plot_data: null,
            mw_values: null,
        };
    }

    componentDidMount() {
        let url = `/dashboard/api/analysis/${this.props.analysis_id}/fc_vector_col_names/`;
        $.get(url, (d) => {
            this.setState({
                col_names: d,
            });
        });
    }

    renderSelector() {
        var makeOption = function(x, i) {
            return <option key={i} value={i}>{x}</option>;
        };

        if (this.state.col_names == null) {
            return false;
        }

        return (
            <div className='row well well-sm' style={{marginTop: 5}}>
                <div className='col-sm-9'>
                    <form className="form-horizontal">
                        <label className='col-sm-3 control-label'>Select a dataset:</label>
                        <div className='col-sm-9'>
                            <select ref="selector" className='form-control'>
                                {this.state.col_names.map(makeOption)}
                            </select>
                        </div>
                    </form>
                </div>
                <div className='col-sm-3'>
                    <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={this.handleSelectClick.bind(this)}>Display coverage details</button>
                </div>
            </div>
        );
    }

    handleSelectClick() {
        var index = this.refs.selector.value,
            url = `/dashboard/api/analysis/${this.props.analysis_id}/clust_boxplot/?k=${this.props.k}&index=${index}`;

        this.setState({
            selected_col: null,
            box_plot_data: null,
            mw_values: null,
            isLoading: true,
        });

        $.get(url, (d)=>{
            this.setState({
                selected_col: parseInt(index),
                box_plot_data: d[0],
                mw_values: d[1],
                isLoading: false,
            });
        });
    }

    renderLoader(){
        return <div className='row'>
            <div className='col-xs-offset-6 col-xs-6'>
                <Loader/>
            </div>
        </div>;
    }

    renderCharts(width) {
        if (this.state.isLoading){
            return this.renderLoader();
        }

        if (this.state.selected_col == null) {
            return null;
        }

        return <div className='row'>
            <div className='col-xs-12'>
                <p><b>Read coverage values at clusters:</b></p>
                <BoxPlot
                    data={this.state.box_plot_data}
                    height={250}
                    width={width}
                    cluster_id={this.props.cluster_id}/>
            </div>
            <div className='col-xs-12'>
                <p><b>Pairwise <i>p</i>-values from Mann-Whitney test:</b></p>
                <PValueTable data={this.state.mw_values}/>
            </div>
        </div>;
    }

    render() {
        var width = $('#ind_heatmap_modal_body').width() - 30;
        return (
            <div className="container-fluid">
                {this.renderSelector()}
                {this.renderCharts(width)}
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


