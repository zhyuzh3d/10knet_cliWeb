/*
根据用户uid获取其篮筐列表
props:{
    userId:如果为空则自动调取当前用户的uid使用
    wdRef:野狗数据参照路径,与userId不同时使用
    isFocus:是否是收藏他人的篮子
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import List from 'material-ui/List';
import FontA from 'react-fa';

import BasketItem from '../../Units/Basket/BasketItem';


const style = theme => ({
    loading: {
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        color: '#AAA',
        marginTop: 64,
    },
    addFab: {
        margin: theme.spacing.unit,
        position: 'fixed',
        bottom: theme.spacing.unit * 5,
        right: theme.spacing.unit * 2,
    },
});

//元件
class com extends Component {
    state = {
        currentUser: null,
        list: null,
        isCurrentUser: false,
    };

    wdAuthListen = null;

    //界面生成之前，读取数据
    componentDidMount = async function() {
        let that = this;
        let userId = that.props.userId;
        let wdRef = that.props.wdRef;

        that.setState({ userId: userId });

        that.wdAuthListen = global.$wd.auth().onAuthStateChanged((user) => {
            let curUser = global.$wd.auth().currentUser;
            if(curUser && !userId) {
                userId = curUser.uid;
                !this.hasUnmounted && that.setState({
                    userId: userId,
                    currentUser: curUser
                });
            };

            if(curUser && userId === curUser.uid) {
                !this.hasUnmounted && that.setState({ isCurrentUser: true });
            };

            if(wdRef) {
                that.getListByRef(wdRef);
            } else {
                if(userId) that.getListByUid(userId);
            };
        });
    };

    //根据uid获取列表
    getListByUid = (userId) => {
        let that = this;
        let ref;
        if(that.props.isFocus) {
            ref = global.$wd.sync().ref(`ufbasket/${userId}`);
        } else {
            ref = global.$wd.sync().ref(`ubasket/${userId}`);
        };
        ref.on('value', (shot) => {
            !this.hasUnmounted && that.setState({ list: shot.val() });
        });
    };

    //根据wdRef获取列表
    getListByRef = (wdRef) => {
        let that = this;
        global.$wd.sync().ref(wdRef).on('value', (shot) => {
            that.setState({ list: shot.val() });
        });
    };


    //取消野狗监听
    hasUnmounted = false;
    componentWillUnmount = () => {
        this.hasUnmounted = true;
        let userId = this.state.userId;
        if(userId) global.$wd.sync().ref(`ubasket/${userId}`).off('value');
        this.wdAuthListen && this.wdAuthListen();
        let wdRef = this.props.wdRef;
        if(wdRef) global.$wd.sync().ref(wdRef).off('value');
    };


    //显示弹窗添加项目
    showAddItemDialog = () => {
        let that = this;
        let userId = this.state.userId;

        if(!userId) {
            global.$snackbar.fn.show('您还没有登录', '请点击右上角按钮登录后再试');
        } else {
            global.$confirm.fn.show({
                title: '请输入篮子名称',
                input: {
                    label: '篮子名称',
                    tip: '2～32个字符',
                    regx: /^.{2,32}$/,
                    value: '未命名',
                },
                okHandler: (ipt) => {
                    that.addItem(ipt);
                },
            });
        };
    };

    //新建一个空项目，通过ref可以索引到基础信息,素材列表放在assets内,然后添加到用户索引
    addItem = (ipt) => {
        let that = this;
        let userId = that.state.userId;
        let ref = global.$wd.sync().ref(`basket`);

        ref.push({ author: userId }).then((res) => {
            let newItem = {
                author: userId,
                title: ipt,
                ref: `ubasket/${userId}`,
                ts: global.$wd.sync().ServerValue.TIMESTAMP,
            };

            global.$wd.sync().ref(`ubasket/${userId}`).update({
                [res.key()]: newItem
            }).then((res) => {
                global.$snackbar.fn.show('创建成功', 2000);
            });
        }).catch((err) => {
            global.$snackbar.fn.show(`创建失败:${err.message}`, 3000);
        });
    };


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let itemElArr = h(Grid, { item: true, className: css.loading }, [
            h(FontA, { name: 'spinner', spin: true }),
        ]);
        let list = that.state.list;

        itemElArr = [];
        if(list) {
            let itemArr = [];
            for(var key in list) {
                list[key].id = key;
                itemArr.push(list[key])
            };

            //排序
            itemArr = itemArr.sort(global.$fn.sortByTopTs);
            itemArr.forEach((item, index) => {
                let el = h(BasketItem, {
                    item: item,
                    isFocus: that.props.isFocus,
                    currentUser: that.state.currentUser,
                });
                itemElArr.push(el);
                itemElArr.push(h('div', { className: css.divider }));
            });
        };

        //新增按钮
        if(that.state.isCurrentUser && !that.props.isFocus) {
            itemElArr.push(
                h(Button, {
                    fab: true,
                    color: 'accent',
                    className: css.addFab,
                    onClick: () => {
                        that.showAddItemDialog();
                    },
                }, h(AddIcon, { className: css.addIcon }))
            );
        };

        return h(List, { style: { padding: 0 } }, itemElArr);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
