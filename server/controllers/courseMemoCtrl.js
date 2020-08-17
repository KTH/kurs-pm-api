"use strict";

const log = require("kth-node-log");
const dbOneDocument = require("../lib/dbDataById");
const dbCollectedData = require("../lib/dbCollectedData");
const co = require("co");

async function _getMemoDataById(req, res) {
  const id = req.params.id;
  log.info("Received request for memo with id: ", id);
  try {
    const dbResponse = await dbOneDocument.fetchCourseMemoDataById(id);

    res.json(dbResponse);
    log.info("Responded to request for memo with id: ", id);
  } catch (err) {
    log.error("Failed request for memo, error:", { err });
    return err;
  }
}

async function _postMemoData(req, res) {
  try {
    const listLength = req.body.length;
    const memoList = req.body;
    const dbResponse = [];
    let oldObject = {
      previousFileName: "",
      publishDate: "",
    };

    for (let memo = 0; memo < listLength; memo++) {
      log.info("Posting new roundCourseMemoData", { memoList });
      const exists = await dbOneDocument.fetchCourseMemoDataById(
        memoList[memo]._id
      );
      memoList[memo].lastChangeDate = new Date();
      if (!memoList[memo].hasOwnProperty("previousFileList")) {
        memoList[memo].previousFileList = [];
      }
      if (exists) {
        oldObject = {
          previousFileName: exists.courseMemoFileName,
          publishDate: exists.lastChangeDate,
        };
        exists.previousFileList.push(oldObject);
        memoList[memo].previousFileList = exists.previousFileList;
        log.info(
          "roundCourseMemoData already exists, update" + memoList[memo]._id
        );
        dbResponse.push(
          await dbOneDocument.updateCourseMemoDataById(memoList[memo])
        );
      } else {
        log.info("saving new memo data" + memoList[memo]._id);
        dbResponse.push(
          await dbOneDocument.storeNewCourseMemoData(memoList[memo])
        );
      }
    }
    log.info("dbResponse", dbResponse);
    res.status(201).json(dbResponse);
  } catch (error) {
    log.error("Error in while trying to _posttDataById (postdocanization)", {
      error,
    });
    return error;
  }
}

async function _putMemoDataById(req, res) {
  try {
    const id = req.body._id;
    let dbResponse;
    log.info("Posting new roundCourseMemoData", { id });
    const exists = await dbOneDocument.fetchCourseMemoDataById(id);
    req.body.changedDate = new Date();
    if (exists) {
      log.info("Updating Course Memo Data :", { id });
      dbResponse = await dbOneDocument.storeNewCourseMemoData(req.body);
    } else {
      log.info("Creating new Course Memo Data :", { id });
      dbResponse = await dbOneDocument.storeNewCourseMemoData(req.body);
    }

    res.status(201).json(dbResponse);
  } catch (error) {
    log.error("Error in while trying to _posttDataById (postdocanization)", {
      error,
    });
    return error;
  }
}

async function _deleteMemoDataById(req, res) {
  try {
    const id = req.params.id;
    log.info("Hard delete roundCourseMemoData by id:", { id });

    const dbResponse = await dbOneDocument.removeCourseMemoDataById(id);

    log.info("Successfully removed roundCourseMemoData by id: ", { id });
    res.json(dbResponse);
  } catch (error) {
    log.error("Error in _deleteDataById", { error });
    return error;
  }
}

async function _getCourseMemoListByCourseCode(req, res) {
  const courseCode = req.params.courseCode.toUpperCase();
  let semester = req.params.semester;
  let dbResponse;
  const returnList = [];
  const tempObj = {};

  semester = isNaN(semester) ? "19001" : semester;

  log.info("Received request for all memos with: ", { courseCode: courseCode });

  try {
    dbResponse = await dbCollectedData.fetchAllByCourseCode(courseCode);

    log.info(
      "Successfully got all memos for",
      { courseCode: courseCode },
      "dbResponse length",
      dbResponse.length
    );
    if (!dbResponse) {
      log.info("dbResponse IS EMPTY for course", courseCode);
      return res.json();
    }
    for (let index = 0; index < dbResponse.length; index++) {
      if (dbResponse[index].semester >= semester) {
        tempObj[dbResponse[index]._id] = {
          courseCode: dbResponse[index].courseCode,
          pdfMemoUploadDate: dbResponse[index].pdfMemoUploadDate,
          koppsRoundId: dbResponse[index].koppsRoundId,
          courseMemoFileName: dbResponse[index].courseMemoFileName,
          semseter: dbResponse[index].semester,
        };
      }
      returnList.push(tempObj);
    }
    res.json(tempObj);
    log.info("Responded to request for all memos with: ", {
      courseCode: courseCode,
    });
  } catch (error) {
    log.error("Error in _getCourseMemoListByCourseCode", { error });
    return error;
  }
}

async function _getUsedRounds(req, res) {
  const courseCode = req.params.courseCode;
  const semester = req.params.semester;
  log.info("Received request for used rounds for: ", {
    courseCode: courseCode,
  });
  try {
    const dbResponse = await dbCollectedData.fetchAllByCourseCodeAndSemester(
      courseCode.toUpperCase(),
      semester
    );
    const returnObject = {
      usedRoundsIdList: [],
    };
    for (let index = 0; index < dbResponse.length; index++) {
      returnObject[dbResponse[index]._id] = dbResponse[index];
      returnObject.usedRoundsIdList.push(dbResponse[index].koppsRoundId);
    }
    log.info("Successfully got used rounds for", {
      courseCode: courseCode,
      semester: semester,
      result: returnObject,
    });
    res.json(returnObject);
    log.info("Responded to request for used rounds for: ", {
      courseCode: courseCode,
    });
  } catch (error) {
    return error;
  }
}

module.exports = {
  getMemoDataById: co.wrap(_getMemoDataById),
  postMemoData: co.wrap(_postMemoData),
  putMemoDataById: co.wrap(_putMemoDataById),
  deleteMemoDataById: co.wrap(_deleteMemoDataById),
  getCourseMemoList: co.wrap(_getCourseMemoListByCourseCode),
  getUsedRounds: co.wrap(_getUsedRounds),
};
