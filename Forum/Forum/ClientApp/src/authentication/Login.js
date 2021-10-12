import React, { Component } from 'react';
import { Util } from '../util/Util';

export class Login extends Component {
    constructor(props) {
        super(props);

        this.onLogin = this.onLogin.bind(this);
    }

    onLogin = async (event) => {
        event.preventDefault();

        const emailControl = document.getElementById('emailControl');
        const passwordControl = document.getElementById('passwordControl');
        const loginData = {
            email: emailControl.value,
            password: passwordControl.value
        };

        try {
            const response = await fetch('User/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (data.success) {
                Util.toggleButtonsForLoggedUser();

                this.props.history.push({
                    pathname: '/'
                });
            } else {
                Util.showError('Ooops... Your login failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    }

    render = () => {
        return (<div className="container">
            <h1>Login</h1>
            <form>
                <div className="text-danger"></div>
                <div className="form-group">
                    <label>Email:</label>
                    <input className="form-control" id="emailControl" type="email" onChange={this.onChange} />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input className="form-control" id="passwordControl" type="password" onChange={this.onChange} />
                </div>
                <button className="btn btn-primary" onClick={this.onLogin}>Login</button>
            </form>
        </div>);
    }
}