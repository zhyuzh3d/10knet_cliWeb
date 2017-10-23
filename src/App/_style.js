//公用样式表
const styles = theme => ({
    mainPart: {
        flexGrow: 'initial',
        width: 360,
        minWidth: 360,
        margin: 0,
        padding: 0,
    },
    slavePart: {
        flexGrow: 1,
        borderRight: '1px solid #AAA',
        margin: 0,
        padding: 0,
    },
    partsContainer: {
        flexWrap: 'nowrap',
        justifyContent: 'flex-end',
        margin: 0,
        padding: 0,
        height: '100%',
    },
});
export default styles;
