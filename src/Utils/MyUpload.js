/**
 * 上传文件到七牛的控件,目前只支持随机地址上传，格式／RANDKEY/test.html
 * 每次发起上传生成新的file对象，可以用file.abort方法取消
 * 并不直接管理上传文件列表或缩略图，需要外部利用回调函数自行处理
 * 如果props.file存在那么直接上传，用此方法可以实现借blob上传文字为文件，见下
 * 使用props.freeze和freezeTime实现上传过程中冻结按钮，实现单一上传
 * 多个文件上传进度条将多种颜色交替显示，也可以overlayColor使用单一颜色
 *
 * props:{
 *  color:'inherit'|'primary'|'accent'...按钮颜色
 *  raised:false|true,按钮样式
 *  label:'上传文件',按钮的文字
 *  icon:'insert_drive_file',按钮的图标
 *  nameRegx:'^\.+$',对文件名进行验证的正则表达式，例如'^.+(?:.png|.jpg)$'
 *  accept:'',接受的文件MIME类型（仅browser有效）
 *  children:'上传文件',按钮文字，可以是任何dom元素h('div',{},[h(HomeIcon),h('span','上传home')]}
 *  start(file):开始前运行的函数，可以利用它获取file，用file.abort()随时取消上传，也可以用它生成缩略图
 *  success(file,err,res):上传成功后的函数
 *  error(file,err,res):上传失败后的函数
 *  complete(file,err,res):上传完成后的函数，与成功失败同时执行
 *  progress(file,event):上传过程中执行的函数，{direction，percent，total，loaded},
 *  overlayColor:字符串颜色，如果不指定则使用文件随机颜色colorTag值
 *  file:file对象，具有name和lastModifiedDate属性的new blob(['...',{}])
 *  freeze:上传过程是否冻结按钮，限定只能逐个上传
 *  freezeTime:冻结毫秒，超过此时间按钮自动重新激活,默认3秒
 * },
 */

import React from 'react';
import Request from 'superagent';
import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import BackupIcon from 'material-ui-icons/Backup';

var $fn = {};
const _style = theme => ({
    label: {
        fontSize: 18,
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '0',
        height: '5px',
        opacity: 0.75,
    },
    finput: {
        display: 'none',
    },
    vmid: {
        verticalAlign: 'middle'
    }
});

const freezeDefault = 3000;
const colors = ['#962800', '#ba7a02', '#d1c200', '#01a340', '#009688', '#004cb4', '#4b00a2', '#b200b2']; //随机overlay颜色

class MyComponent extends Component {
    state = {
        reactVersion: React.version, //去除unuse警告
        file: [],
        inputDom: undefined,
        overlay: 0,
        overlayColor: '#009688',
        freeze: false,
        freezeTimerId: undefined,
    };

    genInputDom = () => {
        let that = this;
        return h('input', {
            type: "file",
            accept: (that.props.accept || ''),
            ref: (dom) => { that.state.inputDom = dom },
            onChange: (event) => { that.onChange(event.target.files) },
        })
    };

    //请求token并发起上传
    start = $fn.start = async(file, successFn, errorFn) => {
        let that = this;

        //外部利用start函数获得文件对象，便于生成缩略图或取消上传
        that.props.start && that.props.start(file);

        Request.post('http://10knet.com/api/qiniu/uploadTokenRand')
            .send({ fileName: file.name })
            .end((err, res) => {
                if(err || res.body.code !== 1) {
                    errorFn && errorFn(err, res);
                } else {
                    let data = res.body.data;
                    for(var k in data) {
                        file[k] = data[k];
                    };
                    that.upload(file, data);
                };
            });
    };

