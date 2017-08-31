import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Icon from 'material-ui/Icon';

const styles = theme => ({
    page: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        marginTop: theme.spacing.unit * 10,
    },
    container: {
        margin: 0,
        padding: 0,
        width: 360,
    },
    item: {
        padding: 0
    },
    textField: {
        width: '100%',
    },
    loginBtn: {
        marginTop: theme.spacing.unit * 6,
        width: '100%',
    }
});

class com extends Component {
    render() {
        const css = this.props.classes;

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
                    }),
                ]),
                h(Grid, { item: true, xs: 12 }, [
                    h(TextField, {
                        className: css.textField,
                        label: '密码',
                        placeholder: '您的密码',
                        type: "password",
                        autoComplete: "current-password",
                        helperText: '请输入6～18位字符'
                    }),
                ]),
                h(Button, {
                    color: 'primary',
                    raised: true,
                    className: css.loginBtn,
                }, '登陆'),
            ]),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(com);

//export default com;
