const topBarHei=40;
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
        boxShadow: 'none',
    },
    titleBar:{
        borderBottom:'1px solid #f4f4f4',
        background:'#f8f8f8',
        height:topBarHei,
        margin:0,
    },
    straitBtn: {
        width: 32,
        minWidth:32,
    },
    barLeftBtn:{
        minWidth:topBarHei,
        minHeight:topBarHei,
    },

});
export default styles;
