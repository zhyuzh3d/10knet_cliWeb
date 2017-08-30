import LoginPage from './pages/LoginPage';
import h from 'react-hyperscript';

function App() {
    return h('div', [
        h(LoginPage, 'btn'),
    ]);
};

export default App;
