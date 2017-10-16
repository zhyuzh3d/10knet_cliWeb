import { Component } from 'react';

import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';

import MyUpload from '../../Utils/MyUpload';
import _style from './_style';
import merge from 'deepmerge';

import ModalBar from '../../Units/MainAppBar/ModalBar';



//元件
class com extends Component {
    //数据对象
    state = {
        file: null,
        nick: '',
        title: '修改资料',
        contentHeight: window.innerHeight - 48,
    };

    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    wdAuthListen = null;

    //界面完成后的初始化函数-更新用户已有图标到file
    componentWillMount = async function() {
        let that = this;
        window.addEventListener('resize', this.setContentSize);

        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
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
    componentWillUnmount = async function() {
        this.wdAuthListen && this.wdAuthListen();
        window.removeEventListener('resize', this.setContentSize);
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
            photoURL: url,
            displayName: nick,
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
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

        let content = h(Grid, { container: true, className: css.page }, [
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

        let contentStyle = {
            padding: 16,
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };
        return h(Grid, { container: true, }, [
            h(ModalBar, { title: that.state.title }),
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

export default withStyles(_style)(com);
