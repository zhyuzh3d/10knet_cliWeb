//根据top值和ts值排序；
const sortByTopTs = (a, b) => {
    if(a.top && !b.top) {
        return -1;
    } else if(b.top && !a.top) {
        return 1;
    } else if(a.top && b.top) {
        return b.top - a.top;
    };
    return b.ts - a.ts;
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


//把字符串变为dom
var str2dom = function(html) {
    var wrapMap = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        legend: [1, "<fieldset>", "</fieldset>"],
        area: [1, "<map>", "</map>"],
        param: [1, "<object>", "</object>"],
        thead: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        body: [0, "", ""],
        _default: [1, "<div>", "</div>"]
    };
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    var match = /<\s*\w.*?>/g.exec(html);
    var element = document.createElement('div');
    if(match != null) {
        var tag = match[0].replace(/</g, '').replace(/>/g, '').split(' ')[0];
        if(tag.toLowerCase() === 'body') {
            var body = document.createElement("body");
            // keeping the attributes
            element.innerHTML = html.replace(/<body/g, '<div').replace(/<\/body>/g, '</div>');
            var attrs = element.firstChild.attributes;
            body.innerHTML = html;
            for(var i = 0; i < attrs.length; i++) {
                body.setAttribute(attrs[i].name, attrs[i].value);
            }
            return body;
        } else {
            var map = wrapMap[tag] || wrapMap._default;
            html = map[1] + html + map[2];
            element.innerHTML = html;
            // Descend through wrappers to the right content
            var j = map[0] + 1;
            while(j--) {
                element = element.lastChild;
            }
        }
    } else {
        element.innerHTML = html;
        element = element.lastChild;
    }
    return element;
}


const fn = {
    sortByTopTs,
    sortObjByKey,
    str2dom,
};

export default fn;
