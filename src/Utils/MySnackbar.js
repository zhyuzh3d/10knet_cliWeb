/*
提示信息元素，全局唯一使用
输出函数$fn.show(element／title, duration);
*/
import React from 'react';
import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Snackbar from 'material-ui/Snackbar'; //底部统一的提示

var $fn = {};
const _style = theme => ({});


class MyComponent extends Component {
    state = {
        reactVersion: React.version, //去除unuse警告
        open: false,
        element: null,
        duration: 3000,
    }

    //打开底部的提示
    show = $fn.show = (element, duration) => {
        this.setState({
            open: true,
            element: element,
            duration: duration || 100000,
        });
    };

    //关闭底部的提示
    hide = $fn.hide = () => {
        this.setState({
            open: false,
            element: null,
        });
    };

    //渲染实现
    render() {
        let that = this;
        return h('div', {}, [

            h(Snackbar, {
                open: that.state.open,
                autoHideDuration: that.state.duration,
                onRequestClose: that.hide,
                message: that.state.element || '...',
            }),
        ]);
    };
};

MyComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};
MyComponent = withStyles(_style)(MyComponent);
MyComponent.fn = $fn;

export default MyComponent;
