/*
导航专用顶部栏，包含左侧的返回按钮（返回上一页）和面包屑导航标题，右侧用户头像菜单
props:{
    title:导航栏显示的标题，默认 资源管理中心，可以是元素数组[]
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import ButtonBase from 'material-ui/ButtonBase';
import IconButton from 'material-ui/IconButton';
import FontA from 'react-fa';
import Typography from 'material-ui/Typography';
import Menu, { MenuItem } from 'material-ui/Menu';
import Avatar from 'material-ui/Avatar';

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
    componentDidMount = async function() {
        let that = this;
        global.$wd.auth().onAuthStateChanged(function(user) {
            if(global.$wd.auth().currentUser) {
                that.setState({ currentUser: user });
            } else {
                that.setState({ currentUser: null });
            };
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        const title = that.props.title || that.state.title;
        const winTitle = that.props.winTitle || '控制台';
        let cuser = that.state.currentUser;

        document.getElementsByTagName('title')[0].innerHTML = winTitle;

        //用户头像
        let userIconArr = [
            h(Avatar, {
                className: css.appAvatar,
                src: cuser && cuser.photoURL ? `http://${cuser.photoURL}-thumb64` : global.$conf.defaultIcon
            }),
            h(Typography, { type: 'caption', className: css.uname }, cuser && cuser.displayName ? cuser.displayName : '未知用户'),
        ];

        //用户头像下拉菜单
        let userMenuArr = [
            h(MenuItem, {
                disabled: !that.state.currentUser,
                onClick: () => {
                    global.$router.changePage('ProfilePage', {
                        successPage: global.$router.currentPage,
                    });
                },
            }, '修改资料'),
            h(MenuItem, {
                disabled: !that.state.currentUser,
                onClick: () => {
                    if(global.$wd.auth().currentUser) {
                        global.$wd.auth().signOut().then(function(user) {
                            global.$snackbar.fn.show('退出成功', 2000);
                        }).catch(function(error) {
                            global.$alert.fn.show('退出失败，请重试', error.message);
                        });
                    } else {
                        global.$alert.fn.show('您还没有登录', '请登录后再试');
                    };
                },
            }, '退出登录'),
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
                            global.$router.prevPage();
                        }
                    }, h(FontA, { name: 'chevron-left' })),
                    h(ButtonBase, {
                        className: css.baseButton,
                        onClick: (evt) => {
                            global.$router.changePage('MainHomePage');
                        }
                    }, '首页'),
                    h('span', { className: css.dividerV }, '|'),
                ]),
                h(Typography, { type: 'title', className: css.flex }, title),
                h('div', {}, [
                    h(Button, {
                        className: css.appUserBtn,
                        onClick: (evt) => {
                            that.setState({
                                userMenuOpen: !that.state.userMenuOpen,
                                userMenuAnchor: evt.currentTarget,
                            })
                        },
                    }, userIconArr),
                    h(Menu, {
                        open: that.state.userMenuOpen,
                        anchorEl: that.state.userMenuAnchor,
                        onRequestClose: () => { that.setState({ userMenuOpen: false }) },
                    }, userMenuArr),
                ]),
            ]),
        ]);

        return topBar;
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
