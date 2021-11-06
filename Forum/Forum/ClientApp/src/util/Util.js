import React, { Component } from 'react';
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

export class Util extends Component {
    static toggleAuthenticationButtons = async () => {
        debugger;
        const isUserLoggedIn = await Util.isUserLoggedIn();

        if (isUserLoggedIn) {
            Util.toggleButtonsForLoggedUser();
        } else {
            Util.toggleButtonsForNotLoggedUser();
        }
    }

    static toggleButtonsForLoggedUser = () => {
        const logoutButton = document.getElementById('logoutButton');
        const loginButton = document.getElementById('loginButton');
        const registerButton = document.getElementById('registerButton');
        const userInfoButton = document.getElementById('userInfoButton');

        if (logoutButton) {
            logoutButton.style.display = 'inline';
            userInfoButton.style.display = 'inline';
        }

        if (loginButton && registerButton) {
            loginButton.style.display = 'none';
            registerButton.style.display = 'none';
        }
    }

    static toggleButtonsForNotLoggedUser = () => {
        const logoutButton = document.getElementById('logoutButton');
        const loginButton = document.getElementById('loginButton');
        const registerButton = document.getElementById('registerButton');
        const userInfoButton = document.getElementById('userInfoButton');

        if (logoutButton) {
            logoutButton.style.display = 'none';
            userInfoButton.style.display = 'none';
        }

        if (loginButton && registerButton) {
            loginButton.style.display = 'inline';
            registerButton.style.display = 'inline';
        }
    }

    static isUserLoggedIn = async () => {
        try {
            const response = await fetch('User/IsUserLoggedIn');
            const isUserLoggedIn = await response.json();

            return isUserLoggedIn;
        } catch (e) {
            throw e;
        }
    }

    static getCurrentUser = async () => {
        try {
            const request = await fetch('User/GetCurrentUser');
            const currentUser = await request.json();

            return currentUser;
        } catch (e) {
            return null;
        }
    }

    static showError = (err) => {
        alertify.error(err);
    }

    static showSuccess = (message) => {
        alertify.success(message);
    }

    static showMessage = (message) => {
        alertify.warning(message);
    }

    static trimContent = (content) => {
        const maximumVisibleLength = 20;

        if (content.length > maximumVisibleLength) {
            return `${content.slice(0, 17)}...`;
        }

        return content;
    }
}