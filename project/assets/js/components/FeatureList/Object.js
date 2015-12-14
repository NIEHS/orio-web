import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import urls from '../../constants/urls';

import h from '../../utils/helpers';


class FeatureListObject extends React.Component {

    renderDeleteConfirmation() {
        if (!this.props.isDelete) return null;
        return (
            <div className='alert' style={{'border': '2px solid #c9302c', 'backgroundColor': '#efefef'}}>
                <form method="post" onSubmit={this.props.handleDeleteForm}>
                    <p>Are you sure you want to delete?</p>
                    <button className='btn btn-danger' type="submit">Confirm delete</button>
                </form>
            </div>
        );
    }

    renderDetailRow(header, content){
        return <tr><th>{header}</th><td>{content}</td></tr>;
    }

    render() {
        let object = this.props.object;
        return (
            <div>
                <BreadcrumbBar
                    paths={[urls.dashboard, urls.feature_list]}
                    current={object.name} />

                <h2>{object.name}</h2>

                <table className='table table-condensed'>
                    <col style={{width: '15%'}} />
                    <col style={{width: '85%'}} />
                    <tbody>
                        {this.renderDetailRow('Description', object.description)}
                        {this.renderDetailRow('Public', h.booleanCheckbox(object.public))}
                        {this.renderDetailRow('Validated', h.booleanCheckbox(object.validated))}
                        {this.renderDetailRow('Stranded', h.booleanCheckbox(object.stranded))}
                        {this.renderDetailRow('Date created', h.datetimeFormat(object.created))}
                        {this.renderDetailRow('Date updated', h.datetimeFormat(object.last_updated))}
                    </tbody>
                </table>

                {this.renderDeleteConfirmation()}

                <h3>Content</h3>
                <pre style={{'maxHeight': '300px'}} >
                    {object.text}
                </pre>
            </div>
        );
    }
}








export default FeatureListObject;
