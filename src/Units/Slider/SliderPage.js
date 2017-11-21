/*
幻灯片单页，支持edit模式和play模式，play模式自带画板图层

props:{
    pageId,页面路径的key
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
        border: '1px solid #AAA',
    },
    page: {
        padding: 16,
        position: 'relative',
        fontSize: 0,
        minHeight: 96,
    },
    pos: {
        display: 'inline-block',
        padding: 4,
        background: '#AAA',
        textAlign: 'center',
        fontSize: 12,
        width: 24,
        verticalAlign: 'top',
        height: 14,
    },
    indexBox: {
        position: 'absolute',
        color: '#FFF',
        top: 0,
        left: 0,
    },
    upDown: {
        verticalAlign: 'top',
        display: 'inline-block',
        padding: 2,
        background: '#AAA',
        textAlign: 'center',
        fontSize: 15,
        width: 24,
        borderLeft: '1px solid #FFF',
        cursor: 'pointer',
        height: 18,
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

    //向上或下移动，从路径裁切到id，然后找到前一个或后一个，颠倒index值
    moveUp = (down) => {
        let that = this;
        let path = that.props.wdRef;
        if(!path) return;

        path = path.replace(/\/$/, '');
        let key = path.replace(/.*\//g, '');
        let sliderPath = path.substr(0, path.length - key.length - 1);

        //获取全部页面顺序然后排序再保存
        let ref = global.$wd.sync().ref(sliderPath);
        ref.once('value', (shot) => {
            let data = shot.val();
            if(!data) return;

            let arr = global.$fn.sortObjByKey(data, 'pos');
            if(arr < 1) return;

            let cur = -1;
            for(let i = 0; i < arr.length; i++) {
                arr[i].pos = i; //强力修正顺序
                if(arr[i].key === key) cur = i;
            };
            if(cur === -1) return;

            if(!down) {
                if(cur === 0) return;
                arr[cur].pos = cur - 1;
                arr[cur - 1].pos = cur;
            } else {
                if(cur === arr.length - 1) return;
                arr[cur].pos = cur + 1;
                arr[cur + 1].pos = cur;
            };

            let newData = {};
            arr.forEach((item, index) => {
                let k = item.key;
                delete item.key;
                newData[k] = item;
            });

            ref.update(newData).catch((err) => {
                global.$snackbar.fn.show(`排序失败:${err.message}`, 3000);
            });
        });
    }

    render() {
        let that = this;
        const css = that.props.classes;
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
            that.props.mode === 'edit' ? h('div', {
                className: css.indexBox,
            }, [
                h('div', {
                    className: css.pos,
                }, page.pos + 1),
                h('div', {
                    className: css.upDown,
                    onClick: () => {
                        that.moveUp(false);
                    },
                }, h(FontA, { name: 'caret-up' })),
                h('div', {
                    className: css.upDown,
                    onClick: () => {
                        that.moveUp(true);
                    },
                }, h(FontA, { name: 'caret-down' })),
            ]) : undefined,

            that.props.mode === 'edit' ? h('div', {
                className: css.delete,
                onClick: that.deletePage,
            }, h(FontA, { name: 'close' })) : undefined,
            that.props.mode === 'edit' ? h(MyUpload, {
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
