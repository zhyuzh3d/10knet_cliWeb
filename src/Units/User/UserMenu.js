/*
顶部导航右上角头像和菜单
props:{
    无参数，固定显示当前用户信息
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import merge from 'deepmerge';

import Button from 'material-ui/Button';
import Avatar from 'material-ui/Avatar';
import Typography from 'material-ui/Typography';
import Menu, { MenuItem } from 'material-ui/Menu';

const style = theme => ({
    img: {
        height: 28,
        width: 28,
    },
    uName: {
        width: 60,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    uButton: {},
});

//元件
class com extends Component {
    state = {
        currentUser: {},
    };

    //界面生成之前，读取数据
    wdAuthListen = null;
    componentWillMount = async function() {
        let that = this;
        if(global.$currentUser) {
            that.getCurrentUserInof(global.$currentUser);
        } else {
            this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
                var cuser = global.$wd.auth().currentUser;
                if(!cuser) {
                    that.setState({ currentUser: null });
                    return;
                } else {
                    that.getCurrentUserInof(cuser);
                };
            });
        };
    };

    //获取用户头像
    getCurrentUserInof = (cuser) => {
        let that = this;
        let ref = global.$wd.sync().ref(`user/${cuser.uid}`);
        ref.once('value', (shot) => {
            cuser = merge(cuser, shot.val() || {});
            !this.hasUnmounted && that.setState({ currentUser: cuser });
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
        let cuser = that.state.currentUser;

        let nametxt = cuser && cuser.displayName ? cuser.displayName : (cuser ? '未命名' : '未登录');

        //用户头像
        let userIconArr = [
            h(Avatar, {
                className: css.img,
                src: cuser && cuser.photoURL ? `http://${cuser.photoURL}-thumb64` : global.$conf.defaultIcon
            }),
            h(Typography, {
                type: 'caption',
                className: css.uName
            }, nametxt),
        ];

        //用户头像下拉菜单
        let userMenuArr = [
            !that.state.currentUser ? h(MenuItem, {
                onClick: () => {
                    global.$router.changePage('LoginPage', {
                        successPage: global.$router.currentPage,
                    });
                },
            }, '登录注册') : undefined,
            false && h(MenuItem, {
                disabled: !that.state.currentUser,
                onClick: () => {
                    global.$router.changePage('AssetListPage', {
                        userId: that.state.currentUser.uid,
                    });
                },
            }, '我的素材'),
            false && h(MenuItem, {
                disabled: !that.state.currentUser,
                onClick: () => {
                    global.$router.changePage('FollowListPage', {
                        userId: that.state.currentUser.uid,
                    });
                },
            }, '我的关注'),
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

        return h('div', {}, [
            h(Button, {
                className: css.uButton,
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
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
