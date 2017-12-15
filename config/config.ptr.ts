/* tslint:disable:no-var-requires */
import * as Config from "webpack-chain";

import * as CommonConfig from "./config.common";
import { Credentials, EnvOptions } from "./types";
const ScreepsWebpackPlugin = require("../libs/screeps-webpack-plugin");

function webpackConfig(options: EnvOptions = {}): Config {
  // get the common configuration to start with
  const config = CommonConfig.init(options);

  // make "dev" specific changes here
  const credentials: Credentials = require("./credentials.json");
  credentials.branch = "dev";
  credentials.serverUrl = "https://screeps.com/ptr";

  config.plugin("screeps")
    .use(ScreepsWebpackPlugin, [credentials]);

  // modify the args of "define" plugin
  config.plugin("define").tap((args: any[]) => {
    args[0].PRODUCTION = JSON.stringify(false);
    args[0].__PROFILER_ENABLED__ = JSON.stringify(true);
    return args;
  });

  return config;
}

module.exports = webpackConfig;
