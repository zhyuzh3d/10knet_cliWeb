import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

var e = React.createElement;
var k = Math.random;

class App extends Component {
    render() {
        return e('div', { className: 'App', key: k() }, [
            e('div', { className: 'App-header', key: k() }, [
                e('img', { src: logo, className: 'App-logo', key: k() }),
                e('h2', { key: k() }, 'Welcome to 10knet!'),
            ]),
            e('p', { className: 'App-intro',key: k()  }, '= the next generation of web browser =')
        ]);
    }
}

export default App;
