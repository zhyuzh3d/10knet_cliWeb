import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

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
        let that = this;
        const css = this.props.classes;

        return h(Grid, { container: true, className: css.page }, [
            h(Button,'hell world!')
        ]);
    }
};






com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
