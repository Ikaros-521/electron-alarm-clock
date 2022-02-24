// app.js

// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, BrowserWindow, Menu, Tray } = require('electron')
const path = require('path')

let mainWindow;
let tray = null

function createWindow () {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  // 打开窗口的调试工具
  // mainWindow.webContents.openDevTools();

  // 关闭默认菜单
  mainWindow.setMenu(null);

  // 加载 index.html
  mainWindow.loadFile('index.html')

  // 窗口关闭的监听  
  mainWindow.on('closed', (event) => {
    win = null;
  });
  // 触发关闭时触发
  mainWindow.on('close', (event) => {
    // 截获 close 默认行为
    event.preventDefault();
    // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);

  });
  // 触发显示时触发
  mainWindow.on('show', () => {});
  // 触发隐藏时触发
  mainWindow.on('hide', () => {});

  // 新建托盘
  tray = new Tray(path.join(__dirname, 'img/icon.ico'));
  // 托盘名称
  tray.setToolTip('Electron Clock');
  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([{
      label: 'show',
      click: () => { mainWindow.show() }
    },
    {
      label: 'quit',
      click: () => { mainWindow.destroy() }
    }
  ]);
  // 载入托盘菜单
  tray.setContextMenu(contextMenu);
  // 双击触发
  tray.on('double-click', () => {
    // 双击通知区图标实现应用的显示或隐藏
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true);
  });
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()

  // 当窗口开始活动时触发
  app.on('activate', function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
    if (mainWindow === null) {
      createWindow();
    }
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。
