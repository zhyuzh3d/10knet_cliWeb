import { Component } from 'react';
import logo from './imgs/logo.svg';
import './App.css';

var h = require('react-hyperscript');
class App extends Component {
    render() {
        return h('div.App', [
            h('div.App-header', [
                h('img.App-logo', { src: logo }),
                h('h2', 'Welcome to 10knet!'),
            ]),
            h('p.App-intro', '= the next generation of web browser =')
        ]);
    }
}


export default App;
