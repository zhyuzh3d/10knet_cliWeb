import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';
import ModalBar from '../../Units/MainAppBar/ModalBar';
import MyUpload from '../../Utils/MyUpload';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Menu, { MenuItem } from 'material-ui/Menu';
import FontA from 'react-fa';


//元件
class com extends Component {
    state = {
        assetId: null,
        title: '新建素材',
        contentHeight: window.innerHeight - 48,
        curType: global.$conf.assetTypes.link,
        file: null,
        assetUrl: '', //http开头的完整地址
        assetTitle: '',
        assetDesc: '',
    };


    //保存素材到asset
    saveAsset = () => {
        let that = this;

        if(!global.$wd.auth().currentUser) {
            global.$alert.fn.show('您还没有登录', '请点右上角图标进行登录或注册');
            return;
        };
        if(!global.$conf.regx.assetUrl.test(that.state.assetUrl)) {
            global.$alert.fn.show('链接格式错误', '请检查确认以http开头的完整链接');
            return;
        };
        if(!global.$conf.regx.assetTitle.test(that.state.assetTitle)) {
            global.$alert.fn.show('标题格式错误', '请确认字符数量3～64个');
            return;
        };
        if(!global.$conf.regx.assetTitle.test(that.state.assetTitle)) {
            global.$alert.fn.show('标题格式错误', '请确认字符数量<256个');
            return;
        };

        let curUser = global.$wd.auth().currentUser;
        let assetId = that.state.assetId;
        let newAsset = {
            url: that.state.assetUrl,
            title: that.state.assetTitle,
            desc: that.state.assetDesc,
            author: curUser.uid,
            type: that.state.curType.id,
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
        };

        if(assetId) {
            global.$wd.sync().ref(`asset/${assetId}`).update(newAsset).then((res) => {
                global.$snackbar.fn.show('保存成功', 2000);
            });
        } else {
            global.$wd.sync().ref('asset').push(newAsset).then((res) => {
                that.state.assetId = res.key();
                global.$snackbar.fn.show('创建成功，可继续编辑或返回', 2000);
            });
        }
    };

    wdAuthListen = null;

