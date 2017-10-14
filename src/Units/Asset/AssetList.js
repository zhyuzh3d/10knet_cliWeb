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
import List, { ListItem } from 'material-ui/List';
import FontA from 'react-fa';
import Moment from 'react-moment';

const style = theme => ({
    loading: {
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        color: '#AAA',
        marginTop: 64,
    },
    item: {
        padding: '8px 16px',
    },
    itemIcon: {
        margin: 8,
    },
    itemArrow: {
        fontSize: 8,
        color: '#AAA',
    },
    itemText: {
        margin: 8,
        flex: 1,
    },
    itemTitle: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#333'
    },
    itemTime: {
        fontSize: 8,
        fontWeight: 200,
        color: '#AAA',
        verticalAlign: 'middle',
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
                that.setState({ isCurrentUser: true });
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


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        const AssetTypes = global.$conf.assetTypes;

        let assetElArr = h(Grid, { item: true, className: css.loading }, [
            h(FontA, { name: 'spinner', spin: true }),
        ]);
        let assets = that.state.assets;

        assetElArr = [];
        if(assets) {
            let assetsArr = [];
            for(var key in assets) {
                assets[key].id = key;
                assetsArr.push(assets[key])
            };

            //排序
            assetsArr = assetsArr.sort((a, b) => { return b.ts - a.ts });
            assetsArr.forEach((item, index) => {
                let el = h(ListItem, {
                    className: css.item,
                    button: true,
                    onClick: () => {
                        //window.open(item.url);
                        global.$router.changePage('AssetDetailPage', { assetId: item.id });
                    },
                }, [
                    h(Grid, { container: true, align: 'center' }, [
                        h(Grid, {
                            item: true,
                            className: css.itemIcon
                        }, h(FontA, { name: AssetTypes[item.type].icon })),
                        h(Grid, {
                            item: true,
                            className: css.itemText,
                        }, [
                            h('div', { className: css.itemTitle }, item.title || '未标题...'),
                            h(Moment, {
                                className: css.itemTime,
                                format: 'YY.MMDD.hhmm'
                            }, item.ts),
                        ]),
                        h(Grid, {
                            item: true,
                            className: css.itemArrow,
                        }, h(FontA, { name: 'chevron-right' })),
                    ]),
                ]);
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
                        let basketId = that.props.basketId;
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
