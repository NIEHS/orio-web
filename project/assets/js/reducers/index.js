import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import config from './config';
import feature_list from './FeatureList';
import user_dataset from './UserDataset';
import sort_vector from './SortVector';
import analysis from './Analysis';


const reducer = combineReducers({
    router: routerStateReducer,
    config,
    feature_list,
    user_dataset,
    sort_vector,
    analysis,
});

export default reducer;