    //界面完成后的初始化函数:判断用户是否登录，创建userMenu
    componentDidMount = async function() {
        let that = this;
        window.addEventListener('resize', () => {
            that.setState({ contentHeight: window.innerHeight - 48 });
        });
        that.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            if(global.$wd.auth().currentUser) that.setState({ hasLogin: true })
        });

        //编辑状态读取asset信息
        const assetId = global.$store('AssetEditPage', 'assetId');
        if(!assetId) return;
        that.setState({ assetId: assetId });

        global.$wd.sync().ref(`asset/${assetId}`).once('value', (shot) => {
            var asset = shot.val();
            that.setState({
                assetTitle: asset.title,
                assetUrl: asset.url,
                assetDesc: asset.desc,
                curType: global.$conf.assetTypes[asset.type],
                file: { name: asset.url },
            });
        });
    };

    componentWillUnmount = async function() {
        this.wdAuthListen && this.wdAuthListen();
    };

    //检查url是否可以显示的图片
    isImageUrl = (str) => {
        if(!str) return false;
        let regx = global.$conf.regx.imgFile;
        return regx.test(str);
    };

    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;
        const AssetTypes = global.$conf.assetTypes;

        //类型下拉菜单
        let typeMenuArr = [];
        let typesArr = [];
        for(var key in AssetTypes) typesArr.push(AssetTypes[key]);
        typesArr.forEach(function(item, index) {
            var menuItem = h(MenuItem, {
                onClick: (evt) => {
                    that.setState({
                        curType: item,
                        typeMenuOpen: false,
                        file: null,
                    })
                },
            }, [
                h(FontA, { name: item.icon }),
                h('span', { style: { margin: '0 8px' } }, item.name),
            ]);
            typeMenuArr.push(menuItem);
        });

        //内容区
        let content = [
            h('div', { style: { height: 16 } }),
            h(Grid, { item: true, xs: 12 }, [
                h(Button, {
                    raised: true,
                    onClick: (evt) => {
                        that.setState({
                            typeMenuOpen: !that.state.typeMenuOpen,
                            typeMenuAnchor: evt.currentTarget,
                        })
                    }
                }, [
                    h(FontA, { name: that.state.curType.icon }),
                    h('span', { style: { margin: '0 8px' } }, that.state.curType.name),
                    h(FontA, { name: 'caret-down' }),
                ]),
                h(Menu, {
                    open: that.state.typeMenuOpen,
                    anchorEl: that.state.typeMenuAnchor,
                    onRequestClose: () => { that.setState({ typeMenuOpen: false }) },
                }, typeMenuArr),
            ]),

            //粘贴输入连接
            that.state.curType === AssetTypes.link ? h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '链接',
                    placeholder: '粘贴链接',
                    helperText: '请输入完整的http开头的链接地址',
                    value: that.state.url,
                    onChange: (e) => { that.setState({ assetUrl: e.target.value }) },
                }),
            ]) : undefined,

            //上传图片
            that.state.curType === AssetTypes.image ? h(Grid, {
                item: true,
                xs: 12,
                className: css.imgBox,
            }, [
               h(MyUpload, {
                    freeze: 10,
                    style: { padding: 1, background: '#FAFAFA' },
                    nameRegx: global.$conf.regx.imgFile,
                    children: h('img', {
                        className: css.img,
                        src: that.state.assetUrl && that.isImageUrl(that.state.assetUrl) ? `${that.state.assetUrl}-scale512` : global.$conf.defaultIcon,
                    }),
                    success: (file, err, res) => {
                        that.setState({ file: file, assetUrl: `http://${file.url}` });
                    },
                }),
                h('div', {
                    className: css.fileLink,
                }, that.state.assetUrl ? that.state.assetUrl : '点击图片上传png,jpg或gif文件'),
            ]) : undefined,

            //上传文件
            that.state.curType === AssetTypes.file ? h(Grid, {
                item: true,
                xs: 12,
                className: css.fileBox,
            }, [
               h(MyUpload, {
                    freeze: 10,
                    raised: true,
                    children: h('div', {}, [
                        h(FontA, { name: 'cloud-upload' }),
                        h('span', { style: { margin: '0 8px' } }, '上传文件'),
                    ]),
                    success: (file, err, res) => {
                        that.setState({ file: file, assetUrl: `http://${file.url}` });
                    },
                }),
                that.state.assetUrl ? h('div', {
                    className: css.fileLink,
                }, that.state.assetUrl) : undefined,
            ]) : undefined,

            //上传视频
            that.state.curType === AssetTypes.video ? h(Grid, {
                item: true,
                xs: 12,
                className: css.fileBox,
            }, [
               h(MyUpload, {
                    freeze: 10,
                    raised: true,
                    nameRegx: global.$conf.regx.videoFile,
                    children: h('div', {}, [
                        h(FontA, { name: 'cloud-upload' }),
                        h('span', {
                            style: { margin: '0 8px' },
                        }, '上传mp4视频文件')]),
                    success: (file, err, res) => {
                        that.setState({ file: file, assetUrl: `http://${file.url}` });
                    },
                }),
                that.state.assetUrl ? h('div', {
                    className: css.fileLink,
                }, that.state.assetUrl) : undefined,
            ]) : undefined,

            //标题
            h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '标题',
                    placeholder: '为您的素材设定标题',
                    helperText: '不超过64个字符',
                    value: that.state.assetTitle,
                    onChange: (e) => { that.setState({ assetTitle: e.target.value }) },
                }),
            ]),

            //描述
            h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '简介',
                    multiline: true,
                    placeholder: '简单介绍此素材的内容、作用或特征',
                    helperText: '不超过256个字符',
                    value: that.state.assetDesc,
                    onChange: (e) => { that.setState({ assetDesc: e.target.value }) },
                }),
            ]),

            h(Button, {
                disabled: !that.state.hasLogin,
                color: 'primary',
                raised: true,
                className: css.longBtn,
                onClick: () => { that.saveAsset() },
            }, '保 存'),
        ];

        //最终拼合
        return h(Grid, { container: true, className: css.page }, [
            h(ModalBar, { title: that.state.title }),
            h('div', { style: { height: 48 } }),
            h(Grid, { container: true, justify: 'center' }, [
                h(Grid, { item: true, xs: 10, sm: 8 }, content),
            ]),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
