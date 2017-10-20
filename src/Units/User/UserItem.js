/*
单个用户项
props:{
    userId,用户的ID，这里会自动读取用户头像姓名信息
    currentUser:当前用户，用于判断是否显示菜单
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { ListItem } from 'material-ui/List';
import FontA from 'react-fa';



const style = theme => ({
    item: {
        padding: '8px 16px',
        borderBottom: '1px solid #EEE',
    },
    itemIcon: {
        margin: 8,
        width: 48,
    },
    itemArrow: {
        fontSize: 8,
        color: '#AAA',
        width: 56,
        textAlign: 'center',
    },
    itemFollow: {
        fontSize: 8,
        width: 56,
        textAlign: 'center',
    },
    itemText: {
        margin: 8,
        flex: 1,
    },
    itemTitle: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#333',
    },
    itemTime: {
        fontSize: 8,
        fontWeight: 200,
        color: '#AAA',
        verticalAlign: 'middle',
    },
    avatar: {
        width: 32,
        height: 32,
        background: '#EEE',
        borderRadius: 48,
        verticalAlign: 'middle',
    },
    itemBtn: {
        width: 56,
        minWidth: 56,
    }
});

//元件
class com extends Component {
    state = {
        item: null,
        hasFollow: false,
    };

    componentWillMount = async function() {
        let that = this;
        if(global.$wd.auth().currentUser) {
            that.getUserInfo();
        } else {
            that.wdAuthListen = global.$wd.auth().onAuthStateChanged((user) => {
                that.getUserInfo();
            });
        }
    };

    //读取用户信息以及关注状态
    getUserInfo = () => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        let userId = that.props.userId;

        global.$wd.sync().ref(`user/${userId}/`).once('value', (shot) => {
            that.setState({ item: shot.val() });
        });

        let cuserId = cuser ? cuser.uid : undefined;
        if(!cuser) {
            global.$snackbar.fn.show(`您还没有登录，不能关注`, 3000);
            return;
        };
        global.$wd.sync().ref(`ufollow/${cuserId}/${userId}`).once('value', (shot) => {
            let followed = shot.val() ? true : false;
            that.setState({ hasFollow: followed });
        });
    };


    //点击跳转打开用户详情页面
    clickHandler = () => {
        let that = this;
        global.$router.changePage('UserDetailPage', {
            userId: that.props.userId,
        });
    };

    //关注当前用户
    followUser = () => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        let cuserId = cuser ? cuser.uid : undefined;
        let userId = that.props.userId;
        if(!cuser) {
            global.$snackbar.fn.show(`您还没有登录，不能关注`, 3000);
            return;
        };

        global.$wd.sync().ref(`ufollow/${cuserId}/${userId}`).update({
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
        }).then((res) => {
            that.setState({ hasFollow: true });
            global.$snackbar.fn.show(`关注成功`, 2000);
        }).catch((err) => {
            global.$snackbar.fn.show(`关注失败:${err.message}`, 3000);
        });
    };

    //取消关注当前用户
    unFollowUser = () => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        let cuserId = cuser ? cuser.uid : undefined;
        let userId = that.props.userId;
        if(!cuser) {
            global.$snackbar.fn.show(`您还没有登录，不能取消关注`, 3000);
            return;
        };

        global.$wd.sync().ref(`ufollow/${cuserId}/${userId}`).remove().then((res) => {
            that.setState({ hasFollow: false });
            global.$snackbar.fn.show(`取消关注成功`, 2000);
        }).catch((err) => {
            global.$snackbar.fn.show(`取消关注失败:${err.message}`, 3000);
        });
    };


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let item = that.state.item;

        let itemEl = h(ListItem, {
            className: css.item,
            button: true,
        }, [
            h(Grid, { container: true, align: 'center' }, [
                h(Grid, {
                    item: true,
                    className: css.itemIcon,
                    onClick: that.clickHandler,
                }, h('img', {
                    className: css.avatar,
                    width: 32,
                    height: 32,
                    src: item && item.photoURL ? `http://${item.photoURL}` : global.$conf.defaultIcon,
                })),
                h(Grid, {
                    item: true,
                    className: css.itemText,
                    onClick: that.clickHandler,

                }, h('div', { className: css.itemTitle }, [
                     item && item.displayName ? item.displayName : '未命名用户',
                ])),
                h(Grid, {
                    item: true,
                    className: css.itemFollow,
                    onClick: () => {
                        if(!that.state.hasFollow) {
                            that.followUser();
                        } else {
                            that.unFollowUser();
                        }
                    },
                }, h(Button, { color: 'accent', className: css.itemBtn }, [
                    h(FontA, { name: that.state.hasFollow ? 'heart' : 'heart-o' }),
                ])),
                h(Grid, {
                    item: true,
                    className: css.itemArrow,
                    onClick: that.clickHandler,
                }, h(FontA, { name: 'chevron-right' })),
                        ]), ]);
        return itemEl;
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
