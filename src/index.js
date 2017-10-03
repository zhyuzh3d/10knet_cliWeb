import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import h from 'react-hyperscript';
import './index.css';

import App from './App/App';

ReactDOM.render(h(App), document.getElementById('root'));
registerServiceWorker();

