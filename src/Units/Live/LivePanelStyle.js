const styles = theme => ({
    panelBox: {
        padding: 0,
        margin: 0,
        width: '100%',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        height: '100%',
        position: 'relative',
    },
    liveRoomBox: {
        height: 120,
        width: '100%',
        positin: 'relative',
    },
    btnBar: {
        width: 'calc(100% - 8px)',
        padding: 4,
        margin: 0,
        height: 40,
        borderBottom: '1px solid #EEE',
        background: '#FFF',
        display: 'flex',
        position: 'relative',
    },
    btn: {
        padding: 0,
        height: 32,
        width: 32,
        minHeight: 32,
        minWidth: 32,
        cursor: 'pointer',
        borderRadius: 100,
        margin: 4,
        background: '#FFF',
    },
    browserAddr: {
        display: 'flex',
        flexGrow: 1,
        background: 'inherit',
        border: 'none',
        fontSize: '12px',
        placeholder: '请在这里输入您的网址',
    },
    browserBtnGrp: {
        background: '#DFDFDF',
        height: 40,
        display: 'flex',
        flexGrow: 1,
        marginLeft: 8,
        marginRight: 4,
        borderRadius: 100,
        minWidth: 200,
    },

    inviteName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    invitePs: {
        fontSize: 12,
        fontWeight: 200,
    },
    boardPanel: {
        margin: 0,
        padding: 0,
        flexGrow: 1,
        display: 'flex',
    },
    empty: {
        width: '100%',
        paddingTop: 50,
        fontSize: 12,
        color: '#DDD',
        textAlign: 'center',
    },
    liveChatBox: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        zIndex: 10,
    },
    barDivider: {
        height: 20,
        width: 1,
        background: '#CCC',
        margin: '10px 8px',
    },

});

export default styles;
