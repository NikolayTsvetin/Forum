import React, { Component } from 'react';

export class Posts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            posts: null
        }
    }

    async componentDidMount() {
        debugger;
        await this.getAllPosts();
    }

    async getAllPosts() {
        debugger;
        const response = await fetch('Posts/GetPosts');
        const data = await response.json();
        debugger;
    }

    render() {
        return <h1>zdr ot posts</h1>
    }
}