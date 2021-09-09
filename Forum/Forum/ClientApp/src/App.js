import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Posts } from './components/Posts';
import { ViewPost } from './components/ViewPost';

import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Route exact path='/' component={Home} />
                <Route path='/posts' component={Posts} />
                <Route path='/viewPost' component={ViewPost} />
            </Layout>
        );
    }
}
