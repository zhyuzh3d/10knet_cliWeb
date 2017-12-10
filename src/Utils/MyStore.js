import merge from 'deepmerge';

//利用本地存储JSON结构的数据，分为单独的targetKey避免整个ls读取压力
//获取存储的数据store('key','subkey')；
//存储,与原来数据合并store('key',{'subkey':11})；
//获取整个对象store('key',null)；
//清理store('key')或store('key',undefined)；
//清理子属性store('key',{'subkey':undefined})；
const store = (targetKey, objOrKey) => {
    if(!targetKey || targetKey.constructor !== String) return;
    let lsdata, res;

    if(objOrKey === undefined) {
        localStorage.removeItem(targetKey);
        return;
    } else if(objOrKey === null) {
        lsdata = localStorage.getItem(targetKey);
        res = lsdata ? JSON.parse(lsdata) : undefined;
        return res;
    }

    lsdata = localStorage.getItem(targetKey);
    res = lsdata ? JSON.parse(lsdata) : undefined;

    if(objOrKey && objOrKey.constructor === String) {
        res = res ? res[objOrKey] : undefined;
    } else {
        res = merge(res || {}, objOrKey || {});
        localStorage.setItem(targetKey, JSON.stringify(res));
    };
    return res;
};


export default {
    store,
};
