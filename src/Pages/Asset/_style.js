const styles = theme => ({
    page: {
        padding: 0,
        margin: 0,
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        display: 'block',
    },
    content: {
        margin: 0,
        flex: 1,
        padding: 16,
    },
    container: {

    },
    textField: {
        width: '100%',
        marginTop: theme.spacing.unit * 2,
    },
    longBtn: {
        marginTop: theme.spacing.unit * 6,
        width: '100%',
    },
    fullWidth: {
        width: '100%',
        padding: 0,
        margin: 0,
        textAlign: 'center',
    },
    img: {
        maxHeight: 128,
    },
    imgBox: {
        marginTop: theme.spacing.unit * 2,
    },
    fileBox: {
        marginTop: theme.spacing.unit * 2,
    },
    fileLink: {
        fontSize: 12,
        color: '#666',
        marginTop: theme.spacing.unit,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: `${theme.spacing.unit}px 0`,
    },
    nav: {
        fontSize: '1rem',
    },
    contentBox: {
        padding: theme.spacing.unit,
    },
    postsLabel: {
        fontSize: '0.8rem',
        color: '#888',
        margin: theme.spacing.unit,
    },
});

export default styles;
