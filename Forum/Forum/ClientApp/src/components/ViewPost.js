import React, { Component } from 'react';
import { Util } from '../util/Util';

export class ViewPost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            post: null,
            isUserLoggedIn: false
        }

        this.addComment = this.addComment.bind(this);
        this.reloadPost = this.reloadPost.bind(this);
        this.redirectToLogin = this.redirectToLogin.bind(this);
        this.redirectToRegistration = this.redirectToRegistration.bind(this);
    }

    addComment = async () => {
        const commentInput = document.getElementById('comment');
        const commentValue = commentInput.value;

        try {
            const comment = { content: commentValue, postId: this.state.post.id };
            const response = await fetch('Comments/AddComment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(comment)
            });

            const data = await response.json();

            if (data.success) {
                await this.reloadPost(this.state.post.id);

                commentInput.value = '';
            } else {
                throw `There was error adding your comment: ${commentValue}`;
            }
        } catch (e) {
            throw e;
        }
    }

    async reloadPost(postId) {
        if (!postId) {
            return;
        }

        const response = await fetch('Posts/GetPostInformation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postId)
        });

        const data = await response.json();

        this.setState({ post: data.post });
    }

    generatePostInfo = (post) => {
        if (!post) {
            return 'Post info is being generated...';
        }

        return (<section className="jumbotron text-center">
            <div className="container">
                <h1 className="jumbotron-heading">{post.title}</h1>
                <p className="lead text-muted">{post.content}</p>
                <p className="lead text-muted">Created on: {new Date(post.dateCreated).toLocaleString()}</p>
            </div>
        </section>);
    }

    redirectToLogin = () => {
        this.props.history.push({
            pathname: '/login'
        });
    }

    redirectToRegistration = () => {
        this.props.history.push({
            pathname: '/register'
        });
    }

    getCommentOptions = () => {
        if (!this.state.isUserLoggedIn) {
            return (<div>
                <p>In order to comment, you have to be <button className="btn btn-primary" onClick={this.redirectToLogin}>Logged in</button></p>
                <p>Don't have registration? <button className="btn btn-primary" onClick={this.redirectToRegistration}>Register now</button></p>
            </div>);
        } else {
            return (<div className="input-group">
                <input className="form-control width100" id="comment" type="text" name="comment" placeholder="Your comment here…" />
                <span className="input-group-btn">
                    <button className="btn btn-info" onClick={this.addComment}>Add comment</button>
                </span>
            </div>);
        }
    }

    createCommentsSection = (post) => {
        if (!post) {
            return '';
        }

        const isLoggedInCheck = this.getCommentOptions();

        if (!post.comments) {
            return (<div className="container">
                <p>Currently there are no comments under this post. You can be the first one!</p>
                {isLoggedInCheck}
            </div>);
        } else {
            return (<div className="album py-5 bg-light">
                <div className="container">
                    <h3 className="text-center">Comments:</h3>
                    <div className="row">
                        {post.comments.map(x => {
                            return (<div className="col-md-12 postHolder" key={x.id}>
                                <div className="card-body">
                                    <p className="card-text">{x.content}</p>
                                    <p>Created on: {new Date(x.dateCreated).toLocaleString()}</p>
                                </div>
                            </div>);
                        })}
                        {isLoggedInCheck}
                    </div>
                </div>
            </div>);
        }
    }

    componentDidMount = async () => {
        const isUserLoggedIn = await Util.isUserLoggedIn();

        this.setState({ post: this.props.location.state.post, isUserLoggedIn: isUserLoggedIn });
    }

    render = () => {
        const postInfo = this.generatePostInfo(this.state.post);
        const commentsSection = this.createCommentsSection(this.state.post);

        return (<div className="container">
            {postInfo}
            {commentsSection}
        </div>);
    }
}