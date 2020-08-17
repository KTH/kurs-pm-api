/**
 *
 *            Server specific settings
 *
 * *************************************************
 * * WARNING! Secrets should be read from env-vars *
 * *************************************************
 *
 */
const {
  getEnv,
  unpackMongodbConfig,
  unpackNodeApiConfig,
  unpackApiKeysConfig,
  devDefaults,
} = require("kth-node-configuration");
const { safeGet } = require("safe-utils");

// DEFAULT SETTINGS used for dev, if you want to override these for you local environment, use env-vars in .env
const devPrefixPath = devDefaults("/api/kurs-pm");
const devSsl = devDefaults(false);
const devPort = devDefaults(3001);
const devMongodb = devDefaults("mongodb://localhost:27017/kurs-pm");

// EXAMPLE: const devApiKeys = devDefaults('?name=devClient&apiKey=SET_YOUR_API_KEY&scope=write&scope=read')
const devApiKeys = devDefaults(
  "?name=devClient&apiKey=9876&scope=write&scope=read"
);

// END DEFAULT SETTINGS

module.exports = {
  // The proxy prefix path if the application is proxied. E.g /places
  proxyPrefixPath: {
    uri: getEnv("SERVICE_PUBLISH", devPrefixPath),
  },
  useSsl: safeGet(
    () => getEnv("SERVER_SSL", devSsl + "").toLowerCase() === "true"
  ),
  port: getEnv("SERVER_PORT", devPort),

  ssl: {
    // In development we don't have SSL feature enabled
    pfx: getEnv("SERVER_CERT_FILE", ""),
    passphrase: getEnv("SERVER_CERT_PASSPHRASE", ""),
  },

  // API keys
  kurs_pm_api_keys: unpackApiKeysConfig("KURS_PM_API_KEYS", devApiKeys),

  // NODEAPI FOR MIGRATION
  apiKey: {
    kursPmDataApi: getEnv("KURS_PM_DATA_API_KEY", devDefaults("1234")),
  },
  nodeApi: {
    kursPmDataApi: unpackNodeApiConfig(
      "KURS_PM_DATA_API_URI",
      devDefaults("http://localhost:3001/api/kurs-pm-data?defaultTimeout=10000")
    ),
  },
  //END OF MIGRATION SETTINGS

  // Services
  db: unpackMongodbConfig("KURS_PM_MONGODB_URI", devMongodb),

  // Logging
  logging: {
    log: {
      level: getEnv("LOGGING_LEVEL", "debug"),
    },
    accessLog: {
      useAccessLog:
        safeGet(() => getEnv("LOGGING_ACCESS_LOG"), "true") === "true",
    },
  },

  // Custom app settings
};
