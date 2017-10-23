/*
用户主窗口和辅助窗口之间通信
init(winName),'main','slave'
*/

const renderer = global.$electron ? global.$electron.ipcRenderer : undefined;

const cmds = {
    OPENULR: 'openUrl',
}

//初始化主窗口
const initMain = () => {
    //替换window.open命令，在从窗口中打开
    window.open = (url) => {
        run(`if(!slaveWindow)initSlave();`);
        run(`slaveWindow.restore();`);
        setTimeout(() => {
            send('slave', {
                type: cmds.OPENULR,
                url: url,
            });
        }, 200);
    };

    renderer.on('msg', (event, arg) => {
        console.log('>[MyIpc:on msg]', global.$winName, arg, event);
    });
}

//初始化从窗口
const initSlave = () => {
    renderer.on('msg', (event, arg) => {
        console.log('>[MyIpc:on msg]', global.$winName, arg, event);
    });
}


//初始化当前窗口的设置
const init = (winName) => {
    if(winName === 'main') {
        initMain();
    } else {
        initSlave();
    };
}


//呼叫主进程执行命令
const run = (cmd) => {
    renderer.sendSync('run', cmd);
}

//向主窗口／从窗口发送信息
const send = (target, payload) => {
    renderer.sendSync('send', {
        target: target,
        payload: payload,
    });
}



const ipc = {
    init,
    send,
    run,
    cmds,
    renderer,
};

export default global.$electron ? ipc : null;
