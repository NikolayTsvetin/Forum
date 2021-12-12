import React, { useEffect, useState } from 'react';
import { Util } from '../util/Util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

const Likes = (props) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [likes, setLikes] = useState(null);
    const [isLikedByUser, setIsLikedByUser] = useState(null);

    const getPostLikesRequest = async (postId) => {
        try {
            const response = await fetch(`Likes/GetPostLikes?postId=${postId}`);
            const likes = await response.json();

            return likes;
        } catch (e) {
            Util.showError(e);

            return [];
        }
    };

    const isPostLikedByUserRequest = async (postId, userId) => {
        try {
            const response = await fetch(`Likes/IsPostLikedByUser?postId=${postId}&userId=${userId}`);
            const isLiked = await response.json();

            return isLiked;
        } catch (e) {
            Util.showError(e);

            return false;
        }
    };

    useEffect(() => {
        const isUserLoggedIn = async () => {
            return await Util.isUserLoggedIn();
        };

        const getCurrentUser = async () => {
            const currentUserResult = await Util.getCurrentUser();

            setCurrentUser(currentUserResult);

            if (currentUserResult && currentUserResult.userId) {
                isPostLikedByUser(props.postId, currentUserResult.userId);
            }
        };

        const getPostLikes = async (postId) => {
            const likesResult = await getPostLikesRequest(postId);

            setLikes(likesResult);
        };

        const isPostLikedByUser = async (postId, userId) => {
            const isLikedByUser = await isPostLikedByUserRequest(postId, userId);

            setIsLikedByUser(isLikedByUser);
        };

        const isUserLoggedInResult = isUserLoggedIn();

        if (props.postId) {
            getPostLikes(props.postId);
        }

        if (isUserLoggedInResult) {
            getCurrentUser();
        }
    }, []);

    const onLike = async (e) => {
        e.preventDefault();

        const isUserLoggedIn = await Util.isUserLoggedIn();

        if (!isUserLoggedIn) {
            Util.showError('To like this post, you must be logged in.');

            return;
        }

        if (!props.postId) {
            Util.showError('Unexpected error. Post id cannot be found.');

            return;
        }

        const model = { postId: props.postId, userId: currentUser.userId };

        const response = await fetch('Likes/LikePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            const likes = await getPostLikesRequest(props.postId);

            setLikes(likes);
            setIsLikedByUser(true);
        }

        if (result.error) {
            Util.showError(result.error);
        }
    };

    const onUnlike = async (e) => {
        e.preventDefault();

        if (!props.postId) {
            Util.showError('Unexpected error. Post id cannot be found.');

            return;
        }

        const model = { postId: props.postId, userId: currentUser.userId };

        const response = await fetch('Likes/UnlikePost', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(model)
        });

        const result = await response.json();

        if (result.success) {
            const likes = await getPostLikesRequest(props.postId);

            setLikes(likes);
            setIsLikedByUser(false);
        }

        if (result.error) {
            Util.showError(result.error);
        }
    };

    const generateLikeSection = () => {
        if (!likes) {
            return 'Generating likes section...';
        }

        if (!currentUser || !currentUser.userId) {
            return (<div><p>Total likes: {likes.length}</p>
                <p><button onClick={onLike} className="btn btn-primary">Like <FontAwesomeIcon icon={faThumbsUp} /></button></p>
            </div>);
        }

        const likeButton = isLikedByUser ? <button onClick={onUnlike} className="btn btn-secondary">Liked <FontAwesomeIcon icon={faThumbsUp} /></button> : <button onClick={onLike} className="btn btn-primary">Like <FontAwesomeIcon icon={faThumbsUp} /></button>;

        return (<div><p>Total likes: {likes.length}</p>
            <p>{likeButton}</p>
        </div>);
    };

    const likesSection = generateLikeSection();

    return (<div className="container">
        {likesSection}
    </div>);
};

export default Likes;