/*
直播视频窗口
props:{
    wdStream,媒体流
    style,样式
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


const style = theme => ({
    video: {
        height: '100%',
    }
});

//元件
class com extends Component {
    state = {};

    componentDidMount = async function() {
        if(this.props.wdStream) {
            this.props.wdStream.attach(this.refs.videoEl);
        }
    };

    render() {
        let that = this;
        const css = that.props.classes;

        return that.props.wdStream ? h('video', {
            className: css.video,
            style: that.props.style,
            ref: 'videoEl',
            autoPlay: true,
        }) : null;
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
