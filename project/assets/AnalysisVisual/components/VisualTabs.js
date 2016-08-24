import $ from 'jquery';
import React from 'react';

import {
    getMaxContainerHeight,
} from '../utils';

import AnalysisOverview from '../AnalysisOverview';
import IndividualOverview from '../IndividualOverview';
import FeatureClusteringOverview from '../FeatureClusteringOverview';


class VisualTabs extends React.Component {

    constructor(){
        super();
        this.handleTabClick = this.handleTabClick.bind(this);
    }

    componentDidMount(){
        // create instances for visualization
        let maxHeight = getMaxContainerHeight(this.refs.contents) - 15,
            dc1 = $('#dataClusterSubpanel1').css('height', maxHeight),
            dc2 = $('#dataClusterSubpanel2').css('height', maxHeight),
            fc = $('#featureCluster').css('height', maxHeight);

        this.overview = new AnalysisOverview(dc1),
        this.individual_overview = new IndividualOverview(dc2),
        this.feature_clust_overview = new FeatureClusteringOverview(fc);

        $(this.refs.tabs)
            .find('a:first')
            .get(0)
            .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }

    handleTabClick(e){
        e.preventDefault();

        let el = e.nativeEvent.target;
        $(el).tab('show');

        switch(el.getAttribute('href')){
        case '#vt_dataset':
            this.overview.render();
            break;
        case '#vt_correlation':
            this.individual_overview.render();
            break;
        case '#vt_feature':
            this.feature_clust_overview.render();
            break;
        }
    }

    renderDataset(){
        return <div className='container-fluid' id='dataClusterSubpanel1'>
        </div>;
    }

    renderCorrelation(){
        return <div className='container-fluid' id='dataClusterSubpanel2'>
        </div>;
    }

    renderFeature(){
        return <div className='container-fluid' id='featureCluster'>
        </div>;
    }

    render() {
        return <div style={{paddingTop: '1em'}}>
            <ul className="nav nav-pills nav-justified well well-sm" ref="tabs">
                <li role="presentation">
                    <a href="#vt_dataset"
                       onClick={this.handleTabClick}>Dataset clustering</a></li>
                <li role="presentation">
                    <a href="#vt_correlation"
                       onClick={this.handleTabClick}>Dataset correlations</a></li>
                <li role="presentation">
                    <a href="#vt_feature"
                       onClick={this.handleTabClick}>Feature clustering</a></li>
            </ul>
            <div className="tab-content" ref="contents">
                <div role="tabpanel" className="tab-pane" id='vt_dataset'>
                    {this.renderDataset()}
                </div>
                <div role="tabpanel" className="tab-pane" id='vt_correlation'>
                    {this.renderCorrelation()}
                </div>
                <div role="tabpanel" className="tab-pane" id='vt_feature'>
                    {this.renderFeature()}
                </div>
            </div>
        </div>;
    }
}

VisualTabs.propTypes = {
};

export default VisualTabs;
