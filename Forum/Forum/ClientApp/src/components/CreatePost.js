import React, { Component } from 'react';

export class CreatePost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            content: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const target = event.target.name;
        const value = event.target.value;

        if (target === 'title') {
            this.setState({ title: value });
        } else if (target === 'content') {
            this.setState({ content: value });
        } else {
            throw `There is no info in state for ${target}`;
        }
    }

    async handleSubmit(event) {
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
                this.props.history.push('/posts');
            } else {
                throw 'Ooops... Your post creation has failed. Please, try again.'
            }
        } catch (e) {
            throw e;
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
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
                <input className="btn btn-primary" type="submit" value="Submit" />
            </form>
        );
    }
}