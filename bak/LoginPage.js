import { Component } from 'react';

import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

import style from './LoginStyle';

console.log('>>>', global.$electron.ipcRenderer);


//元件
class com extends Component {
    state = {
        dialogOpen: false,
        dialogTitle: null,
        dialogText: null,
        iptPhone: null,
        iptPw: null,
    };

    componentDidMount = async function() {
        //var user = await wilddog.auth().createUserWithPhoneAndPassword('13405045537', 'zhyuzh');
        //野狗相关数据接口,放在外面ref会没有auth信息。。。。。

        //wilddog.initializeApp(global.$wdConf);

        let wilddog = global.$wd;
        var sync = wilddog.sync();

        var user = await wilddog.auth().signInWithPhoneAndPassword('13405045537', 'zhyuzh');
        console.log('>>>', user);
        var res = sync.ref().set({
            a: 12
        });


        //var sres = await wilddog.auth().currentUser.sendPhoneVerification();
        /*try {
            var rres = await wilddog.auth().currentUser.verifiyPhone('129178');
            console.log('>>>>xxx1', rres);
        } catch(error) {
            console.log('>>>>xxx2', error);
            this.setState({
                dialogOpen: true,
                dialogTitle: '初始化异常',
                dialogText: error.message,
            });
        }*/
    };

    //关闭弹窗
    closeDialog = () => {
        this.setState({ dialogOpen: false });
    };

    //注册新用户
    createUser = () => {
        let that = this;
        let phone = that.state.iptPhone;
        let pw = that.state.iptPw;
        /*//wilddog.auth().createUserWithPhoneAndPassword(phone, pw).then(function(user) {
        wilddog.auth().signInWithPhoneAndPassword(phone, pw).then(function(user) {
            //window.changePage('HomePage');
            //wilddog.auth().currentUser.sendPhoneVerification();
        }).catch(function(error) {
            that.setState({
                dialogOpen: true,
                dialogTitle: '登录失败',
                dialogText: error.message,
            });
        });*/
    };

    //渲染实现
    render() {
        const css = this.props.classes;
        let that = this;

        return h(Grid, { container: true, className: css.page }, [
            h('h3', { className: css.title }, '登录'),
            h(Grid, {
                item: true,
                className: css.container,
            }, [
                h(Grid, { item: true, xs: 12 }, [
                    h(TextField, {
                        className: css.textField,
                        label: '账号',
                        placeholder: '手机号码',
                        helperText: '请输入11位手机号',
                        autoComplete: "tel",
                        onChange: (e) => { this.setState({ iptPhone: e.target.value }) },
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
                        onChange: (e) => { this.setState({ iptPw: e.target.value }) },
                    })
                ]),
                h(Button, {
                    color: 'primary',
                    raised: true,
                    className: css.loginBtn,
                    onClick: () => { this.createUser() },
                }, '登陆'),
            ]),
            //弹窗
            h(Dialog, {
                open: this.state.dialogOpen,
                onRequestClose: this.closeDialog,
                className: css.dialog,
            }, [
                h(DialogTitle, this.state.dialogTitle),
                h(DialogContent, [
                    h(DialogContentText, this.state.dialogText),
                ]),
                h('div', [
                    h(Button, {
                        raised: true,
                        onClick: this.closeDialog,
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

export default withStyles(style)(com);
