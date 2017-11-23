/*
多个发言的列表,带有添加新发言功能
参照post设计，显示改为聊天显示
props:{
    wdRef:野狗路径
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
        overflowY: 'auto',
        maxHeight: 150,
        marginBottom: 48,
        background: 'rgba(0,0,0,0.66)',
    },
    newItemBox: {

    },
    itemList: {

    },
    newItem: {
        width: '100%',
        background: '#EEE',
        height: 48,
        position: 'absolute',
        bottom: 0,
        left: 0,
        display: 'flex',
    },
    newItemUrl: {
        width: '100%',
        background: '#EEE',
        height: 24,
        position: 'absolute',
        bottom: 48,
        left: 0,
        display: 'block',
        zIndex: 10,
    },
    newItemBtn: {

    },
    newItemUrlBtn: {
        width: '100%',
        minHeight: 20,
        padding: 6,
        fontSize: 10,
        fontWeight: 400,
    },
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
        newItemText: '',
        newItemUrl: '',
        currentUser: null,
    };

    wdAuthListen = null;
    componentDidMount = async function() {
        let that = this;
        const wdRef = that.props.wdRef;
        if(!wdRef) return;

        //读取跟帖数据
        let ref = global.$wd.sync().ref(wdRef);
        ref.orderByChild('ts').limitToFirst(10).on('value', (shot) => {
            let data = shot.val();
            that.setState({ data: data });
        });
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(!cuser) return;
            that.setState({ currentUser: cuser });
        });
    };

    componentWillUnmount = () => {
        this.wdAuthListen();
        this.props.wdRef && global.$wd.sync().ref(this.props.wdRef).off();
    };


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
        if(that.state.newItemUrl && !global.$conf.regx.postUrl.test(that.state.newItemUrl)) {
            global.$alert.fn.show('链接格式错误', '请检查确认以http开头的完整链接');
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
            url: that.state.newItemUrl,
            text: that.state.newItemText,
            author: curUser.uid,
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
        };

        let ref = global.$wd.sync().ref(wdRef);
        ref.push(newItem).then((shot) => {
            that.setState({
                newItemUrl: '',
                newItemText: '',
            });
        }).catch((err) => {
            global.$snackbar.fn.show(`发布失败:${err.message}`, 3000);
        });
    };


    render() {
        let that = this;
        const css = that.props.classes;

        let itemArr = [];
        let data = that.state.data || {};
        let itemElArr = [];

        for(var key in data) itemArr.push(data[key]);
        itemArr = itemArr.sort((a, b) => { return b.ts - a.ts });
        itemArr.forEach((item, index) => {
            itemElArr.push(
                h(Chat, {
                    data: item
                }),
            );
        });

        //添加新项目
        let addItemDom = h('div', {
            className: css.newItemBox,
        }, [
            that.state.newItemUrl ? h('div', { className: css.newItemUrl }, [
                h(Button, {
                    className: css.newItemUrlBtn,
                    color: 'primary',
                    onClick: () => {
                        that.setState({ newItemUrl: null });
                    },
                }, [
                    h(FontA, { name: 'close' }),
                    h('span', { style: { marginLeft: 8 } }, that.state.newItemUrl),
                ]),
            ]) : undefined,
            h('div', { className: css.newItem }, [
                h(MyUpload, {
                    raised: true,
                    freeze: 10,
                    children: h(FontA, { name: 'photo' }),
                    style: {
                        height: 48,
                        width: 48,
                        minWidth: 48,
                        borderTop: '1px solid #CCC',
                    },
                    success: (file, err, res) => {
                        that.setState({ newItemUrl: `http://${file.url}` });
                    },
                }),
                h('input', {
                    className: css.newItemText,
                    placeholder: '发个消息吧～',
                    value: that.state.newItemText,
                    onChange: (e) => {
                        var val = e.target.value;
                        that.setState({
                            newItemText: val,
                        });
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
                }, '发布'),
            ]),
        ]);

        return h('div', {
            className: css.comBox,
        }, [
            h('div', {
                className: css.itemList,
            }, itemElArr),
            addItemDom,
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
