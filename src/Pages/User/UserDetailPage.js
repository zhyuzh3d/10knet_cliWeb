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
import AssetList from '../../Units/Asset/AssetList';
import merge from 'deepmerge';

const style = theme => ({
    uBox: {
        textAlign: 'center',
        marginTop: 48,
    },
    btnBox: {
        textAlign: 'center',
        marginTop: 16,
    },
    uName: {
        marginTop: 8,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    uImg: {
        width: 96,
        height: 96,
        borderRadius: 96,
        background: '#EEE',
    },
    followBtn: {
        marginTop: 24,
        marginRight: 8,
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
        global.$wd.sync().ref(`follow/${currentUserId}/${userId}`).once('value', (shot) => {
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

        global.$wd.sync().ref(`follow/${curUserId}/${userId}`).update({
            ts: global.$wd.sync().ServerValue.TIMESTAMP
        }).then((res) => {
            that.setState({ hasFollowed: true });
            global.$snackbar.fn.show('关注成功', 1000);
        }).catch((err) => {
            global.$snackbar.fn.show(`关注失败:${err.message}`, 3000);
        });
    };



    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;
        var userId = global.$store('AssetListPage', 'userId');
        var uPhoto = that.state.user.photoURL ? `http://${that.state.user.photoURL}-thumb128` : global.$conf.defaultIcon;

        let content = h(Grid, { container: true, justify: 'center' }, [
            h(Grid, { item: true, xs: 12, className: css.uBox }, [
                h('img', {
                    className: css.uImg,
                    src: uPhoto,
                }),
                h('div', {
                    className: css.uName,
                }, that.state.user.displayName),
            ]),
            h(Grid, { item: true, xs: 12, className: css.btnBox }, [
                h(Button, {
                    className: css.followBtn,
                    raised: true,
                    color: 'accent',
                    disabled: that.state.hasFollowed || !that.state.userId || !that.state.currentUser,
                    onClick: () => {
                        that.followUser();
                    },
                }, [
                    h(FontA, { name: 'heart', style: { marginRight: 12 } }),
                    h('span', '关注'),
                ]),
                h(Button, {
                    className: css.assetsBtn,
                    raised: true,
                    color: 'primary',
                    disabled: !that.state.userId,
                    onClick: () => {
                        global.$router.changePage('AssetListPage', {
                            userId: that.state.userId,
                        });
                    },
                }, [
                    h(FontA, { name: 'list', style: { marginRight: 12 } }),
                    h('span', 'TA的素材'),
                ]),
            ]),
        ]);

        //最终拼合
        let contentStyle = {
            padding: 16,
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };
        return h(Grid, { container: true, }, [
            h(NavBar, { title: that.state.title }),
            h(Grid, { container: true, style: { height: 64 } }),
            h(Grid, { container: true, justify: 'center' },
                h(Grid, { item: true, xs: 12, sm: 10, md: 8, style: contentStyle }, content),
            ),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
