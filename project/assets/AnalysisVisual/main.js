import _ from 'underscore';
import $ from 'jquery';

import React from 'react';
import ReactDOM from 'react-dom';

import VisualTabs from './components/VisualTabs';


let startup = function(){
    $(document).ready(function(){

        // set configuration variables to window
        let config = JSON.parse(document.getElementById('config').textContent);
        _.each(config, (v, k) => window[k] = v);

        ReactDOM.render(
            <VisualTabs />,
            document.getElementById('visual_container')
        );

    });
};

export default startup;
