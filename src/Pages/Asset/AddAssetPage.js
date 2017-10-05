import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';
import ModalBar from '../../Units/ModalBar/ModalBar';
import MyUpload from '../../Utils/MyUpload';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Menu, { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import FontA from 'react-fa';

const AssetTypes = {
    link: {
        name: '链接',
        icon: 'link',
    },
    image: {
        name: '图片',
        icon: 'file-photo-o',
    },
    file: {
        name: '文件',
        icon: 'file-zip-o',
    },
    video: {
        name: '视频',
        icon: 'file-video-o',
    },
};

//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        title: '新建资源',
        contentHeight: window.innerHeight - 48,
        curType: AssetTypes.video,
        file: null,
        assetUrl: '', //http开头的完整地址
        assetTitle: '',
        assetDesc: '',
    };

    //界面初始化之前的函数
    componentWillMount = async function() {};

    //界面完成后的初始化函数:判断用户是否登录，创建userMenu
    componentDidMount = async function() {
        let that = this;
        window.addEventListener('resize', () => {
            that.setState({ contentHeight: window.innerHeight - 48 });
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = this.props.classes;
        let cuser = that.state.currentUser;

        //类型下拉菜单
        let typeMenuArr = [];
        let typesArr = [];
        for(var key in AssetTypes) typesArr.push(AssetTypes[key]);
        typesArr.map(function(item, index) {
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
            that.state.curType == AssetTypes.link ? h(Grid, { item: true, xs: 12 }, [
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
            that.state.curType == AssetTypes.image ? h(Grid, {
                item: true,
                xs: 12,
                className: css.imgBox,
            }, [
               h(MyUpload, {
                    freeze: 10,
                    style: { padding: 1, background: '#FAFAFA' },
                    children: h('img', {
                        className: css.img,
                        src: that.state.file ? `${that.state.assetUrl}-scale512` : global.$conf.defaultIcon,
                    }),
                    success: (file, err, res) => {
                        that.setState({ file: file, assetUrl: `http://${file.url}` });
                    },
                }),
                h('div', { style: { fontSize: 12, color: '#AAA' } }, '点击图片上传'),
            ]) : undefined,

            //上传文件
            that.state.curType == AssetTypes.file ? h(Grid, {
                item: true,
                xs: 12,
                className: css.fileBox,
            }, [
               h(MyUpload, {
                    freeze: 10,
                    raised: true,
                    children: [h(FontA, { name: 'cloud-upload' }), h('span', {
                        style: { margin: '0 8px' },
                    }, '上传文件')],
                    success: (file, err, res) => {
                        that.setState({ file: file, assetUrl: `http://${file.url}` });
                    },
                }),
                that.state.file ? h('div', {
                    className: css.fileLink,
                }, that.state.file.name) : undefined,
            ]) : undefined,

            //上传视频
            that.state.curType == AssetTypes.video ? h(Grid, {
                item: true,
                xs: 12,
                className: css.fileBox,
            }, [
               h(MyUpload, {
                    freeze: 10,
                    raised: true,
                    children: [h(FontA, { name: 'cloud-upload' }), h('span', {
                        style: { margin: '0 8px' },
                    }, '上传mp4视频文件')],
                    success: (file, err, res) => {
                        that.setState({ file: file, assetUrl: `http://${file.url}` });
                    },
                }),
                that.state.file ? h('div', {
                    className: css.fileLink,
                }, that.state.file.name) : undefined,
            ]) : undefined,

            //标题
            h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '标题',
                    placeholder: '为您的资源设定标题',
                    helperText: '不超过128个字符',
                    value: that.state.assetTitle,
                    onChange: (e) => { that.setState({ assetTitle: e.target.value }) },
                }),
            ]),

            //描述
            h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '简介',
                    placeholder: '简单介绍此资源的内容、作用或特征',
                    helperText: '不超过256个字符',
                    value: that.state.assetDesc,
                    onChange: (e) => { that.setState({ assetDesc: e.target.value }) },
                }),
            ]),

            h(Button, {
                color: 'primary',
                raised: true,
                className: css.longBtn,
                onClick: () => { that.updateProfile() },
            }, '完 成'),
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
