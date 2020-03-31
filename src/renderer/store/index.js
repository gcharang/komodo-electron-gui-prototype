import * as path from "path";
import * as fs from "fs";
import SmartChain from "node-komodo-rpc";
import moment from "moment";
import * as Sequelize from "sequelize";
import sqlite3 from "sqlite3";
/*
https://gist.github.com/craigvantonder/f59277cd788f8aa755e3bdbe5d21f08e
https://gist.github.com/jonataswalker/b5a5c008cb92a4721b1e83a2b3b22dc7
https://web.archive.org/web/20160309223943/http://verysimple.com/2015/05/30/using-node_sqlite3-with-electron/
https://www.techiediaries.com/electron-sqlite-windows/
https://github.com/mapbox/node-sqlite3#source-install

must do:
npm install -g -save node-gyp

*/

export const state = () => ({
  daemonConnected: false,
  chainName: "sahipsiz",
  chainMagic: 1890685667,
  getInfo: {},
  chainObj: null,
  dexp2pDir: null,
  OS: null,
  intervalId: null,
  latestPublishData: {},
  dbPath: null,
  publishProgress: 0,
  allPublishedFilesDataFromDB: [],
  PublishedFilesTableInDB: null,
  globalSnackbarColor: "error",
  globalSnackbar: false,
  globalSnackbarError: "",
});

export const mutations = {
  SET_DAEMON_CONNECTION_STATUS(state, payload) {
    state.daemonConnected = payload.status === "ok";
  },
  SET_CHAIN_NAME(state, payload) {
    state.chainName = payload.chainName;
  },
  SET_CHAIN_MAGIC(state, payload) {
    state.chainMagic = payload.chainMagic;
  },
  SET_GET_INFO(state, payload) {
    state.getInfo = payload.getInfo;
  },
  SET_CHAIN_OBJ(state, payload) {
    state.chainObj = payload.chainObj;
  },
  SET_OS(state, payload) {
    state.OS = payload.OS;
  },
  SET_DEXP2P_DIR(state, payload) {
    state.dexp2pDir = payload.dexp2pDir;
  },
  SET_INTERVAL_ID(state, payload) {
    state.intervalId = payload.intervalId;
  },
  SET_LATEST_PUBLISH_DATA(state, payload) {
    state.latestPublishData = payload.latestPublishData;
  },
  SET_DB_PATH(state, payload) {
    state.dbPath = payload.dbPath;
  },
  SET_PUBLISH_PROGRESS(state, payload) {
    state.publishProgress = payload.publishProgress;
  },
  SET_PUBLISHED_FILE_DATA(state, payload) {
    state.allPublishedFilesDataFromDB = payload.allPublishedFilesDataFromDB;
  },
  ADD_FILE_TO_PUBLISHED_FILE_DATA(state, payload) {
    state.allPublishedFilesDataFromDB.push(payload.file);
    /*
    let duplicate = false;
    state.allPublishedFilesDataFromDB.forEach((element) => {
      if (element.id === payload.file.id) {
        duplicate = true;
      }
    });
    if (!duplicate) {
      state.allPublishedFilesDataFromDB.push(payload.file);
    } else {
      state.globalSnackbarError = "The file has already been published";
      state.globalSnackbar = true;
    }
    */
  },
  SET_GLOBAL_SNACKBAR(state, payload) {
    state.globalSnackbar = payload.globalSnackbar;
  },
  SET_GLOBAL_SNACKBAR_ERROR(state, payload) {
    state.globalSnackbarError = payload.globalSnackbarError;
  },
  SET_GLOBAL_SNACKBAR_COLOR(state, payload) {
    state.globalSnackbarColor = payload.globalSnackbarColor;
  },
  SET_TABLE_PUBLISHED_FILES(state, payload) {
    state.PublishedFilesTableInDB = payload.PublishedFilesTableInDB;
  },
};

