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

import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import FontA from 'react-fa';

import MainAppBar from '../../Units/MainAppBar/MainAppBar';
import BasketList from '../../Units/Basket/BasketList';

import UserList from '../../Units/User/UserList';

const style = theme => ({
    tabBar: {
        marginTop: 48,
        boxShadow: 'none',
    },
    listBox: {
        marginTop: 56,
        width: '100%',
    },
    tabIcon: {
        marginRight: 8,
    }
});


//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        title: '首页',
        contentHeight: window.innerHeight - 48,
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

    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    componentWillUnmount = () => {
        this.wdAuthListen && this.wdAuthListen();
        window.removeEventListener('resize', this.setContentSize);
    };

    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;
        let cuser = that.state.currentUser;

        //内容区
        let content = h(Grid, { container: true, justify: 'center', className: css.myBox }, [
            h(AppBar, { className: css.tabBar, color: 'default' }, [
                h(Tabs, {
                    fullWidth: true,
                    value: this.state.tabValue,
                    onChange: (evt, val) => {
                        that.setState({ tabValue: val });
                        global.$store('MainHomePage', {
                            tabsValue: val,
                        });
                    },
                    indicatorColor: 'primary',
                    textColor: 'primary',
                }, [
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'leaf', style: { marginRight: 8 } }),
                            h('span', '收集')
                        ]),
                    }),
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'user-plus', style: { marginRight: 8 } }),
                            h('span', '发现')
                        ]),
                    }),
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'star', style: { marginRight: 8 } }),
                            h('span', '收藏')
                        ]),
                    }),
                    h(Tab, {
                        icon: h('div', {}, [
                            h(FontA, { name: 'user', style: { marginRight: 8 } }),
                            h('span', '关注')
                        ]),
                    }),
                ])
            ]),
            h('div', { className: css.listBox }, [
                this.state.tabValue === 0 ? h(BasketList) : undefined,
                this.state.tabValue === 1 ? h(UserList, {
                    wdRefObj: cuser ? global.$wd.sync().ref(`ucheck`).limitToLast(10) : null,
                }) : undefined,
                this.state.tabValue === 2 ? h(BasketList, { isFocus: true }) : undefined,
                this.state.tabValue === 3 ? h(UserList, {
                    wdRefObj: cuser ? global.$wd.sync().ref(`ufollow/${cuser.uid}`) : null,
                }) : undefined,
            ]),
        ]);

        //最终拼合
        let contentStyle = {
            padding: 16,
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };

        return h(Grid, { container: true, }, [
            h(MainAppBar, { title: that.state.title }),
            h(Grid, { container: true, style: { height: 72 } }),
            h(Grid, { container: true, justify: 'center' },
                h(Grid, { item: true, xs: 12, sm: 10, md: 8, style: contentStyle }, content),
            ),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
