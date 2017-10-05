/*
实现页面数据的存储和获取
利用localstoreage
*/

import merge from 'deepmerge';

//初始化数据
let xdata = {};

//获取或者设置
const data = (targetKey, key, val) => {
    let res = JSON.parse(localStorage.getItem(targetKey));
    if(key) {
        if(!val) {
            res = res[key];
        } else {
            var obj = {};
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
