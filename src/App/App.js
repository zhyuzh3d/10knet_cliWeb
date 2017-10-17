import { Component } from 'react';
import wilddog from 'wilddog';
import h from 'react-hyperscript';
import { MuiThemeProvider } from 'material-ui/styles';
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

//全局使用
global.$fn = MyFn;
global.$router = MyRouter;
global.$store = MyStore.store;
global.$storeRemove = MyStore.storeRemove;
global.$alert = MyAlert;
global.$confirm = MyConfirm;
global.$selector = MySelector;
global.$snackbar = MySnackbar;

//野狗账号与数据存储
global.$conf = Conf;
global.$wd = wilddog;
global.$wd.initializeApp(global.$conf.wd);

//所有公用函数
global.$xdata = {}; //穿越

//App元素
class App extends Component {
    state = {
        currentPage: 'div',
    };

    //每分钟自动记录一次登录状态
    userCheckTimer = false;
    startAutoCheck = (uid) => {
        let that = this;
        setInterval(() => {
            that.userCheck(uid);
        }, 60000);
    };

    //签到一次
    userCheck = (uid) => {
        global.$wd.sync().ref(`ucheck`).update({
            [uid]: global.$wd.sync().ServerValue.TIMESTAMP,
        });
        global.$wd.sync().ref(`uchecks/${uid}`).transaction(function(cv) {
            return(cv || 0) + 1;
        });
    };

    //初始化页面，自动根据地址栏路径判断切换到首页
    componentDidMount = async function() {
        global.$router.init(this, Pages);
        var urlObj = urlParser.parse(window.location.href);
        var pName = urlObj.path ? urlObj.path.base : '/MainHomePage';
        global.$router.changePage(pName);

        //野狗自动登录，自动定时签到
        let that = this;
        global.$currentUser = global.$wd.auth().currentUser;
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            clearInterval(that.userCheckTimer);
            if(cuser) {
                that.startAutoCheck(cuser.uid);
            };
        });
    };

    //渲染实现
    render() {
        let that = this;
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        return h(MuiThemeProvider, {
            theme: Theme,
        }, h('div', [
            h(that.state.currentPage),
            h(MySnackbar),
            h(MyAlert),
            h(MyConfirm),
            h(MySelector),
        ]));
    };
};

export default App;
