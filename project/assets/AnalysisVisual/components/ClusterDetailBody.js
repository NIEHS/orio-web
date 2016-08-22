import $ from 'jquery';
import React from 'react';


class ClusterDetailBody extends React.Component {

    componentDidMount(){
        $(this.refs.tabs)
            .find('a:first')
            .get(0)
            .dispatchEvent(new MouseEvent('click', {bubbles: true,}));
    }

    onTabClick(e){
        e.preventDefault();
        $(e.nativeEvent.target).tab('show');
    }

    renderFeatures(){
        return <div className="container-fluid">
            <br/>
            <pre className="pre-scrollable validation_notes"></pre>
            <button type="button" className="btn btn-primary">Download</button>
        </div>;
    }

    renderGenes(){
        return <div className="container-fluid">
            <br/>
            <pre className="pre-scrollable validation_notes"></pre>
            <button type="button" className="btn btn-primary">Download</button>
        </div>;
    }

    render() {
        return <div>
            <ul className="nav nav-tabs" ref="tabs">
                <li role="presentation">
                    <a href="#fcdm_features"
                       onClick={this.onTabClick}>Features</a></li>
                <li role="presentation">
                    <a href="#fcdm_genes"
                       onClick={this.onTabClick}>Genes</a></li>
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
