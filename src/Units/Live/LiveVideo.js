/*
用户直播视频
需要外部支援global.$live.toggleLiveCamera/toggleLiveMicphone两个方法开关自己的摄像头话筒
props:{
    info,{uid,stream}
    style,样式
    muted,是否静音
    isAuthor, 是否允许设置主持人
    onChair, 当前是否主持人
    roomId, 用于设置主持人
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import FontA from 'react-fa';
import Tooltip from 'material-ui/Tooltip';
import merge from 'deepmerge';


import { withStyles } from 'material-ui/styles';
import UserButton from '../../Units/User/UserButton';



const style = theme => ({
    comBox: {
        height: '100%',
        display: 'inline-block',
        minWidth: 160,
        maxWidth: 160,
        textAlign: 'center',
        position: 'relative',
        background: '#444',
        verticalAlign: 'top',
        borderRight: '1px solid #AAA',
        borderLeft: '1px solid #888',
    },
    video: {
        height: '100%',
        width: 160,
        display: 'inline-block',
    },
    btnBox: {
        position: 'absolute',
        left: 0,
        bottom: 0,
    },
    videoBtn: {
        display: 'inline-block',
        fontSize: 18,
        color: '#333',
        padding: '6px 10px',
        textShadow: '0 0 8px #000',
        cursor: 'pointer',
        opacity: '0.85',
        verticalAlign: 'bottom',
    },
    audioBtn: {
        display: 'inline-block',
        fontSize: 24,
        color: '#666',
        padding: '4px 8px',
        textShadow: '0 0 8px #000',
        cursor: 'pointer',
        opacity: '0.85',
        verticalAlign: 'bottom',
    },
    micphoneBtn: {
        display: 'inline-block',
        fontSize: 20,
        color: '#666',
        padding: '5px 8px',
        textShadow: '0 0 8px #000',
        cursor: 'pointer',
        opacity: '0.85',
        verticalAlign: 'bottom',
    },
    chairBtn: {
        display: 'inline-block',
        fontSize: 24,
        color: '#666',
        padding: '4px 8px',
        textShadow: '0 0 8px #000',
        cursor: 'pointer',
        opacity: '0.85',
        verticalAlign: 'bottom',
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
        enableAudio: false,
        enableVideo: false,
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
                this.setState({ streamId: newId });
                that.hasAttached = true;
                newStream.attach(this.refs.videoEl);
            } else {
                that.hasAttached = false;
            }
        };
        //不是自己的情况，开关状态保持一致
        let cuid = global.$wd.auth().currentUser ? global.$wd.auth().currentUser.uid : null;
        let isMe = this.props.info.uid && this.props.info.uid === cuid;
        if(!isMe) {
            that.switchAudio(that.state.enableAudio);
            that.switchVideo(that.state.enableVideo);
        };
    };

    //开关音频,本地流不可更改
    switchAudio = (onOff) => {
        let that = this;
        if(onOff === undefined) onOff = !that.state.enableAudio;
        that.setState({ enableAudio: onOff });
        let stream = that.props.info ? that.props.info.stream : null;
        if(!stream) return;
        if(stream.type !== 'LocalStream') {
            stream.enableAudio(that.state.enableAudio);
        }
    }

    //开关视频，本地流不可更改
    switchVideo = (onOff) => {
        let that = this;
        if(onOff === undefined) onOff = !that.state.enableVideo;
        that.setState({ enableVideo: onOff });
        let stream = that.props.info ? that.props.info.stream : null;
        if(!stream) return;
        if(stream.type !== 'LocalStream') {
            stream.enableVideo(that.state.enableVideo);
        }
    };

    //设置或取消主持人,直接更改数据库，仅author有效
    setChair = () => {
        let that = this;
        let roomId = that.props.roomId;
        let uid = this.props.info.uid;
        let cuser = global.$wd.auth().currentUser;
        if(!roomId || !uid || !cuser) return;

        console.log('setchair', roomId, uid, cuser);

        global.$wd.sync().ref(`iroom/${roomId}`).update({
            chairMan: uid,
        }).catch((err) => {
            console.log(`>[LiveVideo:switchChair]error${err}`);
        });
    };

    render() {
        let that = this;
        const css = that.props.classes;
        let stream = this.props.info.stream;
        let uid = this.props.info.uid;

        let useVideoEl = stream && stream.stream && stream.stream.active && stream.captureVideo;
        let useAudioEl = stream && stream.stream && stream.stream.active && stream.captureAudio;
        let enableVideo = that.state.enableVideo;
        let enableAudio = that.state.enableAudio;

        let cuid = global.$wd.auth().currentUser ? global.$wd.auth().currentUser.uid : null;
        let isMe = this.props.info.uid && this.props.info.uid === cuid;

        let isAuthor = that.props.isAuthor;
        let onChair = uid && that.props.chairMan === uid;


        //音频开关
        let audioBtn = h(Tooltip, {
            title: isMe ? '开启我的话筒' : '声音开关',
        }, h('div', {
            className: isMe ? css.micphoneBtn : css.audioBtn,
            style: { display: (useAudioEl || isMe) ? 'inline-block' : 'none' },
            onClick: () => {
                if(isMe) {
                    let onOff = global.$live.toggleLiveMicphone();
                    that.setState({ enableAudio: onOff });
                } else {
                    that.switchAudio();
                }
            },
        }, [
            (useAudioEl || isMe) ? (h('div', {
                style: { color: enableAudio ? '#FFF' : '#666' },
            }, h(FontA, { name: isMe ? 'microphone' : 'volume-up' }))) : null,
        ]));

        //视频开关
        let videoBtn = h(Tooltip, {
            title: isMe ? '开启我的摄像头' : '图像开关',
        }, h('div', {
            className: css.videoBtn,
            style: { display: (useVideoEl || isMe) ? 'inline-block' : 'none' },
            onClick: () => {
                if(isMe) {
                    let onOff = global.$live.toggleLiveCamera();
                    that.setState({ enableVideo: onOff });
                } else {
                    that.switchVideo();
                }
            },
        }, [
            (useVideoEl || isMe) ? (h('div', {
                style: { color: enableVideo ? '#FFF' : '#666' },
            }, h(FontA, { name: 'camera' }))) : null,
        ]));

        //设置主持人开关，仅author可用
        let chairBtn = h(Tooltip, {
            title: isAuthor ? '设置为主持人' : '是否主持人',
        }, h('div', {
            className: css.videoBtn,
            style: { cursor: isAuthor ? 'pointer' : 'auto' },
            onClick: () => {
                isAuthor && that.setChair();
            },
        }, [
            h('div', {
                style: { color: onChair ? '#f50057' : '#666' },
            }, h(FontA, { name: 'user-circle-o' })),
        ]));

        return h('div', {
            className: css.comBox,
            style: merge(that.props.style || {}, {
                borderRightWidth: isMe ? 4 : 1,
            }),
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
            h('div', {
                className: css.btnBox,
            }, [
                videoBtn,
                audioBtn,
                chairBtn,
            ]),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
