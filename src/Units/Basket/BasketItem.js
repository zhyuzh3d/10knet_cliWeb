/*
单个篮筐项
props:{
    item:数据对象,带有item.id
    currentUser:当前用户，用于判断是否显示菜单
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Menu, { MenuItem } from 'material-ui/Menu';
import ButtonBase from 'material-ui/ButtonBase';
import { ListItem } from 'material-ui/List';
import FontA from 'react-fa';
import Moment from 'react-moment';



const style = theme => ({
    item: {
        padding: '8px 16px',
        borderBottom: '1px solid #EEE',
    },
    itemIcon: {
        margin: 8,
    },
    itemArrow: {
        fontSize: 8,
        color: '#AAA',
        width: 56,
        height: 48,
        textAlign: 'center',
    },
    itemText: {
        margin: 8,
        flex: 1,
    },
    itemTitle: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#333',
    },
    itemTime: {
        fontSize: 8,
        fontWeight: 200,
        color: '#AAA',
        verticalAlign: 'middle',
    },
});

//元件
class com extends Component {
    state = {
        editMod: false,
    };

    //点击跳转打开素材列表页面
    clickHandler = () => {
        let that = this;
        let item = that.props.item;

        global.$router.changePage('AssetListPage', {
            userId: null,
            wdRef: `basket/${item.id}`,
            basketId: item.id,
            appBarTitle: item.title,
        });
    };

    //删除一个篮子，只是删除ubasket下面的篮子，并不真正删除basket下包含素材的篮子
    deletItem = () => {
        let that = this;
        let item = that.props.item;
        let userId = that.props.currentUser ? that.props.currentUser.uid : null;
        if(!item || !userId) return;

        global.$confirm.fn.show({
            title: `确定删除${item.title}吗?`,
            text: '删除后无法恢复',
            okHandler: () => {
                global.$wd.sync().ref(`ubasket/${userId}/${item.id}`).remove().then((res) => {
                    global.$snackbar.fn.show('删除成功', 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`删除失败:${err.message}`, 3000);
                });
            },
        });
    };

    //置顶item,设置item.pos等于当前时间戳
    setItemTop = () => {
        let that = this;
        let item = that.props.item;
        let userId = that.props.currentUser ? that.props.currentUser.uid : null;
        if(!item || !userId) return;

        global.$wd.sync().ref(`ubasket/${userId}/${item.id}`).update({
            top: global.$wd.sync().ServerValue.TIMESTAMP,
        }).then((res) => {
            global.$snackbar.fn.show('置顶成功', 2000);
        }).catch((err) => {
            global.$snackbar.fn.show(`置顶失败:${err.message}`, 3000);
        });
    };

    //置顶item,设置item.pos等于当前时间戳
    setItemUnTop = () => {
        let that = this;
        let item = that.props.item;
        let userId = that.props.currentUser ? that.props.currentUser.uid : null;
        if(!item || !userId) return;

        global.$wd.sync().ref(`ubasket/${userId}/${item.id}/top`).remove().then((res) => {
            global.$snackbar.fn.show('取消置顶成功', 2000);
        }).catch((err) => {
            global.$snackbar.fn.show(`取消置顶失败:${err.message}`, 3000);
        });
    };

    //重命名
    renameItem = () => {
        let that = this;
        let item = that.props.item;
        let userId = that.props.currentUser ? that.props.currentUser.uid : null;
        if(!item || !userId) return;

        global.$confirm.fn.show({
            title: '请输入篮子新名称',
            input: {
                label: '篮子新名称',
                tip: '2～32个字符',
                regx: /^.{2,32}$/,
                value: item.title,
            },
            okHandler: (ipt) => {
                global.$wd.sync().ref(`ubasket/${userId}/${item.id}`).update({
                    title: ipt,
                }).then((res) => {
                    global.$snackbar.fn.show('修改成功', 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`修改失败:${err.message}`, 3000);
                });
            },
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let cuser = that.props.currentUser;
        let item = that.props.item;

        let editMod = false;
        if(cuser && item && cuser.uid === item.author) {
            editMod = true;
        };


        //当前用户编辑菜单
        let cuserMenuGrp;
        if(editMod) {
            let cuserMenuBtn = h(ButtonBase, {
                className: css.itemArrow,
                onClick: (evt) => {
                    that.setState({
                        cuserMenuOpen: !that.state.cuserMenuOpen,
                        cuserMenuAnchor: evt.currentTarget,
                    })
                }
            }, [
                h(FontA, { name: 'bars' }),
            ]);

            let cuserMenus = h(Menu, {
                open: that.state.cuserMenuOpen,
                anchorEl: that.state.cuserMenuAnchor,
                onRequestClose: () => { that.setState({ cuserMenuOpen: false }) },
            }, [
                h(MenuItem, {
                    onClick: () => {
                        that.setState({ cuserMenuOpen: false });
                        that.setItemTop();
                    },
                }, item.top ? '移到顶部' : '置顶'),
                item.top && h(MenuItem, {
                    onClick: () => {
                        that.setState({ cuserMenuOpen: false });
                        that.setItemUnTop();
                    },
                }, '取消置顶'),
                h(MenuItem, {
                    onClick: () => {
                        that.setState({ cuserMenuOpen: false });
                        that.renameItem();
                    },
                }, '重命名'),
                h(MenuItem, {
                    onClick: () => {
                        that.setState({ cuserMenuOpen: false });
                        that.deletItem();
                    },
                }, '删除'),
            ]);

            cuserMenuGrp = h('div', { className: css.cuserMenuGrp }, [
                cuserMenuBtn,
                cuserMenus,
            ]);
        };

        let itemEl = h(ListItem, {
            className: css.item,
            button: true,
        }, [
            h(Grid, { container: true, align: 'center' }, [
                h(Grid, {
                    item: true,
                    className: css.itemIcon,
                    onClick: that.clickHandler,
                }, h(FontA, { name: item.top ? 'folder' : 'folder-o' })),
                h(Grid, {
                    item: true,
                    className: css.itemText,
                    onClick: that.clickHandler,

                }, [
                    h('div', { className: css.itemTitle }, item.title || '未标题...'),
                    h(Moment, {
                        className: css.itemTime,
                        format: 'YYYY/MM/DD hh:mm'
                    }, item.ts),
                ]),
                editMod ? cuserMenuGrp : h(Grid, {
                    item: true,
                    className: css.itemArrow,
                    onClick: that.clickHandler,
                }, h(FontA, { name: 'chevron-right' })),
            ]),
        ]);
        return itemEl;

    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
