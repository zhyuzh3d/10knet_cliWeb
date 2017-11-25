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

import Button from 'material-ui/Button';
import FontA from 'react-fa';


const style = theme => ({
    comBox: {
        position: 'relative',
        margin: 0,
        padding: 0,
        width: '100%',
        background: '#000',
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
        height: 'calc(100% - 48px)',
        overflowY: 'auto',
    },
    linkView: {
        marginTop: '20%',
    },
    imgView: {
        width: '100%',
    },
    btnGrp: {
        float: 'right',
        position: 'absolute',
        right: 0,
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
var $fn = {};
class com extends Component {
    state = {
        data: null,
        curPos: 0,
        hisArr: [],
        type: 'text',
    };

    wdRefArr = [];

    componentWillReceiveProps = async function() {
        this.checkContentType();
    };

    componentDidMount = async function() {
        this.startSync();
    };

    componentWillUnmount = async function() {
        this.wdRefArr.forEach((item) => {
            item.off();
        });
    };

    //开始同步
    startSync = global.$live.test = () => {
        let that = this;
        let ref = global.$wd.sync().ref(`${that.props.wdRef}/conf`);
        that.wdRefArr.push(ref);

        ref.on('value', (shot) => {
            if(!shot || !shot.val()) return;
            let data = shot.val();
            let hisArr = that.state.hisArr;
            hisArr.push(data);
            that.setState({
                data: data,
                hisArr: hisArr,
                curPos: hisArr.length - 1,
                type: this.checkContentType(data.url),
            });
        });
    }

    //停止同步
    stopSync = () => {
        let that = this;
        global.$wd.sync().ref(`${that.props.wdRef}/conf`).off();
    }

    //上一页
    prevPage = () => {
        let that = this;
        let curPos = that.state.curPos;
        let newPos = curPos - 1;
        if(newPos < 0) newPos = 0;
        if(newPos >= that.state.hisArr.length - 1) newPos = that.state.hisArr.length - 1;
        that.setState({ curPos: newPos });
    }

    //下一页
    nextPage = () => {
        let that = this;
        let curPos = that.state.curPos;
        let newPos = curPos + 1;
        if(newPos < 0) newPos = 0;
        if(newPos >= that.state.hisArr.length - 1) newPos = that.state.hisArr.length - 1;
        that.setState({ curPos: newPos });
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
    showUrl = $fn.showUrl = (opt) => {
        let ref = global.$wd.sync().ref(`${this.props.wdRef}/conf`);
        ref.update({
            author: opt.author || '',
            url: opt.url || '',
        });
    };


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let hisArr = that.state.hisArr;
        let curPos = that.state.curPos;
        let data = that.state.hisArr[curPos];
        let type = data ? this.checkContentType(data.url) : 'none';

        let btnGrp = h('div', {
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
            }, `${curPos+1}/${hisArr.length}`),
            h(Button, {
                className: css.arrBtn,
                raised: true,
                disbaled: String(curPos >= hisArr.length - 1),
                onClick: () => {
                    that.nextPage();
                },
            }, [
                h(FontA, { name: 'arrow-right' })
            ])
        ]);

        //显示内容，自动根据type适配
        let viewEl;
        if(data) {
            if(type === 'image') {
                viewEl = h('img', {
                    className: css.imgView,
                    src: data.url,
                });
            } else {
                viewEl = h(Button, {
                    className: css.linkView,
                }, `链接：${data.url}`);
            };
        }

        return h('div', {
            className: css.comBox,
        }, [
            hisArr.length > 1 && that.props.onChair ? btnGrp : undefined,
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
com.fn = $fn;

export default withStyles(style)(com);
