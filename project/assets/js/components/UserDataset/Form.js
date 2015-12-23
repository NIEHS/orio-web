import React from 'react';

import BreadcrumbBar from '../BreadcrumbBar';
import FormFieldError from '../FormFieldError';
import urls from '../../constants/urls';
import h from '../../utils/helpers';


class Form extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.object;
    }

    handleChange(e){
        let obj = {};
        obj[e.target.name] = h.getValue(e.target);
        this.setState(obj);
    }

    handleSubmit(e){
        e.preventDefault();
        this.props.handleSubmit(this.state);
    }

    getBreadcrumbs() {
        let current = (this.state.id) ? 'Update' : 'Create';
        let paths = [
            urls.dashboard,
            urls.user_dataset,
        ];
        if (this.state.id){
            paths.push({
                name: this.state.name,
                url: h.getObjectURL(urls.user_dataset.url, this.state.id),
            });
        }
        return <BreadcrumbBar paths={paths} current={current} />;
    }

    getTitle(){
        return (this.state.id) ?
            `Update ${this.state.name}` :
            'Create user dataset';
    }

    renderNonFieldErrors(errs){
        if (!errs.non_field_errors) return null;
        return (
            <div className='form-group'>
                <div className='col-sm-12 alert alert-danger has-error'>
                    <FormFieldError errors={errs.non_field_errors} />
                </div>
            </div>
        );
    }

    render() {
        let errs = this.props.errors || {};
        return (
            <div>
                {this.getBreadcrumbs()}
                <h2>{this.getTitle()}</h2>

                <form className='form-horizontal' onSubmit={this.handleSubmit.bind(this)}>

                    {this.renderNonFieldErrors(errs)}

                    <div className={h.getInputDivClass('name', errs)}>
                        <label className='col-sm-2 control-label'>Name</label>
                        <div className='col-sm-10'>
                            <input name='name' className='form-control' type='text'
                                   value={this.state.name}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.name} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('description', errs)}>
                        <label className='col-sm-2 control-label'>Description</label>
                        <div className='col-sm-10'>
                            <textarea name='description' className='form-control'
                                   value={this.state.description}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.description} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('public', errs)}>
                        <label className='col-sm-2 control-label'>Public</label>
                        <div className='col-sm-10'>
                            <input type='checkbox' name='public'
                                   checked={this.state.public}
                                   onChange={this.handleChange.bind(this)} />
                            <FormFieldError errors={errs.public} />
                        </div>
                    </div>

                    <div className={h.getInputDivClass('genome_assembly', errs)}>
                        <label className='col-sm-2 control-label'>Genomic assembly</label>
                        <div className='col-sm-10'>
                            <select type='checkbox' name='genome_assembly'
                                   value={this.state.genome_assembly}
                                   onChange={this.handleChange.bind(this)} >
                                <option value='1'>hg19</option>
                                <option value='2'>mm9</option>
                            </select>
                            <FormFieldError errors={errs.genome_assembly} />
                        </div>
                    </div>

                    <div className='form-actions'>
                        <div className='pull-right'>
                            <button className='btn btn-default' type='button' onClick={h.goBack}>Cancel</button>
                            <span>&nbsp;</span>
                            <button className='btn btn-primary'>Save</button>
                        </div>
                    </div>

                </form>

            </div>
        );
    }
}

export default Form;
