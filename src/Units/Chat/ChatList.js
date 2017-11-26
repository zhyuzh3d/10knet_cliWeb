/*
多个发言的列表,带有添加新发言功能
参照post设计，显示改为聊天显示
props:{
    wdRef:野狗路径
    showChat(author,text):大屏显示chat的方法，新增聊天时候自动显示，传递到chat
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import FontA from 'react-fa';

import Chat from '../../Units/Chat/Chat';
import MyUpload from '../../Utils/MyUpload';

const style = theme => ({
    comBox: {

    },
    listBox: {
        overflowY: 'auto',
        maxHeight: 150,
        minHeight: 50,
        marginBottom: 48,
        background: 'rgba(25,25,25,0.66)',
        padding: '12px 0',
    },
    newItemBox: {},
    newItem: {
        width: '100%',
        background: '#EEE',
        height: 48,
        position: 'absolute',
        bottom: 0,
        left: 0,
        display: 'flex',
    },
    newItemBtn: {},
    newImgBtn: {
        width: 48,
        minWidth: 48,
        borderTop: '1px solid #CCC',
    },
    newItemText: {
        flex: 1,
        height: 46,
        padding: '0 16px',
        fontSize: '0.9rem',
    },
});

//元件
class com extends Component {
    state = {
        data: null,
        itemArr: [],
        newItemText: '',
        currentUser: null,
        sending: false,
    };

    wdAuthListen = null;
    componentDidMount = async function() {
        let that = this;
        const wdRef = that.props.wdRef;
        if(!wdRef) return;

        //读取跟帖数据
        let ref = global.$wd.sync().ref(`${wdRef}/list`);
        //ref.orderByChild('ts').limitToFirst(10).on('child_added', (shot) => {
        ref.on('child_added', (shot) => {
            let data = shot.val();
            if(!data) return;

            let itemArr = that.state.itemArr;
            itemArr.push(data);
            itemArr = itemArr.sort((a, b) => { return b.ts - a.ts });
            that.setState({ itemArr: itemArr });
        });
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(!cuser) return;
            that.setState({ currentUser: cuser });
        });

        that.listenPast();
    };

    componentWillUnmount = () => {
        this.wdAuthListen();
        this.props.wdRef && global.$wd.sync().ref(this.props.wdRef).off();
    };

    //开始监听剪贴板文件
    listenPast = () => {
        let that = this;
        that.inputEl.addEventListener("paste", function(e) {
            if(!(e.clipboardData && e.clipboardData.items)) {
                return;
            };
            for(var i = 0, len = e.clipboardData.items.length; i < len; i++) {
                var item = e.clipboardData.items[i];
                if(item.kind === "file") {
                    var pasteFile = item.getAsFile();
                    that.setState({ pastFile: pasteFile });
                    MyUpload.fn.start(pasteFile, that.uploadSuccess);
                }
            }
        });
    };

    //上传完成后执行的方法，设置文字为url,发送聊天
    uploadSuccess = (file, err, res) => {
        this.setState({ newItemText: `http://${file.url}` });
        this.addItem();
    }

    //创建新帖子
    addItem = () => {
        let that = this;
        const wdRef = that.props.wdRef;
        if(!wdRef) return;
        let curUser = global.$wd.auth().currentUser;

        if(!curUser) {
            global.$alert.fn.show('您还没有登录', '请点右上角图标进行登录或注册');
            return;
        };
        if(!global.$conf.regx.chatText.test(that.state.itemText)) {
            global.$alert.fn.show('内容格式错误', '请确认字符数量3～256个');
            return;
        };

        //屏蔽按钮避免重复发送
        that.setState({ sending: true });
        setTimeout(() => {
            that.setState({ sending: false });
        }, 1000);

        let newItem = {
            text: that.state.newItemText,
            author: curUser.uid,
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
        };

        let ref = global.$wd.sync().ref(`${wdRef}/list`);
        ref.push(newItem).then((shot) => {
            that.setState({
                newItemText: '',
            });
        }).catch((err) => {
            global.$snackbar.fn.show(`发送失败:${err.message}`, 3000);
        });
    };


    render() {
        let that = this;
        const css = that.props.classes;

        let itemArr = that.state.itemArr;
        let itemElArr = [];

        itemArr.forEach((item, index) => {
            itemElArr.push(
                h(Chat, {
                    data: item,
                    showChat: that.props.showChat ? () => {
                        that.props.showChat(item);
                    } : undefined,
                }),
            );
        });

        //添加新项目
        let addItemDom = h('div', {
            className: css.newItemBox,
        }, [
            h('div', { className: css.newItem }, [
                h(MyUpload, {
                    raised: true,
                    freeze: 10,
                    ref: (uploadBtn) => { that.uploadBtn = uploadBtn },
                    children: h(FontA, { name: 'photo' }),
                    style: {
                        height: 48,
                        width: 48,
                        minWidth: 48,
                        borderTop: '1px solid #CCC',
                    },
                    success: (file, err, res) => {
                        that.uploadSuccess(file, err, res);
                    },
                }),
                h('input', {
                    ref: (inputEl) => { that.inputEl = inputEl },
                    className: css.newItemText,
                    placeholder: '发送文字或粘贴截图',
                    value: that.state.newItemText,
                    onChange: (e) => {
                        var val = e.target.value;
                        that.setState({
                            newItemText: val,
                        });
                    },
                    onKeyDown: (event) => {
                        if(event.keyCode === 13) {
                            that.addItem();
                        }
                    },
                }),
                h(Button, {
                    raised: true,
                    disabled: !that.state.currentUser || that.state.sending,
                    color: 'primary',
                    className: css.newItemBtn,
                    onClick: () => {
                        that.addItem();
                    },
                }, h(FontA, { name: 'send' })),
            ]),
        ]);


        return h('div', {
            className: css.comBox,
        }, [
            h('div', {
                className: css.listBox,
            }, itemElArr),
            addItemDom,
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
