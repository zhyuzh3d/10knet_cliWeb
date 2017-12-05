/*
动态元件，单个OJ题目的详情
props:{
    code,外部传来的代码
    id,题目的id
    back(),返回函数
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
        marginBottom: 0,
    },
    itemBox: {
        fontSize: 14,
        fontWeight: 200,
        padding: 16,
        wordBreak: 'break-all',
        wordWrap: 'break-word',
        textAlign: 'justify',
        paddingBottom: 0,
    },
    key: {
        color: '#AAA',
    },
    title: {
        fontSize: 18,
        fontWeight: 800,
    },
    desc: {
        fontSize: 14,
        fontWeight: 300,
        color: '#333',
    },
    tip: {
        fontSize: 12,
        fontWeight: 300,
        color: '#666',
        marginBottom: 4,
    },
    res: {
        fontSize: 16,
        fontWeight: 600,
        color: '#000',
        marginBottom: 4,
    },
});


//元件
class com extends Component {
    state = {
        data: null,
        result: null, //判题结果
        judging: false, //正在判题，冻结判题按钮
    };

    componentDidMount = async function() {
        let that = this;
        let id = that.props.id || global.$store('OJdetails', 'id') || 0
        that.setState({ id: id });
        this.getOJdetails();
    };

    componentWillUnmount = async function() {};

    getOJdetails = async function(page) {
        let that = this;
        let api = `http://oj.xmgc360.com/problem/detail`;
        Request.post(api)
            .send({ problem_id: that.props.id })
            .end((err, res) => {
                if(!err) {
                    console.log('>OJdetails', err, res);
                } else {
                    global.$snackbar.fn.show(`获取题目详情失败:${err}`);
                };
            });
    };

    //开始判题命令,接收外部传来的代码
    judgeTmr = null;
    startJudge = (code) => {
        let that = this;
        if(!that.state.data || !that.state.data) return;
        let langId;
        let langs = that.state.data.language;
        for(let key in langs) {
            if(langs[key] === 'C++') langId = key;
        };
        if(!langId) {
            global.$snackbar.fn.show(`未能提交判题：此题目不支持C++语言`);
            return;
        };

        let api = 'http://oj.xmgc360.com/problem/submitcode';
        Request.get(api)
            .send({
                problem_id: that.state.id,
                language: langId,
                source: code,
            })
            .end((err, res) => {
                if(!err && res.code === 1 && res.data && res.data.solution_id) {
                    console.log('>>>get solutionid', err, res);
                    let sid = res.data.solution_id;
                    that.setState({
                        result: null,
                        judging: true,
                    });
                    that.judgeTmr = setInterval(() => {
                        that.getResult(sid);
                    }, 3000);
                } else {
                    global.$snackbar.fn.show(`提交判题失败:${err}`);
                };
            });
    };

    //获取判题结果
    getResult = (solutionId) => {
        let that = this;
        let api = 'http://oj.xmgc360.com/solution/result';
        Request.get(api)
            .send({
                solution_id: solutionId,
            })
            .end((err, res) => {
                if(!err && res.data && res.data.solution_id) {
                    console.log('>>>get result', err, res);
                    if(res && res.code === 1) {
                        clearInterval(that.judgeTmr);
                        that.setState({
                            judging: false,
                            result: res.data.result_text,
                        });
                    };
                } else {
                    that.setState({
                        judging: false,
                    });
                    global.$snackbar.fn.show(`提交判题失败:${err}`);
                };
            });
    };

    render() {
        let that = this;
        const css = that.props.classes;

        let data = that.state.data || {};

        return h('div', {
            className: css.comBox,
        }, [
            h(Button, {
                color: 'primary',
                style: { marginTop: 12 },
                onClick: () => {
                    that.props.back && that.props.back();
                },
            }, [
                h(FontA, { name: 'caret-left', style: { marginRight: 8 } }),
                h('span', '返回')
            ]),
            h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.title }, `[${data.origin_oj}]${data.title}`),
            ]),
            h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.desc }, `${data.description}`),
            ]),
            h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.tip }, `时间限定:[ ${data.time_limit} ]`),
                h('div', { className: css.tip }, `内存限定:[ ${data.memory_limit} ]`),
            ]),
            h(Button, {
                style: { margin: 16 },
                color: 'primary',
                raised: true,
                onClick: () => { that.startJudge() },
                disabled: that.state.judging,
            }, '开始判题'),
            that.state.result ? h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.res }, `判题结果:[ ${that.state.result} ]`),
            ]) : null,
            h('div', { style: { height: 200 } }),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
