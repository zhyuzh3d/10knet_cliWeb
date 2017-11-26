/*
静态元件:单个分组项
props:{
    info:数据对象,{author,id},
    useMenu:是否使用编辑菜单
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
        fontSize: 10,
        fontWeight: 200,
        color: '#AAA',
        verticalAlign: 'middle',
    },
});

//元件
class com extends Component {
    state = {};

    componentWillMount = async function() {};

    //点击跳转打开详情页面
    clickHandler = () => {
        let that = this;
        let info = that.props.info;
        let useMenu = that.props.useMenu;

        global.$router.changePage('GroupDetailPage', {
            info: info,
            useMenu: useMenu,
        });
    };

    //删除一个项目,同时删除info和ref
    deletItem = () => {
        let that = this;
        let info = that.props.info;
        if(!info || !info.author || !info.id) return;

        global.$confirm.fn.show({
            title: `确定删除[${info.title}]分组吗?`,
            text: '删除后成员全部丢失，无法恢复',
            okHandler: () => {
                let ref = global.$wd.sync().ref(`ugroup/${info.author}/${info.id}`);
                ref.remove().then((res) => {
                    global.$snackbar.fn.show('删除成功', 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`删除失败:${err.message}`, 3000);
                });
                global.$wd.sync().ref(`group/${info.id}`).remove();
            },
        });
    };

    //置顶item,设置info.pos等于当前时间戳
    setItemTop = () => {
        let that = this;
        let info = that.props.info;
        if(!info || !info.author || !info.id) return;

        let ref = global.$wd.sync().ref(`ugroup/${info.author}/${info.id}`);
        ref.update({
            top: global.$wd.sync().ServerValue.TIMESTAMP,
        }).then((res) => {
            global.$snackbar.fn.show('置顶成功', 2000);
        }).catch((err) => {
            global.$snackbar.fn.show(`置顶失败:${err.message}`, 3000);
        });
    };

    //置顶item,设置info.pos等于当前时间戳
    setItemUnTop = () => {
        let that = this;
        let info = that.props.info;
        if(!info || !info.author || !info.id) return;

        let ref = global.$wd.sync().ref(`ugroup/${info.author}/${info.id}`);
        ref.update({ top: 0, }).then((res) => {
            global.$snackbar.fn.show('取消置顶成功', 2000);
        }).catch((err) => {
            global.$snackbar.fn.show(`取消置顶失败:${err.message}`, 3000);
        });
    };

    //重命名,同时更新info和ref
    renameItem = () => {
        let that = this;
        let info = that.props.info;
        if(!info || !info.author || !info.id) return;

        global.$confirm.fn.show({
            title: '请输入新的分组新名称',
            input: {
                label: '分组新名称',
                tip: '2～32个字符',
                regx: /^.{2,32}$/,
                value: info.title,
            },
            okHandler: (ipt) => {
                let ref = global.$wd.sync().ref(`ugroup/${info.author}/${info.id}`);
                ref.update({
                    title: ipt,
                }).then((res) => {
                    global.$snackbar.fn.show('修改成功', 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`修改失败:${err.message}`, 3000);
                });
                global.$wd.sync().ref(`group/${info.id}/info`).update({ title: ipt });
            },
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let info = that.props.info;
        let useMenu = that.props.useMenu;


        //当前用户编辑菜单
        let cuserMenuGrp;
        if(useMenu) {
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
                }, info.top ? '移到顶部' : '置顶'),
                info.top && h(MenuItem, {
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

        return h(ListItem, {
            className: css.item,
            button: true,
        }, [
            h(Grid, { container: true, align: 'center' }, [
                h(Grid, {
                    item: true,
                    className: css.itemIcon,
                    onClick: that.clickHandler,
                }, h(FontA, { name: info.top ? 'address-book' : 'address-book-o' })),
                h(Grid, {
                    item: true,
                    className: css.itemText,
                    onClick: that.clickHandler,

                }, [
                    h('div', { className: css.itemTitle }, info.title || '未标题...'),
                    h(Moment, {
                        className: css.itemTime,
                        format: 'YYYY/MM/DD hh:mm'
                    }, info.ts),
                ]),
                useMenu ? cuserMenuGrp : h(Grid, {
                    item: true,
                    className: css.itemArrow,
                    onClick: that.clickHandler,
                }, h(FontA, { name: 'chevron-right' })),
            ]),
        ]);

    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
