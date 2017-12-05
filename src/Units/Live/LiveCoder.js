/*
共用编辑器界面，代码、设置、动作都指向同一个路径
props:{
    wdRef,同步设置的路径,未指定路径时候整个编辑器禁用
    onChair,是否主持当前代码编写
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';

import MyCoder from '../../Utils/MyCoder';
import OJlist from '../../Units/OJ/OJlist';
import OJdetails from '../../Units/OJ/OJdetails';


const style = theme => ({
    comBox: {
        margin: 0,
        padding: 0,
    },
    coderBox: {
        position: 'relative',
        height: '100%',
        width: '60%',
    },
    OJbox: {
        position: 'relative',
        width: '40%',
    },
});

//元件
class com extends Component {
    state = {
        value: '',
        editorPublic: {}, //用来放置子编辑器传递出来的函数
        editorMode: 'text/x-c++src',
        OJpage: 'list', //显示OJ的页面
        OJid: null, //OJ详细页面的ID，
    };

    componentWillMount = async function() {};

    setContentSize = () => {};

    componentDidMount = async function() {
        if(!this.props.onChair) {
            this.startSync();
        } else {
            this.stopSync();
        }
    };

    componentWillUnmount = async function() {
        this.stopSync();
    };

    //开始同步代码
    startSync = () => {
        let that = this;
        let ref = global.$wd.sync().ref(`${that.props.wdRef}`);
        ref.on('value', (shot) => {
            let value = shot.val().value;
            let sel = shot.val().sel;
            if(that.state.editorPublic) {
                that.state.editorPublic.setValue(value || '');
                that.setState({ value: value });
                let selObj = shot.val ? JSON.parse(sel) : {};
                that.state.editorPublic.setSelection(selObj);
            }
        });
    }

    //停止同步代码
    stopSync = () => {
        let that = this;
        global.$wd.sync().ref(`${that.props.wdRef}`).off();
    }

    //代码变化回调函数，同步到野狗数据库
    onChange = (editor, metadata, value) => {
        let that = this;
        if(!that.props.wdRef || !that.props.onChair) return;
        that.setState({ value: value });
        global.$wd.sync().ref(`${that.props.wdRef}/value`).set(value);
    }

    //选择变化回调函数，同步到野狗数据库，不叠加保存
    onSelection = (editor, data) => {
        let that = this;
        if(!that.props.wdRef || !that.props.onChair) return;
        global.$wd.sync().ref(`${that.props.wdRef}/sel`).set(JSON.stringify(data));
    }

    onChair = false;

    //切换到显示详细信息页面
    showOJdetails = (id) => {
        let that = this;
        that.setState({ OJid: id });
        that.setState({ OJpage: 'details' });
    };

    //显示到OJ列表
    showOJlist = () => {
        this.setState({ OJpage: 'list' });
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

        return h(Grid, {
            container: true,
            className: css.comBox,
        }, [
            h('div', {
                className: css.coderBox
            }, h(MyCoder, {
                fontSize: 16,
                value: that.state.value,
                onChange: that.onChange,
                onSelection: that.onSelection,
                public: that.state.editorPublic,
                options: {
                    mode: that.state.editorMode,
                }
            })),
            h('div', {
                className: css.OJbox
            }, [
                that.state.OJpage === 'list' ? h(OJlist, {
                    showDetails: that.showOJdetails,
                }) : null,
                that.state.OJpage === 'details' ? h(OJdetails, {
                    id: that.state.OJid,
                    code: that.state.value,
                    back: that.showOJlist,
                }) : null,
            ]),
        ]);


    };
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};



export default withStyles(style)(com);
