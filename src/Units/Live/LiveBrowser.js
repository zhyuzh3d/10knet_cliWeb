/*
显示素材链接的webview，不包含导航控制按钮
global.$live.browser,
props:{
    url,直接提供url或者提供wdRef路径
    wdRef,{author,url}房间对应的ibrowser地址
    onChair,是否主持人，由外部的panel控制
    show,是否显示，不管显示与否，都存在
    style,样式
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


global.$live = global.$live || {};
const style = theme => ({
    comBox: {
        position: 'relative',
        margin: 0,
        padding: 0,
        width: '100%',
        flexGrow: 4,
        display: 'flex',
        flexShrink: '1.5',
    },
    empty: {
        width: '100%',
        paddingTop: 50,
        fontSize: 12,
        color: '#AAA',
        textAlign: 'center',
    },
    webview: {
        position: 'relative',
        textAlign: 'center',
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%',
        overflow: 'auto',
    },
});

//元件
var $fn = {};
class com extends Component {
    state = {
        data: null,
        hasSetWebview: false,
        hisArr: [],
        pos: -1,
    };

    wdRefArr = [];

    //当外部传来的wdPath改变时候，被动更新
    componentWillReceiveProps = async function(newProps) {
        let that = this;
        if(newProps.wdPath && newProps.wdPath !== that.props.wdPath) {
            that.stopSync(that.props.wdPath);
            that.startSync(newProps.wdPath);
        }
    };

    componentDidMount = async function() {
        const webview = document.querySelector('webview');
        webview.addEventListener('dom-ready', this.webviewReady);
        webview.addEventListener('load-commit', this.loadCommit);
        webview.addEventListener('new-window', this.newWindow);
    };

    componentWillUnmount = async function() {
        this.wdRefArr.forEach((item) => {
            item.off();
        });
    };

    //在当前窗口中打开_blank链接
    newWindow = (evt) => {
        this.loadUrl(evt.url);
    };

    //地址栏发生变化，需要同步到hisArr，更新pos
    loadCommit = (evt) => {
        if(!evt.isMainFrame) return;
        let that = this;
        let oldUrl = that.getUrl();
        let newUrl = evt.url;
        let pos = that.state.pos;

        if(newUrl !== oldUrl) {
            let hisArr = that.state.hisArr;
            let arr = hisArr.length > 0 ? hisArr.slice(0, pos + 1) : [];
            arr.push(newUrl);
            that.state.hisArr = arr;
            that.state.pos = arr.length - 1;
            that.setState({
                pos: arr.length - 1,
                hisArr: arr,
            });
        };

        if(that.props.setUrl) {
            that.props.setUrl(newUrl);
        };
    };


    //webview就绪回调,提供goNext和goPrev方法
    webviewReady = () => {
        let that = this;
        that.webview.loadUrl = this.loadUrl;
        that.webview.getUrl = this.getUrl;
        that.webview.goNext = this.goNext;
        that.webview.canGoNext = this.canGoNext;
        that.props.setWebview && that.props.setWebview(that.webview);
        if(that.props.url) {
            that.loadUrl(that.props.url);
        };
        that.webview.removeEventListener('dom-ready', that.webviewReady);
    };

    //载入页面，updateHis会自动更新hisarr和pos;url为空刷新
    loadUrl = (url, opt) => {
        let that = this;
        url = url ? url : that.getUrl();
        if(url) {
            that.webview.stop();
            that.webview.loadURL(url, opt);
        };
    };

    //获取当前页面地址
    getUrl = () => {
        let that = this;
        let pos = that.state.pos;
        let arr = that.state.hisArr;
        if(arr.length < 0 || pos < 0 || pos >= arr.length) return;
        return arr[pos];
    };


    //向前向后跳转
    goNext = (next) => {
        let that = this;
        const webview = document.querySelector('webview');
        if(webview) {
            let arr = that.state.hisArr;
            if(arr.length < 1) return;
            let pos = next ? that.state.pos + 1 : that.state.pos - 1;
            pos = pos >= arr.length ? arr.length - 1 : pos;
            pos = pos < 0 ? 0 : pos;
            that.state.pos = pos;
            that.setState({ pos: pos });
            let url = arr[pos];
            that.loadUrl(url);
            return url;
        };
    };

    //能否向前或向后
    canGoNext = (next) => {
        let that = this;
        const webview = that.webview;
        if(!webview) return false;

        let arr = that.state.hisArr;
        if(arr.length < 1) return false;
        let pos = next ? that.state.pos + 1 : that.state.pos - 1;
        if(next && pos >= arr.length) return false;
        if(!next && pos < 0) return false;
        return true;
    };

    //开始同步，被动更新
    startSync = global.$live.syncBrowser = (wdPath) => {
        let that = this;
        if(!wdPath) return;

        let ref = global.$wd.sync().ref(`${wdPath}`);
        that.wdRefArr.push(ref);
        ref.on('value', (shot) => {
            if(that.props.onChair) return;
            if(!that.webview || !that.webview.loadURL) return;
            let url = shot.val() ? shot.val().url : null;
            if(!url) return;
            let oldUrl = that.getUrl();
            if(url !== oldUrl) {
                this.webview.loadUrl(url);
            };
        });
    }

    //停止同步
    stopSync = (wdPath) => {
        global.$wd.sync().ref(`${wdPath}/conf`).off();
    }


    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let data = that.state.data;

        let webview = h('webview', {
            className: css.webview,
            src: './welcome.html',
            allowpopups: 'false',
            plugins: 'true',
            disablewebsecurity: 'true',
            ref: (webview) => {
                that.webview = webview;
            },
        });

        //显示内容，自动根据type适配
        return h('div', {
            className: css.comBox,
            style: {
                display: that.props.show ? 'flex' : 'none',
            },
        }, [
            webview,
            !that.webview ? h('div', {
                className: css.empty,
                style: { display: data && data.url ? 'none' : 'flex' }
            }, '...还没显示内容，请输入地址...') : null,
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};
com.fn = $fn;

export default withStyles(style)(com);
