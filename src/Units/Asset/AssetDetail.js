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
        fontSize: 8,
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
        fontSize: 8,
        width: 56,
        minWidth:56,
        textAlign: 'center',
    },
});

//元件
class com extends Component {
    state = {
        asset: null,
        curUser: null,
        author: {},
        isSrc: false,
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
                    color: 'accent',
                    className: css.contentBtn,
                    onClick: () => {
                        window.open(asset.url);
                    },
                }, '打开链接'),

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
