/*
根据用户uid获取其资源列表
props:{
    userId:如果为空则自动调取当前用户的uid使用
    wdRef:野狗数据参照路径,与userId不同时使用
    basketId:当前打开的篮子Id，用于传递到添加素材页面
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

import AssetItem from '../../Units/Asset/AssetItem';


const style = theme => ({
    loading: {
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        color: '#AAA',
        marginTop: 64,
    },
    divider: {
        width: '100%',
        height: 1,
        background: '#EEE',
    },
    addIcon: {
        fontSize: '1.2rem',
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
        assets: null,
        isCurrentUser: false,
        currentUser: null,
        assetArr: [],
    };

    wdAuthListen = null;

    //界面生成之前，读取数据
    componentDidMount = async function() {
        let that = this;
        let userId = that.props.userId;
        let wdRef = that.props.wdRef;

        that.wdAuthListen = global.$wd.auth().onAuthStateChanged((user) => {
            let curUser = global.$wd.auth().currentUser;
            if(curUser && !userId) {
                userId = curUser.uid;
            };
            if(curUser && userId === curUser.uid) {
                that.setState({
                    isCurrentUser: true,
                    currentUser: curUser,
                });
            };
            if(wdRef) {
                that.getAssetsByRef(wdRef);
            } else {
                if(userId) that.getAssetsByUid(userId);
            };
        });
    };

    //根据uid获取资源列表
    getAssetsByUid = (userId) => {
        let that = this;
        let ref = global.$wd.sync().ref('asset')
        let query = ref.orderByChild('author').equalTo(userId).limitToFirst(100);
        query.on('value', (shot) => {
            that.setState({ assets: shot.val() });
        });
    };

    //根据wdRef获取资源列表
    getAssetsByRef = (wdRef) => {
        let that = this;
        let ref = global.$wd.sync().ref(wdRef + '/arr');
        let query = ref.limitToLast(100);
        query.on('value', (shot) => {
            that.setState({ assets: shot.val() });
        });
    };


    //取消野狗监听
    componentWillUnmount = () => {
        global.$wd.sync().ref('asset').off('value');
        this.wdAuthListen && this.wdAuthListen();
        let wdRef = this.props.wdRef;
        if(wdRef) global.$wd.sync().ref(wdRef + '/arr').off('value');
    };


    //向上移动素材的函数,查找前一个item.id,根据item.index查询
    moveUpHandler = (item) => {
        let that = this;
        let arr = that.state.assetArr;
        let prev = item.index - 1;
        let basketId = that.props.basketId;
        if(!basketId) return;

        if(prev < 0) {
            global.$snackbar.fn.show(`已经在最顶端`, 2000);
        } else if(prev < arr.length) {
            let prevItem = arr[prev];
            let prevPos = prevItem.pos;
            let curPos = item.pos;

            global.$wd.sync().ref(`basket/${basketId}/arr/${prevItem.id}`).update({
                pos: curPos,
            }).then((res) => {
                global.$wd.sync().ref(`basket/${basketId}/arr/${item.id}`).update({
                    pos: prevPos,
                }).then((res) => {
                    global.$snackbar.fn.show(`上移成功`, 2000);
                });
            }).catch((err) => {
                global.$snackbar.fn.show(`上移失败:${err.message}`, 3000);
            });
        };
    };

    //向下移动素材的函数,查找前一个item.id,根据item.index查询
    moveDownHandler = (item) => {
        let that = this;
        let arr = that.state.assetArr;
        let nex = item.index + 1;
        let basketId = that.props.basketId;
        if(!basketId) return;

        if(nex >= arr.length) {
            global.$snackbar.fn.show(`已经在最底`, 2000);
        } else if(nex >= 0) {
            let nexItem = arr[nex];
            let nexPos = nexItem.pos;
            let curPos = item.pos;

            global.$wd.sync().ref(`basket/${basketId}/arr/${nexItem.id}`).update({
                pos: curPos,
            }).then((res) => {
                global.$wd.sync().ref(`basket/${basketId}/arr/${item.id}`).update({
                    pos: nexPos,
                }).then((res) => {
                    global.$snackbar.fn.show(`上移成功`, 2000);
                });
            }).catch((err) => {
                global.$snackbar.fn.show(`上移失败:${err.message}`, 3000);
            });
        };
    };


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let basketId = that.props.basketId;

        let assetElArr = h(Grid, { item: true, className: css.loading }, [
            h(FontA, { name: 'spinner', spin: true }),
        ]);
        let assets = that.state.assets;

        assetElArr = [];
        if(assets) {
            that.state.assetArr = [];
            let assetArr = that.state.assetArr;

            //补充数据
            for(var key in assets) {
                assets[key].id = key;
                assets[key].basket = basketId;
                assetArr.push(assets[key]);
            };

            //排序
            assetArr = assetArr.sort((a, b) => { return b.pos - a.pos });

            assetArr.forEach((item, index) => {
                item.index = index;
                let el = h(AssetItem, {
                    item: item,
                    currentUser: that.state.currentUser,
                    moveUpHandler: that.moveUpHandler,
                    moveDownHandler: that.moveDownHandler,
                });

                assetElArr.push(el);
                assetElArr.push(h('div', { className: css.divider }));
            });
        };

        //新增按钮
        if(that.state.isCurrentUser) {
            assetElArr.push(
                h(Button, {
                    fab: true,
                    color: 'accent',
                    className: css.addFab,
                    onClick: () => {
                        global.$storeRemove('AssetEditPage', 'assetId');
                        let opt = basketId ? { basketId: basketId } : {};
                        global.$router.changePage('AssetEditPage', opt);
                    },
                }, h(AddIcon, { className: css.addIcon }))
            );
        };

        return h(List, { style: { padding: 0 } }, assetElArr);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
