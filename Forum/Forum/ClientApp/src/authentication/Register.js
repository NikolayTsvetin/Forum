import React, { Component } from 'react';
import { Util } from '../util/Util';

export class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            confirmPassword: ''
        };

        this.onRegister = this.onRegister.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onRegister = async (event) => {
        event.preventDefault();

        const registrationData = {
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword
        };

        if (registrationData.password !== registrationData.confirmPassword) {
            Util.showError('Confirmed password was different from the chosen one.');

            return;
        } else if (registrationData.password.length < 8) {
            Util.showError('Please, enter password equal to or longer than 8 symbols.');

            return;
        }

        try {
            const response = await fetch('User/RegisterUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            if (data.success) {
                Util.toggleButtonsForLoggedUser();

                this.props.history.push({
                    pathname: '/'
                });
            } else {
                Util.showError('Ooops... Your registration failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    }

    onChange = (event) => {
        const target = event.target.name;
        const value = event.target.value;

        if (target === 'email') {
            this.setState({ email: value });
        } else if (target === 'password') {
            this.setState({ password: value });
        } else if (target === 'confirmPassword') {
            this.setState({ confirmPassword: value });
        } else {
            Util.showError(`There is no info in state for ${target}`);
        }
    }

    getRegistrationForm = () => {
        return (
            <form>
                <div className="text-danger"></div>
                <div className="form-group">
                    <label>Email:</label>
                    <input className="form-control" name="email" type="email" onChange={this.onChange} />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input className="form-control" name="password" type="password" onChange={this.onChange} />
                </div>
                <div className="form-group">
                    <label>Confirm password:</label>
                    <input className="form-control" name="confirmPassword" type="password" onChange={this.onChange} />
                </div>
                <button className="btn btn-primary" onClick={this.onRegister}>Register</button>
            </form>
        );
    }

    render = () => {
        const registrationForm = this.getRegistrationForm();

        return (<div className="row">
            <div className="col-md-12">
                {registrationForm}
            </div>
        </div>);
    }
}