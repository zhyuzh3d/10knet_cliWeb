/*
视频直播面板
props:{
    roomInfo,{roomId},必须，如果此直播房间还不存在那么直接创建
    style,样式
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';

import LiveVideo from '../../Units/Live/LiveVideo';
import LiveBoard from '../../Units/Live/LiveBoard';
import UserButton from '../../Units/User/UserButton';


const style = theme => ({
    panelBox: {
        padding: 0,
        width: '100%',
        height: 'calc(100% + 8px)',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        margin: -8,
    },
    btnGrp: {
        width: 128,
        flexGrow: 'initial',
        padding: 0,
        margin: 0,
    },
    videoGrp: {
        background: '#99a',
        flexGrow: 1,
        padding: 0,
        margin: 0,
    },
    fullWidthBth: {
        width: 128,
        height: '50%',
        margin: 0,
        padding: 0,
        borderBottom: '1px solid #EEE',
    },
    widthBth6: {
        width: 80,
        height: '50%',
        minWidth: 36,
        margin: 0,
        padding: 0,
        borderBottom: '1px solid #EEE',
        borderRight: '1px solid #EEE',
    },
    widthBth4: {
        width: 48,
        minWidth: 36,
        height: '50%',
        margin: 0,
        padding: 0,
        borderBottom: '1px solid #EEE',
    },
    inviteName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    invitePs: {
        fontSize: 12,
        fontWeight: 200,
    },
    liveEmpty: {
        width: '100%',
        marginTop: 30,
        fontSize: 12,
        color: '#DDD',
        textAlign: 'center',
    },
    videoPanel: {
        margin: 0,
        padding: '8px 8px 0 8px',
        maxHeight: 128,
        flexGrow: 0,
    },
    boardPanel: {
        margin: 0,
        padding: '0px 8px',
        flexGrow: 1,
    },
});

//元件
global.$live = {};
class com extends Component {
    state = {
        room: null, //直播房间对象
        streams: {}, //所有的媒体流
        streamArr: [], //所有的媒体流
        liveVideoElArr: [], //所有视频元素的列表
        liveVideoEls: {}, //和Arr完全一致的id索引
        wdRefArr: [], //全部野狗监听
    };

    componentWillMount = async function() {
        this.setRoom();
    };

    componentWillUnmount = () => {
        this.wdAuthListen && this.wdAuthListen();
        this.state.wdRefArr.forEach((item) => {
            item.off();
        });
        //关闭后自动断开直播
        this.state.room.disconnect();
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

    //设置当前直播间，自动开启自身视频流
    initRoom = (roomId) => {
        let that = this;
        //创建房间，自动发布自己的摄像头视频流
        var room = global.$wd.video.room(roomId);
        room.connect();
        room.on('connected', () => {
            global.$wd.video.createLocalStream({
                captureAudio: true,
                captureVideo: true,
                dimension: '480p',
                maxFPS: 15,
            }).then(function(localStream) {
                that.setState({ room: room });

                room.publish(localStream, function(error) {
                    if(error == null) {
                        global.$snackbar.fn.show('成功进入房间');
                    }
                });
                localStream.muted = true;
                that.addLiveVideo(localStream);
            });
        });

        //监听新成员的加入
        room.on('stream_added', function(roomStream) {
            room.subscribe(roomStream, function(err) {
                if(err != null) {
                    console.log(`>[LivePanel:setRoom:stream_added]failed:${err.message}`);
                }
            })
        });

        room.on('stream_received', function(roomStream) {
            roomStream.enableAudio(true);
            that.addLiveVideo(roomStream);
        });

        //监听成员的退出,去掉对应的video
        room.on('stream_removed', function(roomStream) {
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

    //添加一个视频流
    addLiveVideo = (stream) => {
        let that = this;
        that.state.streamArr.push(stream);
        that.setState({
            streamArr: that.state.streamArr,
        });
    };

    render() {
        let that = this;
        const css = that.props.classes;

        let videoArr = that.state.streamArr.map((stream, index) => {
            return h(LiveVideo, {
                wdStream: stream,
            });
        });

        let videoGrp = h(Grid, {
            item: true,
            className: css.videoGrp,
            style: { padding: 0 },
        }, videoArr.length > 0 ? videoArr : h('div', {
            className: css.liveEmpty,
        }, '遇到困难？开启直播邀请大神帮你忙！'));


        return that.props.roomInfo && that.state.room ? h(Grid, {
            container: true,
            className: css.videoPanel,
        }, [
            videoGrp,
        ]) : null;
    };
};



com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
