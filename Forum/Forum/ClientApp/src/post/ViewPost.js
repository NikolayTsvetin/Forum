import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Likes from './Likes';
import Comments from './Comments';

const ViewPost = () => {
    const history = useHistory();

    const [post, setPost] = useState(null);

    useEffect(() => {
        setPost(history.location.state.post);
    }, []);

    const generatePostInfo = post => {
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
    };

    const postInfo = generatePostInfo(post);

    return post ? (<div className="container">
        {postInfo}
        <Comments post={post} />
    </div>) : (<div className="container">
        {postInfo}
    </div>);
}

export default ViewPost;