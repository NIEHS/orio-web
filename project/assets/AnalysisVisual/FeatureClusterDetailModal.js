import React from 'react';
import ReactDOM from 'react-dom';

import ClusterDetailBody from './components/ClusterDetailBody';



class FeatureClusterDetailModal{

    constructor($modal, d, analysis_id, cluster_id){
        this.data = d;
        this.analysis_id = analysis_id;
        this.cluster_id = cluster_id;
        this.$modal = $modal;
        this.$title = $modal.find('.modal-header > h4');
        this.$body = $modal.find('.modal-body');
        this.$modal
            .one('show.bs.modal', this.render.bind(this))
            .one('hidden.bs.modal', this.unrender.bind(this))
            .modal('show');

    }

    render(){
        this.$title.text(`Feature list cluster #${this.cluster_id}: details`);
        ReactDOM.render(
            <ClusterDetailBody
                analysis_id={this.analysis_id}
                cluster_id={this.cluster_id} />,
            this.$body.get(0)
        );
    }

    unrender(){
        // leave no trace
        ReactDOM.unmountComponentAtNode(
            this.$body.get(0)
        );
        this.$title.empty();
        this.$body.empty();
    }
}

export default FeatureClusterDetailModal;
