const topBarHei = 40;
const styles = theme => ({
    page: {
        padding: 0,
        margin: 0,
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        display: 'block',
    },
    appBar: {
        padding: 0,
        boxShadow: 'none',
        borderBottom: '1px solid #EEE',
        height: 48,
        minHeight: 48,
    },
    straitBtn: {
        width: 36,
        minWidth: 36,
    },
    barLeftBtn: {
        minWidth: topBarHei,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    baseButton: {
        fontSize: '1rem',
    },
    dividerV: {
        marginRight: theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit,
    },
    flex: {
        flex: 1,
        userSelect: false,
    },
    uname: {
        width: 60,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    appAvatar: {
        height: 28,
        width: 28,
    },
    appUserBtn: {

    },
});

export default styles;
