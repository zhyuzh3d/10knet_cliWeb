import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

import MainAppBar from '../../Units/MainAppBar/MainAppBar';

const style = theme => ({
    myBtn: {
        marginTop: 12,
        height: 64,
    },
    myBox: {
        marginTop: 24,
    },
    myBtnBox: {
        textAlign: 'center',
    },
});


//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        title: '资源管理中心',
        contentHeight: window.innerHeight - 48,
        currentUser: null,
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

    //渲染实现
    render() {
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        let that = this;
        const css = this.props.classes;

        //内容区
        let content = h(Grid, { container: true, justify: 'center', className: css.myBox }, [
            h(Grid, { item: true, xs: 12, className: css.myBtnBox }, [
                h(Button, {
                    raised: true,
                    color: 'primary',
                    className: css.myBtn,
                    onClick: () => {
                        global.$router.changePage('AssetListPage', {
                            userId: null,
                        });
                    },
                }, '我的资源列表'),
            ]),
            h(Grid, { item: true, xs: 12, className: css.myBtnBox }, [
                h(Button, {
                    raised: true,
                    color: 'primary',
                    className: css.myBtn,
                    onClick: () => {
                        global.$router.changePage('FollowListPage', {
                            userId: null,
                        });
                    },
                }, '我的关注列表'),
            ]),
        ]);

        //最终拼合
        let contentStyle = {
            padding: 16,
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };
        return h(Grid, { container: true, }, [
            h(MainAppBar, { title: that.state.title }),
            h(Grid, { container: true, style: { height: 72 } }),
            h(Grid, { container: true, justify: 'center' },
                h(Grid, { item: true, xs: 12, sm: 10, md: 8, style: contentStyle }, content),
            ),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
