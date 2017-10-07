import { Component } from 'react';

import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import ArrowBackIcon from 'material-ui-icons/ArrowBack';

import MyUpload from '../../Utils/MyUpload';
import _style from './_style';
import merge from 'deepmerge';


//元件
class com extends Component {
    //数据对象
    state = {
        file: null,
        nick: '',
    };

    //界面完成后的初始化函数-更新用户已有图标到file
    componentWillMount = async function() {
        let that = this;
        global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(!cuser) return;
            //合并user字段数据
            global.$wd.sync().ref(`user/${cuser.uid}`).once('value', (shot) => {
                cuser = merge(cuser, shot.val());
                if(cuser && cuser.photoURL && !that.state.file) {
                    that.setState({ file: { url: cuser.photoURL } });
                };
                if(cuser && cuser.displayName && !that.state.nick) {
                    that.setState({ nick: cuser.displayName });
                };
            });
        });
    };

    //控制器-注册新用户
    updateProfile = () => {
        let that = this;
        let nick = that.state.nick;
        let url = that.state.file ? that.state.file.url : undefined;

        if(!global.$wd.auth().currentUser) {
            global.$alert.fn.show('您还没有登录', '请点击下面的文字跳转到登录注册页面');
            return;
        };

        if(!global.$conf.regx.nick.test(nick)) {
            global.$alert.fn.show('昵称格式错误', '请填写1～16位非空字符');
            return;
        };

        if(!url) {
            global.$alert.fn.show('图片还没上传', '请先上传图片');
            return;
        };

        //保存到user字段下
        var uid = global.$wd.auth().currentUser.uid;
        global.$wd.sync().ref(`user/${uid}`).update({
            'photoURL': url,
            'displayName': nick,
        }).then(function(user) {
            global.$snackbar.fn.show('保存成功', 2000);
            global.$router.changePage('ProfilePage$successPage');
        }).catch(function(error) {
            global.$alert.fn.show('保存失败，请重试', error.message);
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        return h(Grid, { container: true, className: css.page }, [
            h(AppBar, { position: 'static', className: css.appBar }, [
                h(Toolbar, { disableGutters: true, className: css.topBar }, [
                    h(IconButton, {
                        color: 'contrast',
                        onClick: () => { global.$router.prevPage() },
                    }, [
                        h(ArrowBackIcon),
                    ]),
                    h(Typography, { color: 'inherit', type: 'subheading' }, '资料设置'),
                ]),
            ]),
            h('div', { style: { height: 24 } }),
            h('div', { className: css.row }, [
                h('div', { className: css.container }, [
                    h(Grid, { item: true, xs: 12 }, [
                       h(MyUpload, {
                            freeze: 10,
                            children: h('img', {
                                className: css.avatarLarge,
                                src: that.state.file ? `http://${that.state.file.url}-thumb256` : global.$conf.defaultIcon,
                            }),
                            success: (file, err, res) => {
                                that.setState({ file: file });
                            },
                        }),
                        h('div', { style: { fontSize: 12, color: '#AAA' } }, '点击图片上传新头像'),
                    ]),
                    h(Grid, { item: true, xs: 12 }, [
                        h(TextField, {
                            className: css.textField,
                            label: '昵称',
                            placeholder: '昵称',
                            helperText: '非空字符，不超过16个',
                            autoComplete: "tel",
                            value: that.state.nick,
                            onChange: (e) => { that.setState({ nick: e.target.value }) },
                        }),
                    ]),
                    h(Grid, { item: true, xs: 12, className: css.forgotPw }, [
                        h(Button, {
                            onClick: () => {
                                global.$router.changePage('LoginPage', {
                                    successPage: global.$router.currentPage,
                                });
                            },
                        }, '还没有登录？'),
                    ]),
                    h(Button, {
                        color: 'primary',
                        raised: true,
                        className: css.loginBtn,
                        onClick: () => { that.updateProfile() },
                    }, '保 存'),
                ]),
            ]),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(_style)(com);
