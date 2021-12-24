import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useHistory } from 'react-router-dom';
import { Util } from '../util/Util';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

// holy shit. expert level css?. long live stackoverflow
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

Modal.setAppElement(document.getElementById('root'));

const Posts = (props) => {
    const history = useHistory();

    const [loaded, setLoaded] = useState(null);
    const [posts, setPosts] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [title, setTitle] = useState(null);
    const [content, setContent] = useState(null);
    const [updateId, setUpdateId] = useState(null);

    useEffect(() => {
        const getCurrentUser = async () => {
            const currentUserResult = await Util.getCurrentUser();

            setCurrentUser(currentUserResult);
        };

        getAllPosts();
        getCurrentUser();
    }, []);

    const getAllPosts = async () => {
        try {
            const response = await fetch('Posts/GetPosts');
            const data = await response.json();

            setLoaded(true);
            setPosts(data);
        } catch (e) {
            Util.showError(e);
        }
    };

    const showPosts = (posts) => {
        if (!posts || posts.length === 0) {
            return '';
        }

        const elements = posts.map(x => {
            let shoulddisable = 'disabled';
            if (currentUser && currentUser.userId && x.applicationUserId && currentUser.userId.toLowerCase() === x.applicationUserId.toLowerCase()) {
                shoulddisable = '';
            }

            return (<div className="col-md-4 postHolder" key={x.id}>
                <div className="card mb-4 box-shadow">
                    <h4 className="text-center">{x.title}</h4>
                </div>
                <div className="card-body">
                    <p className="card-text text-center">{Util.trimContent(x.content)}</p>
                    <p className="text-center">Posted on: {new Date(x.dateCreated).toLocaleString()}</p>
                </div>
                <div className="btn-group buttonsHolder">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => viewPost(x.id)}>View</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled={shoulddisable} onClick={() => editPost(x)}>Edit</button>
                </div>
                <div className="btn-group buttonsHolder">
                    <button className="btn btn-sm btn-outline-secondary" disabled={shoulddisable} style={{ marginTop: '5px' }} onClick={() => deletePost(x.id)}>Delete</button>
                </div>
            </div>);
        });

        return elements;
    };

    const viewPost = async (postId) => {
        try {
            const postInformation = await getPostInformation(postId);

            history.push('/viewPost', { post: postInformation });
        } catch (e) {
            Util.showError(e);
        }
    };

    const getPostInformation = async (id) => {
        const response = await fetch('Posts/GetPostInformation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(id)
        });

        const data = await response.json();

        if (data.post) {
            return data.post;
        } else {
            Util.showError(data.error);
        }
    };

    const editPost = async (post) => {
        setTitle(post.title);
        setContent(post.content);
        setUpdateId(post.id);

        openModal();
    };

    const openModal = (event) => {
        // If !event is called manually for edit, not event based calling.
        if (!event) {
            setEditModalIsOpen(true);
        } else {
            if (!currentUser.userName || !currentUser.userId || currentUser.userName.length === 0 || currentUser.userId.length === 0) {
                Util.showError('To be able to create posts, you must be logged in.');
            } else {
                setCreateModalIsOpen(true);
            }
        }
    }

    const deletePost = async (postId) => {
        try {
            const postInformation = await getPostInformation(postId);

            confirmAlert({
                title: 'Confirm to delete',
                message: `Are you sure you want to delete this post: ${postInformation.title}?`,
                buttons: [{
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            const response = await fetch('Posts/DeletePost', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(postId)
                            });
                            const data = await response.json();

                            if (data.success) {
                                await getAllPosts();
                            } else {
                                Util.showError(`There is no post with id: ${postId}. Error message: ${data.error}`);
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

    const getToggleButtons = () => {
        if (!currentUser || !currentUser.userId) {
            return '';
        }

        return (<div className="btn-group btn-group-toggle" data-toggle="buttons">
            <button onClick={onAllPosts} id="allPostsButton" className="btn btn-secondary active">All posts</button>
            <button onClick={onOnlyMine} id="onlyMineButton" className="btn btn-secondary">Only mine</button>
        </div>);
    };

    const onAllPosts = async (event) => {
        event.preventDefault();
        const allPostsButton = document.getElementById('allPostsButton');
        const onlyMineButton = document.getElementById('onlyMineButton');

        // Button is already selected, no action here.
        if (allPostsButton.className.indexOf('active') >= 0) {
            return;
        }

        allPostsButton.classList.add('active');
        onlyMineButton.classList.remove('active');
        await getAllPosts();
    };

    const onOnlyMine = async (event) => {
        event.preventDefault();
        const allPostsButton = document.getElementById('allPostsButton');
        const onlyMineButton = document.getElementById('onlyMineButton');

        // Button is already selected, no action here.
        if (onlyMineButton.className.indexOf('active') >= 0) {
            return;
        }

        allPostsButton.classList.remove('active');
        onlyMineButton.classList.add('active');
        await getPostsOnlyByCurrentUser();
    };

    const getPostsOnlyByCurrentUser = async () => {
        try {
            const response = await fetch(`Posts/GetPostsByUser?id=${currentUser.userId}`);
            const data = await response.json();

            setLoaded(true);
            setPosts(data);
        } catch (e) {
            Util.showError(e);
        }
    };

    const handleChange = (event) => {
        const target = event.target.name;
        const value = event.target.value;

        if (target === 'title') {
            setTitle(value);
        } else if (target === 'content') {
            setContent(value);
        } else {
            Util.showError(`There is no info in state for ${target}`);
        }
    };

    const closeModal = (event) => {
        // If !event is called manually. Close whatever is open.
        if (!event) {
            setCreateModalIsOpen(false);
            setEditModalIsOpen(false);

            return;
        }

        // Two options - 'Create' and 'Edit'
        const modalType = event.currentTarget.nextElementSibling.innerText;

        if (modalType === 'Create') {
            setCreateModalIsOpen(false);
        } else {
            setEditModalIsOpen(false);
        }
    };

    const saveModal = async (event) => {
        event.preventDefault();

        try {
            const postObject = { title: title, content: content };
            const response = await fetch('Posts/CreatePost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postObject)
            });

            const data = await response.json();

            if (data.success) {
                closeModal();
                Util.showSuccess('Post created!');

                await this.getAllPosts();
            } else {
                Util.showError('Ooops... Your post creation has failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    };

    const saveEditedModal = async (event) => {
        event.preventDefault();

        try {
            const postObject = { title: title, content: content, id: updateId };
            const response = await fetch('Posts/UpdatePost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postObject)
            });

            const data = await response.json();

            if (data.success) {
                closeModal();

                await getAllPosts();
            } else {
                Util.showError('Ooops... Your post update has failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    };

    const pageContent = loaded ? showPosts(posts) : 'Retrieving all posts...';
    const toggleButtons = getToggleButtons();

    return (<div>
        <h1>q da vidim sega</h1>
        <section className="jumbotron text-center">
            <div className="container">
                <h1 className="jumbotron-heading">All posts</h1>
                <p className="lead text-muted">Below you can see all available posts. Check if something is interesting for you, or post your own topic!</p>
                <p><button className="btn btn-primary my-2" onClick={openModal}>Create post</button></p>
                {toggleButtons}
                <Modal
                    isOpen={createModalIsOpen}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="Create new"
                >
                    <h2>Create new post</h2>
                    <form>
                        <div className="mb-3">
                            <label className="form-label">Title:
                                    <input className="form-control" name="title" type="text" onChange={handleChange} />
                            </label>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Content:
                                    <textarea className="form-control" name="content" onChange={handleChange} />
                            </label>
                        </div>
                        <button className="btn btn-primary" style={{ float: 'left' }} onClick={closeModal}>Close</button>
                        <button className="btn btn-primary" style={{ float: 'right' }} onClick={saveModal}>Create</button>
                    </form>
                </Modal>
                <Modal
                    isOpen={editModalIsOpen}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="Edit post">
                    <h2>Edit post</h2>
                    <form>
                        <div className="mb-3">
                            <label className="form-label">Title:
                                    <input className="form-control" name="title" type="text" value={title} onChange={handleChange} />
                            </label>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Content:
                                    <textarea className="form-control" name="content" value={content} onChange={handleChange} />
                            </label>
                        </div>
                        <button className="btn btn-primary" style={{ float: 'left' }} onClick={closeModal}>Close</button>
                        <button className="btn btn-primary" style={{ float: 'right' }} onClick={saveEditedModal}>Save</button>
                    </form>
                </Modal>
            </div>
        </section>
        <div className="album py-5 bg-light">
            <div className="container">
                <div className="row">
                    {pageContent}
                </div>
            </div>
        </div>
    </div>);
};

export default Posts;