import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'underscore';

import Root from './containers/Root';


let wrapAdditionalSettings = function($el){
    /*
        with DOM content already rendered using django template, add a wrap
        to show/hide additional configuration settings
    */

    let extra = $('<div>').attr('class', 'hidden');
    $el.find('#div_id_anchor').closest('.form-group').appendTo(extra);
    $el.find('#div_id_bin_start').appendTo(extra);
    $el.find('#div_id_bin_size').appendTo(extra);
    $el.find('#div_id_bin_number').appendTo(extra);

    let btn = $('<button type="button" class="btn btn-default pull-right" title="Show/hide additional options">'),
        icon = $('<i class="fa fa-plus-square-o"></i>').appendTo(btn);

    btn.click(function(e){
        e.preventDefault();
        if (extra.hasClass('hidden')){
            extra.removeClass('hidden');
            icon.addClass('fa-minus-square-o')
                .removeClass('fa-plus-square-o');
        } else {
            extra.addClass('hidden');
            icon.addClass('fa-plus-square-o')
                .removeClass('fa-minus-square-o');
        }

    });

    let header = $('<h3>')
        .text('Additional settings')
        .append(btn);

    $el.find('#div_id_sort_vector')
        .after(extra)
        .after(header)
        .after('<hr>');

    $el.find('.form-actions').before('<hr>');

    let config = JSON.parse(document.getElementById('config').textContent),
        fls = _.groupBy(config.feature_lists, 'genome_assembly'),
        svs = _.groupBy(config.sort_vectors, 'feature_list_id'),
        create_option = function(el){
            return `<option value="${el.id}">${el.name}</option>`;
        },
        create_null = function(){
            return create_option({id: '', name: '---------'});
        },
        $fl = $('#id_feature_list'),
        $sv = $('#id_sort_vector');

    // change feature-list based on genome
    $('#id_genome_assembly')
        .change(function(e){
            let genome = parseInt(e.target.value),
                existing = parseInt($fl.val()),
                choices = fls[genome] || [],
                opts = choices.map(create_option);

            opts.unshift(create_null());

            $fl.empty()
               .html(opts);

            if (_.contains(_.pluck(choices, 'id'), existing)){
                $fl.val(existing);
            }

        })
        .trigger('change');

    // change sort-vector based on feature-list
    $fl
        .change(function(e){
            let fl = parseInt($fl.val()),
                existing = parseInt($sv.val()),
                choices = svs[fl] || [],
                opts = choices.map(create_option);

            opts.unshift(create_null());

            $sv.empty()
               .html(opts);

            if (_.contains(_.pluck(choices, 'id'), existing)){
                $sv.val(existing);
            }
        })
        .trigger('change');
};

let renderEncodePicker = function($el){
    let reactEntry = $('<div>');
    $el.find('.form-actions').before(reactEntry);
    let config = JSON.parse(document.getElementById('config').textContent);
    ReactDOM.render(<Root config={config}/>, reactEntry.get(0));
};

const startup = function(){
    $(document).ready(function(){
        let $el = $('#analysis_form');
        wrapAdditionalSettings($el);
        renderEncodePicker($el);
        $el.fadeIn();
    });
};

export default startup;
