/*
动态固定元件，OJ题目列表
props:{
    page,当前页码
    wdPath,如果有那么自动从这里读取页码
    showDetails(item),显示OJ详情的方法
}
*/
import { Component } from 'react';
import Request from 'superagent';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import FontA from 'react-fa';

const style = theme => ({
    comBox: {
        width: '100%',
        background: '#DDD',
        height: '100%',
        position: 'absolute',
        right: 0,
        overflowY: 'auto',
    },
    label: {
        fontSize: 14,
        color: '#888',
        margin: 16,
        marginBottom: 8,
    },
    list: {},
    item: {
        fontSize: 14,
        padding: '8px 16px',
        width: 'calc(100% - 32px)',
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
    },
    index: {
        fontWeight: 200,
    },
    origin: {
        fontWeight: 200,
    },
    title: {
        cursor: 'pointer',
        fontWeight: 800,
        paddingLeft: 12,
    },
    searchGrp: {
        margin: '8px 16px',
    },
    searchIpt: {
        fontSize: 14,
        height: 24,
        verticalAlign: 'middle',
    },
    searchBtn: {
        verticalAlign: 'middle',
        minWidth: 32,
    },
    pageNavGrp: {
        textAlign: 'right',
        width: '100%',
        margin: '8px 0',
    },
    pageBtn: {
        minHeight: 32,
        height: 32,
        minWidth: 32,
        width: 32,
        marginRight: 8,
        marginLeft: 8,
        verticalAlign: 'middle',
    },
    pageIpt: {
        width: 48,
        height: 28,
        fontSize: 14,
        verticalAlign: 'middle',
        textAlign: 'center',
    },
});

//元件
class com extends Component {
    state = {
        data: null,
        searchData: null, //搜索结果列表
        page: 0,
    };

    //优先从wdPath读取-props读取-store读取
    componentDidMount = async function() {
        let that = this;
        let storePage = global.$store('OJlist', 'page');
        if(that.props.wdPath) {
            global.$wd.sync().ref(`${that.props.wdPath}/page`).on('value', (shot) => {
                let page = shot ? shot.val() : (storePage || 0);
                that.setState({ page: page });
                this.getOJList();
            });
        } else {
            let page = that.props.page || storePage || 0;
            that.setState({ page: page });
            this.getOJList();
        }
    };

    componentWillUnmount = async function() {};

    getOJList = async function(page, searchStr) {
        let that = this;
        page = page === undefined ? that.state.page : page;
        that.updateSync();

        let api = 'http://oj.xmgc360.com/problem/lists';
        let opt = searchStr ? { search: searchStr } : { page: page };
        Request.post(api)
            .send(opt)
            .type('form')
            .end((err, res) => {
                if(!err && res.text) {
                    let obj = JSON.parse(res.text);
                    console.log('>getOJList', page, searchStr, obj);
                    if(obj.code === 1) {
                        let data = obj.data;
                        that.setState(!searchStr ? { data: data } : { searchData: data });
                    } else {
                        global.$snackbar.fn.show(`获取题目失败:${obj.text}`);
                    };
                } else {
                    global.$snackbar.fn.show(`获取题目列表失败:${err}`);
                };
            });
    };

    //显示详细信息页面
    showDetails = (item) => {
        let that = this;
        if(that.props.showDetails) {
            that.props.showDetails(item.problem_id);
        }
    };

    //执行搜索
    doSearch = () => {
        let val = this.searchIpt.value;
        this.getOJList(undefined, val);
    };

    //清理搜索结果
    clearSearch = () => {
        this.setState({ searchData: null });
    };

    //上下翻页
    prevPage = () => {
        let that = this;
        let page = this.state.page - 1;
        if(page < 0) page = 0;
        if(that.state.data && page > that.state.data.pages) page = that.state.data.pages;
        this.setState({ page: page });
        this.getOJList(page || 0);
    };
    //上下翻页
    nextPage = () => {
        let that = this;
        let page = this.state.page + 1;
        if(page < 0) page = 0;
        if(that.state.data && page > that.state.data.pages) page = that.state.data.pages;
        this.setState({ page: page });
        this.getOJList(page || 0);
    };
    //页面跳转
    goPage = () => {
        this.getOJList(this.state.page || 0);
    };
    //同步存储page页码
    updateSync = () => {
        let that = this;
        if(!that.props.wdPath) return;
        global.$wd.sync().ref(`${that.props.wdPath}`).update({ page: that.state.page });
    };


    render() {
        let that = this;
        const css = that.props.classes;

        let data = that.state.data || that.state.searchData;
        let itemElArr = [];

        if(data && data.list) {
            let list = data.list;
            itemElArr = list.map((item, index) => {
                return h('div', {
                    className: css.item,
                    onClick: () => {
                        that.showDetails(item);
                    },
                }, [
                   h('span', { className: css.index }, `${index+1}.`),
                   h('span', { className: css.origin }, `[${item.origin_oj}]`),
                   h('span', { className: css.title }, item.title),
               ])
            });
        };

        //分页符
        let pageCount = data ? Math.ceil(data.pages / 50) : 0;
        let pageNavGrp = h('div', {
            className: css.pageNavGrp,
        }, [
            h(Button, {
                className: css.pageBtn,
                raised: true,
                color: 'primary',
                onClick: () => { that.prevPage() },
            }, h(FontA, { name: 'caret-left' })),
            h('input', {
                className: css.pageIpt,
                value: that.state.page + 1,
                onChange: (e) => {
                    var page = Math.floor(e.target.value);
                    that.setState({
                        page: page,
                    });
                    global.$store('OJlist', 'page', page);
                },
                onBlur: (event) => {
                    that.goPage();
                },
            }),
            h(Button, {
                className: css.pageBtn,
                raised: true,
                color: 'primary',
                onClick: () => { that.nextPage() },
            }, h(FontA, { name: 'caret-right' })),
        ])


        return h('div', {
            className: css.comBox,
        }, [
            h('div', {
                className: css.searchGrp,
            }, [
                h('input', {
                    className: css.searchIpt,
                    ref: (searchIpt) => { this.searchIpt = searchIpt },
                }),
                h(Button, {
                    color: 'primary',
                    className: css.searchBtn,
                    onClick: () => { that.doSearch() },
                }, h(FontA, { name: 'search' })),
            ]),
            h('div', {
                className: css.label,
            }, [
                h('span', that.state.searchData ? '搜索结果' : '全部题目列表'),
                that.state.searchData ? h(Button, {
                    color: 'primary',
                    className: css.searchBtn,
                    onClick: () => { that.clearSearch() },
                }, '返回列表') : null,
            ]),
            pageCount > 1 ? pageNavGrp : null,
            h('div', {
                className: css.list,
            }, itemElArr),
            pageCount > 1 ? pageNavGrp : null,
            h('div', { style: { height: 100 } }),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
