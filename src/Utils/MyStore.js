import merge from 'deepmerge';

//利用本地存储JSON结构的数据，分为单独的targetKey避免整个ls读取压力
const store = (targetKey, objOrKey) => {
    var lsdata = localStorage.getItem(targetKey);
    let res = lsdata ? JSON.parse(lsdata) : undefined;

    if(objOrKey && objOrKey.constructor === String) {
        res = res ? res[objOrKey] : undefined;
    } else {
        res = merge(res || {}, objOrKey || {});
        localStorage.setItem(targetKey, JSON.stringify(res));
    }
    return res;
};
//彻底清理某个本地存储，如果清理单个子属性可以store({key:undefined})
const storeRemove = (targetKey) => {
    localStorage.removeItem(targetKey);
};

export default {
    store,
    storeRemove,
};
