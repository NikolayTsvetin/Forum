import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            isUserLoggedIn: false
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    componentDidMount = async () => {
        await this.isUserLoggedIn();
    }

    isUserLoggedIn = async () => {
        try {
            const response = await fetch('User/IsUserLoggedIn');
            const isUserLoggedIn = await response.json();

            this.setState({ isUserLoggedIn: isUserLoggedIn });
        } catch (e) {
            throw e;
        }
    }

    toggleAuthenticationButtons = () => {
        if (this.state.isUserLoggedIn) {
            const logoutButton = document.getElementById('logoutButton');

            if (logoutButton) {
                logoutButton.style.display = 'inline';
            }
        } else {
            const loginButton = document.getElementById('loginButton');
            const registerButton = document.getElementById('registerButton');

            if (loginButton && registerButton) {
                loginButton.style.display = 'inline';
                registerButton.style.display = 'inline'
            }
        }
    }

    onLogout = async (event) => {
        event.preventDefault();

        await fetch('User/Logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.toggleAuthenticationButtons();
    }

    render() {
        this.toggleAuthenticationButtons();

        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">Forum</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                            <ul className="navbar-nav flex-grow">
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/">Home</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/posts">Posts</NavLink>
                                </NavItem>
                                <NavItem style={{ display: 'none' }} id="logoutButton">
                                    <NavLink tag={Link} className="text-dark" to="#" onClick={this.onLogout}>Logout</NavLink>
                                </NavItem>
                                <NavItem style={{ display: 'none' }} id="loginButton">
                                    <NavLink tag={Link} className="text-dark" to="/login">Login</NavLink>
                                </NavItem>
                                <NavItem style={{ display: 'none' }} id="registerButton">
                                    <NavLink tag={Link} className="text-dark" to="/register">Register</NavLink>
                                </NavItem>
                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }
}
