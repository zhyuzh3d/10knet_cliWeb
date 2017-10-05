/*
实现基本的换页方法prevPage,nextPage,changePage;
需要导入Pages.js作为设置

Pages.js应当导出conf和pages两个属性，范例如下:
import HomePage from '../Pages/Home/HomePage';
const conf = {
    DefaultPageName: 'HomePage', //默认起始页面
    DefaultSucessPageName: 'HomePage', //默认成功跳转页面
    DefaultFailedPageName: 'HomePage', //默认失败跳转页面
};
const pages = {
    HomePage,
};
export { conf, pages }
*/

import { conf, pages } from '../App/Pages';

//初始化
let app = null;


function init(appComponent) {
    app = appComponent;
};


//导航变量
let nav = {
    pageNameHistory: [],
    currentPageName: null,
    successPageName: conf.DefaultSucessPageName,
    failedPageName: conf.DefaultFailedPageName,
    currentPageIndex: -1,
};

//后退方法
const prevPage = () => {
    nav.currentPageIndex -= 1;
    if(nav.currentPageIndex < 0) {
        nav.currentPageIndex = 0;
        return;
    };

    if(nav.currentPageIndex < nav.pageNameHistory.length) {
        var page = pages[nav.pageNameHistory[nav.currentPageIndex]];
        page && app.setState({ currentPage: page });
    } else {
        nav.currentPageIndex = nav.pageNameHistory.length;
    };
};

//前进方法
const nextPage = () => {
    nav.currentPageIndex += 1;
    if(nav.currentPageIndex > nav.pageNameHistory.length) {
        nav.currentPageIndex = nav.pageNameHistory.length;
        return;
    };

    if(nav.currentPageIndex >= 0) {
        var page = pages[nav.pageNameHistory[nav.currentPageIndex]];
        page && app.setState({ currentPage: page });
    } else {
        nav.currentPageIndex = 0;
    };
};

//换页方法,如果无参数自动跳转success成功页面; 换页将裁切所有后面的前进历史
const changePage = (pageName, successPageName, failedPageName) => {
    if(!pageName || pageName === 'sucess') {
        changePage(nav.successPageName || conf.DefaultSucessPageName);
    } else if(pageName === 'failed') {
        changePage(nav.failedPageName || conf.DefaultFailedPageName);
    } else {
        //刷新的重复不计入历史
        if(pageName && pageName !== nav.currentPageName) {
            //换页永远切掉pageHis后面的历史并添加新的页面
            nav.pageNameHistory = nav.pageNameHistory.slice(0, nav.currentPageIndex + 1);
            nav.pageNameHistory.push(pageName);
        };
        //当前重置到队列的最后
        nav.currentPageIndex = nav.pageNameHistory.length - 1;
        app.setState({
            currentPage: pages[pageName],
        });
        nav.currentPageName = pageName;
    };
    nav.successPageName = successPageName;
    nav.failedPageName = failedPageName;
};

const MyRouter = {
    conf,
    pages,
    nav,
    init,
    app,
    prevPage,
    nextPage,
    changePage,
};
export default MyRouter;
