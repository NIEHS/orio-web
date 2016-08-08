import _ from 'underscore';
import $ from 'jquery';

import AnalysisOverview from './AnalysisOverview';
import IndividualOverview from './IndividualOverview';
import FeatureClusteringOverview from './FeatureClusteringOverview';


let startup = function(){
    $(document).ready(function(){

        // set configuration variables to window
        let config = JSON.parse(document.getElementById('config').textContent);
        _.each(config, (v, k) => window[k] = v);

        // create instances for visualization
        let dataCluster = $('#dataCluster'),
            featureCluster = $('#featureCluster'),
            dataClusterSubpanel1 = $('#dataClusterSubpanel1'),
            dataClusterSubpanel2 = $('#dataClusterSubpanel2'),
            btnDc = $('#data_clust_button'),
            btnFc = $('#feature_clust_button'),
            overview = new AnalysisOverview(dataClusterSubpanel1),
            individual_overview = new IndividualOverview(dataClusterSubpanel2),
            feature_clust_overview = new FeatureClusteringOverview(featureCluster),
            activeClass = {class: 'btn btn-primary'},
            inactiveClass = {class: 'btn btn-default'},
            handleFeatureClusterClick = function() {
                btnFc.attr(activeClass);
                btnDc.attr(inactiveClass);
                dataCluster.hide();
                featureCluster.show();
                feature_clust_overview.render();
            },
            handleDataClusterClick = function() {
                btnFc.attr(inactiveClass);
                btnDc.attr(activeClass);
                featureCluster.hide();
                dataCluster.show();
                overview.render();
                individual_overview.render();
            };

        // setup button handlers
        btnDc.click(handleDataClusterClick).trigger('click');
        btnFc.click(handleFeatureClusterClick);
    });
};

export default startup;
