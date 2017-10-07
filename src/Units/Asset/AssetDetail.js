/*
根据用户uid获取其资源列表
props:{
    userId:如果为空则自动调取当前用户的uid使用
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
import UserMini from '../../Units/User/UserMini';

//元件
class com extends Component {
    state = {
        asset: null,
        curUser: null,
        author: {},
    };

    //界面生成之前，读取数据
    componentWillMount = async function() {
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
            that.setState({ asset: asset });
            global.$wd.sync().ref(`user/${asset.author}`).once('value', (shot) => {
                that.setState({ author: shot.val() || {} });
            });
        });
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {};

    //渲染实现
    render() {
        let that = this;

        const css = that.props.classes;
        const AssetTypes = global.$conf.assetTypes;
        const asset = that.state.asset || {};

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
                h(UserMini, { userId: asset.author }),
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
                    className: css.contentBtn
                }, '显示内容'),
                isAuthor ? h(Button, {
                    className: css.contentBtn,
                    onClick: () => {

                    },
                }, '编辑') : undefined,
                isAuthor ? h(Button, {
                    className: css.contentBtn,
                    onClick: () => {

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
