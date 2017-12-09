/*
空页面，用于自我刷新
*/
import { Component } from 'react';
import Request from 'superagent';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

const style = theme => ({
    comBox: {
        width: '100%',
        height: '100%',
        position: 'relative',
        textAlign: 'center',
        margin: 0,
        padding: 0,
        paddingTop: '10%',
    },
});

//元件
class com extends Component {
    state = {};

    componentWillMount = async function() {};
    componentDidMount = async function() {};
    componentWillUnmount = async function() {};

    render() {
        let that = this;
        const css = that.props.classes;

        return h('div', {
            className: css.comBox,
        }, '10knet.com');
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
