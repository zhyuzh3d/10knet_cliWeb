import React from 'react';
import { Component } from 'react';
import h from 'react-hyperscript';

import Snackbar from 'material-ui/Snackbar'; //底部统一的提示

class MyComp extends Component {
    state = {
        open: false,
        element: null,
        duration: 3000,
    }

    //打开底部的提示
    showSnackbar = global.$fn.showSnackbar = (ele, dur) => {
        this.setState({
            open: true,
            element: ele,
            duration: dur || 3000,
        });
    };

    //关闭底部的提示
    hideSnackbar = global.$fn.hideSnackbar = (ele) => {
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
            onRequestClose: that.hideSnackbar,
            message: that.state.element || '...',
        });
    };
};

export default MyComp;
