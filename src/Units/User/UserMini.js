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

import ButtonBase from 'material-ui/ButtonBase';

const style = theme => ({
    user: {
        verticalAlign: 'middle',
        paddingLeft: 0,
    },
    userImg: {
        width: theme.spacing.unit * 2,
        height: theme.spacing.unit * 2,
        borderRadius: theme.spacing.unit * 2,
        background: '#EEE',
        border: '1px solid #CCC',
        verticalAlign: 'middle',
        marginRight: theme.spacing.unit,
    },
    userName: {
        fontSize: 8,
        fontWeight: 200,
        color: '#888',
        display: 'inline-block',
        marginRight: theme.spacing.unit,
    },
});

//元件
class com extends Component {
    state = {
        user: {},
    };

    //界面生成之前，读取数据
    componentWillReceiveProps = async function() {
        let that = this;
        let userId = that.props.userId;
        global.$wd.sync().ref(`user/${userId}`).once('value', (shot) => {
            let user = merge({ uid: userId }, shot.val() || {});
            that.setState({ user: user });
        });
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {};

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let user = that.state.user;

        return h(ButtonBase, {
            className: css.user,
            onClick: () => {
                global.$router.changePage('UserDetailPage', { userId: user.uid });
            },
        }, [
            h('img', {
                src: user.photoURL ? `http://${user.photoURL}-thumb64` : global.$conf.defaultIcon,
                className: css.userImg,
            }),
            h('span', { className: css.userName }, user.displayName || '无名'),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
