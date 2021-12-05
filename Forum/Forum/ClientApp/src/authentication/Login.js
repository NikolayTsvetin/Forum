import React from 'react';
import { useHistory } from 'react-router-dom';
import { Util } from '../util/Util';

const Login = () => {
    const history = useHistory();

    const onLogin = async (event) => {
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
                Util.showSuccess('Welcome! Successfully logged in!');

                history.push('/');
                return;
            } else {
                Util.showError('Ooops... Your login failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    }

    return (<div className="container">
        <h1>Login</h1>
        <form>
            <div className="text-danger"></div>
            <div className="form-group">
                <label>Email:</label>
                <input className="form-control" id="emailControl" type="email" />
            </div>
            <div className="form-group">
                <label>Password:</label>
                <input className="form-control" id="passwordControl" type="password" />
            </div>
            <button className="btn btn-primary" onClick={onLogin}>Login</button>
        </form>
    </div>);
}

export default Login;