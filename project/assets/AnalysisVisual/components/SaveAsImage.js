import $ from 'jquery';
import React from 'react';


class SaveAsImage extends React.Component {

    constructor(){
        super();
        this.handlePngSubmit = this.handlePngSubmit.bind(this);
        this.handlePdfSubmit = this.handlePdfSubmit.bind(this);
    }

    getJqueryElement(){
        return (this.props.content)?
            $(this.props.content):
            $(this.props.selector);
    }

    handlePngSubmit(e){
        e.preventDefault();
        let $el = this.getJqueryElement();
        this.refs.content.value = $el.html();
        this.refs.width.value = parseInt($el.width() * 1.05);
        this.refs.height.value = parseInt($el.height() * 1.05);
        this.refs.format.value = 'png';
        this.refs.form.submit();
        return false;
    }

    handlePdfSubmit(e){
        e.preventDefault();
        let $el = this.getJqueryElement();
        this.refs.content.value = $el.html();
        this.refs.width.value = parseInt($el.width() * 1.05);
        this.refs.height.value = parseInt($el.height() * 1.05);
        this.refs.format.value = 'pdf';
        this.refs.form.submit();
        return false;
    }

    render(){
        let classType = (this.props.dropup)? 'btn-group dropup': 'btn-group';
        return <div>
            <form className='hidden' ref='form' action="/phantom/rasterize/" method="post">
                <select ref='format' name='format'>
                    <option value='png'>png</option>
                    <option value='pdf'>pdf</option>
                </select>
                <input ref='content' name='content'></input>
                <input type="number" ref='width' name='width'></input>
                <input type="number" ref='height' name='height'></input>
            </form>
            <div className={classType}>
                <button type="button" className="btn btn-sm btn-default dropdown-toggle"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                    title="Download image of visualization">
                <i className='fa fa-download'></i>
                </button>
                <ul className="dropdown-menu" style={{minWidth: 0}}>
                    <li><a href='#' onClick={this.handlePngSubmit}>
                        <i className='fa fa-fixed fa-file-image-o'></i> PNG</a></li>
                    <li><a href='#' onClick={this.handlePdfSubmit}>
                        <i className='fa fa-fixed fa-file-pdf-o'></i> PDF</a></li>
                </ul>
            </div>
        </div>;
    }
}

SaveAsImage.propTypes = {
    content: React.PropTypes.instanceOf(window.HTMLElement),
    selector: React.PropTypes.string,
    dropup: React.PropTypes.bool,
};

export default SaveAsImage;
