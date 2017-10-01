import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import urlParser from 'urlparser';

import style from './_style';


import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';


//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {};

    //渲染实现
    render() {
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        let that = this;
        const css = this.props.classes;

        return h(Grid, { container: true, className: css.page }, [
           h(Button, {
                onClick: () => {
                    var send = global.$electron.ipcRenderer.sendSync;
                    send('run', `if(!slaveWindow)initSlave();`);
                    send('run', `slaveWindow.restore()`);

                    //打开从属页首页
                    var urlObj = urlParser.parse(window.location.href);
                    if(!urlObj.query) urlObj.query = { parts: [] };
                    urlObj.query.parts.push('pageName=SlaveHomePage');
                    send('run', `slaveWindow.loadURL('${urlObj.toString()}')`);
                },
            }, '显示大窗口'),
            h(Button, {
                onClick: () => {
                    var send = global.$electron.ipcRenderer.sendSync;
                    send('run', `slaveWindow.hide()`);
                },
            }, '隐藏大窗口'),
        ]);
    }
};






com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
