import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import MyUpload from '../../Utils/MyUpload';

import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import HomeIcon from 'material-ui-icons/Home';


//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        file: null,
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {
        let that = this;
        var blob = new Blob([`<h2>hello world!!</h2><br>@${new Date()}`], { type: 'text/html' });
        blob.name = 'test.html';
        blob.lastModifiedDate = new Date();
        that.setState({ file: blob });
    };

    //关闭弹窗
    closeDialog = () => {
        this.setState({ dialogOpen: false });
    };

    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;

        return h(Grid, { container: true, className: css.page }, [
            h(AppBar, { position: 'static', className: css.appBar }, [
                h(Toolbar, { disableGutters: true, className: css.topBar }, [
                    h(IconButton, {
                        color: 'contrast',
                    }, [
                        h(HomeIcon),
                    ]),
                    h(Typography, { color: 'inherit', type: 'subheading' }, '欢迎使用10knet'),
                ]),
            ]),
            h(Button, {
                onClick: () => { global.$snackbar.fn.show('登录成功', 2000) },
            }, 'showSnackbar'),

            h(Button, {
                onClick: () => { global.$alert.fn.show('登录成功', '真的成功了') },
            }, 'showAlert'),
            h(MyUpload, {
                //file: that.state.file,
                freeze: 10,
                success: (file, err, res) => {
                    console.log('>>ok file', file);
                }
            }),
        ]);
    }
};



com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
