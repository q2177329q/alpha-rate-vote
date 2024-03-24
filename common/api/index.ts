import axios from "axios";
import config from "../../config/index";

const apiBaseUrl = config?.default?.apiBaseUrl;

export const getTokenAlpha = async (tokenAddress: string) =>
  axios.get(
    apiBaseUrl + "/api/token/getTokenAlphaByAddress?address=" + tokenAddress
  );

export const getTokenDetail = async (tokenAddress: string) =>
  axios.get(apiBaseUrl + "/api/token/detail?address=" + tokenAddress);

export const getFarcasterTokens = async (pushTime) => {
  return {
    data: {
      success: true,
      data: [
        {
          address: "0xb90b2a35c65dbc466b04240097ca756ad2005295",
          pushReason: "tokenRecommendation",
          pushTime: "1711086656",
        },
        {
          address: "0xf21661d0d1d76d3ecb8e1b9f1c923dbfffae4097",
          pushReason: "tokenRecommendation",
          pushTime: "1711086656",
        },
        {
          address: "0x12970e6868f88f6557b76120662c1b3e50a646bf",
          pushReason: "tokenRecommendation",
          pushTime: "1711086656",
        },
      ],
      errCode: null,
      errMsg: null,
    },
  };
};
