import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Util } from '../util/Util';

const Home = () => {
    const history = useHistory();

    const [currentUser, setCurrentUser] = useState(null);
    const [likedPosts, setLikedPosts] = useState(null);
    const [commentedPosts, setCommentedPosts] = useState(null);
    const [loaded, setLoaded] = useState(null);

    useEffect(() => {
        const getCurrentUser = async () => {
            const userResult = await Util.getCurrentUser();

            setCurrentUser(userResult);
        }

        const getTop3MostLikedPosts = async () => {
            try {
                const response = await fetch('Likes/GetTop3MostLikedPosts');
                const data = await response.json();

                if (!loaded) {
                    setLoaded(true);
                }

                setLikedPosts(data);
            } catch (e) {
                Util.showError(e);
            }
        }

        const getTop3MostCommentedPosts = async () => {
            try {
                const response = await fetch('Likes/GetTop3MostCommentedPosts');
                const data = await response.json();

                if (!loaded) {
                    setLoaded(true);
                }

                setCommentedPosts(data);
            } catch (e) {
                Util.showError(e);
            }
        }

        getCurrentUser();
        getTop3MostLikedPosts();
        getTop3MostCommentedPosts();
    }, []);

    const getHelloMessage = () => {
        const name = currentUser && currentUser.userName.length > 0 ? currentUser.userName : 'guest';

        return (<h1 className="jumbotron-heading">Hello, {name}</h1>);
    }

    const getPostInformation = async (postId) => {
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

    const viewPost = async (postId) => {
        try {
            const postInformation = await getPostInformation(postId);

            history.push('/viewPost', { post: postInformation });
            return;
        } catch (e) {
            Util.showError(e);
        }
    }

    const displayPosts = (posts, type) => {
        if (!posts || posts.length === 0) {
            return '';
        }

        const items = posts.data;

        const elements = items.map(x => {
            const typeGeneratedInfo = type === 'Likes' ? <span>Likes : <b>{x.likesCount}</b></span> : <span>Comments: <b>{x.post.comments.length}</b></span>;

            return (<div className="col-md-4 postHolder" key={x.post.id}>
                <div className="card mb-4 box-shadow">
                    <h4 className="text-center">{x.post.title}</h4>
                </div>
                <div className="card-body">
                    <p className="card-text text-center">{Util.trimContent(x.post.content)}</p>
                    <p className="text-center">Created by: <b>{x.author}</b>.</p>
                    <p className="text-center">Posted on: <b>{new Date(x.post.dateCreated).toLocaleString()}</b>. {typeGeneratedInfo}</p>
                </div>
                <div className="btn-group buttonsHolder">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => viewPost(x.post.id)}>View</button>
                </div>
            </div>);
        });

        return elements;
    }

    const helloMessage = getHelloMessage();
    const mostLikedPosts = loaded ? displayPosts(likedPosts, 'Likes') : 'Collecting our most popular posts for you...';
    const mostCommentedPosts = loaded ? displayPosts(commentedPosts, 'Comments') : '';

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

export default Home;