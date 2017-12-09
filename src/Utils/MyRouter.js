/*
实现store数据本地存储和基本的换页方法prevPage,nextPage,changePage;

store(key,objOrKey)本地存储方法，可用此方法手工恢复页面state数据:
key 要设置或者要获取的key字符串名
objOrKey    如果是obj就被合并设置到key键，如果是字符串就获取key[objOrKey]

changePage(path,state)方法，它推入浏览历史并通过监听激活goPage方法换页
path    带或不带'/'的路径（会被自动添加），接受$分割页面变量例如curPageName$successPage格式将自动读取当前页面store的successPage字段，这也是path为定义情况默认的设置
state   保存到store，可以借此将任何需要传递的参数设置到下一个页面，如userId,assetId等
【注意】此方法依赖app.setState({currentPage:component})方法,并自动更新currentPage自动利用store存到本地，所有可以在App内利用store恢复到之前的页面，避免刷新返回首页的bug

goPage方法直接跳转，不影响历史记录，可以用来刷新页面
这里没有直接实现刷新，单可以制作单独BlankPage页面，goPage过去 (无历史痕迹)，然后再goPage回到当前页面

init(app,pages)初始化方法：
app react的顶级app
pages 所有页面的设置对象{MainPage:reactComponent,}
*/

import createHistory from 'history/createBrowserHistory';
import MyStore from './MyStore';

//初始化
let app = null;
let pages = null;
let store = MyStore.store;
let currentPage = 'MainHomePage';
let history = createHistory({
    basename: '',
});

//从外部获得App对象用于setstate(currentPage)实现换页
function init(appComponent, Pages) {
    app = appComponent;
    pages = Pages;
};

//被调用的换页方法，不直接使用
//自动合并页面状态到本地存储，这些数据将在跳转后被使用
//pageName支持$storeKey分隔符变量，默认跳转到$successPage
const goPage = (pageName, state) => {
    if(!pageName) return;
    if(pages[pageName]) {
        store(pageName, state);
        app.setState({
            currentPage: pages[pageName],
        });
        currentPage = pageName;
        store('App', { currentPage: pageName });
    };
};


//监听所有动作，针对pathName更换页面
history.listen((location, action, stagte) => {
    let pageName = location.pathname ? location.pathname.substr(1) : undefined;
    goPage(pageName, location.state);
});

//兼容空参数的path,空参数跳转到'currentPage$successPage'
//store存储的KV值，currentPage.successPage
const changePage = (path, state) => {
    if(!path) path = '$';
    if(path.indexOf('$') !== -1) {
        let strArr = path.split('$');
        let tar = strArr[0] ? strArr[0] : currentPage;
        let key = strArr[1] ? strArr[1] : 'successPage';
        path = store(tar, key);
        currentPage = tar;
    } else {
        currentPage = path;
    };
    history.push(path, state);
};

//获取当前页名称
const getCurrentPage = () => {
    return currentPage;
};

//获取页面列表
const getPages = () => {
    return pages;
};

const MyRouter = {
    init,
    app,
    goPage,
    changePage,
    getCurrentPage,
    prevPage: history.goBack,
    nextPage: history.goForward,
};
export default MyRouter;
