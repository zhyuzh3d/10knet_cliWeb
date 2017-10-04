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
    flex: {
        flex: 1
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
