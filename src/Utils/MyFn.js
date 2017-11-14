//根据top值和ts值排序；
const sortByTopTs = (a, b) => {
    if(a.top && !b.top) {
        return -1;
    } else if(b.top && !a.top) {
        return 1;
    } else if(a.top && b.top) {
        return b.top - a.top;
    };
    return a.ts - b.ts;
}

//把对象的字段根据key（默认pos）数字值排,
//返回数组,单元带有item.key
const sortObjByKey = (obj, key) => {
    let arr = [];
    key = key ? key : 'pos';
    for(let k in obj) {
        let item = obj[k];
        if(item && item.constructor === Object) {
            item.key = k;
            arr.push(item);
        }
    };
    arr.sort((a, b) => { return a[key] - b[key] });
    return arr;
}

const fn = {
    sortByTopTs,
    sortObjByKey,
};

export default fn;
