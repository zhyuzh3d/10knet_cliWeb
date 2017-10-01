import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

//import MyUpload from '../../Utils/MyUpload';
import MyCoder from '../../Utils/MyCoder'

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';


//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        code: '<h1>I ♥ react-codemirror2</h1>',
        fontSize: 14,
        lineWrapping: false,
        lineNumbers: true,
        theme: 'default',
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
            h(MyCoder, {
                ref: (dom) => { this.dom = dom },
                fontSize: this.state.fontSize,
                options: {
                    theme: this.state.theme,
                    lineWrapping: this.state.lineWrapping,
                    lineNumbers: this.state.lineNumbers,
                }
            }),
            h(Button, {
                className: css.straitBtn,
                onClick: () => {
                    that.setState({ fontSize: that.state.fontSize += 1 });
                },
            }, 'A+'),
            h(Button, {
                className: css.straitBtn,
                onClick: () => {
                    that.setState({ fontSize: that.state.fontSize -= 1 });
                },
            }, 'A-'),
            h(Button, {
                className: css.straitBtn,
                onClick: () => {
                    that.state.lineWrapping = !that.state.lineWrapping;
                    that.setState({ lineWrapping: that.state.lineWrapping });
                },
            }, 'line'),
            h(Button, {
                className: css.straitBtn,
                onClick: () => {
                    that.state.lineNumbers = !that.state.lineNumbers;
                    that.setState({ lineNumbers: that.state.lineNumbers });
                },
            }, '123'),
            h(Button, {
                className: css.straitBtn,
                onClick: () => {
                    var theme = that.state.theme === 'default' ? 'monokai' : 'default';
                    that.setState({ theme: theme });
                },
            }, 'UI'),
        ]);
    }
};






com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
