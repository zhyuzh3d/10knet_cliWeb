//页面路由跳转
import LoginPage from '../Pages/Account/LoginPage';
import RegPage from '../Pages/Account/RegPage';
import RstPwPage from '../Pages/Account/RstPwPage';

import HomePage from '../Pages/Home/HomePage';

import MainHomePage from '../Pages/MainHome/MainHomePage';
import SlaveHomePage from '../Pages/SlaveHome/SlaveHomePage';

//import TestPage from '../Pages/Temp/TestPage.jsx';

//默认页面的设置
const conf = {
    DefaultPageName: 'HomePage', //默认起始页面
    DefaultSucessPageName: 'HomePage', //默认成功跳转页面
    DefaultFailedPageName: 'HomePage', //默认失败跳转页面
};
conf.DefaultSucessPageName = conf.DefaultPageName;

//全部页面列表
const pages = {
    LoginPage,
    RegPage,
    RstPwPage,
    HomePage,
    SlaveHomePage,
    MainHomePage,
    //TestPage,
};

export { conf, pages }
