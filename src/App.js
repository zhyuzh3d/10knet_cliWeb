import LoginPage from './pages/LoginPage';
import h from 'react-hyperscript';


//定制主题颜色
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/palette';
import teal from 'material-ui/colors/teal';
import pink from 'material-ui/colors/pink';
import red from 'material-ui/colors/red';
import Button from 'material-ui/Button';

const theme = createMuiTheme({
    palette: createPalette({
        primary: teal,
        accent: pink,
        error: red,
    }),
    overrides: {
        MuiButton: {
            root: {
                borderRadius: 0,
                boxShadow: 'none',
            },
            raised: {
                borderRadius: 0,
                boxShadow: 'none',
            }
        },
    },
});


//载入首页
function App() {
    return h(MuiThemeProvider, {
        theme: theme,
    }, [
        h(LoginPage, 'btn'),
    ]);
};

export default App;
