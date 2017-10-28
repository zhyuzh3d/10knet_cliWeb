/*
直播面板，创建直播间或加入直播间
props:{
    liveRoomId,如果没有指定那么使用uid
    open,
    style,
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


const style = theme => ({
    panelBox: {
        height: '100%',
        padding: 0,
        margin: 0,
        width: '100%',
    },
    btnGrp: {
        width: 96,
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
    addBtn: {
        width: '100%',
        height: '50%',
        margin: 0,
        borderBottom: '1px solid #EEE',
    },
    liveVideo: {
        height: '100%',
        background: '#000',
    }
});

//元件
global.$live = {};
class com extends Component {
    state = {
        currentRoom: null,
        streams: {}, //所有的媒体流
        streamArr: [], //所有的媒体流
        liveVideoElArr: [], //所有视频元素的列表
        liveVideoEls: {}, //和Arr完全一致的id索引
    };

    componentDidMount = async function() {};

    componentWillUnmount = () => {};

    //创建直播房间
    setRoom = global.$live.setRoom = (url) => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        if(!cuser) {
            global.$alert.fn.show('请您先登录', '创建房间功能仅提供给已登录用户使用');
            return;
        };

        global.$wd.video.initialize({
            appId: global.$conf.wd.videoAppId,
            token: cuser.getToken()
        });

        that.initRoom(url || that.props.liveRoomId || cuser.uid);
    };

    //设置当前直播间
    initRoom = (id) => {
        let that = this;
        //创建房间，自动发布自己的摄像头视频流
        var room = global.$wd.video.room(id);
        room.connect();
        room.on('connected', () => {
            global.$wd.video.createLocalStream({
                captureAudio: true,
                captureVideo: true,
                dimension: '480p',
                maxFPS: 15,
            }).then(function(localStream) {
                that.setState({ currentRoom: room });
                that.addLiveVideo(localStream);
            });
            global.$snackbar.fn.show('创建成功，已经加入房间');
        });

        //监听新成员的加入
        room.on('stream_added', function(roomStream) {
            room.subscribe(roomStream, function(err) {
                if(err == null) {
                    console.log(`>[LivePanel:setRoom:stream_added]failed:${err.message}`);
                }
            })
        });
        room.on('stream_received', function(roomStream) {
            that.addLiveVideo(roomStream);
        });

        //监听成员的退出,去掉对应的video
        room.on('stream_removed', function(roomStream) {
            that.removeLiveVideo(roomStream);
        })
    };

    //离开房间，停止推送本地视频／停止所有订阅，不关闭房间
    leaveRoom = global.$live.leaveRoom = () => {
        if(!this.state.currentRoom) return;
        this.state.currentRoom.disconnect();
        this.setState({
            currentRoom: null,
            streamArr: []
        });
    };

    //删除一个视频流
    removeLiveVideo = (stream) => {
        let that = this;
        let arr = that.state.streamArr;
        let index = that.state.streamArr.indexOf(stream);
        if(index === -1) return;

        that.state.streamArr.splice(index, 1);
        that.setState({
            streamArr: that.state.streamArr,
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

        let btnGrp = h(Grid, {
            item: true,
            className: css.btnGrp,
            style: { padding: 0 },
        }, [
           that.state.currentRoom ? h(Button, {
                className: css.addBtn,
                onClick: () => {
                    that.leaveRoom();
                },
            }, [
               h(FontA, {
                    name: 'close',
                    style: { marginRight: 4 },
                }),
               h('span', '退出')
            ]) : h(Button, {
                className: css.addBtn,
                onClick: () => {
                    that.setRoom();
                },
            }, [
               h(FontA, {
                    name: 'flash',
                    style: { marginRight: 4 },
                }),
               h('span', '直播')
            ]),
             h(Button, {
                className: css.addBtn,
                onClick: () => {
                    that.leaveRoom();
                },
                disabled: !that.state.currentRoom,
            }, [
               h(FontA, {
                    name: 'user-circle-o',
                    style: { marginRight: 4 },
                }),
               h('span', '邀请')
            ]),
        ]);


        let videoArr = that.state.streamArr.map((stream, index) => {
            return h(LiveVideo, {
                wdStream: stream,
            });
        });

        let videoGrp = h(Grid, {
            item: true,
            className: css.videoGrp,
            style: { padding: 0 },
        }, videoArr);

        return that.props.open ? h(Grid, {
            container: true,
            className: css.panelBox,
            style: that.props.style,
        }, [
            btnGrp,
            videoGrp,
        ]) : null;
    }
};



com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
