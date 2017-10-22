import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Tabs, { Tab } from 'material-ui/Tabs';
import FontA from 'react-fa';

const style = theme => ({
    page: {
        padding: 0,
        margin: 0,
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        display: 'block',
    },
    tabs: {
        borderBottom: '1px solid #DDD',
        background: '#FAFAFA',
    },
    tab: {
        borderRight: '1px solid #DDD',
    },
    closeBtn: {
        minWidth: 20,
        width: 24,
        padding: 2,
        height: '100%',
        marginRight: 0,
    }
});



//元件
class com extends Component {
    state = {
        pages: [],
        tabValue: 0,
        contentHeight: window.innerHeight - 48,
    };

    //重新初始化ipc，使用自定义msg监听器
    componentWillMount = async function() {
        let that = this;

        window.addEventListener('resize', this.setContentSize);

        if(!global.$ipc) return;
        let ipc = global.$ipc;
        ipc.renderer.on('msg', (event, arg) => {
            switch(arg.payload.type) {
                case ipc.cmds.OPENULR:
                    that.openUrl(arg.payload);
                    break;
                default:
                    break;
            };
        });
    };


    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    //在标签卡中打开链接
    openUrl = (payload) => {
        let that = this;
        let arr = that.state.pages;
        arr.push({
            url: payload.url,
        });
        that.setState({
            pages: arr,
            tabValue: arr.length - 1,
        });
    };


    //关闭标签页
    closeTab = (index) => {
        let that = this;

        let arr = that.state.pages;
        arr.splice(index, 1);
        let val = that.state.tabValue || 0;

        if(val === index) val = index - 1;
        if(val >= arr.length - 1) val = arr.length - 1;

        that.setState({
            pages: arr,
        });

        setTimeout(() => {
            that.setState({
                tabValue: val,
            });
        }, 100);
    };

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {};

    //渲染实现
    render() {
        document.getElementsByTagName('title')[0].innerHTML = '资源浏览器';
        let that = this;
        const css = this.props.classes;

        let tabElarr = that.state.pages.map((item, index) => {
            let el = h(Tab, {
                className: css.tab,
                label: h('div', {
                    id: index,
                }, [
                    h(FontA, {
                        name: 'close',
                        className: css.closeBtn,
                        onClick: () => {
                            that.closeTab(index);
                        },
                    }),
                    h('span', '载入中')
                ]),
            });
            return el;
        });

        let tabEl = h(Tabs, {
            fullWidth: true,
            value: this.state.tabValue,
            onChange: (evt, val) => {
                that.setState({ tabValue: val });
            },
            indicatorColor: 'primary',
            textColor: 'primary',
            className: css.tabs,
        }, tabElarr);

        let contentArr = that.state.pages.map((item, index) => {
            let el = h('webview', {
                src: item.url,
                style: {
                    display: index === that.state.tabValue ? 'flex' : 'none',
                    height: that.state.contentHeight,
                },
            });
            return el;
        });

        let contentEl = h('div', {
            style: {
                height: that.state.contentHeight,
            }
        }, contentArr);


        return h(Grid, { container: true, className: css.page }, [
            tabEl,
            contentEl,
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default withStyles(style)(com);