    //正式发起上传
    upload = $fn.upload = async(file, tokenObj) => {
        var that = this;

        file.colorTag = colors[Math.floor(Math.random() * colors.length)];
        that.setState({
            overlay: 0,
            file: file,
        });

        //支持冻结freeze属性
        if(that.props.freeze) {
            that.state.freezeTimerId && clearTimeout(that.state.freezeTimerId);
            let sec = that.props.freezeTime || freezeDefault;

            //启动倒计时重新激活按钮，防止僵死
            let timerId = setTimeout(() => {
                that.setState({
                    freeze: false,
                });
            }, sec);

            //保存倒计时，冻结按钮
            that.setState({
                freeze: true,
                freezeTimerId: timerId,
            });

        };

        var formdata = new FormData();
        formdata.append('token', tokenObj.token);
        formdata.append('file', file);
        formdata.append('key', tokenObj.key);
        var req = Request.post("http://up.qiniu.com")
            .send(formdata)
            .on('progress', event => {
                //更新数据
                if(!file.aborted) {
                    that.setState({
                        file: {
                            direction: event.direction,
                            percent: event.percent,
                            total: event.total,
                            loaded: event.loaded,
                            colorTag: file.colorTag,
                        },
                        overlay: event.percent,
                    });
                };

                //自定义进程处理函数
                that.props.progress && that.props.progress(file, event);
            })
            .end((err, res) => {
                that.setState({
                    overlay: 0,
                    freeze: false
                });
                that.props.complete && that.props.complete(file, err, res);
                if(err) {
                    that.props.error && that.props.error(file, err, res);
                } else {
                    that.props.success && that.props.success(file, err, res);
                };
            });

        //request放到file内备用
        file.req = req;

        //取消函数
        file.abort = () => {
            that.setState({
                overlay: 0,
                reeze: false,
            });
            file.aborted = true;
            req.abort();
        };
    };

    //按钮被点击,如果props.file存在那么直接上传它，否则就使用隐身的input
    onClick = () => {
        let that = this;
        if(that.props.file) {
            that.start(that.props.file, that.upload, (err, res) => {
                alert(`获取上传权限失败:${err||res.message}`);
            });
        } else {
            this.state.inputDom && this.state.inputDom.click();
        }
    };

    //文件被选择，选择文件改变
    onChange = (files) => {
        let that = this;
        var file = (FileList.length >= 0) ? files[0] : null;
        if(!file) return;

        //延迟以清理原有input，避免重复选择文件不能触发事件
        that.setState({ inputDom: null });
        setTimeout(() => {
            that.setState({ inputDom: that.genInputDom() });
        }, 100);

        //检查文件格式
        var regx = new RegExp(this.props.nameRegx || '^.+$');
        if(!regx.test(file.name)) {
            if(global.$alert) {
                global.$alert.fn.show('文件格式错误', '上传被取消，请重新选择');
            } else {
                alert('文件格式错误', '上传被取消，请重新选择');
            };
            return;
        };

        //启动获取token的操作然后自动上传
        that.start(file, that.upload, (err, res) => {
            alert(`获取上传权限失败:${err||res.message}`);
        });
    };

    //渲染实现
    render() {
        let that = this;
        let css = that.props.classes;

        return h('div', {}, [
            h(Button, {
                color: that.props.color || 'inherit',
                raised: that.props.raised || false,
                onClick: () => {
                    this.onClick();
                },
                disabled: that.props.freeze ? that.state.freeze : false,
            }, [
                that.props.children || h('div', {}, [
                    h(BackupIcon, { className: css.vmid }),
                    h('span', { className: css.vmid }, ' 上传文件'),
                ]),
                h('div', {
                    className: css.overlay,
                    style: {
                        width: that.props.freeze ? 0 : `${that.state.overlay}%`,
                        background: that.props.overlayColor || that.state.file.colorTag,
                    }
                })
            ]),
            h('input', {
                className: css.finput,
                type: "file",
                accept: (that.props.accept || ''),
                ref: (dom) => { that.state.inputDom = dom },
                onChange: (event) => { that.onChange(event.target.files) },
            }) //实际输入，每次自动重新生成
        ]);
    };
};

MyComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};
MyComponent = withStyles(_style)(MyComponent);
MyComponent.fn = $fn;


export default MyComponent;
