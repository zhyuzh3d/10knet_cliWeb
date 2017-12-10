/*
浏览器默认打开页面
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


const style = theme => ({
    comBox: {
        width: '100%',
        height: '100%',
        position: 'relative',
        margin: 0,
        padding: 0,
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
        }, [
            h('div', 'hello world!!!'),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
