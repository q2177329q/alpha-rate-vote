import fs from "fs";
import { join, resolve } from "path";

import {
  getFarcasterTokens as _getFarcasterTokens,
  getTokenDetail as _getTokenDetail,
  getTokenAlpha as _getTokenAlpha,
  checkFarVote as _checkFarVote,
} from "../../../common/api/index";

const cacheFarcasterMap = {};
const cacheTokenMap = {};
const cacheTokenAlphaMap = {};
const cacheVoteMap = {};
const cacheGraphMap = {};

export const getFarcasterTokens = async (pushTime) => {
  if (cacheFarcasterMap[pushTime]) {
    console.log(
      "getFarcasterTokens from cache pushTime:",
      pushTime,
      cacheFarcasterMap[pushTime]
    );
    return cacheFarcasterMap[pushTime];
  }
  const resp = await _getFarcasterTokens(pushTime);
  if (resp?.data?.data?.length > 0) {
    cacheFarcasterMap[pushTime] = resp?.data?.data;
  }
  console.log(
    "getFarcasterTokens from network pushTime:",
    pushTime,
    cacheFarcasterMap[pushTime] || []
  );

  return cacheFarcasterMap[pushTime] || [];
};

export const getTokenDetail = async (tokenAddress) => {
  if (cacheTokenMap[tokenAddress]) {
    console.log(
      "getTokenDetail from cache, tokenAddress: ",
      tokenAddress
      // cacheTokenMap[tokenAddress]
    );
    return cacheTokenMap[tokenAddress];
  }
  const resp = await _getTokenDetail(tokenAddress);
  if (resp?.data?.data?.tokenName) {
    cacheTokenMap[tokenAddress] = resp?.data?.data;
  }
  console.log(
    "getTokenDetail from network, tokenAddress: ",
    tokenAddress
    // cacheTokenMap[tokenAddress] || {}
  );

  return cacheTokenMap[tokenAddress] || {};
};

export const getTokenAlpha = async (tokenAddress) => {
  if (cacheTokenAlphaMap[tokenAddress]) {
    console.log(
      "getTokenAlpha from cache, tokenAddress: ",
      tokenAddress
      // cacheTokenAlphaMap[tokenAddress]
    );
    return cacheTokenAlphaMap[tokenAddress];
  }
  const resp = await _getTokenAlpha(tokenAddress);
  if (resp?.data?.data?.week?.length) {
    cacheTokenAlphaMap[tokenAddress] = resp?.data?.data;
  }
  console.log(
    "getTokenAlpha from network, tokenAddress: ",
    tokenAddress
    // cacheTokenAlphaMap[tokenAddress] || {}
  );

  return cacheTokenAlphaMap[tokenAddress] || {};
};

export const checkFarVote = async (fid, pushTime) => {
  if (!fid || !pushTime) {
    return false;
  }
  if (cacheVoteMap[pushTime]) {
    if (cacheVoteMap[pushTime][fid]) {
      console.log(
        "checkFarVote from cache, fid:",
        fid,
        "pushTime:",
        pushTime,
        cacheVoteMap[pushTime][fid]
      );
      return cacheVoteMap[pushTime][fid];
    }
  } else {
    cacheVoteMap[pushTime] = {};
  }

  const resp = await _checkFarVote(fid, pushTime);
  if (resp?.data?.data) {
    cacheVoteMap[pushTime][fid] = resp?.data?.data;
    return cacheVoteMap[pushTime][fid];
  }
  return false;
};

export const getGraphData = async (pushTime) => {
  if (cacheGraphMap[pushTime]) {
    console.log(
      "getGraphData from cache, pushTime: ",
      pushTime
      // cacheGraphMap[tokenAddress]
    );
    return cacheGraphMap[pushTime];
  } else {
    const dictGraphData = await new Promise((resolve) => {
      fs.readFile(
        join(
          process.cwd(),
          "app",
          "tokenVote",
          "cache",
          "images",
          pushTime + ".png"
        ),
        {
          encoding: "base64",
        },
        function (err, data) {
          if (err) {
            console.log("read graph file error", pushTime, err);
            resolve(null);
          } else {
            console.log("read graph file success", pushTime, data.length);
            resolve("data:image/png;base64," + data);
          }
        }
      );
    });
    if (dictGraphData) {
      console.log(
        "getGraphData from file, pushTime: ",
        pushTime
        // cacheGraphMap[tokenAddress]
      );
      cacheGraphMap[pushTime] = dictGraphData;
      return dictGraphData;
    }
  }

  return null;
};

export const setGraphData = (pushTime, data) => {
  cacheGraphMap[pushTime] = data;

  const base64Data = data.replace(/^data:image\/png;base64,/, "");
  console.log("process.cwd()", process.cwd());
  fs.writeFile(
    join(
      process.cwd(),
      "app",
      "tokenVote",
      "cache",
      "images",
      pushTime + ".png"
    ),
    base64Data,
    "base64",
    function (err) {
      if (err) {
        console.log("write graph file error", pushTime, err);
      }
    }
  );
};
