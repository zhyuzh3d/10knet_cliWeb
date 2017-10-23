/*
用户详情页面，用于关注用户，呼叫用户等内容
{
    userId:用户ID
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';

import NavBar from '../../Units/MainAppBar/NavBar';
import merge from 'deepmerge';

import BasketList from '../../Units/Basket/BasketList';


const style = theme => ({
    uBox: {
        textAlign: 'left',
        marginTop: 24,
        marginRight: 16,
        borderRight: '1px solid #EEE'
    },
    btnBox: {
        textAlign: 'left',
        marginTop: 16,
    },
    uName: {
        marginTop: 8,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    uImg: {
        width: 64,
        height: 64,
        borderRadius: 96,
        background: '#EEE',
        marginLeft: 24,
        marginRight: 8,
    },
    followBtn: {
        marginTop: 8,
        minHeight: 32,
        height: 32,
        fontSize: 12,
    },
    assetBtn: {
        marginTop: 8,
        width: 96,
    },
    label: {
        background: '#FFF',
        width: '100%',
        height: 24,
        paddingLeft: 24,
        marginTop: 16,
        fontSize: 12,
        color: '#AAA',
    },
    userGrp: {
        marginBottom: 16,
    }
});

//元件
class com extends Component {
    state = {
        title: '用户信息',
        user: {},
        contentHeight: window.innerHeight - 48,
        currentUser: null,
        hasFollowed: true,
    };

    componentWillMount = async function() {
        let that = this;
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            let userId = global.$store('UserDetailPage', 'userId');
            if(cuser && userId) {
                that.setState({ currentUser: cuser });
                that.checkForFollow(cuser.uid, userId);
            };
        });
    };

    componentDidMount = async function() {
        window.addEventListener('resize', this.setContentSize);
        this.state.userId = global.$store('UserDetailPage', 'userId');
        this.state.userId && this.getUserInfo(this.state.userId);
    };

    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.setContentSize);
    };

    //检查是否已经关注过了
    checkForFollow = (currentUserId, userId) => {
        let that = this;
        global.$wd.sync().ref(`ufollow/${currentUserId}/${userId}`).once('value', (shot) => {
            !shot.val() && that.setState({ hasFollowed: false });
        });
    };

    //获取user字段下的用户信息
    getUserInfo = (userId) => {
        let that = this;
        global.$wd.sync().ref(`user/${userId}`).once('value', (shot) => {
            let user = merge({ uid: userId }, shot.val() || {});
            that.setState({ user: user });
        });
    };

    //关注此用户
    followUser = () => {
        let that = this;
        const userId = this.state.userId;
        const curUserId = this.state.currentUser ? this.state.currentUser.uid : undefined;
        if(!userId || !curUserId) {
            global.$alert.show('您还没有登录，无法添加关注', '请登陆后再试');
            return;
        };

        global.$wd.sync().ref(`ufollow/${curUserId}/${userId}`).update({
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
        }).then((res) => {
            that.setState({ hasFollowed: true });
            global.$snackbar.fn.show('关注成功', 1000);
        }).catch((err) => {
            global.$snackbar.fn.show(`关注失败:${err.message}`, 3000);
        });
    };

    //关注此用户
    unFollowUser = () => {
        let that = this;
        const userId = this.state.userId;
        const curUserId = this.state.currentUser ? this.state.currentUser.uid : undefined;
        if(!userId || !curUserId) {
            global.$alert.show('您还没有登录，无法添加关注', '请登陆后再试');
            return;
        };

        global.$wd.sync().ref(`ufollow/${curUserId}/${userId}`).remove().then((res) => {
            that.setState({ hasFollowed: false });
            global.$snackbar.fn.show('取消关注成功', 1000);
        }).catch((err) => {
            global.$snackbar.fn.show(`取消关注失败:${err.message}`, 3000);
        });
    };


    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;
        var uPhoto = that.state.user.photoURL ? `http://${that.state.user.photoURL}-thumb128` : global.$conf.defaultIcon;

        let content = h('div', {}, [
            h(Grid, { container: true, justify: 'flex-start', className: css.userGrp }, [
                h(Grid, { item: true, className: css.uBox }, [
                    h('img', {
                        className: css.uImg,
                        src: uPhoto,
                    }),
                ]),
                h(Grid, { item: true, className: css.btnBox }, [
                    h('div', {
                        className: css.uName,
                    }, that.state.user.displayName || '未知用户名'),
                    h(Button, {
                        className: css.followBtn,
                        raised: true,
                        color: that.state.hasFollowed ? 'default' : 'accent',
                        disabled: !that.state.userId || !that.state.currentUser,
                        onClick: () => {
                            if(that.state.hasFollowed) {
                                that.unFollowUser();
                            } else {
                                that.followUser();
                            };
                        },
                    }, [
                        h(FontA, { name: 'heart', style: { marginRight: 12 } }),
                        h('span', that.state.hasFollowed ? '取消关注' : '关注'),
                    ]),
                ]),
            ]),
            h('div', { className: css.label }, 'TA收集的素材'),
            h(BasketList, {
                userId: that.state.user ? that.state.user.uid : undefined,
            }, 'hh'),
        ]);

        //最终拼合
        let contentStyle = {
            padding: '24px 8px',
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };
        return h('div', { container: true, }, [
            h(NavBar, { title: that.state.title }),
            h(Grid, { container: true, justify: 'center' },
                h(Grid, { item: true, xs: 12, style: contentStyle }, content),
            ),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
