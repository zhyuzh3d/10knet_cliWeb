/*
弹窗警告元素，全局唯一使用
输出函数$fn.show(title,text);
*/
import React from 'react';
import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import Dialog, {
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';


//自定义样式
const _style = theme => ({
    dialog: {
        reactVersion: React.version, //去除unuse警告
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
    },
    dialogBtn: {
        width: 120,
        margin: theme.spacing.unit,
        marginBottom: theme.spacing.unit * 2,
    },
});

var $fn = {};

class MyComponent extends Component {
    state = {
        open: false,
        title: null,
        text: null,
    };


    //打开底部的提示
    show = $fn.show = (title, text) => {
        this.setState({
            open: true,
            title: title || '...',
            text: text || '...',
        });
    };

    //关闭底部的提示
    hide = $fn.hide = (text) => {
        this.setState({
            open: false,
            title: null,
            text: null,
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        return h(Dialog, {
            open: that.state.open,
            onRequestClose: that.hide,
            className: css.dialog,
        }, [
            h(DialogTitle, that.state.title),
            h(DialogContent, [
                h(DialogContentText, that.state.text),
            ]),
            h('div', [
                h(Button, {
                    raised: true,
                    onClick: that.hide,
                    className: css.dialogBtn,
                }, '关 闭'),
            ])
        ]);
    };
};

MyComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};
MyComponent = withStyles(_style)(MyComponent);
MyComponent.fn = $fn;

export default MyComponent;
