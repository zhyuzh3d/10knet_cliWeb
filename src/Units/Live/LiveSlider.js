/*
PPT互动面板，根据主持人islider尺寸同步缩放大小，带有覆盖层的画板功能
props:{
    wdRef,{sliderId,width,height}房间对应的islider地址
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

import SliderPage from '../../Units/Slider/SliderPage';


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
    btnGrp: {
        float: 'right',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 10,
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
class com extends Component {
    state = {
        sliderId: null,
        pageArr: null,
        curPos: 0,
    };

    wdRefArr = [];

    componentDidMount = async function() {
        this.startSync();
    };

    componentWillReceiveProps = async function() {};

    componentWillUnmount = async function() {
        this.wdRefArr.forEach((item) => {
            item.off();
        });
    };

    //开始同步,并且同步slider数据
    lastSliderRef = null; //上一个同步的slider，避免多个同时存在
    startSync = global.$live.test = () => {
        let that = this;
        let ref = global.$wd.sync().ref(`${that.props.wdRef}`);
        that.wdRefArr.push(ref);

        ref.on('value', (shot) => {

            let islider = shot.val();
            if(!islider || !islider.sliderId) return;
            islider.curPos = islider.curPos || 0;
            that.setState({
                sliderId: islider.sliderId,
                curPos: islider.curPos,
            });

            let sref = global.$wd.sync().ref(`slider/${islider.sliderId}`);

            that.wdRefArr.push(sref); //避免最后一个不能清理
            that.lastSliderRef && that.lastSliderRef.off();
            that.lastSliderRef = sref;

            sref.on('value', (shot) => {
                let slider = shot.val();
                let pageArr = [];
                if(slider && slider.pages) {
                    for(let key in slider.pages) {
                        slider.pages[key].key = key;
                        pageArr.push(slider.pages[key]);
                    };
                };
                pageArr.sort((a, b) => { return a.pos - b.pos });

                that.setState({
                    slider: shot.val(),
                    pageArr: pageArr,
                });
            });
        });
    }

    //停止同步
    stopSync = () => {
        let that = this;
        global.$wd.sync().ref(`${that.props.wdRef}`).off();
        that.state.sliderId && global.$wd.sync().ref(`slider/${that.state.sliderId}`).off();
    }

    //向上翻页,主持人
    nextPage = () => {
        let that = this;
        let arr = that.state.pageArr;
        let pos = that.state.curPos;
        if(arr) {
            let n = pos + 1 < arr.length ? pos + 1 : pos;
            global.$wd.sync().ref(`${that.props.wdRef}`).update({
                curPos: n,
            });
            that.setState({ curPos: n });
        };
    }

    //向下翻页，主持人
    prevPage = (editor, data) => {
        let that = this;
        let arr = that.state.pageArr;
        let pos = that.state.curPos;
        if(arr) {
            let n = pos - 1 >= 0 ? pos - 1 : 0;
            global.$wd.sync().ref(`${that.props.wdRef}`).update({
                curPos: n,
            });
            that.setState({ curPos: n });
        };
    }

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let pageArr = that.state.pageArr;
        let pageId;
        let page;
        if(that.state.pageArr) {
            page = pageArr[that.state.curPos];
            pageId = page ? page.key : undefined;
        };

        let btnGrp = h('div', {
            className: css.btnGrp,
        }, [
            h(Button, {
                className: css.arrBtn,
                raised: true,
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
            }, `${that.state.curPos+1}/${pageArr?pageArr.length:0}`),
            h(Button, {
                className: css.arrBtn,
                raised: true,
                onClick: () => {
                    that.nextPage();
                },
            }, [
                h(FontA, { name: 'arrow-right' })
            ])
        ]);

        return h('div', {
            className: css.comBox,
        }, [
            page && that.props.onChair ? btnGrp : undefined,
            page ? h(SliderPage, {
                pageId: pageId,
                wdRef: null,
                data: page,
                mode: 'play',
                style: {
                    boxShadow: 'none',
                    border: 'none',
                    marginTop: 0,
                },
            }) : h('div', {
                className: css.empty,
            }, '...正在等待同步，请稍后...'),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
