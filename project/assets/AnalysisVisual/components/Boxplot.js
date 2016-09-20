import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';


var PValueTable = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
    },

    render: function () {
        var makeHeader = function(x, i) {
            return <th className="pTh" key={i}>{x}</th>;
        };
        var makeRow = function(x, i) {
            return <td className="pTd" key={i}>{parseFloat(x).toPrecision(2)}</td>;
        };

        var rows = [],
            clusters = this.props.data['clusters'],
            p_values = this.props.data['p_values'];

        var header = (<tr><th className="pTh"></th>{clusters.map(makeHeader)}</tr>);

        for (let index in p_values) {
            rows.push(
                <tr className="pTr" key={index}>
                    <th className="pTh">{clusters[index]}</th>
                    {p_values[index].map(makeRow)}
                </tr>
            );
        }

        return (
            <div>
                <p>Pairwise p-values from Mann-Whitney test:</p>
                <table className="pTable">
                    <tbody>{header}{rows}</tbody>
                </table>
            </div>
        );
    },
});


var Axis = React.createClass({
    propTypes: {
        h: React.PropTypes.number,
        margins: React.PropTypes.object,
        axis: React.PropTypes.func,
        axisType: React.PropTypes.oneOf(['x','y']),
    },

    componentDidUpdate: function () { this.renderAxis(); },
    componentDidMount: function () { this.renderAxis(); },
    renderAxis: function () {
        var node = ReactDOM.findDOMNode(this);
        d3.select(node).call(this.props.axis);
    },

    render: function () {
        var translate = (this.props.axisType == 'x') ?
            `translate(0,${this.props.h})` :
            `translate(${this.props.margins.left},0)`;
        return <g className="axis" transform={translate}></g>;
    },
});


var Outliers = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        cluster_id: React.PropTypes.number,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        x: React.PropTypes.func,
        y: React.PropTypes.func,
    },

    render: function() {
        var self = this;

        var data = this.props.data,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var outliers = [];
        data_array.map(function(d,i) {

            var cluster = Object.keys(self.props.data)[i],
                color = (cluster == self.props.cluster_id) ? 'red' : 'black';

            for (let index in d.outliers) {
                outliers.push(
                    <circle
                        key={i + '-' + index}
                        cx={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        cy={self.props.y(d.outliers[index])}
                        r={0.05*cell_width}
                        fill="none"
                        stroke={color}
                    />
                );
            }
        });

        return <g>{outliers}</g>;
    },
});


var Whiskers = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        cluster_id: React.PropTypes.number,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        x: React.PropTypes.func,
        y: React.PropTypes.func,
    },

    render: function() {
        var self = this;

        var data = this.props.data,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var whiskers = data_array.map(function(d,i) {

            var cluster = Object.keys(self.props.data)[i],
                color = (cluster == self.props.cluster_id) ? 'red': 'black';

            return (
                <g key={i}>
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i])+cell_width}
                        y1={self.props.y(d.min)}
                        y2={self.props.y(d.min)}
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        x2={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        y1={self.props.y(d.max)}
                        y2={self.props.y(d.q3)}
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        x2={self.props.x(Object.keys(self.props.data)[i])+0.5*cell_width}
                        y1={self.props.y(d.min)}
                        y2={self.props.y(d.q1)}
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i])+cell_width}
                        y1={self.props.y(d.max)}
                        y2={self.props.y(d.max)}
                        stroke={color}
                    />
                </g>
            );
        });

        return (<g>{whiskers}</g>);
    },
});


var Boxes = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        cluster_id: React.PropTypes.number,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        x: React.PropTypes.func,
        y: React.PropTypes.func,
    },

    render: function() {
        var self = this;

        var data = this.props.data,
            cell_width = this.props.x.rangeBand();

        var data_array = [];
        for (var key in data) {
            data_array.push(data[key]);
        }

        var boxes = data_array.map(function(d,i) {

            var cluster = Object.keys(self.props.data)[i],
                color = (cluster == self.props.cluster_id) ? 'red' : 'black';

            return (
                <g key={i}>
                    <rect
                        x={self.props.x(Object.keys(self.props.data)[i])}
                        y={self.props.y(d.q3)}
                        height={self.props.y(d.q1) - self.props.y(d.q3)}
                        width={cell_width}
                        fill="none"
                        stroke={color}
                    />
                    <line
                        x1={self.props.x(Object.keys(self.props.data)[i])}
                        x2={self.props.x(Object.keys(self.props.data)[i]) + cell_width}
                        y1={self.props.y(d.q2)}
                        y2={self.props.y(d.q2)}
                        stroke={color}
                    />
                </g>
            );
        });

        return <g>{boxes}</g>;
    },
});


var BoxPlot = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        index: React.PropTypes.number,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        cluster_id: React.PropTypes.number,
    },

    render: function() {

        var max_value = 0,
            data = this.props.data,
            margins = {
                left: 100,
                bottom: 60,
            },
            h = this.props.height - margins.bottom,
            w = this.props.width - margins.left;

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key]['max'] > max_value) {
                    max_value = data[key]['max'];
                }
                for (let val of data[key]['outliers'].values()) {
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
                <p>Read coverage values at clusters:</p>
                <svg height={this.props.height} width={this.props.width}>
                    <Boxes
                        data={this.props.data}
                        cluster_id={this.props.cluster_id}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    <Whiskers
                        data={this.props.data}
                        cluster_id={this.props.cluster_id}
                        height = {h}
                        width = {w}
                        x = {x}
                        y = {y}
                        />
                    <Outliers
                        data={this.props.data}
                        cluster_id={this.props.cluster_id}
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
});


var ClusterQuant = React.createClass({
    propTypes: {
        analysis_id: React.PropTypes.number.isRequired,
        k: React.PropTypes.number.isRequired,
        cluster_id: React.PropTypes.number,
    },

    getInitialState: function() {
        return {
            col_names: null,
            selected_col: null,
            box_plot_data: null,
            mw_values: null,
        };
    },

    componentDidMount: function() {
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
        }

        return (
            <div>
                <select id="col_select" className="clustQuantSelect">{this.state.col_names.map(makeOption)}</select>
            </div>
        );
    },

    renderSelectButton() {
        return(
            <div>
                <button
                    type="button"
                    className="btn btn-primary clustQuantButton"
                    onClick={this.handleSelectClick}>Display box plot</button>
            </div>
        );
    },

    handleSelectClick() {
        var index = $('#col_select option:selected').val();

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
        }

        var box_height = 200;
        var pval_height = 200;

        return (
            <div className="ClustCharts" style={{height: box_height, width: width}}>
                <BoxPlot
                    data={this.state.box_plot_data}
                    height={box_height}
                    width={width}
                    cluster_id={this.props.cluster_id}/>
                <PValueTable
                    data={this.state.mw_values}
                    height={pval_height}
                    width={width}/>
            </div>
        );
    },

    render: function() {

        var width = $('#ind_heatmap_modal_body').width();

        return (
            <div className="ClustQuant">
                {this.renderSelectList()}
                {this.renderSelectButton()}
                {this.renderCharts(400,width)}
            </div>
        );
    },
});

export default ClusterQuant;
