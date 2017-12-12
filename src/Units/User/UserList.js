/*
根据wdRef读取用户列表并显示
props:{
    wdRefObj:野狗数据参照路径,与userId不同时使用
    currentUser:当前用户
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import FontA from 'react-fa';

import UserItem from '../../Units/User/UserItem';


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
        currentUser: null,
        list: null,
        isCurrentUser: false,
    };

    wdAuthListen = null;

    //界面生成之前，读取数据
    componentDidMount = async function() {
        let that = this;
        let wdRefObj = this.props.wdRefObj;

        wdRefObj && wdRefObj.on('value', (shot) => {
            that.setState({ list: shot.val() });
        });
    };
    //取消野狗监听
    componentWillUnmount = () => {
        let wdRefObj = this.props.wdRefObj;
        if(wdRefObj) wdRefObj.off('value');
    };
    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;

        let itemElArr = h(Grid, { item: true, className: css.loading }, [
            h(FontA, { name: 'spinner', spin: true }),
        ]);
        let list = that.state.list;

        itemElArr = [];
        if(list) {
            let itemArr = [];
            for(var key in list) {
                list[key].id = key;
                itemArr.push(list[key])
            };

            //排序
            itemArr.forEach((item, index) => {
                let el = h(UserItem, {
                    userId: item.id,
                    currentUser: that.state.currentUser,
                });
                itemElArr.push(el);
                itemElArr.push(h('div', { className: css.divider }));
            });
        };

        return h('div', { style: { padding: 0 } }, itemElArr);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
