/*
根据用户uid获取其资源列表
props:{
    userId:如果为空则自动调取当前用户的uid使用
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
    componentWillMount = async function() {
        let that = this;
        global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(!cuser) return;
            global.$wd.sync().ref(`user/${cuser.uid}`).once('value', (shot) => {
                cuser = merge(cuser, shot.val());
                that.setState({ currentUser: cuser });
            });
        });
    };


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let cuser = that.state.currentUser;

        //用户头像
        let userIconArr = [
            h(Avatar, {
                className: css.img,
                src: cuser && cuser.photoURL ? `http://${cuser.photoURL}-thumb64` : global.$conf.defaultIcon
            }),
            h(Typography, {
                type: 'caption',
                className: css.uName
            }, cuser && cuser.displayName ? cuser.displayName : '未知用户'),
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
