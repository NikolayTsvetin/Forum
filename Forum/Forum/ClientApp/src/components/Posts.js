import React, { Component } from 'react';
import Modal from 'react-modal';
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

export class Posts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            posts: null,
            currentUser: null,
            createModalIsOpen: false,
            editModalIsOpen: false,
            title: '',
            content: '',
            updateId: ''
        }

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.saveModal = this.saveModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.editPost = this.editPost.bind(this);
        this.saveEditedModal = this.saveEditedModal.bind(this);

    }

    openModal = (event) => {
        // If !event is called manually for edit, not event based calling.
        if (!event) {
            this.setState({ editModalIsOpen: true });
        } else {
            this.setState({ createModalIsOpen: true });
        }
    }

    closeModal = (event) => {
        // If !event is called manually. Close whatever is open.
        if (!event) {
            this.setState({ createModalIsOpen: false, editModalIsOpen: false });

            return;
        }

        // Two options - 'Create' and 'Edit'
        const modalType = event.currentTarget.nextElementSibling.innerText;

        if (modalType === 'Create') {
            this.setState({ createModalIsOpen: false });
        } else {
            this.setState({ editModalIsOpen: false });
        }
    }

    saveModal = async (event) => {
        event.preventDefault();

        try {
            const post = { title: this.state.title, content: this.state.content };
            const response = await fetch('Posts/CreatePost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
            });

            const data = await response.json();

            if (data.success) {
                this.closeModal();
                Util.showSuccess('Post created!');

                await this.getAllPosts();
            } else {
                Util.showError('Ooops... Your post creation has failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    }

    handleChange = (event) => {
        const target = event.target.name;
        const value = event.target.value;

        if (target === 'title') {
            this.setState({ title: value });
        } else if (target === 'content') {
            this.setState({ content: value });
        } else {
            Util.showError(`There is no info in state for ${target}`);
        }
    }

    deletePost = async (id) => {
        try {
            const postInformation = await this.getPostInformation(id);

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
                                body: JSON.stringify(id)
                            });
                            const data = await response.json();

                            if (data.success) {
                                await this.getAllPosts();
                            } else {
                                Util.showError(`There is no post with id: ${id}. Error message: ${data.error}`);
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

    getPostInformation = async (id) => {
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
    }

    viewPost = async (id) => {
        try {
            const postInfromation = await this.getPostInformation(id);

            this.props.history.push({
                pathname: '/viewPost',
                state: { post: postInfromation }
            });
        } catch (e) {
            Util.showError(e);
        }
    }

    editPost = (post) => {
        this.setState({ title: post.title, content: post.content, updateId: post.id });
        this.openModal();
    }

    saveEditedModal = async (event) => {
        event.preventDefault();

        try {
            const post = { title: this.state.title, content: this.state.content, id: this.state.updateId };
            const response = await fetch('Posts/UpdatePost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
            });

            const data = await response.json();

            if (data.success) {
                this.closeModal();

                await this.getAllPosts();
            } else {
                Util.showError('Ooops... Your post creation has failed. Please, try again.');
            }
        } catch (e) {
            Util.showError(e);
        }
    }

    componentDidMount = async () => {
        await this.getAllPosts();
        const currentUserName = await Util.getCurrentUser();

        this.setState({ currentUser: currentUserName });
    }

    getAllPosts = async () => {
        try {
            const response = await fetch('Posts/GetPosts');
            const data = await response.json();

            this.setState({ loaded: true, posts: data });
        } catch (e) {
            Util.showError(e);
        }
    }

    trimContent = (content) => {
        const maximumVisibleLength = 20;

        if (content.length > maximumVisibleLength) {
            return `${content.slice(0, 17)}...`;
        }

        return content;
    }

    showPosts = (posts) => {
        if (!posts || posts.length === 0) {
            return '';
        }

        const currentUser = this.state.currentUser;

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
                    <p className="card-text text-center">{this.trimContent(x.content)}</p>
                    <p className="text-center">Posted on: {new Date(x.dateCreated).toLocaleString()}</p>
                </div>
                <div className="btn-group buttonsHolder">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => this.viewPost(x.id)}>View</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled={shoulddisable} onClick={() => this.editPost(x)}>Edit</button>
                </div>
                <div className="btn-group buttonsHolder">
                    <button className="btn btn-sm btn-outline-secondary" disabled={shoulddisable} style={{ marginTop: '5px' }} onClick={() => this.deletePost(x.id)}>Delete</button>
                </div>
            </div>);
        });

        return elements;
    }

    render = () => {
        const content = this.state.loaded ? this.showPosts(this.state.posts) : 'Retrieving all posts...';

        return (<div>
            <section className="jumbotron text-center">
                <div className="container">
                    <h1 className="jumbotron-heading">All posts</h1>
                    <p className="lead text-muted">Below you can see all available posts. Check if something is interesting for you, or post your own topic!</p>
                    <p><button className="btn btn-primary my-2" onClick={this.openModal}>Create post</button></p>
                    <Modal
                        isOpen={this.state.createModalIsOpen}
                        onRequestClose={this.closeModal}
                        style={customStyles}
                        contentLabel="Create new"
                    >
                        <h2>Create new post</h2>
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Title:
                                    <input className="form-control" name="title" type="text" onChange={this.handleChange} />
                                </label>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Content:
                                    <textarea className="form-control" name="content" onChange={this.handleChange} />
                                </label>
                            </div>
                            <button className="btn btn-primary" style={{ float: 'left' }} onClick={this.closeModal}>Close</button>
                            <button className="btn btn-primary" style={{ float: 'right' }} onClick={this.saveModal}>Create</button>
                        </form>
                    </Modal>
                    <Modal
                        isOpen={this.state.editModalIsOpen}
                        onRequestClose={this.closeModal}
                        style={customStyles}
                        contentLabel="Edit post">
                        <h2>Edit post</h2>
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Title:
                                    <input className="form-control" name="title" type="text" value={this.state.title} onChange={this.handleChange} />
                                </label>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Content:
                                    <textarea className="form-control" name="content" value={this.state.content} onChange={this.handleChange} />
                                </label>
                            </div>
                            <button className="btn btn-primary" style={{ float: 'left' }} onClick={this.closeModal}>Close</button>
                            <button className="btn btn-primary" style={{ float: 'right' }} onClick={this.saveEditedModal}>Save</button>
                        </form>
                    </Modal>
                </div>
            </section>
            <div className="album py-5 bg-light">
                <div className="container">
                    <div className="row">
                        {content}
                    </div>
                </div>
            </div>
        </div>);
    }
}