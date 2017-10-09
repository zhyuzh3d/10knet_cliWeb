/*
用户关注的其他用户列表
{
    userId:用户ID，默认为空使用currentUser.uid
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import FontA from 'react-fa';
import List, { ListItem } from 'material-ui/List';

import NavBar from '../../Units/MainAppBar/NavBar';
import UserButton from '../../Units/User/UserButton';

const style = theme => ({
    userBox: {
        flex: 1,
    },
    userRow: {
        height: 72,
        borderBottom: '1px solid #EEE',
        paddingBottom: 0,
        paddingTop: 0,
    },
    rightArrow: {
        fontSize: 10,
        color: '#CCC',
    },
    tip: {
        width: '100%',
        fontSize: 14,
        fontWeight: 200,
        color: '#AAA',
        textAlign: 'center',
        marginTop: 32,
    },
});

//元件
class com extends Component {
    state = {
        title: '我关注的人',
        contentHeight: window.innerHeight - 48,
        currentUser: null,
        userId: null,
        follows: null,
    };

    //如果usrId为空则使用当前用户uid
    componentWillMount = async function() {
        let that = this;
        var userId = global.$store('FollowListPage', 'userId');
        if(userId) {
            that.setState({ userId: userId });
            that.getFollowList(userId);
        } else {
            this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
                var cuser = global.$wd.auth().currentUser;
                if(cuser) {
                    that.setState({
                        currentUser: cuser,
                        userId: cuser.uid
                    });
                    that.getFollowList(cuser.uid);
                };
            });
        };
    };

    componentDidMount = async function() {
        window.addEventListener('resize', this.setContentSize);
    };

    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.setContentSize);
    };

    //获取user字段下的用户信息
    getFollowList = (userId) => {
        let that = this;
        global.$wd.sync().ref(`follow/${userId}`).once('value', (shot) => {
            let follows = shot.val();
            follows && that.setState({ follows: follows });
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;

        let followArr = [];
        let follows = that.state.follows;
        if(follows) {
            for(let key in follows) {
                followArr.push(h(ListItem, {
                    className: css.userRow,
                    button: true,
                    onClick: () => {
                        global.$router.changePage('UserDetailPage', {
                            userId: key,
                        });
                    },
                }, [
                    h(Grid, {
                        item: true,
                        className: css.userBox
                    }, h(UserButton, { userId: key, size: 'lg', asButton: false })),
                    h(Grid, {
                        item: true,
                        className: css.rightArrow
                    }, h(FontA, { name: 'chevron-right' })),
                ]));
            };
        } else {
            followArr.push(h('div', { className: css.tip }, '...您还没有关注其他用户...'));
        };

        let content = h(List, {}, followArr);

        //最终拼合
        let contentStyle = {
            padding: 16,
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };
        return h(Grid, { container: true, }, [
            h(NavBar, { title: that.state.title }),
            h(Grid, { container: true, style: { height: 56 } }),
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
