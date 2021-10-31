import React, { Component } from 'react';
import { Util } from '../util/Util';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);

        this.state = {
            currentUser: null,
            likedPosts: null,
            commentedPosts: null,
            loaded: null
        }
    }

    getHelloMessage = () => {
        const name = this.state.currentUser ? this.state.currentUser.userName.length > 0 ? this.state.currentUser.userName : 'guest' : 'guest';

        return (<h1 className="jumbotron-heading">Hello, {name}</h1>);
    }

    getTop3MostLikedPosts = async () => {
        try {
            const response = await fetch('Likes/GetTop3MostLikedPosts');
            const data = await response.json();

            this.setState({ loaded: true, likedPosts: data });
        } catch (e) {
            Util.showError(e);
        }
    }

    getTop3MostCommentedPosts = async () => {
        try {
            const response = await fetch('Likes/GetTop3MostCommentedPosts');
            const data = await response.json();

            this.setState({ loaded: true, commentedPosts: data });
        } catch (e) {
            Util.showError(e);
        }
    }

    mostLikedPosts = (posts) => {
        if (!posts || posts.length === 0) {
            return '';
        }

        const items = posts.data;

        const elements = items.map(x => {
            return (<div className="col-md-4 postHolder" key={x.post.id}>
                <div className="card mb-4 box-shadow">
                    <h4 className="text-center">{x.post.title}</h4>
                </div>
                <div className="card-body">
                    <p className="card-text text-center">{Util.trimContent(x.post.content)}</p>
                    <p className="text-center">Created by: <b>{x.author}</b>.</p>
                    <p className="text-center">Posted on: <b>{new Date(x.post.dateCreated).toLocaleString()}</b>. Likes: <b>{x.likesCount}</b></p>
                </div>
                <div className="btn-group buttonsHolder">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => this.viewPost(x.post.id)}>View</button>
                </div>
            </div>);
        });

        return elements;
    }

    mostCommentedPosts = (posts) => {
        if (!posts || posts.length === 0) {
            return '';
        }

        const items = posts.data;

        const elements = items.map(x => {
            return (<div className="col-md-4 postHolder" key={x.post.id}>
                <div className="card mb-4 box-shadow">
                    <h4 className="text-center">{x.post.title}</h4>
                </div>
                <div className="card-body">
                    <p className="card-text text-center">{Util.trimContent(x.post.content)}</p>
                    <p className="text-center">Created by: <b>{x.author}</b>.</p>
                    <p className="text-center">Posted on: <b>{new Date(x.post.dateCreated).toLocaleString()}</b>. Comments: <b>{x.post.comments.length}</b></p>
                </div>
                <div className="btn-group buttonsHolder">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => this.viewPost(x.post.id)}>View</button>
                </div>
            </div>);
        });

        return elements;
    }

    getPostInformation = async (postId) => {
        const response = await fetch('Posts/GetPostInformation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postId)
        });

        const data = await response.json();

        if (data.post) {
            return data.post;
        } else {
            Util.showError(data.error);
        }
    }

    viewPost = async (postId) => {
        try {
            const postInfromation = await this.getPostInformation(postId);

            this.props.history.push({
                pathname: '/viewPost',
                state: { post: postInfromation }
            });
        } catch (e) {
            Util.showError(e);
        }
    }

    componentDidMount = async () => {
        const currentUserName = await Util.getCurrentUser();
        await this.getTop3MostLikedPosts();
        await this.getTop3MostCommentedPosts();

        this.setState({ currentUser: currentUserName });
    }

    render = () => {
        const helloMessage = this.getHelloMessage();
        const mostLikedPosts = this.state.loaded ? this.mostLikedPosts(this.state.likedPosts) : 'Collecting our most popular posts for you...';
        const mostCommentedPosts = this.state.loaded ? this.mostCommentedPosts(this.state.commentedPosts) : '';

        return (
            <div>
                <section className="jumbotron text-center">
                    <div className="container">
                        {helloMessage}
                        <p className="lead text-muted">Below you can see our most popular posts!</p>
                    </div>
                </section>
                <div className="album py-5 bg-light">
                    <div className="container">
                        <h2 className="text-center mb-5">Top 3 most liked posts</h2>
                        <div className="row">
                            {mostLikedPosts}
                        </div>
                        <h2 className="text-center mb-5">Top 3 most commented posts</h2>
                        <div className="row">
                            {mostCommentedPosts}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
