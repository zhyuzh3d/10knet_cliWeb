import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import FontA from 'react-fa';
import Typography from 'material-ui/Typography';

//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        title: '控制台',
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {};

    //渲染实现
    render() {
        document.getElementsByTagName('title')[0].innerHTML = '资源浏览器';
        const css = this.props.classes;

        return h(Grid, { container: true, className: css.page }, [
            h(AppBar, {
                color: 'default',
                className: css.appBar,
            }, [
                h(Toolbar, { className: css.appBar }, [
                    h(IconButton, {
                        onClick: () => {
                            var send = global.$electron.ipcRenderer.sendSync;
                            send('run', `if(!mainWindow)initMain();`);
                            send('run', `mainWindow.restore();`);
                        },
                    }, h(FontA, { name: 'bars' })),
                    h(Typography, { type: 'title', className: css.flex }, '标题'),
                    h(IconButton, {}, h(FontA, { name: 'ellipsis-v' })),
                ]),
            ]),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
