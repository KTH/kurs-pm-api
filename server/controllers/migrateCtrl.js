"use strict";

const log = require("kth-node-log");
const { CourseMemo } = require("../models/courseMemoModel");

//api
const config = require("../configuration").server;
const redis = require("kth-node-redis");
const connections = require("kth-node-api-call").Connections;

const opts = {
  log,
  redis,
  timeout: 30000,
  checkAPIs: true, // performs api-key checks against the apis, if a "required" check fails, the app will exit. Required apis are specified in the config
};

const api = connections.setup(config.nodeApi, config.apiKey, opts);
// send to kurs-pm-data-api function

async function sendDocumentsTo(body) {
  try {
    const { client, paths } = api.kursPmDataApi;
    const uri = paths.migrateAllData.uri; //"uri":"/api/kurs-pm-data/v1/migrateAll"
    log.debug("Sending data", { uri }, " with parameter,", { body });
    const res = await client.postAsync({ uri, body, useCache: false });
    return res.body;
  } catch (error) {
    log.debug("Changing of data with parameter", { body }, "is not available", {
      error,
    });
    return error;
  }
}

// Fetch from db

async function _fetchAll() {
  log.debug("Fetching all courseMemos ");
  return await CourseMemo.find({}).populate("MemoDataListForCourseCode").lean();
}

async function migrate(req, res) {
  const allMemos = await _fetchAll();
  console.log("Type", typeof allMemos);
  console.log("Length", allMemos.length);
  console.log("first ", allMemos[0]);
  log.debug("ALL MEMOS ARE FETCHED");
  const chunkSize = 20;

  try {
    const iterations = Math.round(allMemos.length / chunkSize);
    let newApiResponse = {};
    for (var i = 0; i < iterations; i++) {
      newApiResponse = await sendDocumentsTo({
        // documents: [allMemos[0], allMemos[1]],
        documents: allMemos.splice(0, chunkSize),
      });
    }

    if (newApiResponse && newApiResponse.message) {
      log.debug("Error from KURS-PM-DATA-API: ", newApiResponse.message);
      res.send("Error from KURS-PM-DATA-API: ");
    }
    log.info("Memo contents was updated in kursinfo api");
    return res.json(newApiResponse);
    res.send("Finished ");
  } catch (err) {
    log.error("Error in migrate", { error: err });
    res.send("Error in migrate");
  }
}

module.exports = {
  migrate,
};
