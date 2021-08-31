import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class Posts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            posts: null
        }
    }

    componentDidMount() {
        this.getAllPosts();
    }

    async getAllPosts() {
        try {
            const response = await fetch('Posts/GetPosts');
            const data = await response.json();

            this.setState({ loaded: true, posts: data });
        } catch (e) {
            throw e;
        }
    }

    showPosts = (posts) => {
        if (!posts || posts.length === 0) {
            return '';
        }

        const elements = posts.map(x => {
            return (<div className="col-md-4" key={x.id}>
                <div className="card mb-4 box-shadow">
                    <h4>{x.title}</h4>
                </div>
                <div className="card-body">
                    <p className="card-text">{x.content}</p>
                    <p>Posted on: {new Date(x.dateCreated).toLocaleString()}</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-sm btn-outline-secondary">View</button>
                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                </div>
            </div>);
        });

        return elements;
    }

    render() {
        const content = this.state.loaded ? this.showPosts(this.state.posts) : 'Retrieving all posts...';

        return (<div>
            <section className="jumbotron text-center">
                <div className="container">
                    <h1 className="jumbotron-heading">All posts</h1>
                    <p className="lead text-muted">Below you can see all available posts. Check if something is interesting for you, or post your own topic!</p>
                    <p><Link className="btn btn-primary my-2" to="/create-post">Create post</Link></p>
                </div>
            </section>
            <div className="album py-5 bg-light">
                <div className="container">
                    <div className="row">
                        {content}
                    </div>
                </div>
            </div>
        </div>);
    }
}