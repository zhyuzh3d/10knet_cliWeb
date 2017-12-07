/*
共用编辑器界面，代码、设置、动作都指向同一个路径
props:{
    wdRef,同步设置的路径,未指定路径时候整个编辑器禁用
    roomId,聊天室同步id，可以包含在wdRef中，这里只是方便使用
    onChair,是否主持当前代码编写
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';


import MyCoder from '../../Utils/MyCoder';
import OJlist from '../../Units/OJ/OJlist';
import OJdetails from '../../Units/OJ/OJdetails';


const style = theme => ({
    comBox: {
        margin: 0,
        padding: 0,
        position: 'relative',
    },
    coderBox: {
        position: 'relative',
        height: '100%',
        width: '40%',
    },
    OJbox: {
        position: 'relative',
        width: '60%',
    },
    OJbtn: {
        position: 'absolute',
        right: 0,
        top: 0,
        minWidth: 24,
        minHeight: 24,
        height: 32,
        width: 36,
        zIndex: 10,
    }
});

//元件
class com extends Component {
    state = {
        value: '',
        editorPublic: {}, //用来放置子编辑器传递出来的函数
        editorMode: 'text/x-c++src',
        OJpage: 'list', //显示OJ的页面
        OJid: null, //OJ详细页面的ID，
        lastOJpage: 'list', //上一个OJ页面，用于开关按钮恢复
    };

    wdRefArr = [];
    componentWillMount = async function() {};

    componentDidMount = async function() {
        if(!this.props.onChair) {
            this.startSync();
        } else {
            this.stopSync();
        }
    };

    //切换onChair的时候调整
    oldProps = {};
    componentWillReceiveProps = (newProps) => {
        let that = this;
        newProps = newProps || {};
        let sameRoom = newProps.roomId !== that.oldProps.roomId; //换房间
        let sameChair = newProps.onChair !== that.oldProps.onChair; //换主持
        if(sameRoom || sameChair) {
            //停止旧的监听
            let oldRef = global.$wd.sync().ref(`${that.oldProps.roomId}`);
            oldRef.off();
            //开启新的监听
            that.startSync();
        };
    };

    componentWillUnmount = async function() {
        this.stopSync();
    };

    //开始同步代码，同步oj页面类型
    startSync = () => {
        let that = this;
        if(!that.props.wdRef) return;
        let ref = global.$wd.sync().ref(`${that.props.wdRef}`);
        that.wdRefArr.push(ref);
        ref.on('value', (shot) => {
            let data = shot.val();
            let value = data ? data.value : null;
            let sel = data ? data.sel : null;

            let OJpage = data ? data.OJpage : null;
            if(that.props.onChair) OJpage = that.state.OJpage; //主持人不变OJpage

            if(that.state.editorPublic) {
                that.state.editorPublic.setValue(value || '');
                that.setState({ value: value, OJpage: OJpage });
                let selObj = sel ? JSON.parse(sel) : {};
                that.state.editorPublic.setSelection(selObj || {});
            }
        });
    }

    //停止同步代码
    stopSync = () => {
        let that = this;
        global.$wd.sync().ref(`${that.props.wdRef}`).off();
    }

    //代码变化回调函数，没进房间直接设置value，其他同步到野狗数据库
    onChange = (editor, metadata, value) => {
        let that = this;
        if(!that.props.roomId) {
            that.setState({ value: value });
        };
        if(!that.props.onChair) return;
        global.$wd.sync().ref(`${that.props.wdRef}/value`).set(value);
    }

    //选择变化回调函数，同步到野狗数据库，不叠加保存
    onSelection = (editor, data) => {
        let that = this;
        if(!that.props.wdRef || !that.props.onChair) return;
        global.$wd.sync().ref(`${that.props.wdRef}/sel`).set(JSON.stringify(data));
    }

    onChair = false;

    //切换到显示详细信息页面，同步到ioj
    showOJdetails = (id) => {
        let that = this;
        that.setState({ OJid: id });
        that.setState({ OJpage: 'details' });
        if(that.props.roomId) {
            global.$wd.sync().ref(`${that.props.wdRef}`).update({ OJpage: 'details' });
            global.$wd.sync().ref(`ioj/${that.props.wdRef}/details`).update({ id: id });
        }
    };

    //显示到OJ列表，page页码会由list内部自动同步到ioj
    showOJlist = () => {
        let that = this;
        this.setState({ OJpage: 'list' });
        if(that.props.roomId) {
            global.$wd.sync().ref(`${that.props.wdRef}`).update({ OJpage: 'list' });
        }
    };


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
        that.onChair = that.props.onChair;
        let roomId = that.props.roomId;

        return h(Grid, {
            container: true,
            className: css.comBox,
        }, [
            h('div', {
                className: css.coderBox,
                style: {
                    width: that.state.showOJ ? '100%' : '40%',
                },
            }, h(MyCoder, {
                fontSize: 16,
                value: that.state.value,
                onChange: that.onChange,
                onSelection: that.onSelection,
                public: that.state.editorPublic,
                options: {
                    mode: that.state.editorMode,
                },
            })),
            h('div', {
                className: css.OJbox,
                style: {
                    display: that.state.showOJ ? 'none' : 'block',
                },
            }, [
                that.state.OJpage !== 'details' ? h(OJlist, {
                    showDetails: that.showOJdetails,
                    wdPath: roomId ? `ioj/${roomId}` : undefined,
                    onChair: that.props.onChair || !roomId,
                    roomId: roomId,
                }) : null,
                that.state.OJpage === 'details' ? h(OJdetails, {
                    wdPath: roomId ? `ioj/${roomId}` : undefined,
                    id: that.state.OJid,
                    code: that.state.value,
                    back: that.showOJlist,
                    onChair: that.props.onChair || !roomId,
                    roomId: roomId,
                }) : null,
            ]): null,
            that.props.onChair || !roomId ? h(Button, {
                className: css.OJbtn,
                raised: true,
                color: 'default',
                onClick: () => { that.setState({ showOJ: !that.state.showOJ }) },
            }, h(FontA, {
                name: that.state.showOJ ? 'close' : 'balance-scale'
            })) : null,
        ]);


    };
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};



export default withStyles(style)(com);
