import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Util } from '../util/Util';

const Register = () => {
    const history = useHistory();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const onRegister = async event => {
        event.preventDefault();

        const registrationData = {
            email: email,
            password: password,
            confirmPassword: confirmPassword
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
                Util.showSuccess('Successfully registered!');

                history.push('/');
                return;
            } else {
                Util.showError('Ooops... Your registration failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    }

    return (<div className="row">
        <div className="col-md-12">
            <form>
                <div className="text-danger"></div>
                <div className="form-group">
                    <label>Email:</label>
                    <input className="form-control" name="email" type="email" onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input className="form-control" name="password" type="password" onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Confirm password:</label>
                    <input className="form-control" name="confirmPassword" type="password" onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={onRegister}>Register</button>
            </form>
        </div>
    </div>);
}

export default Register;