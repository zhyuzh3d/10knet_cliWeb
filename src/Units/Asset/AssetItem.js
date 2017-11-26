/*
单个篮筐项
props:{
    item:数据对象,带有item.id和item.basket
    currentUser:当前用户，用于判断是否显示菜单
    moveUpHandler(item):向上移动
    moveDownHandler(item):向下移动
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
        fontSize: 10,
        color: '#AAA',
        width: 36,
        height: 48,
        textAlign: 'center',
    },
    itemMenu: {
        fontSize: 10,
        color: '#AAA',
        width: 48,
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
        color: '#333'
    },
    itemTime: {
        fontSize: 10,
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

        global.$router.changePage('AssetDetailPage', {
            assetId: item.id,
            basketId: item.basket,
            appBarTitle: item.title,
        });
    };

    //删除一个篮素材，只是删除ubasket/uid/arr下面的素材，不删src
    deletItem = () => {
        let that = this;
        let item = that.props.item;
        let userId = that.props.currentUser ? that.props.currentUser.uid : null;
        if(!item || !userId || !item.basket) return;

        global.$confirm.fn.show({
            title: `确定删除${item.title}吗?`,
            text: '删除后无法恢复',
            okHandler: () => {
                let ref = global.$wd.sync().ref(`basket/${item.basket}/arr/${item.id}`);
                ref.remove().then((res) => {
                    global.$snackbar.fn.show('删除成功', 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`删除失败:${err.message}`, 3000);
                });
            },
        });
    };

    //重命名
    renameItem = () => {
        let that = this;
        let item = that.props.item;
        if(!item || !item.basket || !item.id) return;

        global.$confirm.fn.show({
            title: '请输入素材新标题',
            input: {
                label: '素材新标题',
                tip: '2～32个字符',
                regx: /^.{2,32}$/,
                value: item.title,
            },
            okHandler: (ipt) => {
                global.$wd.sync().ref(`basket/${item.basket}/arr/${item.id}`).update({
                    title: ipt,
                }).then((res) => {
                    global.$snackbar.fn.show('修改成功', 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`修改失败:${err.message}`, 3000);
                });
            },
        });
    };

    //修改，打开编辑页面
    editItem = () => {
        let that = this;
        let item = that.props.item;

        global.$router.changePage('AssetEditPage', {
            basketId: item.basket,
            assetId: item.id,
            appBarTitle: item.title,
        });
    };


    //上移动，使用外部prop传来的方法
    moveItemUp = () => {
        let that = this;
        let item = that.props.item;
        let moveUpHandler = that.props.moveUpHandler;
        item && moveUpHandler && moveUpHandler(item);
    };

    //上移动，使用外部prop传来的方法
    moveItemDown = () => {
        let that = this;
        let item = that.props.item;
        let moveDownHandler = that.props.moveDownHandler;
        item && moveDownHandler && moveDownHandler(item);
    };



    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        const AssetTypes = global.$conf.assetTypes;

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
                className: css.itemMenu,
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
                        that.renameItem();
                    },
                }, '重命名'),
                h(MenuItem, {
                    onClick: () => {
                        that.setState({ cuserMenuOpen: false });
                        that.editItem();
                    },
                }, '编辑'),
                h(MenuItem, {
                    onClick: () => {
                        that.setState({ cuserMenuOpen: false });
                        that.deletItem();
                    },
                }, '删除'),
            ]);

            let upBtn = h(ButtonBase, {
                className: css.itemArrow,
                onClick: (evt) => {
                    that.setState({ cuserMenuOpen: false });
                    that.moveItemUp();
                }
            }, [
                 h(FontA, { name: 'arrow-up' }),
            ]);

            let downBtn = h(ButtonBase, {
                className: css.itemArrow,
                onClick: (evt) => {
                    that.setState({ cuserMenuOpen: false });
                    that.moveItemDown();
                }
            }, [
                 h(FontA, { name: 'arrow-down' }),
            ]);

            cuserMenuGrp = h('div', { className: css.cuserMenuGrp }, [
                cuserMenuBtn,
                that.props.moveDownHandler && upBtn,
                that.props.moveDownHandler && downBtn,
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
                }, h(FontA, { name: AssetTypes[item.type].icon })),
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
