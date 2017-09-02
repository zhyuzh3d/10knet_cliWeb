import LoginPage from '../Pages/Account/LoginPage';
import RegPage from '../Pages/Account/RegPage';
import RstPwPage from '../Pages/Account/RstPwPage';

import HomePage from '../Pages/Home/HomePage';

//默认页面的设置
const PConf = {
    DefaultPageName: 'LoginPage', //默认起始页面
    SucessPageName: 'HomePage', //默认成功跳转页面
    FailedPageName: 'HomePage', //默认失败跳转页面
};

//全部页面列表
const Pages = {
    LoginPage,
    RegPage,
    RstPwPage,
    HomePage,
};

export { PConf, Pages };
