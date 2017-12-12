/*
动态元件：分组列表
自动判断是否具有编辑权限
{
    info,分组信息{author*,id*,title}
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import md5 from 'md5';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';
import List, { ListItem } from 'material-ui/List';

import NavBar from '../../Units/MainAppBar/NavBar';
import UserButton from '../../Units/User/UserButton';

const style = theme => ({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        margin: '24px 16px 4px 16px',
    },
    userBox: {
        flex: 1,
    },
    userRow: {
        height: 72,
        borderBottom: '1px solid #EEE',
        paddingBottom: 0,
        paddingTop: 0,
    },
    rightArrow: {
        fontSize: 10,
        color: '#CCC',
    },
    tip: {
        width: '100%',
        fontSize: 14,
        fontWeight: 100,
        color: '#AAA',
        textAlign: 'center',
        marginTop: 32,
    },
    btnGrp: {
        padding: 16,
    },
    btn: {
        padding: '8px 16px',
        minHeight: 32,
        marginRight: 8,
    },
    label: {
        fontSize: 14,
        color: '#888',
        marginLeft: 16,
    }
});

//元件
class com extends Component {
    state = {
        title: '小组成员',
        contentHeight: window.innerHeight - 48,
        data: null, //obj成员列表
        info: null, //obj分组信息
        isAuthor: false,
        cuser: null,
    };

    //读取成员信息，检测权限
    componentWillMount = async function() {
        let that = this;
        let info = global.$store('GroupDetailPage', 'info');
        if(!info || !info.id) return;
        that.getItemList(info);
        this.wdAuthListen = global.$wd.auth().onAuthStateChanged(function(user) {
            var cuser = global.$wd.auth().currentUser;
            if(cuser) {
                that.setState({
                    cuser: cuser,
                    isAuthor: cuser.uid === info.author,
                });
            };
        });
    };

    componentDidMount = async function() {
        window.addEventListener('resize', this.setContentSize);
    };

    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.setContentSize);
    };

    //获取用户列表信息
    getItemList = (info) => {
        let that = this;
        global.$wd.sync().ref(`group/${info.id}/members`).on('value', (shot) => {
            let data = shot.val();
            data && that.setState({ data: data });
        });
        global.$wd.sync().ref(`ugroup/${info.author}/${info.id}`).on('value', (shot) => {
            let data = shot.val();
            data && that.setState({ info: data });
        });
    };

    //搜索添加新成员
    showAddMemberDialog = () => {
        let that = this;
        global.$confirm.fn.show({
            title: '请输入用户的电话号码',
            input: {
                label: '电话号码',
                tip: '2～32个字符',
                regx: global.$conf.regx.phone,
                value: '',
            },
            okHandler: (ipt) => {
                let ref = global.$wd.sync().ref(`user`);
                ref.orderByChild('phone').equalTo(md5(ipt)).once('value', (shot) => {
                    let res = shot.val();
                    if(!res) {
                        global.$snackbar.fn.show(`没找到符合条件的用户`, 3000);
                        return;
                    };
                    let arr = [];
                    for(let key in res) {
                        res[key].displayName = res[key].displayName || '未命名';
                        res[key].uid = key;
                        arr.push(res[key]);
                    };
                    if(arr.length < 1) {
                        global.$snackbar.fn.show(`没找到符合条件的用户`, 3000);
                        return;
                    };

                    global.$selector.fn.show({
                        title: '找到以下用户，点击添加',
                        itemArr: arr,
                        item: arr[0],
                        labelKey: 'displayName',
                        okHandler: (item) => {
                            that.addMember(item);
                        }
                    });
                });
            },
        });
    };

    //添加用户到数据库
    addMember = (uinfo) => {
        let info = global.$store('GroupDetailPage', 'info');
        if(!info || !info.id) return;

        let ref = global.$wd.sync().ref(`group/${info.id}/members/${uinfo.uid}`);
        ref.update(uinfo).then((shot) => {
            global.$snackbar.fn.show(`添加成功`, 2000);
        }).catch((err) => {
            global.$snackbar.fn.show(`添加失败：${err.message}`, 3000);
        })
    };


    //打开用户详情页面
    goUserDetailPage = (uinfo) => {
        global.$router.changePage('UserDetailPage', {
            userId: uinfo.uid,
        });
    };

    //删除一个用户
    removeUser = (uinfo) => {
        let info = global.$store('GroupDetailPage', 'info');
        if(!info || !info.id) return;
        let ref = global.$wd.sync().ref(`group/${info.id}/members/${uinfo.uid}`);

        global.$confirm.fn.show({
            title: `您确定要删除[${uinfo.displayName}]吗？`,
            text: '删除后无法恢复',
            okHandler: (ipt) => {
                ref.remove().then((shot) => {
                    global.$snackbar.fn.show(`删除成功`, 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`删除失败：${err.message}`, 3000);
                })
            },
        })
    };

    //重命名
    renameGroup = () => {
        let that = this;
        let info = that.state.info;
        if(!info || !info.author || !info.id) return;

        global.$confirm.fn.show({
            title: '请输入新的分组新名称',
            input: {
                label: '分组新名称',
                tip: '2～32个字符',
                regx: /^.{2,32}$/,
                value: info.title,
            },
            okHandler: (ipt) => {
                let ref = global.$wd.sync().ref(`ugroup/${info.author}/${info.id}`);
                ref.update({
                    title: ipt,
                }).then((res) => {
                    global.$snackbar.fn.show('修改成功', 2000);
                }).catch((err) => {
                    global.$snackbar.fn.show(`修改失败:${err.message}`, 3000);
                });
                global.$wd.sync().ref(`group/${info.id}/info`).update({ title: ipt });
            },
        });
    };



    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let info = that.state.info;
        let data = that.state.data;
        let isAuthor = that.state.isAuthor;

        let itemElArr = [];
        if(data) {
            for(let key in data) {
                let item = data[key];
                itemElArr.push(h(ListItem, {
                    className: css.userRow,
                    button: true,
                    onClick: () => {
                        !isAuthor && that.goUserDetailPage(item);
                    },
                }, [
                    h(Grid, {
                        item: true,
                        className: css.userBox,
                        onClick: () => {
                            isAuthor && that.goUserDetailPage(item);
                        },
                    }, h(UserButton, { userId: item.uid, size: 'lg', asButton: false })),
                    h(Grid, {
                        item: true,
                        className: css.rightArrow,
                    }, [
                        !isAuthor ? h(FontA, {
                            name: 'chevron-right',
                        }) : h(Button, {
                            name: 'chevron-right',
                            style: { minWidth: 30, color: '#AAA' },
                            onClick: () => {
                                isAuthor && that.removeUser(item);
                            },
                        }, h(FontA, { name: 'close' })),
                    ]),
                ]));
            };
        } else {
            itemElArr.push(h('div', { className: css.tip }, '...这个小组还没添加关注成员...'));
        };

        let itemElArrBox = h('div', { className: css.itemElArrBox }, itemElArr);

        let btnGrp = h('div', { className: css.btnGrp }, [
            h(Button, {
                raised: true,
                color: 'primary',
                className: css.btn,
                onClick: () => {
                    that.showAddMemberDialog();
                },
            }, [
                h(FontA, { name: 'search', style: { marginRight: 4 } }),
                h('span', ' 添加新成员'),
            ]),
            h(Button, {
                raised: true,
                color: 'primary',
                className: css.btn,
                onClick: () => {
                    that.renameGroup();
                },
            }, [
                h(FontA, { name: 'edit', style: { marginRight: 4 } }),
                h('span', ' 重命名'),
            ])
        ]);

        let content = [
            h('div', {
                className: css.title,
            }, info ? info.title : '未命名小组'),
            that.state.isAuthor ? btnGrp : null,
            h('div', {
                className: css.label,
            }, `共${itemElArr.length}成员`),
            h(List, {
                style: {
                    height: 'calc(100% - 150px)',
                    overflowY: 'auto'
                }
            }, itemElArrBox),
        ];

        //最终拼合
        return h('div', { style: { height: '100%' } }, [
            h(NavBar, { title: that.state.title }),
            h('div', { style: { margin: 0, height: 'calc(100% - 48px)' } }, content),
        ]);

    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
