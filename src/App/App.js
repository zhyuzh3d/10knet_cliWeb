import { Component } from 'react';
import wilddog from 'wilddog';
import h from 'react-hyperscript';
import { MuiThemeProvider } from 'material-ui/styles';

import Theme from './Theme'; //主题风格
import Conf from './Conf'; //全局设置

import HomePage from '../Pages/Home/HomePage';
import LoginPage from '../Pages/Account/LoginPage';
import RegPage from '../Pages/Account/RegPage';

//野狗账号与数据存储
global.$conf = Conf;
global.$wd = wilddog;
global.$wd.initializeApp(global.$conf.wd);

//所有公用函数
global.$fn = {};

//全部页面列表
const pages = {
    LoginPage,
    RegPage,
    HomePage,
};

//App元素
class App extends Component {
    state = {
        pageHis: ['LoginPage'],
        curPage: LoginPage,
        successPage: HomePage,
        failedPagee: LoginPage,
        curPageIndex: 0,
    };

    //后退方法
    prevPage = global.$fn.prevPage = () => {
        let that = this;
        that.state.curPageIndex -= 1;
        if(that.state.curPageIndex < 0) {
            that.state.curPageIndex = 0;
            return;
        };

        if(that.state.curPageIndex < that.state.pageHis.length) {
            let pn = that.state.pageHis[that.state.curPageIndex];
            that.setState({ curPage: pages[pn] });
        } else {
            that.state.curPageIndex = that.state.pageHis.length;
        };
    };

    //前进方法
    nextPage = global.$fn.nextPage = () => {
        let that = this;
        that.state.curPageIndex += 1;
        if(that.state.curPageIndex > that.state.pageHis.length) {
            that.state.curPageIndex = that.state.pageHis.length;
        } else {
            var pn = that.state.pageHis[that.state.curPageIndex];
            that.setState({ curPage: pages[pn] });
        };
    };


    //换页方法,永远切掉后面的历史并添加新的页面,刷新的重复不计入历史
    changePage = global.$fn.changePage = (pageName, successPage, failedPagee) => {
        let that = this;
        if(!pageName || pageName === 'sucess') {
            that.changePage(that.successPage || 'HomePage');
            return;
        } else if(pageName === 'failed') {
            that.changePage(that.failedPagee || 'HomePage');
            return;
        } else {
            let curName = that.state.pageHis[that.state.curPageIndex];
            if(curName !== pageName) {
                that.state.curPageIndex += 1;
                that.state.pageHis = that.state.pageHis.slice(0, that.state.curPageIndex);
                that.state.pageHis.push(pageName);
            };
            that.setState({
                curPage: pages[pageName],
                successPage: successPage || that.state.successPage,
                failedPagee: failedPagee || that.state.failedPagee,
            });
        };
    };

    //渲染实现
    render() {
        return h(MuiThemeProvider, {
            theme: Theme,
        }, [
            h(this.state.curPage),
        ])
    };
};

export default App;
