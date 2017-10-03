 //渲染实现
    render() {
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        let that = this;
        const css = this.props.classes;

        return h(Grid, { container: true, className: css.page }, [
           h(Button, {
                onClick: () => {
                    var send = global.$electron.ipcRenderer.sendSync;
                    send('run', `if(!slaveWindow)initSlave();`);
                    send('run', `slaveWindow.restore()`);

                    //打开从属页首页
                    var urlObj = urlParser.parse(window.location.href);
                    if(!urlObj.query) urlObj.query = { parts: [] };
                    urlObj.query.parts.push('pageName=SlaveHomePage');
                    send('run', `slaveWindow.loadURL('${urlObj.toString()}')`);
                },
            }, '显示大窗口'),
            h(Button, {
                onClick: () => {
                    var send = global.$electron.ipcRenderer.sendSync;
                    send('run', `slaveWindow.hide()`);
                },
            }, '隐藏大窗口'),
        ]);
    }
