//公用样式表
const styles = theme => ({
    mainPart: {
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 360,
        height: '100%',
        background: '#FFF',
        flexGrow: 'initial',
        zIndex: 21,
        minWidth: 360,
        margin: 0,
        padding: 0,
        boxShadow: '0px 0 24px #AAA',
    },
    mainPartFull: {
        flexGrow: 'initial',
        width: '100%',
        minWidth: 360,
        margin: 0,
        padding: 0,
    },
    slavePart: {
        flex: 'initial',
        flexGrow: 1,
        borderRight: '1px solid #CCC',
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%',
        overflowX: 'auto',
    },
    partsContainer: {
        display: 'block',
        width: '100%',
        flexWrap: 'nowrap',
        justifyContent: 'flex-end',
        margin: 0,
        padding: 0,
        height: '100%',
        alignContent: 'flex-end',
        alignItems: 'stretch',
    },
    mainVisBar: {
        borderRight: '1px solid #CCC',
        display: 'flex',
        textAlign: 'center',
        cursor: 'pointer',
        background: '#EEE',
        width: 12,
        minWidth: 12,
        zIndex: 99,
    },
    visBarTxt: {
        color: '#666',
        fontSize: 10,
    },
    visBarArr: {
        cursor: 'pointer',
        display: 'block',
        color: '#888',
        fontSize: 12,
        marginTop: 18,
        height: '100%',
        width: '100%',
        textAlign: 'center'
    },
    slaveBox: {
        width: '100%',
        minWidth: 480,
        height: '100%',
        margin: 0,
        padding: 0,
        flexDirection: 'column',
        flexWrap: 'initial',
    },
    live: {
        background: '#FCFCFC',
        height: '100%',
        flexGrow: 'initial',
        margin: 0,
        padding: 0,
    },
    viewer: {
        background: '#FFF',
        flexGrow: 1,
        display: 'flex',
        margin: 0,
        padding: 0,
    },
    webview: {
        flexGrow: 1,
        height: '100%',
    },
});
export default styles;







//
