import React, { Component } from 'react';

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

        if (logoutButton) {
            logoutButton.style.display = 'inline';
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

        if (logoutButton) {
            logoutButton.style.display = 'none';
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
}