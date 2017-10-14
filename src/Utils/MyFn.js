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

const fn = {
    sortByTopTs,
};

export default fn;
