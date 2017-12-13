/*
Asset资源详情页面
props:{
    assetId,
    basketId,如果存在，就读取basket/arr/assetId数据；如果不存在就读取src/assetId源数据
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import FontA from 'react-fa';
import Moment from 'react-moment';

import UserButton from '../../Units/User/UserButton';

const style = theme => ({
    title: {
        flex: 1,
        fontSize: '1rem',
        lineHeight: '1.5rem',
        fontWeight: 'bold',
    },
    typeIcon: {

    },
    time: {
        fontSize: 10,
        fontWeight: 200,
        color: '#AAA',
        verticalAlign: 'middle',
    },
    desc: {
        marginBottom: theme.spacing.unit,
        fontSize: '0.9rem',
        lineHeight: '1.4rem',
        color: '#666',
        textAlign: 'justify',
        letterSpacing: '0.05rem',
        fontWeight: 400,
    },
    contentBtn: {
        marginRight: theme.spacing.unit,
    },
    itemMenu: {
        width: 56,
        minWidth: 56,
        textAlign: 'center',
        verticalAlign: 'middle',
    },
});

//元件
class com extends Component {
    state = {
        asset: null,
        curUser: null,
        author: {},
        isSrc: false,
        myBasketArr: [],
    };

    wdAuthListen = null;

    //界面生成之前，读取数据
    componentDidMount = async function() {
        let that = this;
        let assetId = that.props.assetId;
        if(assetId) that.getAsset();

        that.wdAuthListen = global.$wd.auth().onAuthStateChanged((user) => {
            if(global.$wd.auth().currentUser) {
                that.setState({ currentUser: user });
            };
        });
    };

    //根据uid获取资源列表
    wdDataRef = null;
    getAsset = () => {
        let that = this;
        let assetId = that.props.assetId;
        let basketId = that.props.basketId;
        if(!assetId) return;

        let ref = global.$wd.sync().ref(`src/${assetId}`);
        if(basketId) {
            ref = global.$wd.sync().ref(`basket/${basketId}/arr/${assetId}`);
            that.setState({ isSrc: false });
        } else {
            that.setState({ isSrc: true });
        };
        that.wdDataRef = ref;
        ref.on('value', (shot) => {
            let asset = shot.val();
            if(!asset) return;
            asset.id = assetId;
            that.setState({ asset: asset });
        });
    };

    //取消野狗监听
    componentWillUnmount = () => {
        try {
            this.wdAuthListen && this.wdAuthListen();
            this.wdDataRef.off('value');
        } catch(err) {};
    };

    //删除一个篮素材，只是删除ubasket/uid/arr下面的素材，不删src
    deletItem = () => {
        let that = this;
        let asset = that.state.asset;
        let assetId = that.props.assetId;
        let basketId = that.props.basketId;

        let cuser = global.$wd.auth().currentUser;
        let userId = cuser ? cuser.uid : null;
        if(!assetId || !basketId || !userId) return;

        global.$confirm.fn.show({
            title: `确定删除${asset.title}吗?`,
            text: '删除后无法恢复',
            okHandler: () => {
                let ref = global.$wd.sync().ref(`basket/${basketId}/arr/${assetId}`);
                ref.remove().then((res) => {
                    global.$snackbar.fn.show('删除成功', 2000);
                    global.$router.prevPage();
                }).catch((err) => {
                    global.$snackbar.fn.show(`删除失败:${err.message}`, 3000);
                });
            },
        });
    };

    //拾取，把当前素材复制一份到自己的篮子，picker变自己
    pick = () => {
        let that = this;
        let asset = that.state.asset;
        let cuser = global.$wd.auth().currentUser;

        if(!cuser) {
            global.$snackbar.fn.show(`您还没有登录，不能拾取`, 3000);
            return;
        };

        if(!asset) {
            global.$snackbar.fn.show(`没有素材，不能拾取`, 3000);
            return;
        };

        //获取篮子列表
        let userId = cuser.uid;
        global.$wd.sync().ref(`ubasket/${userId}`).once('value', (shot) => {
            let baskets = shot.val();
            if(!baskets) {
                //创建新篮子
                let bref = global.$wd.sync().ref(`basket`);
                bref.push({ author: userId }).then((res) => {
                    Object.assign(asset, {
                        title: '临时收集篮',
                        picker: userId,
                        ts: global.$wd.sync().ServerValue.TIMESTAMP,
                        top: false,
                    });
                    let itemKey = res.key();
                    global.$wd.sync().ref(`ubasket/${userId}`).update({
                        [itemKey]: asset,
                    }).then((res) => {
                        that.copyAssetToBasket(userId, asset, itemKey);
                    });
                }).catch((err) => {
                    global.$snackbar.fn.show(`收集失败:${err.message}`, 3000);
                });
            } else {
                //提示用户选择
                let arr = [];
                for(let key in baskets) {
                    baskets[key].id = key;
                    arr.push(baskets[key]);
                };
                global.$selector.fn.show({
                    title: '请选择收集篮',
                    itemArr: arr,
                    okHandler: (basket) => {
                        that.copyAssetToBasket(userId, asset, basket.id);
                    },
                });
            };
        });
    };

    //将asset存储到我的basket，同时记录到src/pick,不变src
    copyAssetToBasket = (uid, asset, basketId) => {
        let ref = global.$wd.sync().ref(`basket/${basketId}/arr`);
        ref.push(asset).then((res) => {
            global.$snackbar.fn.show(`收集成功，请返回查看`, 2000);
        });
        global.$wd.sync().ref(`src/${asset.id}/pick`).update({
            [uid]: global.$wd.sync().ServerValue.TIMESTAMP,
        });
    };

    //打开素材,
    openAsset = async function(asset) {
        let that = this;
        let roomInfo = global.$live && global.$live.getRoomInfo ? global.$live.getRoomInfo() : null;
        if(asset.type === 'slider') {
            if(roomInfo) {
                global.$live.setIslider(asset.sliderId);
            } else {
                global.$alert.fn.show('你还没有开启直播', '幻灯片只能在直播中打开，请点击左上角闪电按钮开启直播');
            };
        } else if(asset.type === 'oj') {
            global.$live.toggleCoderOJ(true);
            setTimeout(() => {
                global.$live.showOJdetails(asset.problemId);
            }, 100);
        } else {
            if(roomInfo) {
                global.$live.showUrl(asset.picker, asset.url);
            } else {
                that.openLinkInPop(asset.url);
            };
        };
    };

    //在新窗口打开素材,弹出提示，如果确认就不再弹出
    openLinkInPop = (url) => {
        let hasPop = global.$store('AssetDetail', 'hasPopOpenLink');
        if(!hasPop) {
            global.$confirm.fn.show({
                title: '你还没有开启直播',
                text: '素材只能在直播中打开，请点击左上角闪电按钮开启直播',
                okBtnTxt: '我知道了',
                cancelBtnTxt: '不打开了',
                okHandler: () => {
                    window.open(url);
                    global.$store('AssetDetail', { hasPopOpenLink: true })
                },
            });
        } else {
            window.open(url);
        }
    };


    //渲染实现
    render() {
        let that = this;

        const css = that.props.classes;
        const AssetTypes = global.$conf.assetTypes;
        const asset = that.state.asset || {};
        let assetId = that.props.assetId;
        let basketId = that.props.basketId;

        let isAuthor = false;
        const curUser = that.state.currentUser;
        if(curUser && curUser.uid === asset.author) isAuthor = true;

        return h(Grid, { container: true, style: { padding: '16px 32px' } }, [
            h(Grid, { item: true, xs: 12, className: css.title }, [
                h(FontA, {
                    name: AssetTypes[asset.type || 'link'].icon,
                    className: css.typeIcon,
                }),
                h('span', { style: { marginLeft: 12 } }, asset.title || '未知的标题...'),
            ]),
            h(Grid, { item: true, xs: 12, style: { paddingTop: 0, paddingBottom: 0 } }, [
                h(UserButton, { userId: asset.author, size: 'sm' }),
                h(Moment, {
                    className: css.time,
                    format: 'YY.MMDD.hhmm'
                }, asset.ts),
            ]),
            h(Grid, { item: true, xs: 12, className: css.desc }, asset.desc || '拾取者什么解释也没留下...'),
            h(Grid, { item: true, xs: 12 }, [
                h(Button, {
                    raised: true,
                    color: 'primary',
                    className: css.contentBtn,
                    onClick: () => {
                        that.openAsset(asset);
                    },
                }, [
                    h(FontA, { name: 'fire', style: { marginRight: 8 } }),
                    h('span', '打开'),
                ]),

                h(Button, {
                    raised: true,
                    color: 'accent',
                    className: css.contentBtn,
                    onClick: () => {
                        that.pick();
                    },
                }, [
                    h(FontA, { name: 'leaf', style: { marginRight: 8 } }),
                    h('span', '副本'),
                ]),

                //当前用户编辑菜单
                (isAuthor && basketId) ? h(Button, {
                    raised: true,
                    className: css.itemMenu,
                    onClick: (evt) => {
                        that.setState({
                            cuserMenuOpen: !that.state.cuserMenuOpen,
                            cuserMenuAnchor: evt.currentTarget,
                        })
                    }
                }, [
                    h(FontA, { name: 'bars' }),
                ]) : undefined,
                (isAuthor && basketId) ? h(Menu, {
                    open: that.state.cuserMenuOpen,
                    anchorEl: that.state.cuserMenuAnchor,
                    onRequestClose: () => { that.setState({ cuserMenuOpen: false }) },
                }, [
                    h(MenuItem, {
                        onClick: () => {
                            global.$router.changePage('AssetEditPage', {
                                basketId: basketId,
                                assetId: assetId,
                            });
                        },
                    }, '编辑'),
                    h(MenuItem, {
                        onClick: () => {
                            that.setState({ cuserMenuOpen: false });
                            that.deletItem();
                        },
                    }, '删除'),
                ]) : undefined,
            ]),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
