/*
弹窗列表元素，全局唯一使用
输出函数$fn.show(opt:{
    title,
    text,
    itemArr,数组
    item,当前选择的值
    labelKey,字符串，指定用哪一项做菜单文字，默认title
    okHandler(item),
    cancelHandler(),
});
*/
import React from 'react';
import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import ButtonBase from 'material-ui/ButtonBase';
import List, { ListItem } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
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
    content: {
        padding: 0,
    },
    listItem: {
        padding: 0,
    },
    btn: {
        width: '100%',
        height: 56,
        color: '#AAA',
    },
    btnOn: {
        width: '100%',
        height: 56,
        color: '#000',
    },
    foot: {
        borderTop: '1px solid #CCC',
        padding: 0,
    },
    head: {
        borderBottom: '1px solid #CCC',
    },
});


var $fn = {};

class MyComponent extends Component {
    state = {
        open: false,
        title: null,
        text: null,
        item: null,
        itemArr: null,
        labelKey: 'title',
        okHandler: () => {},
        cancelHandler: () => {},
    };

    //打开底部的提示
    show = $fn.show = (opt) => {
        if(!opt) return;
        let that = this;
        that.setState({
            open: true,
            title: opt.title || '',
            text: opt.text || '',
            item: opt.item || null,
            itemArr: opt.itemArr || null,
            highlight: opt.highlight || false,
            labelKey: opt.labelKey || 'title',
            okHandler: opt.okHandler || that.emptyHandler,
            cancelHandler: opt.cancelHandler || that.emptyHandler,
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
            item: null,
            itemArr: null,
            labelKey: 'title',
            okHandler: that.emptyHandler,
            cancelHandler: that.emptyHandler,
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let arr = that.state.itemArr || [];

        let itemElArr = arr.map((item, index) => {
            return h(ListItem, { className: css.listItem }, h(Button, {
                className: item === that.state.item ? css.btnOn : css.btn,
                onClick: () => {
                    that.hide();
                    that.state.okHandler && that.state.okHandler(item);
                },
            }, item[that.state.labelKey]));
        });

        let menuEl = h('div', {}, itemElArr);

        return h(Dialog, {
            open: that.state.open,
            onRequestClose: that.hide,
            className: css.dialog,
        }, [
            h(DialogTitle, { className: css.head }, that.state.title),
            h(DialogContent, { className: css.content }, [
                menuEl,
            ]),
            h('div', { className: css.foot }, [
                h(Button, {
                    style: { height: 56, width: '100%', margin: 0 },
                    onClick: () => {
                        that.hide();
                    },
                    className: css.dialogBtn,
                }, '取 消'),
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
