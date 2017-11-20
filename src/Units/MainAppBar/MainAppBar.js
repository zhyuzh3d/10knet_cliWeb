/*
Main窗口专用顶部导航，包含左侧的菜单下来按钮和右侧的用户头像下拉按钮。
用于顶级页面。
props:{
    title:导航栏显示的标题，默认 资源管理中心
    winTitle:窗口的标题，默认 控制台
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import merge from 'deepmerge';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import FontA from 'react-fa';
import Typography from 'material-ui/Typography';
import Menu, { MenuItem } from 'material-ui/Menu';

import UserMenu from '../../Units/User/UserMenu';

const style = theme => ({
    appBar: {
        boxShadow: 'none',
        height: 48,
        minHeight: 48,
        position: 'relative',
        width: 360,
        padding: 0,
    },
    flex: {
        flex: 1,
        fontSize: '0.9rem',
    },
});


//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        hasLogin: false,
        title: '资源管理',
        currentUser: null,
    };

    //界面初始化之前的函数
    componentWillMount = async function() {};

    //界面完成后的初始化函数:判断用户是否登录，创建userMenu
    wdAuthListen = null;
    componentDidMount = async function() {
        let that = this;
        that.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(!cuser) return;
            global.$wd.sync().ref(`user/${cuser.uid}`).once('value', (shot) => {
                cuser = merge(cuser, shot.val() || {});
                !that.hasUnmounted && that.setState({ currentUser: cuser });
            });
        });
    };

    hasUnmounted = false;
    componentWillUnmount = async function() {
        this.hasUnmounted = true;
        this.wdAuthListen && this.wdAuthListen();
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        const title = that.props.title || that.state.title;
        //const winTitle = that.props.winTitle || '10knet:拾课网';
        //document.getElementsByTagName('title')[0].innerHTML = winTitle;


        //导航栏下拉菜单
        let barMenuArr = [h(MenuItem, {
                disabled: !global.$electron,
                onClick: () => {
                    global.$ipc.run(`if(!slaveWindow)initSlave();`);
                    global.$ipc.run(`slaveWindow.restore();`);
                    that.setState({
                        appMenuOpen: false
                    })
                },
            }, '显示资源窗'),
            h(MenuItem, {
                disabled: !global.$electron,
                onClick: () => {
                    global.$ipc.run(`slaveWindow.hide();`);
                    that.setState({
                        appMenuOpen: false
                    })
                },
            }, '隐藏资源窗'),
        ];

        //导航栏
        let topBar = h(AppBar, {
            color: 'default',
            className: css.appBar,
        }, [
            h(Toolbar, { className: css.appBar }, [
                h('div', {}, [
                    h(IconButton, {
                        onClick: (evt) => {
                            //global.$app.xset({ mainVis: false });
                            that.setState({
                                appMenuOpen: !that.state.appMenuOpen,
                                appMenuAnchor: evt.currentTarget,
                            })
                        }
                    }, h(FontA, { name: 'bars' })),
                    h(Menu, {
                        open: that.state.appMenuOpen,
                        anchorEl: that.state.appMenuAnchor,
                        onRequestClose: () => { that.setState({ appMenuOpen: false }) },
                    }, barMenuArr),
                ]),
                h(Typography, { type: 'title', className: css.flex }, title),
                h(UserMenu),
            ]),
        ]);

        return topBar;
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
