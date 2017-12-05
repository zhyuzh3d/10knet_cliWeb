/*
动态固定元件，OJ题目列表
props:{
    showDetails(item),显示OJ详情的方法
}
*/
import { Component } from 'react';
import Request from 'superagent';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
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
        margin: 16,
        marginBottom: 4,
    },
    searchIpt: {
        fontSize: 16,
        height: 24,
        verticalAlign: 'middle',
    },
    searchBtn: {
        verticalAlign: 'middle',
        minWidth: 32,
    },
});

let fake = { "code": 1, "text": "", "data": { "page": 0, "pages": 200, "count": "9951", "list": [{ "problem_id": "2383841", "origin_oj": "HDU", "origin_prob": "4150", "title": "Powerful Incantation" }, { "problem_id": "2383817", "origin_oj": "HYSBZ", "origin_prob": "3239", "title": "Discrete Logging" }, { "problem_id": "2383753", "origin_oj": "HDU", "origin_prob": "1159", "title": "Common Subsequence" }, { "problem_id": "2383737", "origin_oj": "HDU", "origin_prob": "1431", "title": "\u7d20\u6570\u56de\u6587" }, { "problem_id": "2383641", "origin_oj": "HDU", "origin_prob": "1517", "title": "A Multiplication Game" }, { "problem_id": "2383585", "origin_oj": "HYSBZ", "origin_prob": "1146", "title": "\u7f51\u7edc\u7ba1\u7406Network" }, { "problem_id": "2383601", "origin_oj": "HYSBZ", "origin_prob": "3102", "title": "[N\/A]" }] } }

//元件
class com extends Component {
    state = {
        data: fake,
        searchData: null, //搜索结果列表
        page: 0,
    };

    componentDidMount = async function() {
        let that = this;
        let page = global.$store('OJlist', 'page') || 0;
        that.setState({ page: page });
        this.getOjList();
    };

    componentWillUnmount = async function() {};

    getOjList = async function(page) {
        let that = this;
        page = page || that.state.page;
        let api = 'http://oj.xmgc360.com/problem/lists';
        Request.get(api)
            .send({ page: page })
            .end((err, res) => {
                if(!err) {
                    global.$store('OJlist', 'page', that.state.page);
                    console.log('>>>get oj list', err, res);
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

    render() {
        let that = this;
        const css = that.props.classes;

        let data = that.state.data || that.state.searchData;
        let itemElArr = [];
        if(data && data.data && data.data.list) {
            let list = data.data.list;
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

        return h('div', {
            className: css.comBox,
        }, [
            h('div', {
                className: css.searchGrp,
            }, [
                h('input', {
                    className: css.searchIpt,
                }),
                h(Button, {
                    color: 'primary',
                    className: css.searchBtn,
                }, h(FontA, { name: 'search' })),
            ]),
            h('div', {
                className: css.label,
            }, [
                h('span', that.state.searchData ? '搜索结果' : '全部题目列表'),
                that.state.searchData ? h(Button, {
                    color: 'primary',
                    className: css.searchBtn,
                }, '返回列表') : null,
            ]),
            h('div', {
                className: css.list,
            }, itemElArr),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
