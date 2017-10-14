import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';

import NavBar from '../../Units/MainAppBar/NavBar';
import AssetList from '../../Units/Asset/AssetList';
import style from './_style';

//元件
class com extends Component {
    state = {
        title: '素材列表',
        assets: null,
        contentHeight: window.innerHeight - 48,
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
        let that = this;
        let userId = global.$store('AssetListPage', 'userId');
        let wdRef = global.$store('AssetListPage', 'wdRef');

        let content = h(AssetList, {
            uid: userId,
            wdRef: wdRef,
        });

        let contentStyle = {
            padding: 16,
            height: that.state.contentHeight,
            overflowY: 'auto',
            paddingBottom: 128,
        };
        return h(Grid, { container: true, }, [
            h(NavBar, { title: that.state.title }),
            h(Grid, { container: true, style: { height: 64 } }),
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
