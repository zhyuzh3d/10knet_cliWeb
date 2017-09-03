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
    show = $fn.show = (ele, dur) => {
        this.setState({
            open: true,
            element: ele,
            duration: dur || 3000,
        });
    };

    //关闭底部的提示
    hide = $fn.hide = (ele) => {
        this.setState({
            open: false,
            element: null,
        });
    };

    //渲染实现
    render() {
        let that = this;
        return h(Snackbar, {
            open: that.state.open,
            autoHideDuration: that.state.duration,
            onRequestClose: that.hide,
            message: that.state.element || '...',
        });
    };
};

MyComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};
MyComponent = withStyles(_style)(MyComponent);
MyComponent.fn = $fn;

export default MyComponent;
