/*
实现store数据本地存储和基本的换页方法prevPage,nextPage,changePage;

store(key,objOrKey)本地存储方法，可用此方法手工恢复页面state数据:
key 要设置或者要获取的key字符串名
objOrKey    如果是obj就被合并设置到key键，如果是字符串就获取key[objOrKey]

changePage(path,state)方法，
path    带或不带'/'的路径（会被自动添加），接受$分割页面变量例如curPageName$successPage格式将自动读取当前页面store的successPage字段，这也是path为定义情况默认的设置
state   保存到store，可以借此将任何需要传递的参数设置到下一个页面，如userId,assetId等
【注意】此方法依赖app.setState({currentPage:component})方法,并自动更新currentPage自动利用store存到本地，所有可以在App内利用store恢复到之前的页面，避免刷新返回首页的bug

init(app,pages)初始化方法：
app react的顶级app
pages 所有页面的设置对象{MainPage:reactComponent,}
*/

//import createHistory from 'history/createMemoryHistory';
import createHistory from 'history/createBrowserHistory';
import MyStore from './MyStore';

//初始化
let app = null;
let pages = null;
let store = MyStore.store;
let currentPage = 'MainHomePage';
let history = createHistory();

//从外部获得App对象用于setstate(currentPage)实现换页
function init(appComponent, Pages) {
    app = appComponent;
    pages = Pages;
};

//换页方法,自动合并页面状态到本地存储，这些数据将在跳转后被使用
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

//兼容空参数的push,空参数跳转到'currentPage$successPage'
const changePage = (path, state) => {
    if(!path) path = '$';
    if(path.indexOf('$') !== -1) {
        let strArr = path.split('$');
        let tar = strArr[0] ? strArr[0] : currentPage;
        let key = strArr[1] ? strArr[1] : 'successPage';
        path = store(tar, key);
    };

    history.push(path, state);
};

const MyRouter = {
    pages,
    init,
    app,
    currentPage,
    goPage,
    changePage,
    prevPage: history.goBack,
    nextPage: history.goForward,
};
export default MyRouter;
