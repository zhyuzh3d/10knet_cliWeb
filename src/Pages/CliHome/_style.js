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
        minHeight:48,
    },
    content:{

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
    moreBtn: {
        minWidth: 30,
        width: 30,
    },

});
export default styles;
