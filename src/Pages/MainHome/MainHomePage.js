import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';
import Tooltip from 'material-ui/Tooltip';

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
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        let that = this;
        const css = this.props.classes;

        return h(Grid, { container: true, className: css.page }, [
            h(Grid, {
                container: true,
                className: css.titleBar
            }, [
                h(Tooltip, { title: 'lelel',placement:"bottom" }, [
                    h(Button, {
                        className: css.barLeftBtn,
                        onClick: () => { that.setState({ open: !that.state.open }) },
                    }, [
                        h(FontA, { name: 'spinner' }),
                    ]),
                ]),
            ]),

        ]);
    }
};






com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
