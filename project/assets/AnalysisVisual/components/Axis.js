import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';


class Axis extends React.Component {

    componentDidUpdate(){
        this.renderAxis();
    }

    componentDidMount(){
        this.renderAxis();
    }

    renderAxis(){
        var node = ReactDOM.findDOMNode(this);
        d3.select(node).call(this.props.axis);
    }

    render(){
        var translate = (this.props.axisType == 'x') ?
            `translate(0,${this.props.h+this.props.margins.top})` :
            `translate(${this.props.margins.left},${this.props.margins.top})`;
        return <g className="axis" transform={translate}></g>;
    }
}

Axis.propTypes = {
    h: React.PropTypes.number,
    margins: React.PropTypes.object,
    axis: React.PropTypes.func,
    axisType: React.PropTypes.oneOf(['x','y']),
};

export default Axis;
