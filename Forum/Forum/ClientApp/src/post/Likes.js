import React, { Component } from 'react';
import { Util } from '../util/Util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export class Likes extends Component {
    constructor(props) {
        super(props);

        this.state = {
            likes: null,
            currentUser: null,
            isLikedByUser: null
        };

        this.onLike = this.onLike.bind(this);
    }

    onLike = async (e) => {
        e.preventDefault();

        const isUserLoggedIn = await Util.isUserLoggedIn();

        if (!isUserLoggedIn) {
            Util.showError('To like this post, you must be logged in.');

            return;
        }

        if (!this.props.postId) {
            Util.showError('Unexpected error. Post id cannot be found.');

            return;
        }

        const model = { postId: this.props.postId, userId: this.state.currentUser.userId };

        const response = await fetch('Likes/LikePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            const likes = await this.getPostLikes(this.props.postId);

            this.setState({ likes: likes, isLikedByUser: true });
        }

        if (result.error) {
            Util.showError(result.error);
        }
    }

    onUnlike = async (e) => {
        e.preventDefault();

        if (!this.props.postId) {
            Util.showError('Unexpected error. Post id cannot be found.');

            return;
        }

        const model = { postId: this.props.postId, userId: this.state.currentUser.userId };

        const response = await fetch('Likes/UnlikePost', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            const likes = await this.getPostLikes(this.props.postId);

            this.setState({ likes: likes, isLikedByUser: false });
        }

        if (result.error) {
            Util.showError(result.error);
        }
    }

    componentDidMount = async () => {
        const isUserLoggedIn = await Util.isUserLoggedIn();

        if (isUserLoggedIn) {
            const currentUser = await Util.getCurrentUser();
            let isLikedByUser = false;

            if (isUserLoggedIn && this.props.postId) {
                isLikedByUser = await this.isPostLikedByUser(this.props.postId, currentUser.userId);
            }

            this.setState({ currentUser: currentUser, isLikedByUser: isLikedByUser });
        }

        if (this.props.postId) {
            const likes = await this.getPostLikes(this.props.postId);

            this.setState({ likes: likes });
        }
    }

    getPostLikes = async (postId) => {
        try {
            const response = await fetch(`Likes/GetPostLikes?postId=${postId}`);
            const likes = await response.json();

            return likes;
        } catch (e) {
            Util.showError(e);

            return [];
        }
    }

    isPostLikedByUser = async (postId, userId) => {
        try {
            const response = await fetch(`Likes/IsPostLikedByUser?postId=${postId}&userId=${userId}`);
            const isLiked = await response.json();

            return isLiked;
        } catch (e) {
            Util.showError(e);

            return false;
        }
    }

    generateLikeSection = () => {
        if (!this.state.likes) {
            return 'Generating likes section...';
        }

        if (!this.state.currentUser) {
            return (<div><p>Total likes: {this.state.likes.length}</p>
                <p><button onClick={this.onLike} className="btn btn-primary">Like <FontAwesomeIcon icon={faThumbsUp} /></button></p>
            </div>);
        }

        const likeButton = this.state.isLikedByUser ? <button onClick={this.onUnlike} className="btn btn-secondary">Liked <FontAwesomeIcon icon={faThumbsUp} /></button> : <button onClick={this.onLike} className="btn btn-primary">Like <FontAwesomeIcon icon={faThumbsUp} /></button>;

        return (<div><p>Total likes: {this.state.likes.length}</p>
            <p>{likeButton}</p>
        </div>);
    }

    render = () => {
        const likesSection = this.generateLikeSection();

        return (<div className="container">
            {likesSection}
        </div>);
    }
}