/*
整个左侧互动面板，包含视频直播、图文聊天、liveboard等
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
import Tooltip from 'material-ui/Tooltip';

import LiveRoom from '../../Units/Live/LiveRoom';
import LiveViewer from '../../Units/Live/LiveViewer';
import ChatList from '../../Units/Chat/ChatList';
import LiveCoder from '../../Units/Live/LiveCoder';
import LiveSlider from '../../Units/Live/LiveSlider';
import UserButton from '../../Units/User/UserButton';



const style = theme => ({
    panelBox: {
        padding: 0,
        margin: 0,
        width: '100%',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        height: '100%',
        position: 'relative',
    },
    liveRoomBox: {
        height: 120,
        width: '100%',
        positin: 'relative',
    },
    btnBar: {
        width: '100%',
        padding: 0,
        margin: 0,
        height: 48,
        borderBottom: '1px solid #EEE',
        background: '#F5F5F5',
    },
    btn: {
        margin: 0,
        padding: 0,
        height: 48,
        borderRight: '1px solid #EEE',
        minWidth: 48,
        cursor: 'pointer',
        background: '#FFF',
    },
    btn2: {
        margin: 0,
        padding: 0,
        height: 48,
        borderLeft: '1px solid #DFDFDF',
        minWidth: 48,
        cursor: 'pointer',
        background: '#FFF',
        float: 'right',
    },
    inviteName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    invitePs: {
        fontSize: 12,
        fontWeight: 200,
    },
    boardPanel: {
        margin: 0,
        padding: 0,
        flexGrow: 1,
        display: 'flex',
    },
    empty: {
        width: '100%',
        paddingTop: 50,
        fontSize: 12,
        color: '#DDD',
        textAlign: 'center',
    },
    liveChatBox: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        zIndex: 10,
    },
});

//元件
global.$live = {};
class com extends Component {
    state = {
        roomInfo: null, //读取iroom数据库的info
        wdRefArr: [], //所有需要取消的野狗监听
        hasNewInvite: 0, //是否有新的邀请
        liveInviteArr: [], //收到的所有邀请
        useLiveRoom: false, //是否使用视频模块
        useLiveChat: true, //是否使用聊天模块
        boardType: 'viewer', //互动板类型，coder，board
    };

    //初始化邀请提示
    componentDidMount = async function() {

        let that = this;
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(!cuser) return;

            //读取自己收到的邀请，如果有新的则红色显示30秒
            let ref = global.$wd.sync().ref(`uinvite/${cuser.uid}`);
            that.state.wdRefArr.push(ref);
            let nows = new Date().getTime();
            nows -= 1800000; //30分钟之内
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

    //创建直播教室,默认自己主持，操作数据库iroom
    setRoom = global.$live.setRoom = (roomId) => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        if(!cuser) {
            global.$alert.fn.show('请您先登录', '创建房间功能仅提供给已登录用户使用');
            return;
        };

        if(!roomId && that.props.roomId === 0) {
            //需要创建新房间
            global.$wd.sync().ref(`iroom`).push({
                author: cuser.uid,
                chairMan: cuser.uid,
                ts: global.$wd.sync().ServerValue.TIMESTAMP,
                boardType: that.state.boardType,
            }).then(function(newRef) {
                let id = newRef.key();
                newRef.on('value', (shot) => {
                    let info = Object.assign({
                        roomId: id,
                    }, shot.val());
                    that.setState({ roomInfo: info });
                });
            });
        } else {
            //读取已有房间并加入
            let id = roomId || that.props.roomId;
            global.$wd.sync().ref(`iroom/${id}`).on('value', (shot) => {
                let info = Object.assign({ roomId: id }, shot.val());
                that.setState({ roomInfo: info });
            });
        }
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
                hideCancelBtn: true,
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
                    });
                },
            });
        });
    };

    //邀请整组用户的方法
    showInviteGroupDiaolog = () => {
        let that = this;
        let roomInfo = that.state.roomInfo;
        let cuser = global.$wd.auth().currentUser;
        if(!roomInfo || !cuser) return;

        //获取我的分组列表
        let ref = global.$wd.sync().ref(`ugroup/${cuser.uid}`);
        ref.once('value', (shot) => {
            if(!shot) return;
            let groups = shot.val();

            let groupArr = [];
            for(let key in groups) {
                groups[key].id = key;
                groupArr.push(groups[key]);
            };
            groupArr.sort((a, b) => { return b.ts - a.ts });
            if(groupArr.length < 1) {
                global.$alert.fn.show('您还没有创建小组', '请在右侧[小组]选项卡下面点击加号创建');
                return;
            };

            global.$selector.fn.show({
                title: `请选择将要邀请的分组`,
                itemArr: groupArr,
                item: groupArr[0],
                hideCancelBtn: true,
                okHandler: (group) => {
                    //弹窗输入提示然后批量发起邀请
                    global.$confirm.fn.show({
                        title: '请输入邀请附言',
                        input: {
                            tip: '邀请附言不多于32字符',
                            regx: /^[\S\s]{0,32}$/,
                            value: '',
                        },
                        okHandler: (iptVal) => {
                            that.inviteGroup(group, iptVal);
                        },
                    });
                },
            });
        });
    };

    //邀请全组
    inviteGroup = (group, ipt) => {
        let that = this;
        let ref = global.$wd.sync().ref(`group/${group.id}/members`);
        ref.once('value', (shot) => {
            if(!shot) return;
            let users = shot.val();
            for(let key in users) {
                that.inviteUser(key, ipt);
            };
        });
    };


    //邀请某人，向liveInvite／uid字段push新对象
    inviteUser = (uid, tip) => {
        let that = this;
        if(!that.state.roomInfo) return;
        if(!global.$wd.auth().currentUser) return;

        global.$wd.sync().ref(`uinvite/${uid}`).push({
            from: global.$wd.auth().currentUser.uid,
            fromName: global.$currentUser.displayName || '未命名用户',
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
            ps: tip || 'TA什么也没说...',
            roomId: that.state.roomInfo.roomId,
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
            title: `最近您收到的直播邀请`,
            itemArr: itemArr,
            labelKey: 'el',
            okHandler: (item) => {
                that.leaveRoom(() => {
                    that.setRoom(item.roomId);
                    that.setState({ settingRoom: true });
                    setTimeout(() => {
                        that.setState({ settingRoom: false });
                    }, 3000);
                });
            },
        });
    };



    //离开房间，停用room，livecode等
    leaveRoom = global.$live.leaveRoom = (callBack) => {
        let that = this;
        if(that.state.roomInfo) {
            global.$confirm.fn.show({
                title: '您即将离开房间',
                text: '退出后无法返回，除非再次收到此房间人员的邀请',
                okHandler: () => {
                    that.clearRoomInfo();
                    if(callBack) callBack();
                },
            });
        } else {
            that.clearRoomInfo();
            if(callBack) callBack();
        };
    };

    clearRoomInfo = () => {
        this.setState({
            roomInfo: null,
            useLiveCode: false,
            useRoom: false,
        });
    };

    //全局设置islider的方法,设置为当前房间
    setIslider = global.$live.setIslider = (sliderId) => {
        let that = this;
        let roomId = that.state.roomInfo ? that.state.roomInfo.roomId : null;
        if(!roomId) {
            global.$snackbar.fn.show('请先开启直播，然后才能打开实时演示');
            return;
        };
        let ref = global.$wd.sync().ref(`islider/${roomId}`);
        ref.update({
            sliderId: sliderId,
            curPos: 0,
        });
    };

    //主持人设置boardType并保存到数据库
    setBoardType = (type) => {
        let that = this;
        let roomId = that.state.roomInfo ? that.state.roomInfo.roomId : null;
        if(!roomId) return;

        let ref = global.$wd.sync().ref(`iroom/${roomId}`);
        ref.update({
            boardType: type || 'slider',
        });
        that.setState({ boardType: type || 'slider' });
    };


    render() {
        let that = this;
        const css = that.props.classes;
        let cuser = global.$wd.auth().currentUser;

        let roomInfo = that.state.roomInfo;
        let onChair = cuser && roomInfo && roomInfo.chairMan === cuser.uid ? true : false;
        let type = onChair ? that.state.boardType : (roomInfo ? roomInfo.boardType : 'slider');

        //开启或退出按钮
        let exitBtn = h(Tooltip, { title: '退出房间' }, h(Button, {
            className: css.btn,
            onClick: () => {
                that.leaveRoom();
            },
        }, [
           h(FontA, {
                name: 'close',
            }),
        ]));
        let startBtn = h(Tooltip, { title: '快速创建房间' }, h(Button, {
            className: css.btn,
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
            })
        ]));

        //弹窗发起邀请按钮
        let inviteBtn = h(Tooltip, { title: '邀请其他在线用户' }, h(Button, {
            className: css.btn,
            onClick: () => {
                that.showInviteDiaolog();
            },
            disabled: !that.state.roomInfo,
        }, [
           h(FontA, {
                name: 'user-plus',
            }),
        ]));

        //弹窗发起分组邀请按钮
        let inviteGroupBtn = h(Tooltip, { title: '批量邀请小组用户' }, h(Button, {
            className: css.btn,
            onClick: () => {
                that.showInviteGroupDiaolog();
            },
            disabled: !that.state.roomInfo,
        }, [
           h(FontA, {
                name: 'group',
            }),
        ]));

        //显示我的邀请函按钮
        let myInviteBtn = h(Tooltip, { title: '最近收到的邀请' }, h(Button, {
            className: css.btn,
            style: {
                background: that.state.hasNewInvite % 2 <= 0 ? '#FFF' : '#f50057',
                color: that.state.hasNewInvite % 2 <= 0 ? (that.state.liveInviteArr.length < 1 ? '#AAA' : 'inherit') : '#FFF',
            },
            onClick: () => {
                that.showMyInviteDiaolog();
            },
            disabled: !that.state.liveInviteArr.length > 0,
        }, [
           h(FontA, {
                name: 'vcard-o',
            }),
        ]));


        //使用直播视频模块按钮
        let liveRoomBtn = h(Tooltip, { title: '视频直播面板' }, h(Button, {
            className: css.btn2,
            style: {
                background: 'inherit',
                color: that.state.useLiveRoom ? '#f50057' : '#AAA',
            },
            onClick: () => {
                that.setState({ useLiveRoom: !that.state.useLiveRoom });
            },
        }, [
           h(FontA, {
                name: 'video-camera',
            }),
        ]));

        //使用聊天模块按钮
        let liveChatBtn = h(Tooltip, { title: '图文聊天面板' }, h(Button, {
            className: css.btn2,
            style: {
                background: 'inherit',
                color: that.state.useLiveChat ? '#f50057' : '#AAA',
            },
            onClick: () => {
                that.setState({ useLiveChat: !that.state.useLiveChat });
            },
        }, [
           h(FontA, {
                name: 'commenting',
            }),
        ]));


        //使用代码模块按钮
        let liveCodeBtn = h(Tooltip, { title: '实时互动编码' }, h(Button, {
            className: css.btn2,
            style: {
                background: 'inherit',
                color: that.state.boardType === 'coder' ? '#f50057' : '#AAA',
            },
            onClick: () => {
                that.setBoardType('coder');
            },
            disabled: !onChair,
        }, [
           h(FontA, {
                name: 'code',
            }),
        ]));

        //使用PPT演示模块按钮
        let liveSliderBtn = h(Tooltip, { title: '实时演示' }, h(Button, {
            className: css.btn2,
            style: {
                background: 'inherit',
                color: that.state.boardType === 'slider' ? '#f50057' : '#AAA',
            },
            onClick: () => {
                that.setBoardType('slider');
            },
            disabled: !onChair,
        }, [
           h(FontA, {
                name: 'caret-square-o-right',
            }),
        ]));

        //使用PPT演示模块按钮
        let liveViewerBtn = h(Tooltip, { title: '互动图文展示' }, h(Button, {
            className: css.btn2,
            style: {
                background: 'inherit',
                color: that.state.boardType === 'viewer' ? '#f50057' : '#AAA',
            },
            onClick: () => {
                that.setBoardType('viewer');
            },
            disabled: !onChair,
        }, [
           h(FontA, {
                name: 'image',
            }),
        ]));

        //互动面板
        let liveBoard;
        if(roomInfo) {
            let roomId = roomInfo.roomId;
            if(type === 'slider') {
                liveBoard = h(LiveSlider, {
                    onChair: onChair,
                    wdRef: roomId ? `islider/${roomId}` : undefined,
                })
            } else if(type === 'coder') {
                liveBoard = h(LiveCoder, {
                    onChair: onChair,
                    wdRef: roomId ? `icoder/${roomId}` : undefined,
                });
            } else if(type === 'viewer') {
                liveBoard = h(LiveViewer, {
                    onChair: onChair,
                    wdRef: roomId ? `iviewer/${roomId}` : undefined,
                });
            } else {
                liveBoard = h('div', {
                    className: css.empty,
                }, '...没有开启任何同步内容...');
            };
        };



        return that.props.open ? h(Grid, {
            container: true,
            className: css.panelBox,
        }, [
            //视频聊天模块
            roomInfo && that.state.useLiveRoom ? h('div', {
                className: css.liveRoomBox,
            }, h(LiveRoom, {
                roomInfo: roomInfo,
            })) : undefined,

            //工具栏各种开关
            h('div', {
                className: css.btnBar,
            }, [
                roomInfo ? exitBtn : startBtn,
                inviteBtn,
                inviteGroupBtn,
                myInviteBtn,
                onChair ? liveViewerBtn : null,
                onChair ? liveCodeBtn : null,
                onChair ? liveSliderBtn : null,
                liveChatBtn,
                liveRoomBtn,
            ]),

            //互动面板
            roomInfo ? h('div', {
                className: css.boardPanel,
            }, liveBoard) : null,

            //文字聊天模块
            roomInfo && that.state.useLiveChat ? h('div', {
                className: css.liveChatBox,
            }, h(ChatList, {
                wdRef: `chats/${roomInfo.roomId}`,
                showChat: roomInfo && onChair && type === 'viewer' ? (chat) => {
                    if(!chat || !LiveViewer.fn || !LiveViewer.fn.showUrl) return;
                    LiveViewer.fn.showUrl({
                        author: chat.author,
                        url: chat.text,
                    });
                } : undefined,
            })) : undefined,

        ]) : null;
    };
};




com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
