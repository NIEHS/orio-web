import $ from 'jquery';

class Loader {
    constructor ($parent){
        this.render($parent);
    }

    render($parent){
        $('<div class="text-center loadingSpinner" >')
            .append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>')
            .append('<p class="lead">Loading...</p>')
            .appendTo($parent);
    }
}

export default Loader;

