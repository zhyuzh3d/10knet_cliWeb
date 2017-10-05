//页面路由跳转
import LoginPage from '../Pages/Account/LoginPage';
import RegPage from '../Pages/Account/RegPage';
import RstPwPage from '../Pages/Account/RstPwPage';
import ProfilePage from '../Pages/Account/ProfilePage';

import HomePage from '../Pages/Home/HomePage';

import MainHomePage from '../Pages/CliHome/MainHomePage';
import SlaveHomePage from '../Pages/CliHome/SlaveHomePage';
import AssetAddPage from '../Pages/Asset/AssetAddPage';
import AssetDetailPage from '../Pages/Asset/AssetDetailPage';
import AssetListPage from '../Pages/Asset/AssetListPage';

import TestPage from '../Pages/Temp/TestPage.jsx';

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
    ProfilePage,
    HomePage,
    SlaveHomePage,
    MainHomePage,
    AssetAddPage,
    AssetDetailPage,
    AssetListPage,
    TestPage,
};

export { conf, pages }
