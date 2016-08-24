import $ from 'jquery';
import _ from 'underscore';
import React from 'react';
import {saveAs} from 'filesaver.js';

import Loader from './Loader';


class ClusterDetailBody extends React.Component {

    constructor(){
        super();
        this.handleDownloadFeaturesClick = this.handleDownloadFeaturesClick.bind(this);
        this.handleDownloadGenesClick = this.handleDownloadGenesClick.bind(this);

        // set initial state
        this.state = {
            featuresCount: null,
            features: null,
            genesCount: null,
            genes: null,
        };
    }

    componentWillMount(){
        $.get(`/dashboard/api/analysis/${this.props.analysis_id}/cluster_details/?k=${this.props.k}&cluster_id=${this.props.cluster_id}`, (d)=>{
            let d2 = _.unzip(d),
                features = d2[0],
                genes = _.chain(d2[1].join(',').split(','))
                        .uniq()
                        .sort()
                        .value();

            this.setState({
                featuresCount: features.length,
                features: features.join('\n'),
                genesCount: genes.length,
                genes: genes.join('\n'),
            });
        });
    }

    componentDidMount(){
        $(this.refs.tabs)
            .find('a:first')
            .get(0)
            .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }

    handleDownloadFeaturesClick(){
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
            <p><b>{this.state.featuresCount} features identified in this cluster:</b></p>
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
            <p><b>{this.state.genesCount} genes identified near features:</b></p>
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
    k: React.PropTypes.number.isRequired,
    cluster_id: React.PropTypes.number.isRequired,
};

export default ClusterDetailBody;
