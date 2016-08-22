import $ from 'jquery';
import React from 'react';
import {saveAs} from 'filesaver.js';


class ClusterDetailBody extends React.Component {

    constructor(){
        super();
        this.handleDownloadFeaturesClick.bind(this);
        this.handleDownloadGenesClick.bind(this);
    }

    componentDidMount(){
        $(this.refs.tabs)
            .find('a:first')
            .get(0)
            .dispatchEvent(new MouseEvent('click', {bubbles: true,}));
    }

    handleDownloadFeaturesClick(){
        var txt = 'feature text placeholder',
            blob = new Blob([txt], {type: 'text/plain; charset=utf-8'});
        saveAs(blob, 'features.txt');
    }

    handleDownloadGenesClick(){
        var txt = 'genes placeholder',
            blob = new Blob([txt], {type: 'text/plain; charset=utf-8'});
        saveAs(blob, 'genes.txt');
    }

    handleTabClick(e){
        e.preventDefault();
        $(e.nativeEvent.target).tab('show');
    }

    renderFeatures(){
        return <div className="container-fluid">
            <br/>
            <pre className="pre-scrollable validation_notes"></pre>
            <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleDownloadFeaturesClick}>Download</button>
        </div>;
    }

    renderGenes(){
        return <div className="container-fluid">
            <br/>
            <pre className="pre-scrollable validation_notes"></pre>
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
};

export default ClusterDetailBody;
