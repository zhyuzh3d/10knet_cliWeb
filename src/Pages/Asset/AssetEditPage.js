/*
新建或者编辑一个素材asset
如果素材与源作者一致，那么同步修改源src
store:{
    basketId,
    assetId,
    appBarTitle: 页面标题,
    data,预填充{title,url,desc,sliderId,problemId,type,ver}
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import MyUpload from '../../Utils/MyUpload';
import NavBar from '../../Units/MainAppBar/NavBar';
import SliderEditor from '../../Units/Slider/SliderEditor';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Menu, { MenuItem } from 'material-ui/Menu';
import FontA from 'react-fa';

import Moment from 'react-moment';


const style = theme => ({
    textField: {
        width: '100%',
        marginTop: theme.spacing.unit * 2,
    },
    img: {
        maxHeight: 128,
    },
    imgBox: {
        marginTop: theme.spacing.unit * 2,
    },
    fileBox: {
        marginTop: theme.spacing.unit * 2,
    },
    fileLink: {
        fontSize: 12,
        color: '#666',
        marginTop: theme.spacing.unit,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: `${theme.spacing.unit}px 0`,
    },
    okBtn: {
        width: '60%',
    },
    cancelBtn: {
        marginRight: '2%',
        width: '38%',
    },
    btnRow: {
        width: '100%',
        marginTop: theme.spacing.unit * 6,
    },
    shortBtn: {
        width: 64,
        minWidth: 64,
        marginLeft: 8,
        textAlign: 'center',
    },
});

//元件
class com extends Component {
    state = {
        appBarTitle: '新建和编辑素材',
        asset: null,
        assetId: null,
        title: '新建素材',
        curType: global.$conf.assetTypes.oj,
        sliderPublic: {},
        file: null,
        assetUrl: '', //http开头的完整地址
        assetTitle: '',
        assetDesc: '',
        assetSrc: '', //指向src下的srcId素材源
        assetVer: '',
        baksetArr: null,
        curBasket: null,
        basketLock: false,
        sliderId: null,
        problemId: null,
        src: null,
        srcArr: [],
        contentHeight: window.innerHeight - 48,
    };


    //保存素材到asset
    saveAsset = () => {
        let that = this;

        if(!global.$wd.auth().currentUser) {
            global.$alert.fn.show('您还没有登录', '请点右上角图标进行登录或注册');
            return;
        };

        if(!that.state.curBasket) {
            global.$alert.fn.show('您还没有选择篮子', '如果没有请点击顶部的新建按钮');
            return;
        };

        if(that.state.curType !== global.$conf.assetTypes.slider && that.state.curType !== global.$conf.assetTypes.oj && !global.$conf.regx.assetUrl.test(that.state.assetUrl)) {
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

        if(that.state.curType === global.$conf.assetTypes.slider && !that.state.sliderPublic.sliderId) {
            global.$alert.fn.show('演示没有创建', '请您刷新后再试');
            return;
        };

        if(that.state.curType === global.$conf.assetTypes.oj && !that.state.problemId) {
            global.$alert.fn.show('题目ID不能为空', '请正确输入题目ID');
            return;
        };

        let curUser = global.$wd.auth().currentUser;
        let userId = curUser.uid;
        let newAsset = {
            title: that.state.assetTitle,
            desc: that.state.assetDesc,
            author: curUser.uid,
            type: that.state.curType.id,
            src: that.state.assetSrc,
            ver: that.state.assetVer || global.$wd.sync().ServerValue.TIMESTAMP,
            picker: userId,
            ts: global.$wd.sync().ServerValue.TIMESTAMP,
            pos: global.$wd.sync().ServerValue.TIMESTAMP,
        };

        if(that.state.curType === global.$conf.assetTypes.oj) {
            newAsset.problemId = that.state.problemId;
        } else if(that.state.curType === global.$conf.assetTypes.slider) {
            newAsset.sliderId = that.state.sliderPublic.sliderId;
        } else {
            newAsset.url = that.state.assetUrl;
        };


        //清理
        for(let key in newAsset) {
            if(!newAsset[key]) delete newAsset[key];
        };

        let assetId = that.state.assetId;
        let basketId = that.state.curBasket.key;
        if(assetId) { //修改basket内asset
            let ref = global.$wd.sync().ref(`basket/${basketId}/arr/${assetId}`);
            ref.update(newAsset).then((res) => {
                if(that.state.saveToSrc) {
                    that.saveAssetToSrc(newAsset, assetId); //同步到src
                } else {
                    global.$snackbar.fn.show('修改成功', 2000);
                    global.$router.prevPage();
                };
            }).catch((err) => {
                global.$snackbar.fn.show(`修改失败:${err.message}`, 2000);
            });
        } else { //新增
            let ref = global.$wd.sync().ref(`src`);
            delete newAsset.picker; //src忽略picker和src属性
            delete newAsset.src;

            ref.push({
                author: curUser.uid,
            }).then((res) => {
                let assetId = res.key();

                //同时推到src和baskets下
                let srcRef = global.$wd.sync().ref(`src/${assetId}/his`);
                srcRef.push(newAsset).then((res) => {
                    newAsset.src = assetId;
                    newAsset.picker = userId;
                    let assetRef = global.$wd.sync().ref(`basket/${basketId}/arr/${assetId}`);
                    assetRef.update(newAsset).then((res) => {
                        global.$snackbar.fn.show('新增成功', 2000);
                        global.$router.prevPage();
                    });
                });
            }).catch((err) => {
                console.log(err);
                global.$snackbar.fn.show(`新增失败:${err.message}`, 2000);
            });
        }
    };

    //保存asset复制品到src/assetId/his,这里的assetId是之前push生成的唯一key
    saveAssetToSrc = (assetId, newAsset) => {
        delete newAsset.picker;
        delete newAsset.src;

        let ref = global.$wd.sync().ref(`src/${assetId}/his`);
        ref.push(newAsset).then((res) => {
            global.$snackbar.fn.show('修改成功', 2000);
            global.$router.prevPage();
        }).catch((err) => {
            global.$snackbar.fn.show(`修改失败:${err.message}`, 2000);
        });
    };


    wdAuthListen = null;

    //界面完成后的初始化函数:判断用户是否登录，创建userMenu
    componentDidMount = async function() {
        let that = this;
        window.addEventListener('resize', this.setContentSize);

        let basketId = global.$store('AssetEditPage', 'basketId');
        if(basketId) that.setState({ basketLock: true });

        that.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            let cuser = global.$wd.auth().currentUser;
            let data = that.props.data;
            if(cuser) {
                that.setState({
                    hasLogin: true,
                    currentUser: cuser
                });
                that.getMyBaskets(cuser.uid);
                const assetId = global.$store('AssetEditPage', 'assetId');
                const basketId = global.$store('AssetEditPage', 'basketId');
                if(assetId) {
                    that.getAsset(basketId, assetId, cuser.uid);
                    that.setState({
                        assetId: assetId,
                        basketId: basketId,
                    });
                } else { //预填充
                    const data = global.$store('AssetEditPage', 'data');
                    if(data) that.setAssetIpt(data);
                };
            };
        });
    };

    //获取asset信息
    getAsset = (basketId, assetId, userId) => {
        let that = this;
        global.$wd.sync().ref(`basket/${basketId}/arr/${assetId}`).once('value', (shot) => {
            var asset = shot.val();
            that.setState({
                asset: asset,
                picker: userId,
                assetSrc: asset.src,
            });
            that.setAssetIpt(asset);
            that.getSrcHis();
            that.getSrcAuthor(asset.src, userId);
        });
    };

    //获取源历史
    getSrcHis = () => {
        let that = this;
        let arr = [];
        let asset = that.state.asset;
        asset && arr.push(asset);
        let assetId = that.state.assetId;

        let ref = global.$wd.sync().ref(`src/${assetId}/his`);
        ref.orderByChild('ts').limitToLast(10).once('value', (shot) => {
            let assets = shot.val();
            if(assets) {
                for(let key in assets) {
                    arr.push(assets[key]);
                };
            };
        });
        that.setState({ srcArr: arr })
    };

    //设置可修改数据
    setAssetIpt = (asset) => {
        let that = this;
        that.setState({
            assetTitle: asset.title || that.state.assetTitle || '',
            assetUrl: asset.url || that.state.assetUrl || '',
            assetDesc: asset.desc || that.state.assetDesc || '',
            sliderId: asset.sliderId || that.state.sliderId || '',
            problemId: asset.problemId || that.state.problemId || '',
            curType: global.$conf.assetTypes[asset.type || 'link'],
            assetVer: asset.ver || '',
            file: { name: asset.url || '' },
        });
    };

    //检查是否src作者,以确认是否要更新src
    getSrcAuthor = (srcId, userId) => {
        let that = this;
        let ref = global.$wd.sync().ref(`asset/${srcId}/author`);
        ref.once('value', (shot) => {
            var suid = shot.val();
            if(userId === suid) {
                that.setState({ saveToSrc: true });
            };
        });
    };


    //获取用户的所有篮筐信息
    getMyBaskets = (uid) => {
        let that = this;
        let ref = global.$wd.sync().ref(`ubasket/${uid}`);
        ref.on('value', (shot) => {
            let baskets = shot.val();
            if(baskets) {
                let basketArr = [];
                let basketId = global.$store('AssetEditPage', 'basketId');

                for(let key in baskets) {
                    baskets[key].key = key;
                    basketArr.push(baskets[key]);
                    if(basketId === key) {
                        that.setState({ curBasket: baskets[key] });
                    };
                };
                if(!that.state.curBasket) that.setState({ curBasket: basketArr[0] });
                that.setState({ basketArr: basketArr });
            };
        });
    };


    //显示弹窗添加项目
    showAddItemDialog = () => {
        let that = this;
        let cuser = global.$wd.auth().currentUser;
        let userId = cuser ? cuser.uid : undefined;

        if(!userId) {
            global.$snackbar.fn.show('您还没有登录', '请点击右上角按钮登录后再试');
        } else {
            global.$confirm.fn.show({
                title: '请输入篮子名称',
                input: {
                    label: '篮子名称',
                    tip: '2～32个字符',
                    regx: /^.{2,32}$/,
                    value: '未命名',
                },
                okHandler: (ipt) => {
                    that.addItem(ipt);
                },
            });
        };
    };

    //新建一个空篮子，通过ref可以索引到基础信息,素材列表放在assets内,然后添加到用户索引
    addItem = (ipt) => {
        let that = this;
        let userId = global.$wd.auth().currentUser.uid;
        let ref = global.$wd.sync().ref(`basket`);

        ref.push({ author: userId }).then((res) => {
            let newItem = {
                title: ipt,
                ref: `ubasket/${userId}`,
                ts: global.$wd.sync().ServerValue.TIMESTAMP,
            };

            let itemKey = res.key(); //ubasket和basket的key相同
            global.$wd.sync().ref(`ubasket/${userId}`).update({
                [itemKey]: newItem
            }).then((res) => {
                global.$snackbar.fn.show('创建成功', 2000);
                newItem.key = itemKey;
                that.setState({ curBasket: newItem });
            });
        }).catch((err) => {
            global.$snackbar.fn.show(`创建失败:${err.message}`, 3000);
        });
    };

    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    componentWillUnmount = async function() {
        this.wdAuthListen && this.wdAuthListen();
        window.removeEventListener('resize', this.setContentSize);

        let cuser = global.$wd.auth().currentUser;
        let uid = cuser ? cuser.uid : null;
        global.$wd.sync().ref(`ubasket/${uid}`).off('value');
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
        let appBarTitle = global.$store('AssetDetailPage', 'appBarTitle');


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

        //篮子下拉菜单
        let basketMenuArr = [];
        let basketArr = that.state.basketArr || [];
        basketArr.forEach(function(item, index) {
            var menuItem = h(MenuItem, {
                onClick: (evt) => {
                    that.setState({
                        curBasket: item,
                        basketMenuOpen: false,
                    })
                },
            }, [
                h(FontA, { name: 'shopping-basket' }),
                h('span', { style: { margin: '0 8px' } }, item.title),
            ]);
            basketMenuArr.push(menuItem);
        });

        //源下拉菜单
        let srcMenuArr = [];
        let srcArr = that.state.srcArr || [];
        srcArr.forEach(function(item, index) {
            var menuItem = h(MenuItem, {
                onClick: (evt) => {
                    that.setState({
                        srcMenuOpen: false,
                    });
                    global.$confirm.fn.show({
                        title: '修改内容将被替换',
                        text: '替换后无法找回，您需要重新修改',
                        okHandler: () => {
                            that.setAssetIpt(item);
                        }
                    });
                },
            }, [
                item === that.state.asset ? h('span', '新') : h('span', '源'),
                h(Moment, {
                    format: 'YYYY/MM/DD hh:mm'
                }, item.ts),
            ]);
            srcMenuArr.push(menuItem);
        });


        //内容区
        let content = [
            h('div', { style: { height: 16 } }),
            h(Grid, { item: true, xs: 12 }, [
                h(Button, {
                    raised: true,
                    style: { marginRight: 12 },
                    onClick: (evt) => {
                        that.setState({
                            typeMenuOpen: !that.state.typeMenuOpen,
                            typeMenuAnchor: evt.currentTarget,
                        })
                    },
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

                //篮子下拉
                h(Button, {
                    raised: true,
                    disabled: that.state.basketLock,
                    style: { marginRight: 4 },
                    onClick: (evt) => {
                        that.setState({
                            basketMenuOpen: !that.state.basketMenuOpen,
                            basketMenuAnchor: evt.currentTarget,
                        })
                    }
                }, [
                    h(FontA, { name: 'shopping-basket' }),
                    h('span', { style: { margin: '0 8px' } }, that.state.curBasket ? that.state.curBasket.title : '未知...'),
                    h(FontA, { name: 'caret-down' }),
                ]),
                h(Menu, {
                    open: that.state.basketMenuOpen,
                    anchorEl: that.state.basketMenuAnchor,
                    onRequestClose: () => { that.setState({ basketMenuOpen: false }) },
                }, basketMenuArr),

                !that.state.basketLock ? h(Button, {
                    raised: true,
                    style: { minWidth: 36 },
                    onClick: (evt) => {
                        that.showAddItemDialog();
                    }
                }, [
                    h(FontA, { name: 'plus' }),
                ]) : undefined,

                //源下拉
                that.state.assetId ? h(Button, {
                    raised: true,
                    className: css.shortBtn,
                    onClick: (evt) => {
                        that.setState({
                            srcMenuOpen: !that.state.srcMenuOpen,
                            srcMenuAnchor: evt.currentTarget,
                        })
                    }
                }, [
                    h(FontA, { name: 'clock-o', style: { marginRight: 4 } }),
                    h(FontA, { name: 'caret-down' }),
                ]) : undefined,
                that.state.assetId ? h(Menu, {
                    open: that.state.srcMenuOpen,
                    anchorEl: that.state.srcMenuAnchor,
                    onRequestClose: () => { that.setState({ srcMenuOpen: false }) },
                }, srcMenuArr) : undefined,
            ]),

            //粘贴输入连接
            that.state.curType === AssetTypes.link ? h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '链接',
                    placeholder: '粘贴链接',
                    helperText: '请输入完整的http开头的链接地址',
                    value: that.state.assetUrl || '',
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

            //OJ题目
            that.state.curType === AssetTypes.oj ? h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '题目ID',
                    placeholder: '粘贴ID数字',
                    helperText: '在题目详情页面顶部标题下面',
                    value: that.state.problemId || '',
                    onChange: (e) => { that.setState({ problemId: e.target.value }) },
                }),
            ]) : undefined,

            //标题
            h(Grid, { item: true, xs: 12 }, [
                h(TextField, {
                    className: css.textField,
                    label: '标题',
                    placeholder: '为您的素材设定标题',
                    helperText: '不超过64个字符',
                    value: that.state.assetTitle || '',
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
                    value: that.state.assetDesc || '',
                    onChange: (e) => { that.setState({ assetDesc: e.target.value }) },
                }),
            ]),

            //保存、取消按钮
            h('div', {
                className: css.btnRow,
            }, [
                 h(Button, {
                    disabled: !that.state.hasLogin,
                    raised: true,
                    className: css.cancelBtn,
                    onClick: () => { global.$router.prevPage() },
                }, '取 消'),
                h(Button, {
                    disabled: !that.state.hasLogin,
                    color: 'primary',
                    raised: true,
                    className: css.okBtn,
                    onClick: () => { that.saveAsset() },
                }, '保 存'),
            ]),


            //编辑创建幻灯片
            that.state.curType === AssetTypes.slider ? h(SliderEditor, {
                sliderId: that.state.asset ? that.state.asset.sliderId : null,
                public: that.state.sliderPublic,
            }) : undefined,

        ];

        //最终拼合
        let contentStyle = {
            padding: '24px 32px',
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };
        return h('div', {}, [
            h(NavBar, { title: `*${that.state.assetTitle || appBarTitle || that.state.appBarTitle}` }),
            h(Grid, { container: true, justify: 'center' },
                h(Grid, { item: true, xs: 12, style: contentStyle }, content),
            ),
        ]);

    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
