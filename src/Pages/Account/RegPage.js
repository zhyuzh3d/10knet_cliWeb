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

import _style from './_style';

//元件
class com extends Component {
    //数据对象
    state = {
        iptPhone: null,
        iptPw: null,
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {
        if(global.$wd.auth().currentUser) {
            await global.$wd.auth().signOut();
        };
    };

    //控制器-注册新用户
    hCreateUser = () => {
        let that = this;
        let phone = that.state.iptPhone;
        let pw = that.state.iptPw;

        if(!global.$conf.regx.phone.test(phone)) {
            global.$alert.fn.show('手机格式错误', '请填写真实的11位手机数字');
            return;
        };

        if(!global.$conf.regx.pw.test(pw)) {
            global.$alert.fn.show('密码格式错误', '请填写6～32位任意字符');
            return;
        };

        global.$wd.auth().createUserWithPhoneAndPassword(phone, pw).then(function(user) {
            global.$snackbar.fn.show('注册成功！', 2000);
            global.$router.changePage();
        }).catch(function(error) {
            global.$alert.fn.show('注册失败，请重试', error.message);
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
                        h(Icon, 'arrow_back')
                    ]),
                    h(Typography, { color: 'inherit', type: 'subheading' }, '新账号注册'),
                ]),
            ]),
            h('div', { className: css.title }, [
                h(Button, {
                    className: css.titleTab + ' opc25 imid',
                    onClick: () => { global.$router.changePage('LoginPage') },
                }, '登录'),
                h('div.imid', '|'),
                h(Button, {
                    className: css.titleTab + ' imid',
                    onClick: () => { global.$router.changePage('RegPage') },
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
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(_style)(com);
