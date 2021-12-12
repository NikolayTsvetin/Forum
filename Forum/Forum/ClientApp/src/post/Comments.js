import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Util } from '../util/Util';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

const Comments = (props) => {
    const history = useHistory();

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [post, setPost] = useState(null);
    const [likesForComments, setLikesForComments] = useState(null);

    const getAllLikesForCommentsOnPost = async (postId) => {
        const response = await fetch(`Likes/GetAllLikesForCommentsOnPost?postId=${postId}`);
        const data = await response.json();

        return data.likesForComments;
    };

    useEffect(() => {
        const getIsUserLoggedIn = async () => {
            const result = await Util.isUserLoggedIn();

            setIsUserLoggedIn(result);

            return result;
        };

        const getCurrentUser = async () => {
            const currentUserResult = await Util.getCurrentUser();

            setCurrentUser(currentUserResult);
        };

        const getLikesForComments = async () => {
            const likes = await getAllLikesForCommentsOnPost(props.post.id);

            setLikesForComments(likes);
            setPost(props.post);
        };

        const isLoggedIn = getIsUserLoggedIn();

        if (isLoggedIn) {
            getCurrentUser();
        }

        getLikesForComments();
    }, []);

    const redirectToLogin = () => {
        history.push('/login');
    }

    const redirectToRegistration = () => {
        history.push('/register');
    }

    const reloadPost = async (postId) => {
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
        const likes = await getAllLikesForCommentsOnPost(postId);

        setPost(data.post);
        setLikesForComments(likes);
    };

    const addComment = async () => {
        const commentInput = document.getElementById('comment');
        const commentValue = commentInput.value;

        if (!commentValue || commentValue.length < 3) {
            Util.showError('Comment cannot be less than 3 symbols.');

            return;
        }

        try {
            const comment = { content: commentValue, postId: post.id };
            const response = await fetch('Comments/AddComment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(comment)
            });

            const data = await response.json();

            if (data.success) {
                await reloadPost(post.id);

                Util.showSuccess('Comment added!');
                commentInput.value = '';
            } else {
                Util.showError(`There was error adding your comment: ${commentValue}`);
            }
        } catch (e) {
            Util.showError(e);
        }
    };

    const getCommentOptions = () => {
        if (!isUserLoggedIn) {
            return (<div>
                <p>In order to comment, you have to be <button className="btn btn-primary" onClick={redirectToLogin}>Logged in</button></p>
                <p>Don't have registration? <button className="btn btn-primary" onClick={redirectToRegistration}>Register now</button></p>
            </div>);
        } else {
            return (<div className="input-group">
                <input className="form-control width100" id="comment" type="text" name="comment" placeholder="Your comment here…" />
                <span className="input-group-btn">
                    <button className="btn btn-info" onClick={addComment}>Add comment</button>
                </span>
            </div>);
        }
    };

    const getDeleteState = (post, comment) => {
        if (!post) {
            return;
        }

        if (!currentUser || !currentUser.userId) {
            return 'disabled';
        }

        const postAuthorId = post.applicationUserId;

        // If current user is author of the post - should be able to delete every comment
        if (currentUser.userId && currentUser.userId.toLowerCase() === postAuthorId.toLowerCase()) {
            return '';
        }

        // If current user is not the author of the post - should be able to delete only comments to which he is author.
        if (currentUser.userId && currentUser.userId.toLowerCase() === comment.applicationUserId.toLowerCase()) {
            return '';
        }

        return 'disabled';
    };

    const getLikeState = (commentId) => {
        if (!currentUser || !currentUser.userId) {
            return 'disabled';
        }

        if (!likesForComments || likesForComments.length === 0) {
            return '';
        }

        const commentIsLiked = likesForComments.filter(x => x.commentId.toLowerCase() === commentId.toLowerCase());

        if (!commentIsLiked || commentIsLiked.length === 0) {
            return '';
        }

        const commentIsLikedByCurrentUser = commentIsLiked.filter(x => x.userId.toLowerCase() === currentUser.userId.toLowerCase());

        if (!commentIsLikedByCurrentUser || commentIsLikedByCurrentUser.length === 0) {
            return '';
        }

        return 'disabled';
    };

    const getLikesCount = (commentId) => {
        if (!likesForComments || likesForComments.length === 0) {
            return 0;
        }

        const likesForComment = likesForComments.filter(x => x.commentId.toLowerCase() === commentId.toLowerCase());

        return likesForComment.length;
    };

    const likeComment = async (postId, commentId) => {
        if (!isUserLoggedIn) {
            Util.showError('To like this comment, you must be logged in.');

            return;
        }

        const model = { commentId: commentId, userId: currentUser.userId };

        const response = await fetch('Likes/LikeComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            await reloadPost(postId);
        }

        if (result.error) {
            Util.showError(result.error);
        }
    };

    const unlikeComment = async (postId, commentId) => {
        const model = { commentId: commentId, userId: currentUser.userId };

        const response = await fetch('Likes/UnlikeComment', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            await reloadPost(postId);
        }

        if (result.error) {
            Util.showError(result.error);
        }
    };

    const deleteComment = async (postId, commentId) => {
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
                                await reloadPost(postId);
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
    };

    const createCommentsSection = post => {
        if (!post) {
            return '';
        }

        const isLoggedInCheck = getCommentOptions();

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
                            const deletedisabledstate = getDeleteState(post, x);
                            const likedisabledstate = getLikeState(x.id);
                            const likesCount = getLikesCount(x.id);
                            let likeButton = <button className="deleteComment btn btn-primary" onClick={() => likeComment(post.id, x.id)} disabled={likedisabledstate}>Like <FontAwesomeIcon icon={faThumbsUp} /></button>;

                            if (isUserLoggedIn && likesForComments && likesForComments.length > 0) {
                                const match = likesForComments.filter(c => c.commentId.toLowerCase() === x.id.toLowerCase() && c.userId.toLowerCase() === currentUser.userId.toLowerCase());

                                if (match && match.length > 0) {
                                    likeButton = <button className="deleteComment btn btn-secondary" onClick={() => unlikeComment(post.id, x.id)}>Liked <FontAwesomeIcon icon={faThumbsUp} /></button>;
                                }
                            }
                            return (<div className="col-md-12 postHolder" key={x.id}>
                                <div className="card-body">
                                    <p className="card-text">{x.content}</p>
                                    <p>Created by: <b>{x.authorName}</b> on: {new Date(x.dateCreated).toLocaleString()}.</p>
                                    <p><b>Likes: {likesCount}</b></p>
                                    <button className="deleteComment btn btn-danger" onClick={() => deleteComment(post.id, x.id)} disabled={deletedisabledstate}><FontAwesomeIcon icon={faTrash} /></button>
                                    {likeButton}
                                </div>
                            </div>);
                        })}
                        {isLoggedInCheck}
                    </div>
                </div>
            </div>);
        }
    };

    const commentsSection = createCommentsSection(post);

    return (<div>
        {commentsSection}
    </div>);
}

export default Comments;