export const actions = {
  async initDaemonConnection({ commit, state }, payload) {
    try {
      const chainObj = new SmartChain({
        name: state.chainName,
      });
      const rpc = chainObj.rpc();
      commit("SET_CHAIN_OBJ", { chainObj });
      const testConn = async (rpc) => {
        const resp = await rpc.getinfo();

        if (resp.version) {
          commit("SET_DAEMON_CONNECTION_STATUS", { status: "ok" });
          commit("SET_CHAIN_NAME", {
            chainName: resp.name.toLowerCase(),
          });
          commit("SET_CHAIN_MAGIC", { chainMagic: resp.magic });
          commit("SET_GET_INFO", { getInfo: resp });
        } else {
          console.log(`Response from getinfo call: ${resp}`);
          commit("SET_DAEMON_CONNECTION_STATUS", { status: "notOk" });
        }
      };
      testConn(rpc);
      const intervalId = setInterval(async () => {
        testConn(rpc);
      }, 3000);
      commit("SET_INTERVAL_ID", { intervalId });
    } catch (error) {
      console.log(error);
    }
  },

  async endDaemonConnection({ commit, state }, payload) {
    try {
      clearInterval(state.intervalId);
      commit("SET_INTERVAL_ID", { intervalId: null });
    } catch (error) {
      console.log(error);
    }
  },
  async getPublishProgress({ commit, state }, payload) {
    const rpc = state.chainObj.rpc();
    try {
      commit("SET_PUBLISH_PROGRESS", { publishProgress: 0 });
      const intervalId = setInterval(async () => {
        const resp = await rpc.DEX_stats();
        if (state.publishProgress === 100) {
          clearInterval(intervalId);
        }
        if (resp.progress) {
          commit("SET_PUBLISH_PROGRESS", {
            publishProgress: resp.progress,
          });
        }
      }, 500);
    } catch (error) {
      console.log(error);
    }
  },
  async initDbConn({ commit, state, dispatch }, payload) {
    try {
      if (!fs.existsSync(state.dexp2pDir)) {
        fs.mkdirSync(state.dexp2pDir);
      }
      const dbPath = path.join(state.dexp2pDir, "dexp2p.sqlite");
      commit("SET_DB_PATH", { dbPath });
      const sequelize = new Sequelize({
        dialect: "sqlite",
        dialectModule: sqlite3,
        logging: false,
        // SQLite only
        storage: dbPath,
      });
      const PublishedFilesTableInDB = sequelize.define("publishedFiles", {
        id: {
          type: Sequelize.INTEGER,
          unique: true,
          primaryKey: true,
        },
        filehash: Sequelize.STRING,
        filename: Sequelize.STRING,
        filesize: Sequelize.INTEGER,
        fragments: Sequelize.INTEGER,
        senderpub: Sequelize.STRING,
        unixTimestamp: Sequelize.INTEGER,
        chainName: Sequelize.STRING,
        chainMagic: Sequelize.INTEGER,
      });
      await PublishedFilesTableInDB.sync();
      commit("SET_TABLE_PUBLISHED_FILES", { PublishedFilesTableInDB });
      dispatch("getPublishedFilesDataFromDB");
    } catch (error) {
      console.log(error);
    }
  },
  async getPublishedFilesDataFromDB({ commit, state }, payload) {
    let allPublishedFilesDataFromDB = await state.PublishedFilesTableInDB.findAll(
      {
        attributes: [
          "id",
          "filehash",
          "filename",
          "filesize",
          "fragments",
          "senderpub",
          "unixTimestamp",
          "chainName",
          "chainMagic",
        ],
      }
    );
    allPublishedFilesDataFromDB = allPublishedFilesDataFromDB.map((file) => {
      if (file instanceof state.PublishedFilesTableInDB) {
        file = file.toJSON();
      }
      const newFileData = {};

      newFileData.id = file.id;
      newFileData.filename = file.filename;
      newFileData.filehash = file.filehash;
      newFileData.filesize = file.filesize;
      newFileData.fragments = file.fragments;
      newFileData.senderpub = `${file.senderpub.slice(
        0,
        5
      )}.....${file.senderpub.slice(-5)}`;
      newFileData.chainNameAndMagic = `${file.chainName} (${file.chainMagic})`;
      newFileData.publishTimeStamp = file.unixTimestamp;
      /*
         const momentNow = moment();
        newFileData.timeSince =
          Math.abs(
            moment.duration(publishTimeStamp.diff(momentNow)).asMinutes()
          ) < 45
            ? moment.duration(publishTimeStamp.diff(momentNow)).humanize(true)
            : moment.duration(publishTimeStamp.diff(momentNow)).humanize(true) +
              ` (${Math.round(
                Math.abs(
                  moment.duration(publishTimeStamp.diff(momentNow)).asMinutes()
                )
              )} minutes)`;
              */
      return newFileData;
    });
    commit("SET_PUBLISHED_FILE_DATA", { allPublishedFilesDataFromDB });
  },
  async storePublishDataInDB({ commit, state }, payload) {
    const latestPublishData = payload.latestPublishData;
    try {
      const storedLatestPublishData = await state.PublishedFilesTableInDB.create(
        {
          id: latestPublishData.id,
          filehash: latestPublishData.filehash,
          filename: latestPublishData.fname,
          filesize: latestPublishData.filesize,
          fragments: latestPublishData.fragments,
          senderpub: latestPublishData.senderpub,
          unixTimestamp: moment(),
          chainName: state.chainName,
          chainMagic: state.chainMagic,
        }
      );
      console.log(
        `publish data of ${storedLatestPublishData.filename} added to DB`
      );
    } catch (e) {
      if (e.name === "SequelizeUniqueConstraintError") {
        console.log(
          `the file's data already exists in the PublishedFiles table in the db.`
        );
      } else {
        console.log(
          `Something went wrong with adding file named "${latestPublishData.fname}" to the PublishedFiles table in the db.\n` +
            e
        );
      }
    }
  },
  addFileToPublishedFileDataFromDB({ commit, state }, payload) {
    let duplicate = false;
    state.allPublishedFilesDataFromDB.forEach((element) => {
      if (element.id === payload.file.id) {
        duplicate = true;
      }
    });
    if (!duplicate) {
      commit("ADD_FILE_TO_PUBLISHED_FILE_DATA", { file: payload.file });
    } else {
      commit("SET_GLOBAL_SNACKBAR_ERROR", {
        globalSnackbarError: "The file has already been published",
      });
      commit("SET_GLOBAL_SNACKBAR", { globalSnackbar: true });
    }
  },
  async setSysInfo({ commit, state }, payload) {
    const OS = require("os").platform();
    commit("SET_OS", { OS });
    const dexp2pDir =
      (process.env.APPDATA ? process.env.APPDATA + "\\dexp2p\\" : false) ||
      process.env.HOME + "/dexp2p/";
    commit("SET_DEXP2P_DIR", { dexp2pDir });
  },
};
