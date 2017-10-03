import { createMuiTheme } from 'material-ui/styles';
//import createPalette from 'material-ui/styles/palette';
import teal from 'material-ui/colors/teal';
import pink from 'material-ui/colors/pink';
import red from 'material-ui/colors/red';

const Theme = createMuiTheme({
    palette: {
        primary: teal,
        accent: pink,
        error: red,
    },
    overrides: {
        MuiButton: {
            root: {
                borderRadius: 0,
                boxShadow: 'none',
            },
            raised: {
                borderRadius: 0,
                boxShadow: 'none',
            },
        },
        MuiDialog: {
            paper: {
                borderRadius: 0,
                boxShadow: 'none',
                minWidth: 300,
            },
        },
        MuiToolbar: {
            root: {
                boxShadow: 'none',
            }
        },
        MuiAppbar: {
            root: {
                boxShadow: 'none',
            }
        },
        MuiPaper: {
            shadow4: {
                //boxShadow: 'none',
            }
        },
        MuiSvgIcon:{
            root:{
                width:20,
                height:20,
            }
        }
    },
});

export default Theme;
