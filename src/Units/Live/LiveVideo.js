/*
用户直播视频
props:{
    wdStream,媒体流
    style,样式
    muted,是否静音
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import UserButton from '../../Units/User/UserButton';



const style = theme => ({
    container: {
        height: '100%',
        display: 'inline-block',
    },
    video: {
        height: '100%',
    },
    userBox: {
        position: 'absolute',
        padding: '4px 8px',
    },
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
        let stream = this.props.wdStream;
        let uid = stream && stream.streamOwners ? stream.streamOwners[0].userId : null;

        return that.props.wdStream ? h('div', {
            className: css.container,
            style: that.props.style,
            onClick: () => {
                console.log('>liveVideo clicked:', this.props.wdStream);
            },
        }, [
            uid ? h('div', {
                className: css.userBox,
            }, h(UserButton, {
                userId: uid,
                size: 'sm',
                asButton: false,
                nameStyle: {
                    color: '#FFF',
                    textShadow: '0 0 8px #000',
                },
                iconStyle: {
                    boxShadow: '0 0 12px #000',
                },
            })) : undefined,
            h('video', {
                className: css.video,
                ref: 'videoEl',
                autoPlay: true,
                muted: stream.muted === true ? true : false,
            })
        ]) : null;
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
