export const getDataFromAllSettled = (
  resp: PromiseSettledResult<any>,
  defaultData: any,
  mapFunction?: (data: any) => any
) => {
  if (resp.status === "fulfilled") {
    if (mapFunction) {
      return mapFunction(resp);
    }
    return resp.value.data.data;
  }
  return defaultData;
};
