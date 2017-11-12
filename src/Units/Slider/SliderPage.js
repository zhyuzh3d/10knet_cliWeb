/*
幻灯片单页，支持edit模式和play模式，play模式自带画板图层

props:{
    wdRef,数据库路径，便于直接修改
    data,页面数据，如果没有那么自动从wdRef读取
    mode，模式，'edit'或者'play',
    style，整体样式,
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import FontA from 'react-fa';
import MyUpload from '../../Utils/MyUpload';




const style = theme => ({
    pageBox: {
        marginTop: 16,
        boxShadow: '8px 0 16px #EEE',
    },
    page: {
        padding: 16,
        position: 'relative',
        border: '1px solid #AAA',
        fontSize: 0,
        minHeight: 96,
    },
    index: {
        position: 'absolute',
        padding: 4,
        background: '#AAA',
        color: '#FFF',
        textAlign: 'center',
        fontSize: 12,
        width: 24,
        top: 0,
        left: 0,
    },
    delete: {
        position: 'absolute',
        padding: 4,
        background: '#AAA',
        color: '#FFF',
        textAlign: 'center',
        fontSize: 12,
        width: 20,
        top: 0,
        right: 0,
        cursor: 'pointer',
    },
    placeholder: {
        textAlign: 'center',
        fontSize: 12,
    },
    bgImg: {
        width: 'calc(100% + 32px)',
        margin: -16,
    },

});
let uploadBtnStyle = {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 32,
    width: 64,
    minWidth: 64,
    minHeight: 32,
    fontSize: 12,
    color: '#FFF',
    background: '#AAA',
    margin: 0,
    padding: 4,
};

//元件
class com extends Component {
    state = {};

    //生成data数据
    componentDidMount = async function() {};

    //删除幻灯片
    deletePage = () => {
        if(!this.props.wdRef) return;
        global.$confirm.fn.show({
            title: '确认删除',
            text: '删除后无法恢复，您确认删除页面吗？',
            okHandler: () => {
                global.$wd.sync().ref(this.props.wdRef).remove().then((shot) => {
                    global.$snackbar.fn.show('删除成功', 2000);
                });
            },
        });
    };

    //重新上传图片
    changeBgUrl = (file) => {
        if(!this.props.wdRef) return;
        global.$wd.sync().ref(this.props.wdRef).update({
            bgUrl: `http://${file.url}`,
        }).then((shot) => {
            global.$snackbar.fn.show('更换成功', 2000);
        });
    };


    render() {
        let that = this;
        const css = that.props.classes;
        let stream = this.props.wdStream;
        let page = that.props.data || {};

        return h('div', {
            className: css.pageBox,
            style: that.props.style,
        }, page ? h('div', {
            className: css.page,
        }, [
            page.bgUrl ? h('img', {
                className: css.bgImg,
                src: page.bgUrl,
            }) : undefined,
            h('div', {
                className: css.index,
            }, page.index),
            that.props.mode == 'edit' ? h('div', {
                className: css.delete,
                onClick: that.deletePage,
            }, h(FontA, { name: 'close' })) : undefined,
            that.props.mode == 'edit' ? h(MyUpload, {
                style: uploadBtnStyle,
                children: h('div', {}, [
                    h(FontA, { name: 'image' }),
                    h('span', ' 更换'),
                ]),
                success: that.changeBgUrl,
            }) : undefined,
        ]) : h('div', {
            className: css.placeholder,
        }, '读取数据失败，请刷新重试'));
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
