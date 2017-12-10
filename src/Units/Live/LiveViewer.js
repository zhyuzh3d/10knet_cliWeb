/*
连接互动面板，输出fns.showUrl({author,url})方法，
自动匹配图像、文字、链接;翻页不存储，只临时缓存
props:{
    wdRef,{author,url}房间对应的iviewer地址
    onChair,是否主持人，由外部的panel控制
    style,样式
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import compare from 'just-compare';

import Button from 'material-ui/Button';
import FontA from 'react-fa';


const style = theme => ({
    comBox: {
        position: 'relative',
        margin: 0,
        padding: 0,
        width: '100%',
        background: '#000',
        overflow: 'hidden',
    },
    empty: {
        width: '100%',
        paddingTop: 50,
        fontSize: 12,
        color: '#DDD',
        textAlign: 'center',
    },
    viewBox: {
        position: 'relative',
        textAlign: 'center',
        margin: 0,
        padding: 0,
        height: 'calc(100% - 0px)',
        overflowY: 'auto',
        fontSize: 0,
    },
    linkView: {
        marginTop: '10%',
        zIndex: 5,
    },
    imgView: {
        width: '100%',
    },
    btnGrp: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 10,
        opacity: 0.66,
    },
    arrBtn: {
        Height: 24,
        minHeight: 24,
        width: 48,
        minWidth: 48,
        padding: 0,
        margin: 0,
        fontSize: 12,
        color: '#666',
    },
});

//元件
global.$live = global.$live || {};
class com extends Component {
    state = {
        data: null,
        curPos: 0,
        his: null,
        type: 'text',
    };

    wdRefArr = [];

    componentWillReceiveProps = async function(newProps) {};

    componentWillMount = async function() {
        this.startSync();
    };

    componentWillUnmount = async function() {
        this.wdRefArr.forEach((item) => {
            item.off();
        });
    };

    //开始同步,全部数据从远程读取
    startSync = global.$live.test = () => {
        let that = this;
        let ref = global.$wd.sync().ref(`${that.props.wdRef}`);
        that.wdRefArr.push(ref);

        ref.on('value', (shot) => {
            if(!shot || !shot.val()) return;
            let data = shot.val();
            if(!data.his || data.his.length < 1) return;

            let hisArr = [];
            if(data.his) {
                for(let key in data.his) hisArr.push(data.his[key]);
            };

            let curPos = data.curPos || hisArr.length - 1;
            if(curPos < 0) curPos = 0;
            if(curPos > hisArr.length - 1) curPos = hisArr.length - 1;
            let curData = hisArr[curPos];

            that.setState({
                data: curData,
                his: hisArr,
                curPos: curPos,
                type: curData ? this.checkContentType(curData.url) : 'text',
            });
        });
    }

    //停止同步
    stopSync = () => {
        let that = this;
        global.$wd.sync().ref(`${that.props.wdRef}`).off();
    }

    //上一页
    prevPage = () => {
        let that = this;
        let curPos = that.state.curPos;
        curPos = isNaN(curPos) ? 0 : curPos;
        let newPos = curPos - 1;
        if(newPos < 0) newPos = 0;
        if(newPos >= that.state.his.length - 1) newPos = that.state.his.length - 1;
        that.setState({ curPos: newPos });
        global.$wd.sync().ref(`${that.props.wdRef}`).update({ curPos: newPos });
    }

    //下一页
    nextPage = () => {
        let that = this;
        let curPos = that.state.curPos;
        curPos = isNaN(curPos) ? 0 : curPos;
        let newPos = curPos + 1;
        if(newPos < 0) newPos = 0;
        if(newPos >= that.state.his.length - 1) newPos = that.state.his.length - 1;
        that.setState({ curPos: newPos });
        global.$wd.sync().ref(`${that.props.wdRef}`).update({ curPos: newPos });
    }

    //判断内容的格式，data.type=text,image,link
    checkContentType = (url) => {
        if(!url) return 'none';
        let regx = global.$conf.regx;

        let type = 'text';
        if(regx.imgFile.test(url)) {
            type = 'image';
        } else if(regx.postUrl.test(url)) {
            type = 'link';
        };
        return type;
    };

    //向外输出函数({author,url})
    showUrlInViewer = global.$live.showUrlInViewer = (opt) => {
        let that = this;
        if(compare(that.state.data, opt)) return;

        let curPos = that.state.his && that.state.his ? (that.state.his.length || 0) : 0;
        curPos !== undefined && global.$wd.sync().ref(`${this.props.wdRef}`).update({
            curPos: curPos,
        });
        global.$wd.sync().ref(`${this.props.wdRef}/his`).push({
            author: opt.author || '',
            url: opt.url || '',
        });
    };


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let his = that.state.his;
        let curPos = that.state.curPos || 0;
        let data = that.state.his ? that.state.his[curPos] : null;
        let type = data ? this.checkContentType(data.url) : 'none';

        let btnGrp = data ? h('div', {
            className: css.btnGrp,
        }, [
            h(Button, {
                className: css.arrBtn,
                raised: true,
                disbaled: String(curPos <= 0),
                onClick: () => {
                    that.prevPage();
                },
            }, [
                h(FontA, { name: 'arrow-left' }),
            ]),
            h(Button, {
                className: css.arrBtn,
                style: {
                    borderLeft: '1px solid #AAA',
                    borderRight: '1px solid #AAA',
                    background: '#e0e0e0',
                },
                raised: true,
                disabled: true,
            }, `${curPos+1}/${his.length}`),
            h(Button, {
                className: css.arrBtn,
                raised: true,
                disbaled: String(curPos >= his.length - 1),
                onClick: () => {
                    that.nextPage();
                },
            }, [
                h(FontA, { name: 'arrow-right' })
            ])
        ]) : null;

        //显示内容，自动根据type适配
        let viewEl;
        if(data) {
            if(type === 'image') {
                viewEl = h('img', {
                    className: css.imgView,
                    src: data.url,
                });
            } else {
                viewEl = h('a', {
                    href: data.url,
                    target: '_blank',
                }, h(Button, {
                    raised: true,
                    color: 'primary',
                    className: css.linkView,
                }, `链接：${data.url}`));
            };
        };

        return h('div', {
            className: css.comBox,
        }, [
            his && his.length > 1 && that.props.onChair ? btnGrp : undefined,
            data ? h('div', {
                className: css.viewBox,
            }, viewEl) : h('div', {
                className: css.empty,
            }, '...还没显示内容，请稍后...'),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
