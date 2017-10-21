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
        default: {
            "50": "#fafafa",
            "100": "#f9f9f9",
            "200": "#f6f6f6",
            "300": "#f3f3f3",
            "400": "#f0f0f0",
            "500": "#efefef",
            "600": "#eaeaea",
            "700": "#e6e6e6",
            "800": "#e0e0e0",
            "900": "#dddddd",
            "A100": "#eeeeee",
            "A200": "#dddddd",
            "A400": "#cccccc",
            "A700": "#aaaaaa",
            "contrastDefaultColor": "dark"
        },
    },
    typography: {
        title: {
            fontSize: 16,
            lineHeight: -4,
        }
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
        MuiIconButton: {
            root: {
                fontSize: 16,
                maxWidth: 1000,
            },
        },
        MuiTab: {
            root: {
                maxWidth: 1000,
            }
        },
        MuiButtonBase: {
            root: {
                maxWidth: 1000,
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
            },
        },
        MuiPaper: {
            shadow4: {
                //boxShadow: 'none',
            }
        },
        MuiSvgIcon: {
            root: {
                width: 20,
                height: 20,
            }
        }
    },
});

export default Theme;
