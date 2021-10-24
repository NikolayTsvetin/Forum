import React, { Component } from 'react';
import { Likes } from './Likes';
import { Comments } from './Comments';

export class ViewPost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            post: null
        };
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
                <Likes postId={post.id} />
            </div>
        </section>);
    }

    componentDidMount = async () => {
        this.setState({ post: this.props.location.state.post });
    }

    render = () => {
        const postInfo = this.generatePostInfo(this.state.post);

        return (<div className="container">
            {postInfo}
            <Comments post={this.state.post} />
        </div>);
    }
}