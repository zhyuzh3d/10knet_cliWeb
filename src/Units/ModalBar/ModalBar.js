/*
模态窗口专用顶部导航，包含左侧的关闭按钮（返回上一页）
props:{
    title:导航栏显示的标题，默认 资源管理中心
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import FontA from 'react-fa';
import Typography from 'material-ui/Typography';

//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        hasLogin: false,
        title: '控制中心',
        currentUser: null,
    };

    //界面初始化之前的函数
    componentWillMount = async function() {};

    //界面完成后的初始化函数:判断用户是否登录，创建userMenu
    componentDidMount = async function() {};

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let title = that.props.title || that.state.title;

        //导航栏
        let topBar = h(AppBar, {
            color: 'default',
            className: css.appBar,
        }, [
            h(Toolbar, { className: css.appBar }, [
                h(IconButton, {
                    onClick: (evt) => {
                        global.$router.prevPage();
                    }
                }, h(FontA, { name: 'close' })),
                h(Typography, { type: 'title', className: css.flex }, title),
            ]),
        ]);
        return topBar;
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
