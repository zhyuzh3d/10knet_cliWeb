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
        curPage: LoginPage,
        successPage: HomePage,
        failedPagee: LoginPage,
    };

    //换页方法
    changePage = global.$fn.changePage = (pageName, successPage, failedPagee) => {
        let that = this;
        if(!pageName || pageName == 'sucess') {
            that.changePage(that.successPage || 'HomePage');
            return;
        } else if(pageName == 'failed') {
            that.changePage(that.failedPagee || 'HomePage');
            return;
        } else {
            this.setState({
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
