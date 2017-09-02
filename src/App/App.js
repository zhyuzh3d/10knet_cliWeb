import React from 'react';
import { Component } from 'react';
import wilddog from 'wilddog';
import h from 'react-hyperscript';
import { MuiThemeProvider } from 'material-ui/styles';

import Theme from './Theme'; //主题风格
import Conf from './Conf'; //全局设置
import { Pages, PConf } from './Pages'; //页面列表

import MySnackbar from '../Utils/MySnackbar'; //底部统一的提示

//野狗账号与数据存储
global.$conf = Conf;
global.$wd = wilddog;
global.$wd.initializeApp(global.$conf.wd);

//所有公用函数
global.$fn = {};


//App元素
class App extends Component {
    state = {
        pageNameHis: [PConf.DefaultPageName],
        curPageName: PConf.DefaultPageName,
        successPageName: PConf.SucessPageName,
        failedPageName: PConf.FailedPageName,
        curPageIndex: 0,
        snackbarOpen: false,
        snackbarElement: null,
        snackbarDuration: 3000,
    };

    //后退方法
    prevPage = global.$fn.prevPage = () => {
        let that = this;
        that.state.curPageIndex -= 1;
        if(that.state.curPageIndex < 0) {
            that.state.curPageIndex = 0;
            return;
        };

        if(that.state.curPageIndex < that.state.pageNameHis.length) {
            let pagename = that.state.pageNameHis[that.state.curPageIndex];
            that.setState({ curPageName: pagename });
        } else {
            that.state.curPageIndex = that.state.pageNameHis.length;
        };
    };

    //前进方法
    nextPage = global.$fn.nextPage = () => {
        let that = this;
        that.state.curPageIndex += 1;
        if(that.state.curPageIndex > that.state.pageNameHis.length) {
            that.state.curPageIndex = that.state.pageNameHis.length;
        } else {
            var pagename = that.state.pageNameHis[that.state.curPageIndex];
            that.setState({ curPageName: pagename });
        };
    };


    //换页方法,如果无参数自动跳转success成功页面;sucess、failed不指定则不替换
    //永远切掉pageHis后面的历史并添加新的页面,刷新的重复不计入历史
    changePage = global.$fn.changePage = (pageName, successPageName, failedPageName) => {
        let that = this;
        if(!pageName || pageName === 'sucess') {
            that.changePage(that.successPageName || 'HomePage');
            return;
        } else if(pageName === 'failed') {
            that.changePage(that.failedPageName || 'HomePage');
            return;
        } else {
            let curName = that.state.pageNameHis[that.state.curPageIndex];
            if(curName !== pageName) {
                that.state.curPageIndex += 1;
                that.state.pageNameHis = that.state.pageNameHis.slice(0, that.state.curPageIndex);
                that.state.pageNameHis.push(pageName);
            };
            that.setState({
                curPageName: pageName,
                successPage: successPageName || that.state.successPageName,
                failedPagee: failedPageName || that.state.failedPageName,
            });
        };
    };

    //渲染实现
    render() {
        let that = this;
        return h(MuiThemeProvider, {
            theme: Theme,
        }, h('div', [
            h(Pages[that.state.curPageName]),
            h(MySnackbar),
        ]));
    };
};

export default App;
