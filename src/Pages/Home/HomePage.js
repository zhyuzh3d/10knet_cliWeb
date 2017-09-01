import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

//元件
class com extends Component {
    state = {

    };

    //关闭弹窗
    closeDialog = () => {
        this.setState({ dialogOpen: false });
    };

    //渲染实现
    render() {
        //const css = this.props.classes;

        return h('h1', 'HomePage!');
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
