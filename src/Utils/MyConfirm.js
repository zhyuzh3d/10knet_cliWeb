/*
弹窗警告元素，全局唯一使用
输出函数$fn.show(opt:{
    title,
    text,
    okHandler(inputval),
    cancelHandler(inputval),
    input:{
        label,
        tip,
        regx,正则表达式，非法则禁用确定按钮
        value,
    },
    hideCancelBtn,禁用取消按钮
});
*/
import React from 'react';
import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
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
        width: 50,
        margin: theme.spacing.unit,
        marginBottom: theme.spacing.unit * 2,
    },
    textField: {
        width: '100%',
        marginTop: theme.spacing.unit * 2,
    },
});

var $fn = {};

class MyComponent extends Component {
    state = {
        open: false,
        title: null,
        text: null,
        okHandler: () => {},
        cancelHandler: () => {},
        useInput: false,
        inputLabel: '',
        inputTip: '',
        inputValue: '',
        inputRegx: null,
        btnEnbled: true,
    };

    //打开底部的提示
    show = $fn.show = (opt) => {
        if(!opt) return;
        let that = this;
        that.setState({
            open: true,
            title: opt.title || '',
            text: opt.text || '',
            okHandler: opt.okHandler || that.emptyHandler,
            cancelHandler: opt.cancelHandler || that.emptyHandler,
            useInput: opt.input ? true : false,
            inputLabel: opt.input ? opt.input.label : '',
            inputTip: opt.input ? opt.input.tip : '',
            inputValue: opt.input ? opt.input.value : '',
            inputRegx: opt.input ? opt.input.regx : '',
            btnDisabled: opt.input && opt.input.regx && !opt.input.regx.test(opt.input.value)
        });
    };
    emptyHandler = () => {};

    //关闭底部的提示
    hide = $fn.hide = (text) => {
        let that = this;
        that.setState({
            open: false,
            title: null,
            text: null,
            okHandler: that.emptyHandler,
            cancelHandler: that.emptyHandler,
            useInput: false,
            inputLabel: '',
            inputTip: '',
            inputValue: '',
            inputRegx: null,
            btnDisabled: true,
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
                that.state.useInput ? h(TextField, {
                    className: css.textField,
                    label: that.state.inputLabel,
                    placeholder: that.state.inputTip,
                    helperText: that.state.inputTip,
                    value: that.state.inputValue,
                    onChange: (e) => {
                        var val = e.target.value;
                        var regx = that.state.inputRegx;
                        that.setState({
                            inputValue: val,
                            btnDisabled: regx && !regx.test(val),
                        });
                    },
                }) : undefined,
            ]),
            h('div', [
                !that.props.hideCancelBtn ? h(Button, {
                    onClick: () => {
                        that.hide();
                        that.state.cancelHandler();
                    },
                    className: css.dialogBtn,
                }, '取 消') : undefined,
                h(Button, {
                    disabled: that.state.useInput && that.state.btnDisabled,
                    raised: true,
                    color: 'primary',
                    onClick: () => {
                        that.hide();
                        that.state.okHandler(that.state.inputValue);
                    },
                    className: css.dialogBtn,
                }, '确 定'),
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
