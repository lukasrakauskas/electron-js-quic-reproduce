const { app, BrowserWindow } = require("electron");
const { QUICClient } = require("@matrixai/quic");
const path = require("node:path");
const { getRandomValues } = require("node:crypto");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.webContents.openDevTools();
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function main() {
  await app.whenReady();

  createWindow();

  await QUICClient.createQUICClient({
    host: "localhost",
    port: 6121,
    crypto: {
      ops: {
        randomBytes: (data) => {
          getRandomValues(new Uint8Array(data));
        },
      },
    },
    config: {
      verifyPeer: false,
    },
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

main().catch(console.error);
