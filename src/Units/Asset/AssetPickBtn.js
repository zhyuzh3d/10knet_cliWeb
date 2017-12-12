/*
静态元件，提供一个通用的拾取素材的按钮,自动打开主面板
先弹出篮筐列表，选择后打开assetEditpage页面并自动填充
props:{
    data,编辑页assetEditpage填充的数据{title,url,desc,sliderId,problemId,type,ver}
    style,样式对象，传递到Button
    children,按钮上的内容对象，
    fab,是否浮动按钮，
    raised,是否升起
    color,Button颜色
    successPage,修改完成跳转的页面名称
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


import Button from 'material-ui/Button';
import FontA from 'react-fa';

const style = theme => ({

});


//元件
class com extends Component {
    state = {
        data: null,
        result: null, //判题结果
        judging: false, //正在判题，冻结判题按钮
        id: null, //题目的id
    };

    //收集一个题目
    pickAsAsset = () => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        if(!cuser) {
            global.$alert.fn.show(`您还没有登录，不能创建素材`, 3000);
            return;
        };

        let userId = cuser.uid;
        global.$wd.sync().ref(`ubasket/${userId}`).once('value', (shot) => {
            let baskets = shot.val();
            if(!baskets) {
                //创建新篮子
                let bref = global.$wd.sync().ref(`basket`);
                bref.push({ author: userId }).then((res) => {
                    let basketId = res.key();
                    let asset = {
                        title: '临时收集篮',
                        picker: userId,
                        ts: global.$wd.sync().ServerValue.TIMESTAMP,
                        top: false,
                    };
                    global.$wd.sync().ref(`ubasket/${userId}`).update({
                        [basketId]: asset,
                    }).then((res) => {
                        that.openAssetEditPage(basketId);
                    });
                }).catch((err) => {
                    global.$snackbar.fn.show(`采集失败:${err.message}`, 3000);
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
                        that.openAssetEditPage(basket.id);
                    },
                });
            };
        });
    };

    //打开素材拾取页面
    openAssetEditPage = (basketId) => {
        let that = this;
        global.$app.toggleMainPart(true); //显示主面板
        global.$store('AssetEditPage', { assetId: undefined }); //清理旧ID

        let opt = {
            basketId: basketId,
            appBarTitle: '新建题目素材',
            data: that.props.data,
            successPage: 'AssetListPage',
        };
        if(global.$router.getCurrentPage() === 'AssetEditPage') {
            global.$router.goPage('BlankPage');
        };
        setTimeout(() => {
            global.$router.changePage('AssetEditPage', opt);
        }, 100);
    };

    render() {
        let that = this;
        const css = that.props.classes;

        return h(Button, {
            className: css.comBox,
            fab: that.props.fab,
            raised: that.props.raised,
            color: that.props.color ? that.props.color : 'primary',
            onClick: () => {
                that.pickAsAsset();
            },
            style: that.props.style,
        }, that.props.children ? that.props.children : [
            h(FontA, { name: 'leaf' }),
            !that.props.fab ? h('span', { style: { marginLeft: 8 } }, "拾取") : null,
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
