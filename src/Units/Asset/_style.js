const styles = theme => ({
    loading: {
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        color: '#AAA',
        marginTop: 64,
    },
    asset: {
        padding: '8px 16px',
    },
    assetIcon: {
        margin: 8,
    },
    assetIcon2: {
        fontSize: 8,
        color: '#AAA',
    },
    assetText: {
        margin: 8,
        flex: 1,
    },
    assetTitle: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#333'
    },
    assetTime: {
        fontSize: 8,
        fontWeight: 200,
        color: '#AAA',
        verticalAlign:'middle',
    },
    divider: {
        width: '100%',
        height: 1,
        background: '#EEE',
    },
    detailTitle: {
        marginTop: theme.spacing.unit * 2,
        flex: 1,
        fontSize: '1rem',
        lineHeight: '1.5rem',
        fontWeight: 'bold',
    },
    detailDesc: {
        marginBottom: theme.spacing.unit,
        fontSize: '0.9rem',
        color: '#666',
        letterSpacing: '0.05rem',
    },
    detailInfo: {
        paddingBottom: 0,
        paddingTop: 0,
    },
    contentBtn: {
        marginRight: theme.spacing.unit,
    },
});

export default styles;
