import * as path from "path";
import * as fs from "fs";
import SmartChain from "node-komodo-rpc";
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
  chainObj: null,
  dexp2pDir: null,
  OS: null,
  intervalId: null,
  publishData: {},
  dbPath: null,
});

export const mutations = {
  SET_DAEMON_CONNECTION_STATUS(state, payload) {
    state.daemonConnected = payload.status === "ok";
  },
  SET_CHAIN_CHAIN_NAME(state, payload) {
    state.chainName = payload.chainName;
  },
  SET_CHAIN_OBJ(state, payload) {
    state.chainObj = payload.chain;
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
  SET_DB_PATH(state, payload) {
    state.dbPath = payload.dbPath;
  },
};

export const actions = {
  async initDaemonConnection({ commit, state }, payload) {
    try {
      const chain = new SmartChain({
        name: state.chainName,
      });
      const rpc = chain.rpc();
      commit("SET_CHAIN_OBJ", { chain });
      const testConn = async (rpc) => {
        const resp = await rpc.getinfo();
        if (resp.version) {
          if (resp.name.toLowerCase() === state.chainName) {
            commit("SET_DAEMON_CONNECTION_STATUS", { status: "ok" });
          } else {
            console.log(resp);
            commit("SET_DAEMON_CONNECTION_STATUS", { status: "notOk" });
          }
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
  async initDbConn({ commit, state }, payload) {
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
      const Transactions = sequelize.define("transactions", {
        txid: {
          type: Sequelize.STRING,
          unique: true,
          primaryKey: true,
        },
        txData: Sequelize.TEXT,
        chain: Sequelize.STRING,
        notaries: {
          type: Sequelize.TEXT,
          defaultValue: "",
        },
        height: Sequelize.INTEGER,
        unixTimestamp: Sequelize.INTEGER,
      });
    } catch (error) {
      console.log(error);
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
