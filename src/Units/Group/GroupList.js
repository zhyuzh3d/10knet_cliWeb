/*
动态元件：根据用户uid获取用户关注的组列表，uid不能为空
props:{
    userId,
    useMenu, 是否使用添加按钮
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import List from 'material-ui/List';

import GroupItem from '../../Units/Group/GroupItem';


const style = theme => ({
    loading: {
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        color: '#AAA',
        marginTop: 64,
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
        data: null, //obj
    };

    //界面生成之前，读取数据
    componentDidMount = async function() {
        let that = this;
        let userId = that.props.userId;
        if(!userId) return;
        that.setState({ userId: userId });
        that.getListByUid(userId);
    };

    //根据uid获取列表
    getListByUid = (userId) => {
        let that = this;
        let ref = global.$wd.sync().ref(`ugroup/${userId}`);
        ref.on('value', (shot) => {
            that.setState({ data: shot.val() });
        });
    };

    //取消野狗监听
    componentWillUnmount = () => {
        let userId = this.props.userId;
        if(userId) global.$wd.sync().ref(`ugroup/${userId}`).off();
    };

    //打开新增弹窗
    openAddDialog = () => {
        let that = this;
        let userId = that.props.userId;
        if(!userId) return;

        global.$confirm.fn.show({
            title: '请输入新名称',
            input: {
                label: '分组名称',
                tip: '2～32个字符',
                regx: /^.{2,32}$/,
                value: '未命名',
            },
            okHandler: (ipt) => {
                that.addItem(ipt);
            },
        });
    };

    //新建一个空项目,同步ref和info
    addItem = (ipt) => {
        let that = this;
        let userId = that.props.userId;
        if(!userId) return;

        let ref = global.$wd.sync().ref(`group`);
        ref.push({ author: userId }).then((res) => {
            if(!res || !res.key()) return;
            let key = res.key();
            let info = {
                title: ipt || '未命名',
                id: key,
                author: userId,
                ts: global.$wd.sync().ServerValue.TIMESTAMP,
            }
            let ref2 = global.$wd.sync().ref(`ugroup/${userId}/${key}`);
            ref2.update(info).then((res) => {
                global.$snackbar.fn.show('创建成功', 2000);
            });
        }).catch((err) => {
            global.$snackbar.fn.show(`创建失败:${err.message}`, 3000);
        });
    };


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let data = that.state.data;
        let itemElArr = [];
        if(data) {
            let itemArr = [];
            for(var key in data) {
                data[key].id = key;
                itemArr.push(data[key])
            };

            //排序
            itemArr = itemArr.sort(global.$fn.sortByTopTs);
            itemArr.forEach((item, index) => {
                let el = h(GroupItem, {
                    info: item,
                    useMenu: true,
                });
                itemElArr.push(el);
                itemElArr.push(h('div', { className: css.divider }));
            });
        };

        //新增按钮
        let fab;
        if(that.props.useMenu) {
            fab = h(Button, {
                fab: true,
                color: 'accent',
                className: css.addFab,
                onClick: () => {
                    that.openAddDialog();
                },
            }, h(AddIcon, { className: css.addIcon }));
        };

        return h(List, { style: { padding: 0 } }, [
            h('div', {
                className: css.itemListBox,
            }, itemElArr),
            that.props.useMenu ? fab : null,
        ]);
    };
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
