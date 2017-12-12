/*
动态元件，单个OJ题目的详情，id优先从wdPath读取
props:{
    code,外部传来的代码
    id,题目的id
    wdPath,同步的路径
    back(),返回函数
    roomId,用于更新icoder的OJpage
}
*/
import { Component } from 'react';
import Request from 'superagent';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import compare from 'just-compare';

import Button from 'material-ui/Button';
import FontA from 'react-fa';

const style = theme => ({
    comBox: {
        width: '100%',
        background: '#F0F0F0',
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
    id: {
        fontSize: 12,
        fontWeight: 800,
        marginTop: 8,
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
    topBtnBar: {
        marginTop: 12,
    }
});


//元件
class com extends Component {
    state = {
        data: null,
        result: null, //判题结果
        judging: false, //正在判题，冻结判题按钮
        id: null, //题目的id
    };

    wdRefArr = [];
    componentWillMount = () => {
        let that = this;
        if(!that.props.onChair && that.props.roomId) { //进入房间且非主持人
            this.startGuestSync();
        } else {
            let id = global.$store('OJdetails', 'id');
            this.getOJdetails(id);
        };
    };

    oldProps = {};
    componentWillReceiveProps = (newProps) => {
        let that = this;
        let changeRoom = newProps.roomId !== that.oldProps.roomId; //换房间
        let changeChair = newProps.onChair !== that.oldProps.onChair; //换主持
        let changeId = newProps.id !== that.oldProps.id; //换主持
        if(changeRoom || changeChair || changeId) {
            that.oldProps.roomId = newProps.roomId;
            that.oldProps.onChair = newProps.onChair;
            that.oldProps.id = newProps.id;
            let oldRef = global.$wd.sync().ref(`${that.oldProps.wdPath}`);
            oldRef.off(); //停止旧的监听
            if(!that.props.onChair) {
                that.startGuestSync(newProps); //开启新的监听
            } else {
                this.getOJdetails(newProps.id);
            };
        };
    };

    //访客同步开始,同步id和判题状态
    startGuestSync = (props) => {
        let that = this;
        props = props || that.props;

        if(!props || !props.wdPath || props.onChair) return;
        let ref = global.$wd.sync().ref(`${props.wdPath}`);
        that.wdRefArr.push(ref);
        ref.off();
        ref.on('value', (shot) => {
            let data = shot ? shot.val() : null;
            let id = data ? data.id : null;

            if(!id) return;
            if(id !== that.state.id) {
                that.setState({ id: id });
                this.getOJdetails(id);
            };

            let judging = data ? data.judging : null;
            if(judging !== that.state.judging) that.setState({ judging: judging });

            let result = data ? data.result : null;
            if(!compare(that.state.result, result)) that.setState({ result: result });
        });
    };

    hasUnmounted = false;
    componentWillUnmount = async function() {
        this.judgeTmr && clearInterval(this.judgeTmr);
        this.wdRefArr.forEach((item, n) => {
            item.off();
        });
        this.resetSyncResult();
        this.hasUnmounted = true;
    };

    getOJdetails = async function(id) {
        let that = this;
        id = id || that.props.id;
        if(!id) return;
        that.setState({ id: id });

        let api = `http://oj.xmgc360.com/problem/detail`;
        Request.post(api)
            .send({ problem_id: id || that.props.id })
            .type('form')
            .end((err, res) => {
                if(!err) {
                    let data = JSON.parse(res.text);
                    if(data && data.code === 1 && !that.hasUnmounted) {
                        that.setState({ data: data.data });
                        that.updateId(id);
                    } else {
                        global.$snackbar.fn.show(`读取题目详情失败:${data.text}`);
                    }
                } else {
                    global.$snackbar.fn.show(`获取题目详情失败:${err}`);
                };
            });
    };

    //更新同步数据库的id
    updateId = (id) => {
        let that = this;
        global.$store('OJdetails', { id: id });
        if(!that.props.onChair) return;
        if(!that.props.wdPath) return;
        global.$wd.sync().ref(`${that.props.wdPath}`).update({ id: that.props.id });
        global.$wd.sync().ref(`icoder/${that.props.roomId}`).update({ OJpage: 'details' });
    };

    //主持人离开的时候重置判题同步数据
    resetSyncResult = () => {
        let that = this;
        if(!that.props.onChair) return;
        if(!that.props.wdPath) return;
        let ref = global.$wd.sync().ref(`${that.props.wdPath}/result`);
        ref.remove();
    };


    //开始判题命令,接收外部传来的代码
    judgeTmr = null;
    startJudge = (code) => {
        let that = this;
        if(!that.props.onChair) return;

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

                        if(that.props.roomId && that.props.onChair) { //更新状态到数据库
                            let ref = global.$wd.sync().ref(`${that.props.wdPath}`);
                            ref.update({
                                state: '排队中...',
                                judging: true,
                                result: false,
                            });
                        };
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
                        };
                        if(result && that.props.roomId && that.props.onChair) { //更新状态到数据库
                            let ref = global.$wd.sync().ref(`${that.props.wdPath}/result`);
                            ref.update(result);
                        };
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
    cancelJudge = (reset) => {
        let that = this;
        that.judgeTmr && clearInterval(that.judgeTmr);
        that.setState({ judging: false });
        if(reset) that.setState({ result: null });
    };

    //收集一个题目
    pickAsAsset = () => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        if(!cuser) {
            global.$snackbar.fn.show(`您还没有登录，不能创建素材`, 3000);
            return;
        };

        let userId = cuser.uid;
        global.$wd.sync().ref(`ubasket/${userId}`).once('value', (shot) => {
            let baskets = shot.val();
            if(!baskets) {
                //创建新篮子
                let bref = global.$wd.sync().ref(`basket`);
                bref.push({ author: userId }).then((res) => {
                    let basketId = res.key();
                    let asset = {
                        title: '临时收集篮',
                        picker: userId,
                        ts: global.$wd.sync().ServerValue.TIMESTAMP,
                        top: false,
                    };
                    global.$wd.sync().ref(`ubasket/${userId}`).update({
                        [basketId]: asset,
                    }).then((res) => {
                        that.openAssetEditPage(basketId);
                    });
                }).catch((err) => {
                    global.$snackbar.fn.show(`采集失败:${err.message}`, 3000);
                });
            } else {
                //提示用户选择
                let arr = [];
                for(let key in baskets) {
                    baskets[key].id = key;
                    arr.push(baskets[key]);
                };
                global.$selector.fn.show({
                    title: '请选择收集篮',
                    itemArr: arr,
                    okHandler: (basket) => {
                        that.openAssetEditPage(basket.id);
                    },
                });
            };
        });

    };


    openAssetEditPage = (basketId) => {
        let that = this;
        global.$app.toggleMainPart(true); //显示主面板
        global.$store('AssetEditPage', { assetId: undefined }); //清理旧ID

        let problemId = that.state.data ? that.state.data.problemId : null;
        problemId = problemId || that.props.id;

        let title = that.state.data ? that.state.data.title : '未命名题目';
        let opt = {
            basketId: basketId,
            appBarTitle: '新建题目素材',
            data: {
                problemId: problemId,
                type: 'oj',
                title: title,
                desc: '采集自10knet.com判题库的题目',
            },
        };
        if(global.$router.getCurrentPage() === 'AssetEditPage') {
            global.$router.goPage('BlankPage');
        };
        setTimeout(() => {
            global.$router.changePage('AssetEditPage', opt);
        }, 100);
    }

    render() {
        let that = this;
        const css = that.props.classes;

        let data = that.state.data || {};
        let result = that.state.result;

        let topBtnGrp = h('div', {
            className: css.topBtnBar,
        }, [
            h(Button, {
                color: 'primary',
                disabled: !that.props.onChair && that.props.rooId,
                style: { marginLeft: 16 },
                onClick: () => {
                    that.props.back && that.props.back();
                },
            }, [
                h(FontA, { name: 'caret-left', style: { marginRight: 8 } }),
                h('span', '返回')
            ]),
            data ? h(Button, {
                color: 'accent',
                raised: true,
                style: { marginLeft: 16 },
                disabled: !that.props.onChair,
                onClick: () => { that.pickAsAsset() },
            }, [
                h(FontA, { name: 'leaf', style: { marginRight: 8 } }),
                h('span', '采集'),
            ]) : null,
        ]);

        return h('div', {
            className: css.comBox,
        }, [
            topBtnGrp,
            h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.title }, `[${data.origin_oj||"NAN"}]${data.title||"题目载入中..."}`),
                h('div', { className: css.id }, `ID:${data.problem_id}`),
            ]),
            data ? h('div', {
                className: css.itemBox,
            }, [
                h('div', {
                    className: css.desc,
                    dangerouslySetInnerHTML: { __html: data.description || '...' },
                }),
            ]) : null,
            data && data.time_limit ? h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.tip }, `时间限定:[ ${data.time_limit} ]`),
                h('div', { className: css.tip }, `内存限定:[ ${data.memory_limit} ]`),
            ]) : null,
            h('div', {
                style: { margin: 16 },
            }, [
                h(Button, {
                    color: 'primary',
                    raised: true,
                    onClick: () => { that.startJudge() },
                    disabled: that.state.judging || (!that.props.onChair && that.props.roomId),
                }, '开始判题'),
                that.state.judging ? h(Button, {
                    style: { marginLeft: 16 },
                    color: 'primary',
                    disabled: !that.props.onChair && that.props.roomId,
                    onClick: () => { that.cancelJudge(true) },
                }, '取消') : null,
            ]): null,
            result ? h('div', {
                className: css.itemBox,
            }, [
                h('div', { className: css.res }, '判题状态:' + that.state.result.state),
                h('div', {
                    className: css.res,
                    style: { color: result.result_text === 'Accepted' ? '#00a371' : '#888' },
                }, '判题结果:' + (result.result_text || "...")),
            ]) : null,
            h('div', { style: { height: 100 } }),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
