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

//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        hasLogin: false,
        title: '控制台',
    };

    //界面初始化之前的函数
    componentWillMount = async function() {};

    //界面完成后的初始化函数:判断用户是否登录，创建userMenu
    componentDidMount = async function() {
        let that = this;
        global.$wd.auth().onAuthStateChanged(function(user) {
            if(global.$wd.auth().currentUser) {
                that.setState({ hasLogin: true });
            };
        });
    };

    //渲染实现
    render() {
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        let that = this;
        const css = this.props.classes;

        let barMenuArr = [h(MenuItem, {
                id: 'appMenu',
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
                onClick: () => {
                    var send = global.$electron.ipcRenderer.sendSync;
                    send('run', `slaveWindow.hide();`);
                    that.setState({
                        appMenuOpen: false
                    })
                },
            }, '隐藏资源窗')];

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
                h(IconButton, {}, h(FontA, { name: 'user' })),
            ]),
        ]);

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
