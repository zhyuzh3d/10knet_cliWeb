/*
视频直播面板
props:{
    roomId,如果没有指定那么只能等待手工创建
    open,
    style,
    roomId,
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
        currentRoom: null,
        roomInfo: null,
        streams: {}, //所有的媒体流
        streamArr: [], //所有的媒体流
        liveVideoElArr: [], //所有视频元素的列表
        liveVideoEls: {}, //和Arr完全一致的id索引
        liveInviteArr: [], //收到的所有邀请
        wdRefArr: [],
        hasNewInvite: 0,
    };

    componentDidMount = async function() {
        let that = this;
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(!cuser) return;

            //读取自己收到的邀请，如果有新的则红色显示30秒
            let ref = global.$wd.sync().ref(`uinvite/${cuser.uid}`);
            that.state.wdRefArr.push(ref);
            let nows = new Date().getTime();
            nows -= 600000; //10分钟之内
            ref.orderByChild('ts').startAt(nows).limitToLast(6).on('child_added', (shot) => {
                let arr = that.state.liveInviteArr;
                arr.push(shot.val());
                arr.sort((a, b) => { return b.ts - a.ts > 0 });
                that.setState({ liveInviteArr: arr, hasNewInvite: 31 });
            });

            //红色提示显示
            setInterval(() => {
                that.setState({ hasNewInvite: that.state.hasNewInvite - 1 });
            }, 1000);
        });
    };

    componentWillUnmount = () => {
        this.wdAuthListen && this.wdAuthListen();
        this.state.wdRefArr.forEach((item) => {
            item.off();
        });
    };

    //创建直播房间
    setRoom = global.$live.setRoom = (roomId) => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        if(!cuser) {
            global.$alert.fn.show('请您先登录', '创建房间功能仅提供给已登录用户使用');
            return;
        };

        global.$wd.video.initialize({
            appId: global.$conf.wd.videoAppId,
            token: cuser.getToken(),
        });

        if(!roomId && that.props.roomId === 0) {
            //需要创建新房间
            global.$wd.sync().ref(`iroom`).push({
                author: cuser.uid,
                chairMan: cuser.uid,
            }).then(function(newRef) {
                let id = newRef.key();
                newRef.on('value', (shot) => {
                    let info = Object.assign({ roomId: id }, shot.val());
                    that.setState({ roomInfo: info });
                });
                that.initRoom(id);
            });
        } else {
            //读取已有房间并加入
            let id = roomId || that.props.roomId;
            global.$wd.sync().ref(`iroom/${id}`).on('value', (shot) => {
                let info = Object.assign({ roomId: id }, shot.val());
                that.setState({ roomInfo: info });
            });
            that.initRoom(id);
        }
    };

    //设置当前直播间
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
                that.setState({ currentRoom: room });

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
        if(!this.state.currentRoom) return;
        this.setState({
            currentRoom: null,
            streamArr: []
        });
        this.state.currentRoom.disconnect();
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


    //弹窗显示当前在线的人员列表，使用selector
    showInviteDiaolog = () => {
        let that = this;
        let nows = new Date().getTime();
        nows -= 300000; //5分钟之前

        let ref = global.$wd.sync().ref('ucheck')
        let query = ref.orderByChild('ts').startAt(nows).limitToLast(6);
        query.once('value', (shot) => {
            let liveUserArr = shot.val();
            let itemArr = [];
            for(let key in liveUserArr) {
                itemArr.push({
                    uid: key,
                    el: h(UserButton, {
                        userId: key,
                        size: 'md',
                        asButton: false,
                    }),
                });
            };

            global.$selector.fn.show({
                title: `为您推荐了${itemArr.length}位在线对象`,
                itemArr: itemArr,
                labelKey: 'el',
                okHandler: (item) => {
                    global.$confirm.fn.show({
                        title: '请输入邀请附言',
                        input: {
                            tip: '邀请附言不多于32字符',
                            regx: /^[\S\s]{0,32}$/,
                            value: '',
                        },
                        okHandler: (iptVal) => {
                            that.inviteUser(item.uid, iptVal);
                        },
                        cancelHandler: (iptVal) => {
                            that.inviteUser(item.uid, iptVal);
                        },
                    });
                },
            });
        });
    };


    //邀请某人，向liveInvite／uid字段push新对象
    inviteUser = (uid, tip) => {
        let that = this;
        if(!that.state.currentRoom) return;
        if(!global.$wd.auth().currentUser) return;

        global.$wd.sync().ref(`uinvite/${uid}`).push({
            from: global.$wd.auth().currentUser.uid,
            fromName: global.$currentUser.displayName || '未命名用户',
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
            ps: tip || 'TA什么也没说...',
            roomId: that.state.currentRoom.roomId,
        });
    };

    //显示我的邀请列表,去除新消息闪烁，点击加入邀请的房间
    showMyInviteDiaolog = () => {
        let that = this;
        const css = that.props.classes;
        let itemArr = that.state.liveInviteArr;

        that.setState({ hasNewInvite: 0 });

        itemArr.forEach((item, index) => {
            item.el = [
                h('div', {
                    className: css.inviteName
                }, h(UserButton, {
                    userId: item.from,
                    size: 'md',
                    asButton: false,
                })),
                h('div', { className: css.invitePs }, `  ${item.ps}`),
            ];
        });

        global.$selector.fn.show({
            title: `最近10分钟您收到的直播邀请`,
            itemArr: itemArr,
            labelKey: 'el',
            okHandler: (item) => {
                that.leaveRoom();
                that.setRoom(item.roomId);
                that.setState({ settingRoom: true });
                setTimeout(() => {
                    that.setState({ settingRoom: false });
                }, 3000);
            },
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
                className: css.fullWidthBth,
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
                className: css.fullWidthBth,
                onClick: () => {
                    that.setRoom();
                    that.setState({ settingRoom: true });
                    setTimeout(() => {
                        that.setState({ settingRoom: false });
                    }, 3000);
                },
                disabled: that.state.settingRoom,
            }, [
               h(FontA, {
                    name: 'flash',
                    style: { marginRight: 4 },
                }),
               h('span', '直播')
            ]),
            h(Button, {
                className: css.widthBth6,
                onClick: () => {
                    that.showInviteDiaolog();
                },
                disabled: !that.state.currentRoom,
            }, [
               h(FontA, {
                    name: 'user-circle-o',
                    style: { marginRight: 4 },
                }),
               h('span', '邀请')
            ]),
            h(Button, {
                className: css.widthBth4,
                style: {
                    background: that.state.hasNewInvite % 2 <= 0 ? 'inherit' : '#f50057',
                    color: that.state.hasNewInvite % 2 <= 0 ? (that.state.liveInviteArr.length < 0 ? '#CCC' : 'inherit') : '#FFF',
                },
                onClick: () => {
                    that.showMyInviteDiaolog();
                },
                disabled: !that.state.liveInviteArr.length > 0,
            }, [
               h(FontA, {
                    name: 'vcard-o',
                    style: {
                        marginRight: 4,
                    },
                }),
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
        }, videoArr.length > 0 ? videoArr : h('div', {
            className: css.liveEmpty,
        }, '遇到困难？开启直播邀请大神帮你忙！'));


        return that.props.open ? h(Grid, {
            container: true,
            className: css.panelBox,
        }, [
            h(Grid, {
                container: true,
                className: css.videoPanel,
            }, [
                btnGrp,
                videoGrp,
            ]),
            that.state.currentRoom && that.state.roomInfo ? h(Grid, {
                container: true,
                className: css.boardPanel,
            }, h(LiveBoard, {
                roomInfo: that.state.roomInfo,
            })) : null,
        ]) : null;
    };
};



com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
