/*
视频直播面板，列出所有直播成员
props:{
    roomInfo,{roomId},必须，如果此直播房间还不存在那么直接创建
    style,样式
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import FontA from 'react-fa';
import Tooltip from 'material-ui/Tooltip';

import LiveVideo from '../../Units/Live/LiveVideo';

const style = theme => ({
    videosBox: {
        height: '100%',
        width: '100%',
        display: 'flex',
    },
    videoGrp: {
        height: '100%',
        background: '#99a',
        padding: 0,
        margin: 0,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        width: 'calc(100% - 40px)',
        overflowX: 'auto',
    },
    btnGrp: {
        height: '100%',
        background: '#FFF',
        padding: 0,
        margin: 0,
        display: 'inline-block',
        verticalAlign: 'top',
    },
    liveEmpty: {
        width: '100%',
        paddingTop: 50,
        fontSize: 12,
        color: '#DDD',
        textAlign: 'center',
    },
    btn: {
        margin: 0,
        padding: 0,
        height: 40,
        borderRight: '1px solid #EEE',
        borderBottom: '1px solid #EEE',
        minWidth: 40,
        cursor: 'pointer',
        background: '#FFF',
        display: 'block',
    },
});

//元件
global.$live = {};
class com extends Component {
    state = {
        members: {}, //全部成员
        room: null, //直播房间对象
        streamArr: [], //所有的媒体流
        wdRefArr: [], //全部野狗监听
        localStream: null, //本地流，以便于停止
        videoOn: false,
        audioOn: false,
        filterOn: false,
    };

    componentWillMount = async function() {
        this.setRoom();
    };
    componentWillReceiveProps = async function(newProps) {
        let that = this;
        let oldMembers = that.state.members || {};
        let newMembers = newProps ? newProps.members : {};

        for(let key in newMembers) {
            if(oldMembers[key]) {
                oldMembers[key].ts = newMembers[key].ts;
            } else {
                oldMembers[key] = newMembers[key];
            }
        };
        this.setState({ members: oldMembers });
    };


    hasUnmounted = false;
    componentWillUnmount = () => {
        this.wdAuthListen && this.wdAuthListen();
        this.state.wdRefArr.forEach((item) => {
            item.off();
        });
        //关闭后自动断开直播
        this.setState({ videoOn: false, audioOn: false });
        this.closeLocalStream();
        this.state.room && this.state.room.disconnect();
        this.hasUnmounted = true;
    };

    //创建直播房间
    setRoom = global.$live.setRoom = (roomId) => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        let roomInfo = that.props.roomInfo;
        if(!cuser || !roomInfo || !roomInfo.roomId) return;

        global.$wd.video.initialize({
            appId: global.$conf.wd.videoAppId,
            token: cuser.getToken(),
        });

        that.initRoom(roomId || roomInfo.roomId);
    };

    //设置当前直播间，不自动开启自身视频流
    initRoom = (roomId) => {
        let that = this;
        //创建房间，自动发布自己的摄像头视频流
        var room = global.$wd.video.room(roomId);
        room.connect();
        room.on('connected', () => {
            global.$snackbar.fn.show('成功进入房间');
            if(that.hasUnmounted) {
                this.state.room && this.state.room.disconnect();
            } else {
                that.setState({ room: room });
            };
        });

        //监听新成员的加入
        room.on('stream_added', function(roomStream) {
            console.log('>>>>stream_added', roomStream);
            if(!roomStream) return;
            room.subscribe(roomStream, function(err) {
                if(err != null) {
                    console.log(`>[LivePanel:setRoom:stream_added]failed:${err}`);
                }
            })
        });

        room.on('stream_received', function(roomStream) {
            console.log('>>>>stream_received', roomStream);
            if(!roomStream) return;
            roomStream.enableAudio(true);
            that.addLiveVideo(roomStream);
        });

        //监听成员的退出,去掉对应的video
        room.on('stream_removed', function(roomStream) {
            console.log('>>>>stream_removed', roomStream);
            if(!roomStream) return;
            that.removeLiveVideo(roomStream);
        })
    };

    //离开房间，停止推送本地视频／停止所有订阅，不关闭房间
    leaveRoom = global.$live.leaveRoom = () => {
        if(!this.state.room) return;
        this.setState({
            room: null,
            streamArr: []
        });
        this.state.room.disconnect();
    };

    //删除一个视频流
    removeLiveVideo = (stream) => {
        let that = this;
        let arr = [];
        that.state.streamArr.forEach((item) => {
            if(item && stream && item.streamId !== stream.streamId) {
                arr.push(item);
            };
        });
        that.setState({
            streamArr: arr,
        });
    };

    //添加一个视频流,同时清理不活动的视频流,将视频流指定到users
    addLiveVideo = (stream) => {
        let that = this;
        let members = that.state.members || {};
        let cuser = global.$wd.auth().currentUser;
        let uid = stream.streamOwners ? stream.streamOwners[0].userId : undefined;

        //把媒体流指定到member.stream
        if(stream.type === 'LocalStream') {
            if(cuser && cuser.uid) {
                members[cuser.uid].stream = stream;
                members[cuser.uid].uid = cuser.uid;
            };
        } else if(uid) {
            if(!members[uid]) {
                members[uid] = { uid: uid };
            };
            members[uid].stream = stream;
            members[uid].uid = uid;
        };

        that.setState({
            members: members,
        });


    };

    //打开或关闭摄像头
    switchVideo = () => {
        let that = this;
        that.state.videoOn = !that.state.videoOn;
        that.setState({ videoOn: that.state.videoOn });
        that.publishLocalStream();
    };

    //打开或关闭音频
    switchAudio = () => {
        let that = this;
        that.state.audioOn = !that.state.audioOn;
        that.setState({ audioOn: that.state.audioOn });
        that.publishLocalStream();
    };

    //关闭本地流,清理streamArr的本地流
    closeLocalStream = () => {

        let that = this;
        let localStream = that.state.localStream;
        if(localStream) {
            console.log('>>>close1', localStream);
            localStream.close();
        };

        let streamArr = that.state.streamArr;
        let arr = [];
        streamArr.forEach((item, index) => {
            if(item.type === 'LocalStream') {
                item.close();
                console.log('>>>close2', localStream);
            } else {
                arr.push(item);
            }
        });
        that.setState({
            localStream: null,
            streamArr: arr,
        });
    };

    //重新发布本地流
    publishLocalStream = () => {
        let that = this;
        let room = that.state.room;
        let videoOn = that.state.videoOn;
        let audioOn = that.state.audioOn;

        if(!room) return;

        if(!videoOn && !audioOn) {
            that.closeLocalStream();
            return;
        } else {
            that.closeLocalStream();
        }

        global.$wd.video.createLocalStream({
            captureVideo: videoOn,
            captureAudio: audioOn,
            dimension: '120p',
            maxFPS: 15,
        }).then(function(localStream) {
            if(that.hasUnmounted) return;
            that.setState({
                localStream: localStream
            });
            room.publish(localStream, function(err) {
                if(err == null) {
                    global.$snackbar.fn.show('成功开启直播');
                } else {
                    global.$snackbar.fn.show(`进入房间失败：${err}`);
                }
            });

            localStream.muted = true;
            that.addLiveVideo(localStream);
        });
    };

    render() {
        let that = this;
        const css = that.props.classes;
        let members = that.state.members;

        let videoArr = [];
        for(let uid in members) {
            videoArr.push(h(LiveVideo, {
                info: members[uid],
            }));
        };

        let videoGrp = h('div', {
            className: css.videoGrp,
            style: { padding: 0 },
        }, videoArr.length > 0 ? videoArr : h('div', {
            className: css.liveEmpty,
        }, '还没有人加入直播'));

        let btnGrp = h('div', {
            className: css.btnGrp,
            style: { padding: 0 },
        }, [
            h(Tooltip, { title: '开启/关闭我的摄像头' }, h(Button, {
                className: css.btn,
                style: {
                    color: that.state.videoOn ? '#f50057' : '#AAA',
                },
                onClick: () => {
                    that.switchVideo();
                },
            }, h(FontA, { name: 'camera' }))),
            h(Tooltip, { title: '开启/关闭我的话筒' }, h(Button, {
                className: css.btn,
                style: {
                    color: that.state.audioOn ? '#f50057' : '#AAA',
                },
                onClick: () => {
                    that.switchAudio();
                },
            }, h(FontA, { name: 'microphone' }))),
            h(Tooltip, { title: '只显示视频用户' }, h(Button, {
                className: css.btn,
                style: {
                    color: that.state.filterOn ? '#f50057' : '#AAA',
                },
                onClick: () => {
                    that.setState({ filterOn: !that.state.filterOn });
                },
            }, h(FontA, { name: 'filter' }))),
        ]);


        return that.props.roomInfo && that.state.room ? h('div', {
            className: css.videosBox,
        }, [
            btnGrp,
            videoGrp,
        ]) : null;
    };
};



com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
