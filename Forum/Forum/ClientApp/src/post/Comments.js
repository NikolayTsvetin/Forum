import React, { Component } from 'react';
import { Util } from '../util/Util';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export class Comments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isUserLoggedIn: null,
            currentUser: null,
            post: null,
            likesForComments: null
        };

        this.redirectToLogin = this.redirectToLogin.bind(this);
        this.redirectToRegistration = this.redirectToRegistration.bind(this);
    }

    reloadPost = async (postId) => {
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
        const likesForComments = await this.getAllLikesForCommentsOnPost(postId);

        this.setState({ post: data.post, likesForComments: likesForComments });
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

    addComment = async () => {
        const commentInput = document.getElementById('comment');
        const commentValue = commentInput.value;

        if (!commentValue || commentValue.length < 3) {
            Util.showError('Comment cannot be less than 3 symbols.');

            return;
        }

        try {
            const comment = { content: commentValue, postId: this.props.post.id };
            const response = await fetch('Comments/AddComment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(comment)
            });

            const data = await response.json();

            if (data.success) {
                await this.reloadPost(this.props.post.id);

                Util.showSuccess('Comment added!');
                commentInput.value = '';
            } else {
                Util.showError(`There was error adding your comment: ${commentValue}`);
            }
        } catch (e) {
            Util.showError(e);
        }
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
            const sortedCommentByDate = post.comments.sort((x, y) => new Date(y.dateCreated) - new Date(x.dateCreated));

            return (<div className="album py-5 bg-light">
                <div className="container">
                    <h3 className="text-center">Comments:</h3>
                    <div className="row">
                        {sortedCommentByDate.map(x => {
                            const deletedisabledstate = this.getDeleteState(post, x);
                            const likedisabledstate = this.getLikeState(x.id);
                            const likesCount = this.getLikesCount(x.id);
                            let likeButton = <button className="deleteComment btn btn-primary" onClick={() => this.likeComment(post.id, x.id)} disabled={likedisabledstate}>Like <FontAwesomeIcon icon={faThumbsUp} /></button>;

                            if (this.state.isUserLoggedIn && this.state.likesForComments && this.state.likesForComments.length > 0) {
                                const match = this.state.likesForComments.filter(c => c.commentId.toLowerCase() === x.id.toLowerCase() && c.userId.toLowerCase() === this.state.currentUser.userId.toLowerCase());

                                if (match && match.length > 0) {
                                    likeButton = <button className="deleteComment btn btn-secondary" onClick={() => this.unlikeComment(post.id, x.id)}>Liked <FontAwesomeIcon icon={faThumbsUp} /></button>;
                                }
                            }
                            return (<div className="col-md-12 postHolder" key={x.id}>
                                <div className="card-body">
                                    <p className="card-text">{x.content}</p>
                                    <p>Created by: <b>{x.authorName}</b> on: {new Date(x.dateCreated).toLocaleString()}.</p>
                                    <p><b>Likes: {likesCount}</b></p>
                                    <button className="deleteComment btn btn-danger" onClick={() => this.deleteComment(post.id, x.id)} disabled={deletedisabledstate}><FontAwesomeIcon icon={faTrash} /></button>
                                    {likeButton}
                                </div>
                            </div>);
                        })}
                        {isLoggedInCheck}
                    </div>
                </div>
            </div>);
        }
    }

    unlikeComment = async (postId, commentId) => {
        const model = { commentId: commentId, userId: this.state.currentUser.userId };

        const response = await fetch('Likes/UnlikeComment', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            await this.reloadPost(postId);
        }

        if (result.error) {
            Util.showError(result.error);
        }
    }

    likeComment = async (postId, commentId) => {
        if (!this.state.isUserLoggedIn) {
            Util.showError('To like this comment, you must be logged in.');

            return;
        }

        const model = { commentId: commentId, userId: this.state.currentUser.userId };

        const response = await fetch('Likes/LikeComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            await this.reloadPost(postId);
        }

        if (result.error) {
            Util.showError(result.error);
        }
    }

    deleteComment = async (postId, commentId) => {
        try {
            confirmAlert({
                title: 'Confirm to delete',
                message: `Are you sure you want to delete the comment?`,
                buttons: [{
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            const response = await fetch('Comments/DeleteComment', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(commentId)
                            });
                            const data = await response.json();

                            if (data.success) {
                                await this.reloadPost(postId);
                            } else {
                                Util.showError(`There is no comment with id: ${commentId}. Error message: ${data.error}`);
                            }
                        } catch (e) {
                            Util.showError(e);
                        }
                    }
                }, {
                    label: 'No',
                    onClick: () => {
                        return;
                    }
                }]
            });
        } catch (e) {
            Util.showError(e);
        }
    }

    getDeleteState = (post, comment) => {
        if (!post) {
            return;
        }

        if (!this.state.currentUser) {
            return 'disabled';
        }

        const postAuthorId = post.applicationUserId;

        // If current user is author of the post - should be able to delete every comment
        if (this.state.currentUser.userId && this.state.currentUser.userId.toLowerCase() === postAuthorId.toLowerCase()) {
            return '';
        }

        // If current user is not the author of the post - should be able to delete only comments to which he is author.
        if (this.state.currentUser.userId && this.state.currentUser.userId.toLowerCase() === comment.applicationUserId.toLowerCase()) {
            return '';
        }

        return 'disabled';
    }

    getLikeState = (commentId) => {
        if (!this.state.currentUser) {
            return 'disabled';
        }

        if (!this.state.likesForComments || this.state.likesForComments.length === 0) {
            return '';
        }

        const commentIsLiked = this.state.likesForComments.filter(x => x.commentId.toLowerCase() === commentId.toLowerCase());

        if (!commentIsLiked || commentIsLiked.length === 0) {
            return '';
        }

        const commentIsLikedByCurrentUser = commentIsLiked.filter(x => x.userId.toLowerCase() === this.state.currentUser.userId.toLowerCase());

        if (!commentIsLikedByCurrentUser || commentIsLikedByCurrentUser.length === 0) {
            return '';
        }

        return 'disabled';
    }

    getLikesCount = (commentId) => {
        if (!this.state.likesForComments || this.state.likesForComments.length === 0) {
            return 0;
        }

        const likesForComment = this.state.likesForComments.filter(x => x.commentId.toLowerCase() === commentId.toLowerCase());

        return likesForComment.length;
    }

    getAllLikesForCommentsOnPost = async (postId) => {
        const response = await fetch(`Likes/GetAllLikesForCommentsOnPost?postId=${postId}`);
        const data = await response.json();

        return data.likesForComments;
    }

    componentDidMount = async () => {
        const isUserLoggedIn = await Util.isUserLoggedIn();

        if (isUserLoggedIn) {
            const currentUser = await Util.getCurrentUser();

            this.setState({ currentUser: currentUser });
        }

        const likesForComments = await this.getAllLikesForCommentsOnPost(this.props.post.id);

        this.setState({ isUserLoggedIn: isUserLoggedIn, likesForComments: likesForComments });
    }

    render = () => {
        const post = this.state.post ? this.state.post : this.props.post;
        const commentsSection = this.createCommentsSection(post);

        return (<div>
            {commentsSection}
        </div>);
    }
}