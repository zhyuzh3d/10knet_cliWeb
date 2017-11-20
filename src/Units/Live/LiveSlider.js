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

import SliderPage from '../../Units/Slider/SliderPage';


const style = theme => ({
    comBox: {
        margin: 0,
        padding: 0,
    },
});

//元件
class com extends Component {
    state = {
        sliderId: null,
        conf: null, // {width,height,currentPage...}
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
    startSync = global.$live.test = () => {
        let that = this;
        let ref = global.$wd.sync().ref(`${that.props.wdRef}`);
        that.wdRefArr.push(ref);

        ref.on('value', (shot) => {
            let islider = shot.val();

            console.log('>>>>liveslider start sync', islider);

            if(!islider || !islider.sliderId) return;
            that.setState({
                sliderId: islider.sliderId,
                conf: islider.conf,
            });

            let sref = global.$wd.sync().ref(`slider/${islider.sliderId}`);
            that.wdRefArr.push(sref);
            sref.once('value', (shot) => {
                that.setState({
                    slider: shot.val(),
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

    }

    //向下翻页，主持人
    prevPage = (editor, data) => {
        let that = this;

    }

    onChair = false;

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        //如果主持身份发生变化，那么启动或者暂停代码同步
        if(that.onChair !== that.props.onChair) {
            if(that.props.onChair) {
                that.stopSync();
            } else {
                that.stopSync();
                that.startSync();
            }
        };

        let pageId;

        return h('div', {
            className: css.codersBox,
        }, [
           h(SliderPage, {
                pageId: pageId,
                wdRef: null,
                data: null,
                mode: 'play',
                style: {},
            }),
            h('h2', 'hello!'),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
