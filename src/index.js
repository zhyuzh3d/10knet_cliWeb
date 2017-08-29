import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

var ele = React.createElement(App, { key: Math.random() });

ReactDOM.render(ele, document.getElementById('root'));
registerServiceWorker();
