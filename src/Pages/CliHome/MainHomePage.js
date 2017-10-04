import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import FontA from 'react-fa';
//import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';
import Menu, { MenuItem } from 'material-ui/Menu';
import Avatar from 'material-ui/Avatar';

//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        hasLogin: false,
        title: '控制台',
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
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        let that = this;
        const css = this.props.classes;
        let cuser = that.state.currentUser;

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
                    global.$router.changePage('ProfilePage', 'MainHomePage');
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
            h(MenuItem, {
                onClick: () => {
                    that.setState({
                        userMenuOpen: false
                    })
                },
            }, h('span', '取消')),
        ];

        //导航栏下拉菜单
        let barMenuArr = [h(MenuItem, {
                disabled: !global.$electron,
                onClick: () => {
                    var send = global.$electron.ipcRenderer.sendSync;
                    send('run', `if(!slaveWindow)initSlave();`);
                    send('run', `slaveWindow.restore();`);
                    that.setState({
                        appMenuOpen: false
                    })
                },
            }, '显示资源窗'),
            h(MenuItem, {
                disabled: !global.$electron,
                onClick: () => {
                    var send = global.$electron.ipcRenderer.sendSync;
                    send('run', `slaveWindow.hide();`);
                    that.setState({
                        appMenuOpen: false
                    })
                },
            }, '隐藏资源窗'),
            h(MenuItem, {
                onClick: () => {
                    that.setState({
                        appMenuOpen: false
                    })
                },
            }, h('span', '取消')),
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
                            that.setState({
                                appMenuOpen: !that.state.appMenuOpen,
                                appMenuAnchor: evt.currentTarget,
                            })
                        }
                    }, h(FontA, { name: 'bars' })),
                    h(Menu, {
                        open: that.state.appMenuOpen,
                        anchorEl: that.state.appMenuAnchor,
                    }, barMenuArr),
                ]),
                h(Typography, { type: 'title', className: css.flex }, '标题'),
                h('div', {}, [
                    h(Button, {
                        className: css.appBarBtn,
                        onClick: (evt) => {
                            that.setState({
                                userMenuOpen: !that.state.userMenuOpen,
                                userMenuAnchor: evt.currentTarget,
                            })
                        }
                    }, userIconArr),
                    h(Menu, {
                        open: that.state.userMenuOpen,
                        anchorEl: that.state.userMenuAnchor,
                    }, userMenuArr),
                ]),
            ]),
        ]);

        //内容区
        let content = h('div', {}, [
                h(Button, {
                onClick: () => {
                    global.$router.changePage('LoginPage', 'MainHomePage');
                },
            }, '打开登录页'),
                h(Button, {
                onClick: () => {
                    console.log('>>>auth', global.$wd.auth().currentUser);
                },
            }, '输出用户信息'),
        ]);

        return h(Grid, { container: true, className: css.page }, [
            h(Grid, { item: true, xs: 12 }, [
               topBar,
            ]),
            h('div', { style: { height: 32 } }),
            h(Grid, { item: true, xs: 12 }, [
               content,
            ]),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
