import $ from 'jquery';
import d3 from 'd3';
import _ from 'underscore';
import React from 'react';
import ReactDOM from 'react-dom';
import {saveAs} from 'filesaver.js';

import Loader from './Loader';

var Axis = React.createClass({
    propTypes: {
        h: React.PropTypes.number,
        margins: React.PropTypes.object,
        axis: React.PropTypes.func,
        axisType: React.PropTypes.oneOf(['x','y'])

    },

    componentDidUpdate: function () { this.renderAxis(); },
    componentDidMount: function () { this.renderAxis(); },
    renderAxis: function () {
        var node = ReactDOM.findDOMNode(this);
        d3.select(node).call(this.props.axis);
    },

    render: function () {

        var translate = (this.props.axisType == 'x') ?
            "translate(0,"+(this.props.h)+")" :
            "translate("+this.props.margins.left+",0)";

        return (
            <g className="axis" transform={translate}>
            </g>
        );
    }
})

var Outliers = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        x: React.PropTypes.func,
        y: React.PropTypes.func,
    },

    render: function() {
        var self = this;

        var data = this.props.data,
            h = this.props.height,
            w = this.props.width,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var outliers = [];
        data_array.map(function(d,i) {
            for (let index in d.outliers) {
                outliers.push(
                    <circle
                        key={i + "-" + index}
                        cx={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        cy={self.props.y(d.outliers[index])}
                        r={0.05*cell_width}
                        fill="none"
                        stroke="black"
                    />
                );
            }
        });

        return (<g>{outliers}</g>);
    },
})

var Whiskers = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        x: React.PropTypes.func,
        y: React.PropTypes.func,
    },

    render: function() {
        var self = this;

        var data = this.props.data,
            h = this.props.height,
            w = this.props.width,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var whiskers = data_array.map(function(d,i) {
            return (
                <g key={i}>
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i])+cell_width}
                        y1={self.props.y(d.min)}
                        y2={self.props.y(d.min)}
                        stroke="black"
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        x2={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        y1={self.props.y(d.max)}
                        y2={self.props.y(d.q3)}
                        stroke="black"
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        x2={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        y1={self.props.y(d.min)}
                        y2={self.props.y(d.q1)}
                        stroke="black"
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i])+cell_width}
                        y1={self.props.y(d.max)}
                        y2={self.props.y(d.max)}
                        stroke="black"
                    />
                </g>
            );
        });

        return (<g>{whiskers}</g>);
    },
})


var Boxes = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        x: React.PropTypes.func,
        y: React.PropTypes.func,
    },

    render: function() {
        var self = this;

        var data = this.props.data,
            h = this.props.height,
            w = this.props.width,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        // var boxes = <svg><rect x="10" y="10" height="100" width="100"/></svg>;
        var keys = ["lower", "upper"];

        var boxes = data_array.map(function(d,i) {
            return (
                <g key={i}>
                    <rect
                        x={self.props.x(Object.keys(self.props.data)[i])}
                        y={self.props.y(d.q3)}
                        height={self.props.y(d.q1) - self.props.y(d.q3)}
                        width={cell_width}
                        fill="none"
                        stroke="black"
                        style={{}}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i]) + cell_width}
                        y1={self.props.y(d.q2)}
                        y2={self.props.y(d.q2)}
                        stroke="black"
                    />
                </g>
            );
        });

        return (<g>{boxes}</g>);
    },
})

var BoxPlot = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        index: React.PropTypes.number,
    },

    render: function() {

        var max_value = 0,
            data = this.props.data,
            margins = {
                left: 100,
                bottom: 50,
            },
            h = this.props.height - margins.bottom,
            w = this.props.width - margins.left;

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key]["max"] > max_value) {
                    max_value = data[key]["max"];
                }
                for (let val of data[key]["outliers"].values()) {
                    if (val > max_value) {
                        max_value = val;
                    }
                }
            }
        }

        var x = d3.scale.ordinal()
            .domain(Object.keys(this.props.data))
            .rangeBands([margins.left, w + margins.left],0.2,0.2);

        var y = d3.scale.linear()
            .domain([-0.2*max_value, 1.2*max_value])
            .range([h, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);

        return (
            <div className="BoxPlot" style={{height: this.props.height, width: this.props.width}}>
                <svg height={this.props.height} width={this.props.width}>
                    <Boxes
                        data={this.props.data}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    <Whiskers
                        data={this.props.data}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    <Outliers
                        data={this.props.data}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    <Axis
                        h={h}
                        margins={margins}
                        axis={xAxis}
                        axisType="x"
                        />
                    <Axis
                        h={h}
                        margins={margins}
                        axis={yAxis}
                        axisType="y"
                        />
                </svg>
            </div>
        );
    },
})

var ClusterQuant = React.createClass({
    propTypes: {
        analysis_id: React.PropTypes.number.isRequired,
        k: React.PropTypes.number.isRequired,
    },

    getInitialState: function() {
        return {
            col_names: null,
            selected_col: null,
            box_plot_data: null,
            mw_values: null,
        };
    },

    componentWillMount: function() {
        $.get(`/dashboard/api/analysis/${this.props.analysis_id}/fc_vector_col_names`, (d)=>{
            this.setState({
                col_names: d,
            });
        });
    },

    renderSelectList() {
        var makeOption = function(x, i) {
            return <option key={i} value={i}>{x}</option>;
        };

        if (this.state.col_names == null) {
            return false;
        };

        return (
            <div>
                <select id="col_select">{this.state.col_names.map(makeOption)}</select>
            </div>
        );
    },

    renderSelectButton() {
        return(
            <div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleSelectClick}>Display box plot</button>
            </div>
        );
    },

    handleSelectClick() {
        var index = $( "#col_select option:selected" ).val();

        $.get(`/dashboard/api/analysis/${this.props.analysis_id}/clust_boxplot/?k=${this.props.k}&index=${index}`, (d)=>{
            this.setState({
                selected_col: parseInt(index),
                box_plot_data: d[0],
                mw_values: d[1],
            });
        });
    },

    renderCharts(height, width) {
        if (this.state.selected_col == null) {
            return false;
        };

        var box_height = 200;

        return (
            <div className="ClustCharts" style={{height: height, width: width}}>
                <BoxPlot
                    data={this.state.box_plot_data}
                    height={box_height}
                    width={width}
                    index={this.state.selected_col}/>
            </div>
        );
    },

    render: function() {
        return (
            <div className="ClustQuant">
                {this.renderSelectList()}
                {this.renderSelectButton()}
                {this.renderCharts(400,300)}
            </div>
        );
    },
})

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
                        .compact() // Remove falsy
                        .uniq()
                        .sort()
                        .value();
                genes = _.without(genes, 'None'); // Python 'None' persist?

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
                <li role="presentation">
                    <a href="#fcdm_coverage"
                       onClick={this.handleTabClick}>Coverage values</a></li>
            </ul>
            <div className="tab-content">
                <div role="tabpanel" className="tab-pane" id='fcdm_features'>
                    {this.renderFeatures()}
                </div>
                <div role="tabpanel" className="tab-pane" id='fcdm_genes'>
                    {this.renderGenes()}
                </div>
                <div role="tabpanel" className="tab-pane" id='fcdm_coverage'>
                    <ClusterQuant
                        analysis_id={this.props.analysis_id}
                        k={this.props.k}/>
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
