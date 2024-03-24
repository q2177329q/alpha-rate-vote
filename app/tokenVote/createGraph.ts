import path from "path";
import D3Node from "d3-node";
import { Resvg } from "@resvg/resvg-js";
import * as d3 from "d3";

export const createGraph = (dataList: any[], colorList: string[]) => {
  const colorUp = "#3FC753";
  const colorPrimary = "#f75";

  var margin = { top: 10, right: 60, bottom: 30, left: 60 },
    width = 720 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

  const d3n = new D3Node();
  var svg = d3n
    .createSVG(
      width + margin.left + margin.right,
      height + margin.top + margin.bottom
    )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Add X axis --> it is a date format
  var x = d3
    .scaleTime()
    .domain(
      d3.extent(dataList[0], function (d: any) {
        // console.log("====33333", d.date);
        return new Date(d.timestamp);
      }) as Iterable<Date>
    )
    .range([0, width]);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .ticks(d3.timeDay.every(1))
        // @ts-ignore
        .tickFormat(d3.timeFormat("%m/%d"))
    );

  // // Add Y axis
  // var y = d3
  //   .scaleLinear()
  //   .domain([
  //     0,
  //     d3.max(dataList[], function (d: any) {
  //       return +d.value;
  //     }) as number,
  //   ])
  //   .range([height, 0]);
  // const yg = svg.append("g").call(d3.axisLeft(y).tickSize(6)).selectAll("text");
  // yg.style("fill", colorUp);

  // alpha y axis
  var y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
  svg
    .append("g")
    // .attr("transform", "translate(" + width + ", 0)")
    .call(d3.axisLeft(y).tickSize(6).tickFormat(d3.format(".0%")))
    .selectAll("text");
  // .attr("fill", colorPrimary);
  // 线条
  console.log(
    "===dataList",
    dataList.length,
    dataList[0].length,
    dataList[1].length,
    dataList[2].length
    // dataList[0]
  );
  (dataList || []).forEach((data: any, index: number) => {
    const line = d3.line(
      (d: any) => {
        return x(new Date(d.timestamp));
      },
      (d: any) => {
        return y(d.alphaProb || d.alphaProb2);
      }
    );
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorList[index])
      .attr("strokeWidth", 1.5)
      .attr("d", line(data));
  });
  // const line2 = d3.line(
  //   (d: any) => {
  //     return x(new Date(d.timestamp));
  //   },
  //   (d: any) => {
  //     return y2(d.alphaProb || d.alphaProb2);
  //   }
  // );
  // console.log("===test", line(data));

  // svg
  //   .append("path")
  //   .datum(tokenAlphaData)
  //   .attr("fill", "none")
  //   .attr("stroke", colorPrimary)
  //   .attr("strokeWidth", 1.5)
  //   .attr("d", line2(tokenAlphaData));

  // console.log("==path", path.join(process.cwd(), "public/microsoft.ttf"));
  const opts = {
    background: "transparent",
    fitTo: {
      mode: "width",
      value: 2160,
    },
    font: {
      fontFiles: [path.join(process.cwd(), "public/microsoft.ttf")], // Load custom fonts.
      loadSystemFonts: false, // It will be faster to disable loading system fonts.
      defaultFontFamily: "Microsoft Yahei", // You can omit this.
    },
    logLevel: "debug",
  };
  // @ts-ignore
  const resvg = new Resvg(d3n.svgString(), opts);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const imgSrc = `data:image/png;base64,${Buffer.from(pngBuffer).toString(
    "base64"
  )}`;
  console.log("===imgSrc", imgSrc.substring(0, 100));
  return imgSrc;
};
