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
import Icon from 'material-ui/Icon';
import Dialog, {
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

import _style from './_style';

//元件
class com extends Component {
    //数据对象
    state = {
        dialogOpen: false,
        dialogTitle: null,
        dialogText: null,
        iptPhone: null,
        iptPw: null,
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {
        if(global.$wd.auth().currentUser) {
            await global.$wd.auth().signOut();
        };
    };

    //控制器-关闭弹窗
    hCloseDialog = () => {
        this.setState({ dialogOpen: false });
    };

    //控制器-注册新用户
    hCreateUser = () => {
        let that = this;
        let phone = that.state.iptPhone;
        let pw = that.state.iptPw;

        if(!global.$conf.regx.phone.test(phone)) {
            that.setState({
                dialogOpen: true,
                dialogTitle: '手机格式错误',
                dialogText: '请填写真实的11位手机数字',
            });
            return;
        };

        if(!global.$conf.regx.pw.test(pw)) {
            that.setState({
                dialogOpen: true,
                dialogTitle: '密码格式错误',
                dialogText: '请填写6～32位任意字符',
            });
            return;
        };

        global.$wd.auth().createUserWithPhoneAndPassword(phone, pw).then(function(user) {
            global.$fn.showSnackbar('注册成功！', 2000);
            global.$fn.changePage();
        }).catch(function(error) {
            that.setState({
                dialogOpen: true,
                dialogTitle: '注册失败，请重试',
                dialogText: error.message,
            });
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
                        onClick: () => { global.$fn.prevPage() },
                    }, [
                        h(Icon, 'arrow_back')
                    ]),
                    h(Typography, { color: 'inherit', type: 'subheading' }, '新账号注册'),
                ]),
            ]),
            h('div', { className: css.title }, [
                h(Button, {
                    className: css.titleTab + ' opc25 imid',
                    onClick: () => { global.$fn.changePage('LoginPage') },
                }, '登录'),
                h('div.imid', '|'),
                h(Button, {
                    className: css.titleTab + ' imid',
                    onClick: () => { global.$fn.changePage('RegPage') },
                }, '注册'),
            ]),
            h('div', { className: css.row }, [
                h('div', { className: css.container }, [
                    h(Grid, { item: true, xs: 12 }, [
                        h(TextField, {
                            className: css.textField,
                            label: '手机',
                            placeholder: '手机号码',
                            helperText: '请输入11位手机号',
                            autoComplete: "tel",
                            onChange: (e) => { that.setState({ iptPhone: e.target.value }) },
                        }),
                    ]),
                    h(Grid, { item: true, xs: 12 }, [
                        h(TextField, {
                            className: css.textField,
                            label: '密码',
                            placeholder: '您的密码',
                            type: "password",
                            autoComplete: "current-password",
                            helperText: '请输入6～18位字符',
                            onChange: (e) => { that.setState({ iptPw: e.target.value }) },
                        })
                    ]),
                    h(Button, {
                        color: 'accent',
                        raised: true,
                        className: css.loginBtn,
                        onClick: () => { that.hCreateUser() },
                    }, '注 册'),
                ]),
            ]),
            //弹窗
            h(Dialog, {
                open: that.state.dialogOpen,
                onRequestClose: that.hCloseDialog,
                className: css.dialog,
            }, [
                h(DialogTitle, that.state.dialogTitle),
                h(DialogContent, [
                    h(DialogContentText, that.state.dialogText),
                ]),
                h('div', [
                    h(Button, {
                        raised: true,
                        onClick: that.hCloseDialog,
                        className: css.dialogBtn,
                    }, '关闭'),
                ])
            ]),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(_style)(com);
