import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import MyUpload from '../../Utils/MyUpload';
import MyEditor from '../../Utils/MyEditor'

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
        code: '<h1>I ♥ react-codemirror2</h1>',
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {};

    //关闭弹窗
    closeDialog = () => {
        this.setState({ dialogOpen: false });
    };

    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;

        return h(Grid, { container: true, className: css.page }, [
            h(MyEditor, {
                options: {
                    fontSize: 12,
                }
            })
        ]);
    }
};






com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
