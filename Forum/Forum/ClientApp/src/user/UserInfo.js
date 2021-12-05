import React, { Component } from 'react';
import { Util } from '../util/Util';

export class UserInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: null
        };
    }

    componentDidMount = async () => {
        try {
            const currentUser = await Util.getCurrentUser();

            this.setState({ currentUser: currentUser });
        } catch (e) {
            Util.showError(e);
        }
    }

    getHeading = () => {
        if (!this.state.currentUser || !this.state.currentUser.userName) {
            return 'Loading...';
        }

        return (<h1 className="jumbotron-heading">Hello, {this.state.currentUser.userName}</h1>);
    }

    render = () => {
        const heading = this.getHeading();

        return (<div>
            <section className="jumbotron text-center">
                <div className="container">
                    {heading}
                    <p className="lead text-muted">baligo!</p>
                </div>
            </section>
        </div>);
    }
}