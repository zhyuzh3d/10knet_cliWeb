//公用样式表
const styles = theme => ({
    page: {
        padding: 0,
        margin: 0,
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        display: 'block',
    },
    title: {
        marginTop: theme.spacing.unit * 6,
        width: '100%',
        textAlign: 'center',
    },
    titleTab: {
        width: 100,
        textAlign: 'center',
    },
    row: {
        width: '100%',
        textAlign: 'center',
    },
    container: {
        margin: 0,
        padding: 0,
        width: 360,
        display: 'inline-block',
    },
    item: {
        padding: 0
    },
    textField: {
        width: '100%',
        marginTop: theme.spacing.unit * 2,
    },
    loginBtn: {
        marginTop: theme.spacing.unit * 6,
        width: '100%',
    },
    dialog: {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
    },
    dialogBtn: {
        width: 120,
        margin: theme.spacing.unit,
        marginBottom: theme.spacing.unit * 2,
    },
    imid: {
        display: 'inline-block',
    },
    vline: {
        display: 'inline-block',
        width: 1,
        height: '100%',
        background: '#AAA',
    }
});
export default styles;
