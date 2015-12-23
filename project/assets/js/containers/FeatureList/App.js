import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import Loading from '../../components/Loading';

import { fetchObjectsIfNeeded } from '../../actions/FeatureList';


@connect((state) => (state))
class FeatureListApp extends React.Component {

    componentWillMount() {
        this.props.dispatch(fetchObjectsIfNeeded());
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}

export default FeatureListApp;