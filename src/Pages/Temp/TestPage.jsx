import React from 'react';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';
import h from 'react-hyperscript';

class PositionedSnackbar extends React.Component {
    state = {
        open: false,
        vertical: null,
        horizontal: null,
    };

    handleClick = state => () => {
        this.setState({ open: true });
    };

    handleRequestClose = () => {
        this.setState({ open: false });
    };

    render() {
        /* return(
            <div>
        <Button onClick={this.handleClick()}>OPEN</Button>
        <Snackbar
          open={this.state.open}
          message='ccc'
        />
      </div>
        );*/

        return h('div', [
            h(Button, {
                onClick: () => { global.$snackbar.fn.show('text') },
            }, 'xx'),
            //h(Snackbar, { open: this.state.open, message: 'xxx' }),
        ])

    }
}

export default PositionedSnackbar;
