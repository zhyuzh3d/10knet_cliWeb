/*
实现页面数据的存储和获取
利用localstoreage
*/

import merge from 'deepmerge';

//获取或者设置
const data = (targetKey, key, val) => {
    let res = JSON.parse(localStorage.getItem(targetKey));
    if(key) {
        if(!val) {
            res = res ? res[key] : undefined;
        } else {
            res = merge(res, {
                [key]: val,
            });
            localStorage.setItem(targetKey, JSON.stringify(res));
        }
    };
    return res;
};

const com = {
    data,
};
export default com;
