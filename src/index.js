import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
var h = require('react-hyperscript');

ReactDOM.render(h(App), document.getElementById('root'));
registerServiceWorker();
