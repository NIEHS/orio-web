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

    handleSubmit(e, type) {
        e.preventDefault();
        let $el = this.getJqueryElement();
        var $clone = $el.clone();
        $clone.css('visibility', 'hidden');
        $clone.insertAfter($el);
            $clone.find('select').each(function() {
                this.remove();
            });
            $clone.find('input').each(function() {
                this.remove();
            });
            $clone.find('button').each(function() {
                this.remove();
            });
            $clone.find('.png-remove').each(function() {
                this.remove();
            });
            var $target = $clone;
        this.refs.content.value = $($target).html();
        this.refs.width.value = parseInt($target.width() * 1.08);
        this.refs.height.value = parseInt($target.height() * 1.08);
        this.refs.format.value = type;
        this.refs.form.submit();
        $clone.remove();
        return false;
    }

    handlePngSubmit(e){
        this.handleSubmit(e, 'png');
    }

    handlePdfSubmit(e){
        this.handleSubmit(e, 'pdf');
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
    content: React.PropTypes.object,
    selector: React.PropTypes.string,
    dropup: React.PropTypes.bool,
};

export default SaveAsImage;
