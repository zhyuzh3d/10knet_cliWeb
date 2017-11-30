/*
用户直播视频
props:{
    info,{uid,stream}
    style,样式
    muted,是否静音
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import FontA from 'react-fa';

import { withStyles } from 'material-ui/styles';
import UserButton from '../../Units/User/UserButton';



const style = theme => ({
    comBox: {
        height: '100%',
        display: 'inline-block',
        minWidth: 120,
        textAlign: 'center',
        position: 'relative',
        background: '#444',
        verticalAlign: 'top',
    },
    video: {
        height: '100%',
        display: 'inline-block',
    },
    audio: {
        fontSize: 32,
        color: '#666',
        paddingTop: 40,
        width: 160,
        textAlign: 'center',
    },
    userBox: {
        position: 'absolute',
        padding: '4px 8px',
    },
});

//元件
class com extends Component {
    state = {
        streamId: null,
    };

    componentDidMount = async function() {};

    hasAttached = false;
    componentWillReceiveProps = async function(newProps) {
        let that = this;
        let oldId = this.state.streamId;
        let newStream = newProps && newProps.info ? newProps.info.stream : null;
        let newId = newStream ? newStream.streamId : null;

        if(newId && newId !== oldId) {
            if(this.refs.videoEl && !that.hasAttached) {
                console.log('>>>>refreshed');
                this.setState({ streamId: newId });
                that.hasAttached = true;
                newStream.attach(this.refs.videoEl);
            } else {
                that.hasAttached = false;
            }
        }
    };

    render() {
        let that = this;
        const css = that.props.classes;
        let stream = this.props.info.stream;
        let uid = this.props.info.uid;

        let useVideoEl = stream && stream.stream && stream.stream.active && stream.captureVideo;
        let useAudioEl = !useVideoEl && stream && stream.stream && stream.stream.active && stream.captureAudio;

        return h('div', {
            className: css.comBox,
            style: that.props.style,
            onClick: () => {
                console.log('>liveVideo clicked:', this.props.info);
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
            useVideoEl ? h('video', {
                className: css.video,
                ref: 'videoEl',
                autoPlay: true,
                muted: stream.muted === true ? true : false,
            }) : null,
            useAudioEl ? h('div', {
                className: css.audio,
            }, h(FontA, { name: 'volume-up' })) : null,
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
