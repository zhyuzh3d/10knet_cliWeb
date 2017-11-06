/*
共用白板、编辑器界面
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';

import MyCoder from '../../Utils/MyCoder';


const style = theme => ({
    codersBox: {
        margin: 0,
        padding: 0,
    },
});

//元件
class com extends Component {
    state = {

    };

    componentWillMount = async function() {};

    setContentSize = () => {};

    componentDidMount = async function() {};

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        return h(Grid, {
            container: true,
            className: css.codersBox,
        }, [
            h(MyCoder, {}),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
