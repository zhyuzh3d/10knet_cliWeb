/*
Asset资源详情页面
props:{
    assetId:
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';
import Moment from 'react-moment';

import style from './_style';
import UserButton from '../../Units/User/UserButton';

//元件
class com extends Component {
    state = {
        asset: null,
        curUser: null,
        author: {},
    };

    //界面生成之前，读取数据
    componentDidMount = async function() {
        let that = this;
        let assetId = that.props.assetId;
        if(assetId) that.getAsset(assetId);

        global.$wd.auth().onAuthStateChanged((user) => {
            if(global.$wd.auth().currentUser) {
                that.setState({ currentUser: user });
            };
        });
    };

    //根据uid获取资源列表
    getAsset = (assetId) => {
        let that = this;
        let ref = global.$wd.sync().ref(`asset/${assetId}`);
        ref.on('value', (shot) => {
            let asset = shot.val();
            if(!asset) return;
            that.setState({ asset: asset });
            global.$wd.sync().ref(`user/${asset.author}`).once('value', (shot) => {
                that.setState({ author: shot.val() || {} });
            });
        });
    };

    //取消野狗监听
    componentWillUnmount = () => {
        let that = this;
        let assetId = that.props.assetId;
        if(assetId) global.$wd.sync().ref(`asset/${assetId}`).off('value');
    };

    //删除asset，然后返回上一页
    removeAsset = (assetId) => {
        let ref = global.$wd.sync().ref(`asset/${assetId}`);
        ref.remove().then(() => {
            global.$wd.sync().ref(`asset/${assetId}`).off('value');
            global.$snackbar.fn.show('删除成功', 2000);
            global.$router.prevPage();
        }).catch((err) => {
            global.$alert.fn.show('删除失败，请重试', err.message);
        });
    };

    //渲染实现
    render() {
        let that = this;

        const css = that.props.classes;
        const AssetTypes = global.$conf.assetTypes;
        const asset = that.state.asset || {};
        let assetId = that.props.assetId;

        let isAuthor = false;
        const curUser = that.state.currentUser;
        if(curUser && curUser.uid === asset.author) isAuthor = true;

        return h(Grid, { container: true, style: { padding: 16 } }, [
            h(Grid, { item: true, xs: 12, className: css.detailTitle }, [
                h(FontA, {
                    name: AssetTypes[asset.type || 'link'].icon,
                    className: css.detailTypeIcon,
                }),
                h('span', { style: { marginLeft: 12 } }, asset.title || '未知的标题...'),
            ]),
            h(Grid, { item: true, xs: 12, style: { paddingTop: 0, paddingBottom: 0 } }, [
                h(UserButton, { userId: asset.author, size: 'sm' }),
                h(Moment, {
                    className: css.assetTime,
                    format: 'YY.MMDD.hhmm'
                }, asset.ts),
            ]),
            h(Grid, { item: true, xs: 12, className: css.detailDesc }, asset.desc || '拾取者什么解释也没留下...'),
            h(Grid, { item: true, xs: 12 }, [
                h(Button, {
                    raised: true,
                    color: 'accent',
                    className: css.contentBtn,
                    onClick: () => {
                        window.open(asset.url);
                    },
                }, '打开链接'),
                isAuthor ? h(Button, {
                    className: css.contentBtn,
                    onClick: () => {
                        global.$router.changePage('AssetEditPage', { assetId: assetId });
                    },
                }, '编辑') : undefined,
                isAuthor ? h(Button, {
                    className: css.contentBtn,
                    onClick: () => {
                        global.$confirm.fn.show({
                            title: '警告！',
                            text: '删除后将无法恢复',
                            okHandler: () => {
                                that.removeAsset(assetId);
                            },
                        });
                    },
                }, '删除') : undefined,
            ]),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
