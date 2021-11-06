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

    render = () => {
        return (<h1>WIP</h1>);
    }
}