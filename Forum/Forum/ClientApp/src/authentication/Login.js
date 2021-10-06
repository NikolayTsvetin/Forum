import React, { Component } from 'react';

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
                const logoutButton = document.getElementById('logoutButton');
                logoutButton.style.display = 'inline';

                const loginButton = document.getElementById('loginButton');
                const registerButton = document.getElementById('registerButton');

                loginButton.style.display = 'none';
                registerButton.style.display = 'none'

                this.props.history.push({
                    pathname: '/'
                });
            } else {
                throw 'Ooops... Your login failed. Please, try again.'
            }
        } catch (e) {
            throw e;
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