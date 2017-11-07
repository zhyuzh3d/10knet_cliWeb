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
import Button from 'material-ui/Button';
import FontA from 'react-fa';

import MyCoder from '../../Utils/MyCoder';
import Menu, { MenuItem } from 'material-ui/Menu';

const style = theme => ({
    codersBox: {
        margin: 0,
        padding: 0,
    },
});

//元件
class com extends Component {
    state = {
        value: '',
        editorPublic: {}, //用来放置子编辑器传递出来的函数
    };

    componentWillMount = async function() {};

    setContentSize = () => {};

    componentDidMount = async function() {
        !this.props.onChair && this.startSync();
    };

    componentWillUnmount = async function() {
        this.stopSync();
    };

    //开始同步代码
    startSync = () => {
        let that = this;
        global.$wd.sync().ref(`${that.props.wdRef}/value`).on('value', (shot) => {
            if(that.state.editorPublic) {
                that.state.editorPublic.setValue(shot.val() || '');
            }
        });
        global.$wd.sync().ref(`${that.props.wdRef}/sel`).on('value', (shot) => {
            if(that.state.editorPublic) {
                let data = shot.val ? JSON.parse(shot.val()) : {};
                that.state.editorPublic.setSelection(data);
            }
        });
    }

    //停止同步代码
    stopSync = () => {
        let that = this;
        global.$wd.sync().ref(`${that.props.wdRef}/value`).off();
        global.$wd.sync().ref(`${that.props.wdRef}/sel`).off();
    }

    //代码变化回调函数，同步到野狗数据库
    onChange = (editor, metadata, value) => {
        let that = this;
        if(!that.props.wdRef || !that.props.onChair) return;
        global.$wd.sync().ref(`${that.props.wdRef}/value`).set(value);
    }

    //选择变化回调函数，同步到野狗数据库，不叠加保存
    onSelection = (editor, data) => {
        let that = this;
        if(!that.props.wdRef || !that.props.onChair) return;
        global.$wd.sync().ref(`${that.props.wdRef}/sel`).set(JSON.stringify(data));
    }

    onChair = false;

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        //如果主持身份发生变化，那么启动或者暂停代码同步
        if(that.onChair != that.props.onChair) {
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
            className: css.codersBox,
        }, [
           h(MyCoder, {
                fontSize: 16,
                value: that.state.value,
                onChange: that.onChange,
                onSelection: that.onSelection,
                public: that.state.editorPublic,
            }),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
