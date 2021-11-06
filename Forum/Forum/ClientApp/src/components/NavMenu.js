import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Util } from '../util/Util';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
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
        const isUserLoggedIn = await Util.isUserLoggedIn();

        this.setState({ isUserLoggedIn: isUserLoggedIn });
    }

    toggleAuthenticationButtons = () => {
        if (this.state.isUserLoggedIn) {
            Util.toggleButtonsForLoggedUser();
        } else {
            Util.toggleButtonsForNotLoggedUser();
        }
    }

    onLogout = async (event) => {
        event.preventDefault();

        confirmAlert({
            title: 'Confirm to logout',
            message: `Are you sure you want to logout?`,
            buttons: [{
                label: 'Yes',
                onClick: async () => {
                    await fetch('User/Logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    Util.showMessage('Sorry to see you go...');

                    this.toggleAuthenticationButtons();
                }
            }, {
                label: 'No',
                onClick: () => {
                    return;
                }
            }]
        });
    }

    render = () => {
        this.toggleAuthenticationButtons();

        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">Forum</NavbarBrand>
                        <NavItem style={{ display: 'none' }} id="userInfoButton">
                            <NavLink tag={Link} className="text-dark" to="/userInfo">User info</NavLink>
                        </NavItem>
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