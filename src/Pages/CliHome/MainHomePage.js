/*
控制面板首页
props:{
    currentUser
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import FontA from 'react-fa';

import MainAppBar from '../../Units/MainAppBar/MainAppBar';
import BasketList from '../../Units/Basket/BasketList';

import UserList from '../../Units/User/UserList';
import GroupList from '../../Units/Group/GroupList';

const style = theme => ({
    pageBox: {
        width: '100%',
        height: '100%',
    },
    tabBar: {
        boxShadow: 'none',
        position: 'relative',
        borderBottom: '1px solid #CCC',
        height: 48,
        width: 'calc(100% - 32px)',
        marginLeft: -32,
    },
    listBox: {
        width: '100%',
        height: '100%',
    },
    tabIcon: {
        marginRight: 8,
    },
    tabs: {
        postion: 'relative',
    },
    tabBtn: {
        minWidth: 30,
        fontSize: 12,
    },
    tabBtnIcon: {
        margin: 4,
        fontSize: 16,
        display: 'block',
    },
    tabBtnTxt: {
        marginRight: 4,
        fontSize: 12,
        display: 'block',
        marginBottom: 16,
    }
});

//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        title: '首页',
        currentUser: null,
        tabValue: 0,
    };


    wdAuthListen;
    componentDidMount = async function() {
        window.addEventListener('resize', this.setContentSize);
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged((user) => {
            this.setState({ currentUser: user });
        });

        //延迟以避免指示条出错
        setTimeout(() => {
            this.setState({ tabValue: global.$store('MainHomePage', 'tabsValue') || 0 });
        }, 200);
    };


    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;
        let cuser = that.state.currentUser;

        //内容区
        let content = [
            h(AppBar, {
                style: {
                    boxShadow: 'none',
                    position: 'relative',
                    borderBottom: '1px solid #CCC',
                    height: 48,
                },
                color: 'default'
            }, [
                h(Tabs, {
                    fullWidth: true,
                    className: css.tabs,
                    value: this.state.tabValue,
                    onChange: (evt, val) => {
                        that.setState({ tabValue: val });
                        global.$store('MainHomePage', {
                            tabsValue: val,
                        });
                    },
                    buttonClassName: css.tabBtn,
                    indicatorColor: 'primary',
                    textColor: 'primary',
                }, [
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'leaf', className: css.tabBtnIcon }),
                            h('span', { className: css.tabBtnTxt }, '采集')
                        ]),
                    }),
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'star', className: css.tabBtnIcon }),
                            h('span', { className: css.tabBtnTxt }, '收藏')
                        ]),
                    }),
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'group', className: css.tabBtnIcon }),
                            h('span', { className: css.tabBtnTxt }, '小组')
                        ]),
                    }),
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'heart', className: css.tabBtnIcon }),
                            h('span', { className: css.tabBtnTxt }, '关注')
                        ]),
                    }),
                ])
            ]),
            h('div', {
                style: {
                    width: '100%',
                    height: 'calc(100% - 96px)',
                    overflowY: 'auto',
                },
            }, [
                this.state.tabValue === 0 ? h(BasketList) : undefined,
                this.state.tabValue === 1 ? h(BasketList) : undefined,
                this.state.tabValue === 2 && cuser ? h(GroupList, {
                    userId: cuser.uid,
                    useMenu: true,
                }) : undefined,
                this.state.tabValue === 3 && cuser ? h(UserList, {
                    wdRefObj: global.$wd.sync().ref(`ufollow/${cuser.uid}`),
                }) : undefined,
            ]),
        ];


        //最终拼合
        return h('div', { style: { width: '100%', height: '100%' } }, [
            h(MainAppBar, { title: that.state.title }),
            h('div', {
                style: {
                    margin: 0,
                    height: '100%',
                    overflow: 'hidden',
                },
            }, content),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
