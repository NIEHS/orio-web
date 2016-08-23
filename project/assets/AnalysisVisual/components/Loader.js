import React from 'react';


class Loader extends React.Component {

    render(){
        return <div className="loadingSpinner">
            <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            <p className="lead">Loading...</p>
        </div>;
    }
}

export default Loader;

