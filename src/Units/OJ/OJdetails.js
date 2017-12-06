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
        marginBottom: 4,
        color: '#888',
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

    componentWillUnmount = async function() {
        this.judgeTmr && clearInterval(this.judgeTmr);
    };

    getOJdetails = async function(page) {
        let that = this;
        let api = `http://oj.xmgc360.com/problem/detail`;
        Request.post(api)
            .send({ problem_id: that.props.id })
            .type('form')
            .end((err, res) => {
                if(!err) {
                    let data = JSON.parse(res.text);
                    console.log('>OJdetails', data);
                    if(data && data.code === 1) {
                        that.setState({ data: data.data });
                    } else {
                        global.$snackbar.fn.show(`读取题目详情失败:${data.text}`);
                    }
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

        code = code || that.props.code;
        if(!code) {
            global.$alert.fn.show('代码不能为空', `提交判题的代码不能为空`);
            return;
        }

        let api = 'http://oj.xmgc360.com/problem/submitcode';
        let payload = {
            problem_id: that.state.id,
            language: langId,
            source: code,
        };
        Request.post(api)
            .send(payload)
            .type('form')
            .end((err, res) => {
                if(!err) {
                    let data = JSON.parse(res.text);
                    if(data && data.code === 1) {
                        data = data.data;
                        let sid = data.solution_id;
                        that.setState({
                            result: {
                                state: '排队中...'
                            },
                            judging: true,
                        });
                        that.judgeTmr = setInterval(() => {
                            that.getResult(sid);
                        }, 3000);
                    } else {
                        global.$snackbar.fn.show(`提交判题请求失败:${data.text}`);
                    };

                } else {
                    global.$snackbar.fn.show(`提交判题失败:${err}`);
                };
            });
    };

    //获取判题结果
    getResult = (solutionId) => {
        let that = this;
        let api = 'http://oj.xmgc360.com/solution/result';

        Request.post(api)
            .send({
                solution_id: solutionId,
            })
            .type('form')
            .end((err, res) => {
                if(!err) {
                    let data = JSON.parse(res.text);
                    console.log('>getResult data', data);
                    if(data && data.code === 1) {
                        let result = data.data;
                        that.setState({ result: result }); //更新判题状态
                        if(result && result.state === 'finished') {
                            that.cancelJudge();
                        }
                    } else {
                        global.$snackbar.fn.show(`判题处理错误:${data.text}`);
                    };
                } else {
                    that.setState({
                        judging: false,
                    });
                    global.$snackbar.fn.show(`判题处理失败:${err}`);
                };
            });
    };


    //取消当前的判题,停止轮询,重置结果
    cancelJudge = () => {
        let that = this;
        that.judgeTmr && clearInterval(that.judgeTmr);
        that.setState({
            judging: false,
            result: null,
        });
    };

    render() {
        let that = this;
        const css = that.props.classes;

        let data = that.state.data || {};
        let result = that.state.result;

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
                h('div', {
                    className: css.desc,
                    dangerouslySetInnerHTML: { __html: data.description },
                }),
            ]),
            h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.tip }, `时间限定:[ ${data.time_limit} ]`),
                h('div', { className: css.tip }, `内存限定:[ ${data.memory_limit} ]`),
            ]),
            h('div', {
                style: { margin: 16 },
            }, [
                h(Button, {
                    color: 'primary',
                    raised: true,
                    onClick: () => { that.startJudge() },
                    disabled: that.state.judging,
                }, '开始判题'),
                !that.state.judging ? h(Button, {
                    style: { marginLeft: 16 },
                    color: 'primary',
                    onClick: () => { that.cancelJudge() },
                }, '取消') : null,
            ]),
            that.state.result ? h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.res }, `判题状态:[ ${that.state.result.state} ]`),
                h('div', {
                    className: css.res,
                    style: { color: result.result_text === 'Accepted' ? '#00a371' : '#888' }
                }, `判题结果:[ ${result.result_text||"..."} ]`),
            ]) : null,
            h('div', { style: { height: 200 } }),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
