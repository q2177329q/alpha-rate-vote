export default function ChartLegendIcon({
  width = "32px",
  height = "32px",
  color = "#68D391",
  style = {},
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 32 32" style={style}>
      <title></title>
      <desc></desc>
      <path
        strokeWidth="4"
        fill="none"
        stroke={color}
        d="M0,16h10.666666666666666
A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16
H32M21.333333333333332,16
A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"
      ></path>
    </svg>
  );
}
