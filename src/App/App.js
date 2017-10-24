import { Component } from 'react';
import wilddog from 'wilddog';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { MuiThemeProvider, withStyles } from 'material-ui/styles';
import urlParser from 'urlparser';

import Theme from './Theme'; //主题风格
import Conf from './Conf'; //全局设置
import Pages from './Pages'; //全局设置

import MyFn from '../Utils/MyFn'; //统一的确认弹窗
import MyRouter from '../Utils/MyRouter'; //全局页面路由
import MyStore from '../Utils/MyStore'; //全局页面路由
import MySnackbar from '../Utils/MySnackbar'; //底部统一的提示
import MyAlert from '../Utils/MyAlert'; //统一的警告弹窗
import MyConfirm from '../Utils/MyConfirm'; //统一的确认弹窗
import MySelector from '../Utils/MySelector'; //统一的选择弹窗
import MyIpc from '../Utils/MyIpc'; //electron窗口进程通信ipc处理

import Grid from 'material-ui/Grid';
import style from './_style';
import FontA from 'react-fa';


//全局使用
global.$fn = MyFn;
global.$router = MyRouter;
global.$store = MyStore.store;
global.$storeRemove = MyStore.storeRemove;
global.$alert = MyAlert;
global.$confirm = MyConfirm;
global.$selector = MySelector;
global.$snackbar = MySnackbar;
global.$ipc = MyIpc;

//野狗账号与数据存储
global.$conf = Conf;
global.$wd = wilddog;
global.$wd.initializeApp(global.$conf.wd);
global.$app = {};

//所有公用函数
global.$xdata = {}; //穿越

//App元素
class App extends Component {
    state = {
        currentPage: 'div',
        currentUser: null,
        mainVis: true,
        consoleHei: 128,
        viewerHei: window.innerHeight - 128,
        viewerUrl: 'http://www.10knet.com',
    };

    //初始化ipc窗口和msg监听
    componentWillMount = () => {
        if(global.$ipc) {
            global.$ipc.init(global.$winName);
        };
    };

    //每分钟自动记录一次登录状态
    userCheckTimer = false;
    startAutoCheck = global.$app.startAutoCheck = (uid) => {
        let that = this;
        that.userCheckTimer && clearInterval(that.userCheckTimer);
        setInterval(() => {
            that.userCheck(uid);
        }, 60000);
    };

    //签到一次
    userCheck = global.$app.userCheck = (uid) => {
        global.$wd.sync().ref(`ucheck`).update({
            [uid]: { ts: global.$wd.sync().ServerValue.TIMESTAMP },
        }).catch((err) => {
            console.log(`[APP/userCheck]:${err}`);
        });

        global.$wd.sync().ref(`uchecks/${uid}`).transaction(function(cv) {
            return(cv || 0) + 1;
        }).catch((err) => {
            console.log(`[APP/userCheck]:${err}`);
        });
    };

    //初始化页面，自动根据地址栏路径判断切换到首页
    componentDidMount = async function() {
        global.$router.init(this, Pages);
        let urlObj = urlParser.parse(window.location.href);
        let pName = urlObj.path ? urlObj.path.base : 'MainHomePage';
        let urlPname = urlObj.query ? urlObj.query.params['pageName'] : undefined;
        pName = urlPname ? urlPname : pName;

        global.$router.changePage(pName, { currentUser: this.state.currentUser });

        //自适应viewer高度
        window.addEventListener('resize', () => {
            that.setState({ viewerHei: window.innerHeight - 97 });
        });

        //替换window.open命令
        window.open = (url) => {
            this.setState({ viewerUrl: url });
            //            console.log(window.innerWidth);
            /*
            let wd = window.screen.availWidth;
            let hei = window.screen.availHeight;
            global.$ipc.run(`mainWindow.setSize(${wd},${hei})`);
            global.$ipc.run(`mainWindow.setPosition(0,0)`);
            */
        };


        //野狗自动登录，自动定时签到
        let that = this;
        global.$currentUser = global.$wd.auth().currentUser;
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            that.setState({ currentUser: cuser });
            clearInterval(that.userCheckTimer);
            if(cuser) {
                that.userCheck(cuser.uid);
                that.startAutoCheck(cuser.uid);
            };
        });
    };

    xset = global.$app.xset = (obj) => {
        this.setState(obj);
    };

    //渲染实现
    render() {
        let that = this;
        document.getElementsByTagName('title')[0].innerHTML = '10knet - 拾课网';
        const css = this.props.classes;

        //当前地址
        let urlObj = urlParser.parse(window.location.href);
        console.log('>>urlObj', urlObj);

        //可折叠右侧资源栏360宽
        let mainPart = h(Grid, {
            item: true,
            className: css.mainPart,
            style: { display: that.state.mainVis ? 'flex' : 'none' },
        }, [
            h(that.state.currentPage),
            h(MySnackbar),
            h(MyAlert),
            h(MyConfirm),
            h(MySelector),
        ]);
        let mainVisbar = h('div', {
            className: css.mainVisBar,
            onClick: () => {
                that.setState({ mainVis: !that.state.mainVis });
            },
        }, h(FontA, {
            name: that.state.mainVis ? 'caret-right' : 'caret-left',
            className: css.visBarArr,
        }));

        let slavePart = h(Grid, {
            item: true,
            className: css.slavePart,
        }, h(Grid, {
            container: true,
            className: css.slaveBox,
        }, [
            h(Grid, {
                item: true,
                className: css.console,
                style: { height: that.state.consoleHei },
            }),
            h(Grid, {
                item: true,
                className: css.viewer,
                style: { padding: 0 },
            }, h('webview', {
                className: css.webview,
                style: { height: that.state.viewerHei },
                src: that.state.viewerUrl,
            })),
        ]));


        //最终拼合
        return h(MuiThemeProvider, {
            theme: Theme,
        }, h(Grid, {
            container: true,
            spacing: 0,
            className: css.partsContainer,
        }, [
            slavePart,
            mainVisbar,
            mainPart,
        ]));
    };
};

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(App);
