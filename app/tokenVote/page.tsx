/* eslint-disable @next/next/no-img-element */
import React, { PureComponent } from "react";

import ChartLegendIcon from "../../components/ChartLegendIcon";
import config from "../../config/index";

console.log("===config", config);
import { ImageResponse } from "@vercel/og";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
  validateActionSignature,
} from "frames.js/next/server";
import { farVote } from "../../common/api";
import {
  getFarcasterTokens,
  getTokenDetail,
  getTokenAlpha,
  checkFarVote,
  getGraphData,
  setGraphData,
} from "./cache/index";
import { getDataFromAllSettled } from "../../common/utils";
import { createGraph } from "./createGraph";

type State = {
  step: number;
  hasGetFarcasterTokensDataError: boolean;
  hasBindPond: boolean;
  hasVote: boolean;
  pushTime: number | string;
};
type FarcasterTokenItem = {
  tokenName: string;
  address: string;
  pushReason: string;
  pushTime: number | string;
  tokenSymbol: string;
};

const reducer: FrameReducer<State> = (state, action) => {
  console.log("===buttonIndex", action.postBody, state);
  return {
    ...state,
  };
};
const colorList = ["#3FC753", "#f75", "#990000"];

export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const colorUp = "#3FC753";
  const colorPrimary = "#f75";
  const previousFrame = getPreviousFrame<State>(searchParams);
  // await validateActionSignature(previousFrame.postBody);
  const frameMessage = await getFrameMessage(previousFrame.postBody);

  // const validMessage = await validateActionSignature(previousFrame.postBody);

  let tokenDetailData1: any = {};
  let tokenDetailData2: any = {};
  let tokenDetailData3: any = {};
  let tokenAlphaData1: any = {};
  let tokenAlphaData2: any = {};
  let tokenAlphaData3: any = {};
  let hasGetFarcasterTokensDataError = false;
  let hasBindPond = true;
  let hasVote = false;

  // console.log("===validMessage", validMessage);
  console.log("===frameMessage", frameMessage);
  console.log("===previousFrame112", previousFrame);
  console.log("===params", searchParams, params);
  const initialState: State = {
    step: 0,
    hasGetFarcasterTokensDataError,
    hasBindPond,
    hasVote,
    pushTime: searchParams?.pushTime as string,
  };

  const buttonIndex = previousFrame?.postBody?.untrustedData?.buttonIndex || -1;
  const prevState = previousFrame?.prevState;
  const firstRender = !previousFrame.postBody;
  const nextState = {
    ...initialState,
    ...prevState,
    hasGetFarcasterTokensDataError,
  };
  let farcasterTokensData: FarcasterTokenItem[] = [];

  const farcasterTokens = await getFarcasterTokens(nextState?.pushTime);
  if (farcasterTokens?.length > 0) {
    farcasterTokensData = farcasterTokens;
  }
  let imgSrc = "";

  // 请求数据
  if (farcasterTokensData.length === 3) {
    const tokenAddress1 = farcasterTokensData[0]?.address;
    const tokenAddress2 = farcasterTokensData[1]?.address;
    const tokenAddress3 = farcasterTokensData[2]?.address;
    if (tokenAddress1 && tokenAddress2 && tokenAddress3) {
      const [
        tokenDetailResp1,
        tokenDetailResp2,
        tokenDetailResp3,
        tokenAlphaResp1,
        tokenAlphaResp2,
        tokenAlphaResp3,
      ] = await Promise.allSettled([
        getTokenDetail(tokenAddress1),
        getTokenDetail(tokenAddress2),
        getTokenDetail(tokenAddress3),
        getTokenAlpha(tokenAddress1),
        getTokenAlpha(tokenAddress2),
        getTokenAlpha(tokenAddress3),
      ]).catch((e) => {
        console.log("error in get token detail", e);
        hasGetFarcasterTokensDataError = true;
        return [];
      });
      const mapFunction = (data) => {
        return data.value;
      };
      tokenDetailData1 = getDataFromAllSettled(
        tokenDetailResp1,
        {},
        mapFunction
      );
      tokenDetailData2 = getDataFromAllSettled(
        tokenDetailResp2,
        {},
        mapFunction
      );
      tokenDetailData3 = getDataFromAllSettled(
        tokenDetailResp3,
        {},
        mapFunction
      );
      tokenAlphaData1 = getDataFromAllSettled(tokenAlphaResp1, {}, mapFunction);
      tokenAlphaData2 = getDataFromAllSettled(tokenAlphaResp2, {}, mapFunction);
      tokenAlphaData3 = getDataFromAllSettled(tokenAlphaResp3, {}, mapFunction);
      console.log("===tokenDetailData1", tokenDetailData1);
      console.log("===tokenDetailData2", tokenDetailData2?.tokenName);
      console.log("===tokenDetailData3", tokenDetailData3?.tokenName);
      console.log("===tokenAlphaData1", tokenAlphaData1?.week?.length);
      console.log("===tokenAlphaData2", tokenAlphaData2?.week?.length);
      console.log("===tokenAlphaData3", tokenAlphaData3?.week?.length);
    }
  }
  if (
    tokenDetailData1?.tokenName &&
    tokenDetailData2?.tokenName &&
    tokenDetailData3?.tokenName &&
    tokenAlphaData1?.week?.length &&
    tokenAlphaData2?.week?.length &&
    tokenAlphaData3?.week?.length
  ) {
    farcasterTokensData[0].tokenName = tokenDetailData1.tokenName;
    farcasterTokensData[1].tokenName = tokenDetailData2.tokenName;
    farcasterTokensData[2].tokenName = tokenDetailData3.tokenName;
    farcasterTokensData[0].tokenSymbol = tokenDetailData1.tokenSymbol;
    farcasterTokensData[1].tokenSymbol = tokenDetailData2.tokenSymbol;
    farcasterTokensData[2].tokenSymbol = tokenDetailData3.tokenSymbol;
    const cacheImgSrc = await getGraphData(nextState?.pushTime);
    if (cacheImgSrc) {
      imgSrc = cacheImgSrc;
    } else {
      imgSrc = createGraph(
        [tokenAlphaData1?.week, tokenAlphaData2?.week, tokenAlphaData3?.week],
        colorList
      );
      setGraphData(nextState?.pushTime, imgSrc);
    }
  } else {
    console.log("error in parse token detail data");
    hasGetFarcasterTokensDataError = true;
  }
  // 进入frame
  if (!previousFrame.postBody || prevState?.hasGetFarcasterTokensDataError) {
    // const hasBindPondRes = await getHasBind();
    // if (hasBindPondRes.data.success) {
    //   nextState.hasBindPond = hasBindPondRes.data.data;
    // }
    const hasVoteRes = await checkFarVote(
      frameMessage?.castId?.fid,
      nextState?.pushTime
    );
    if (hasVoteRes) {
      nextState.hasVote = hasVoteRes;
      if (nextState.hasVote) {
        nextState.step = 1;
      }
    }
  } else {
    // vote token
    if (prevState?.step === 0 && buttonIndex > 0) {
      console.log(
        "====farcasterTokensData.length",
        farcasterTokensData.length,
        buttonIndex
      );
      if (farcasterTokensData.length >= buttonIndex) {
        const tokenAddress = farcasterTokensData[buttonIndex - 1]?.address;
        const _checkFarVote = await checkFarVote(
          frameMessage?.castId?.fid,
          nextState?.pushTime as string
        );
        let farVoteResp: any = {};
        if (!_checkFarVote) {
          farVoteResp = await farVote({
            fid: frameMessage?.castId?.fid,
            address: tokenAddress,
            pushtime: nextState?.pushTime as string,
          }).catch((e) => e);
          console.log(
            "===vote token",
            buttonIndex,
            farcasterTokensData[buttonIndex - 1]?.tokenName
          );
          console.log(
            "===farVoteResp",
            frameMessage?.castId?.fid,
            tokenAddress,
            nextState?.pushTime,
            farVoteResp?.data
          );
        } else {
          console.log("has vote===");
        }
        if (
          _checkFarVote ||
          farVoteResp?.data?.data?.[tokenAddress] !== undefined
        ) {
          nextState.step = 1;
          nextState.hasVote = true;
        } else {
          console.log("error in vote token check or request");
          hasGetFarcasterTokensDataError = true;
          nextState.hasGetFarcasterTokensDataError = true;
        }
      } else {
        console.log("error in vote button click");
        hasGetFarcasterTokensDataError = true;
        nextState.hasGetFarcasterTokensDataError = true;
      }
    }
  }

  // hasGetFarcasterTokensDataError = Math.random() > 0.5;

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  const apiBaseUrl = config?.default?.apiBaseUrl;
  console.log("===state", state);

  console.log(
    "===hasGetFarcasterTokensDataError",
    hasGetFarcasterTokensDataError,
    nextState
  );
  return (
    <div>
      <FrameContainer
        pathname="/tokenVote"
        postUrl="/tokenVote/frames"
        state={{ ...nextState, hasGetFarcasterTokensDataError }}
        previousFrame={previousFrame}
      >
        {/* <FrameImage src="https://framesjs.org/og.png" /> */}
        <FrameImage aspectRatio="1:1">
          {hasGetFarcasterTokensDataError ? (
            <div>something went wrong</div>
          ) : null}
          {!hasGetFarcasterTokensDataError && nextState.step === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: "36px" }}>
                {[tokenDetailData1, tokenDetailData2, tokenDetailData3].map(
                  (item, index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                        key={item.tokenName}
                      >
                        <ChartLegendIcon
                          color={colorList[index]}
                          style={{ marginRight: "4px" }}
                        ></ChartLegendIcon>
                        <img
                          src={item?.tokenUrl}
                          alt={item?.tokenName}
                          style={{
                            width: "30px",
                            height: "30px",
                            marginRight: "4px",
                          }}
                        ></img>

                        <div>{item?.tokenName}</div>
                      </div>
                    );
                  }
                )}
              </div>
              <img
                src={imgSrc}
                style={{ width: "1146px", height: "875px" }}
                alt=""
              />
              <div>Potential alpha rate calculated by Pond</div>
            </div>
          ) : null}
          {!hasGetFarcasterTokensDataError &&
          nextState.step === 1 &&
          nextState.hasBindPond ? (
            <div style={{ padding: "200px" }}>
              Great!!! You will get points if you catch the highest one!!🚀🚀🚀
            </div>
          ) : null}
          {!hasGetFarcasterTokensDataError &&
          nextState.step === 1 &&
          !nextState.hasBindPond ? (
            <div style={{ padding: "200px" }}>
              Great!!! You will get points if you catch the highest one and
              register Pond!!🚀🚀🚀
            </div>
          ) : null}
        </FrameImage>

        {/* button */}
        {hasGetFarcasterTokensDataError ? (
          <FrameButton>refresh</FrameButton>
        ) : null}

        {/* step1 */}
        {!hasGetFarcasterTokensDataError && nextState.step === 0 ? (
          <FrameButton>
            {(tokenDetailData1.tokenName || "").length > 10
              ? tokenDetailData1.tokenSymbol
              : tokenDetailData1.tokenName}
          </FrameButton>
        ) : null}
        {!hasGetFarcasterTokensDataError && nextState.step === 0 ? (
          <FrameButton>
            {(tokenDetailData2.tokenName || "").length > 10
              ? tokenDetailData2.tokenSymbol
              : tokenDetailData2.tokenName}
          </FrameButton>
        ) : null}
        {!hasGetFarcasterTokensDataError && nextState.step === 0 ? (
          <FrameButton>
            {(tokenDetailData3.tokenName || "").length > 10
              ? tokenDetailData3.tokenSymbol
              : tokenDetailData3.tokenName}
          </FrameButton>
        ) : null}

        {/* step2 && bind Pond */}
        {!hasGetFarcasterTokensDataError &&
        nextState.hasBindPond &&
        nextState.step === 1 ? (
          <FrameButton
            action="link"
            target={
              "https://cryptopond.xyz/token_discovery/detail/" +
              farcasterTokensData[0]?.address
            }
          >
            {(tokenDetailData1.tokenName || "").length > 10
              ? tokenDetailData1.tokenSymbol
              : tokenDetailData1.tokenName}
          </FrameButton>
        ) : null}
        {!hasGetFarcasterTokensDataError &&
        nextState.hasBindPond &&
        nextState.step === 1 ? (
          <FrameButton
            action="link"
            target={
              "https://cryptopond.xyz/token_discovery/detail/" +
              farcasterTokensData[1]?.address
            }
          >
            {(tokenDetailData2.tokenName || "").length > 10
              ? tokenDetailData2.tokenSymbol
              : tokenDetailData2.tokenName}
          </FrameButton>
        ) : null}
        {!hasGetFarcasterTokensDataError &&
        nextState.hasBindPond &&
        nextState.step === 1 ? (
          <FrameButton
            action="link"
            target={
              "https://cryptopond.xyz/token_discovery/detail/" +
              farcasterTokensData[2]?.address
            }
          >
            {(tokenDetailData3.tokenName || "").length > 10
              ? tokenDetailData3.tokenSymbol
              : tokenDetailData3.tokenName}
          </FrameButton>
        ) : null}
        {!hasGetFarcasterTokensDataError &&
        !nextState.hasBindPond &&
        nextState.step === 1 ? (
          <FrameButton action="link" target={"https://cryptopond.xyz"}>
            register Pond
          </FrameButton>
        ) : null}
      </FrameContainer>
      <img src={imgSrc} style={{ width: "720px", height: "550px" }} alt="" />
    </div>
  );
}
