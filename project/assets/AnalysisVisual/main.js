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
        let pnl1 = $('#visual_panel_1'),
            pnl2 = $('#visual_panel_2'),
            btnDc = $('#data_clust_button'),
            btnFc = $('#feature_clust_button'),
            overview = new AnalysisOverview(pnl1),
            individual_overview = new IndividualOverview(pnl2),
            feature_clust_overview = new FeatureClusteringOverview(pnl1, pnl2),
            activeClass = {class: 'btn btn-primary'},
            inactiveClass = {class: 'btn btn-default'},
            handleFeatureClusterClick = function() {
                btnFc.attr(activeClass);
                btnDc.attr(inactiveClass);
                pnl1.empty();
                pnl2.empty();
                feature_clust_overview.render();
            },
            handleDataClusterClick = function() {
                btnFc.attr(inactiveClass);
                btnDc.attr(activeClass);
                pnl1.empty();
                pnl2.empty();
                overview.render();
                individual_overview.render();
            };

        // setup button handlers
        btnDc.click(handleDataClusterClick).trigger('click');
        btnFc.click(handleFeatureClusterClick);
    });
};

export default startup;
