import $ from 'jquery';
import React from 'react';
import {saveAs} from 'filesaver.js';

import Loader from './Loader';


class ClusterDetailBody extends React.Component {

    constructor(){
        super();
        this.handleDownloadFeaturesClick = this.handleDownloadFeaturesClick.bind(this);
        this.handleDownloadGenesClick = this.handleDownloadGenesClick.bind(this);

        this.state = {
            features: null,
            genes: null,
        };
    }

    componentWillMount(){
        // TODO - remove timeout
        setTimeout(()=>{
            $.get(`/dashboard/api/analysis/${this.props.analysis_id}/cluster_details/?k=${this.props.cluster_id}`, (d)=>{
                this.setState(d);
            });
        }, 2000);
    }

    componentDidMount(){
        $(this.refs.tabs)
            .find('a:first')
            .get(0)
            .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }

    handleDownloadFeaturesClick(){
        console.log(this)
        let blob = new Blob(
            [this.state.features],
            {type: 'text/plain; charset=utf-8'}
        );
        saveAs(blob, 'features.txt');
    }

    handleDownloadGenesClick(){
        let blob = new Blob(
            [this.state.genes],
            {type: 'text/plain; charset=utf-8'}
        );
        saveAs(blob, 'genes.txt');
    }

    handleTabClick(e){
        e.preventDefault();
        $(e.nativeEvent.target).tab('show');
    }

    renderLoader(){
        return <div className="container-fluid">
            <br />
            <Loader />
        </div>;
    }

    renderFeatures(){
        if (this.state.features === null){
            return this.renderLoader();
        }

        return <div className="container-fluid">
            <br/>
            <pre className="pre-scrollable validation_notes">{this.state.features}</pre>
            <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleDownloadFeaturesClick}>Download</button>
        </div>;
    }

    renderGenes(){
        if (this.state.genes === null){
            return this.renderLoader();
        }

        return <div className="container-fluid">
            <br/>
            <pre className="pre-scrollable validation_notes">{this.state.genes}</pre>
            <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleDownloadGenesClick}>Download</button>
        </div>;
    }

    render() {
        return <div>
            <ul className="nav nav-tabs" ref="tabs">
                <li role="presentation">
                    <a href="#fcdm_features"
                       onClick={this.handleTabClick}>Features</a></li>
                <li role="presentation">
                    <a href="#fcdm_genes"
                       onClick={this.handleTabClick}>Genes</a></li>
            </ul>
            <div className="tab-content">
                <div role="tabpanel" className="tab-pane" id='fcdm_features'>
                    {this.renderFeatures()}
                </div>
                <div role="tabpanel" className="tab-pane" id='fcdm_genes'>
                    {this.renderGenes()}
                </div>
            </div>
        </div>;
    }
}

ClusterDetailBody.propTypes = {
    analysis_id: React.PropTypes.number.isRequired,
    cluster_id: React.PropTypes.number.isRequired,
};

export default ClusterDetailBody;
