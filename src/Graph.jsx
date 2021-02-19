import { Bar, LinePath } from "@vx/shape";
import { Group } from "@vx/group";
import { AxisBottom } from "@vx/axis";
import {curveBasisOpen} from "@vx/curve";
import { MarkerCircle } from "@vx/marker";
import { withTooltip, Tooltip, defaultStyles } from "@vx/tooltip";

import { scaleLinear } from "@vx/scale";

const getRangeOf = (arrayOfObjects, key) => {
  const values = arrayOfObjects
    .filter(object => object[key])
    .map(object => Number.parseInt(object[key]));
  return [Math.min(...values), Math.max(...values)];
};

const getTempForYear = (data, year) => {
  const avgTemp = data.filter((datum =>
    Number.parseInt(datum.year) === Number.parseInt(year)))[0]?.data;
  return avgTemp ? avgTemp.toFixed(2) : undefined;
};

const formatGDP = (number) => {
  const billions = number / 100000000000;
  return "GDP $" + billions.toFixed(2) + "bln.";
};

const tooltipStyles = {
  ...defaultStyles,
  borderRadius: 0,
  boxShadow: "none"
};

const Graph = ({
  climateData,
  GDP,
  height,
  hideTooltip,
  showTooltip,
  tooltipData,
  tooltipLeft,
  tooltipOpen,
  tooltipTop,
  width,
  yearRange,
}) => {
  let tooltipTimeout;
  const bottomAxisHeight = 30;
  const bottomAxisMargin = 10;
  const lineOffset = 100;
  const lineColor = "#00aaff";
  const barColor = "#bbe5fa";

  const xGDPScale = scaleLinear({
    domain: yearRange,
    range: [0, width]
  });

  const yGDPScale = scaleLinear({
    domain: getRangeOf(GDP, "value"),
    range: [height, 40]
  });

  const xAvgTempScale = scaleLinear({
    domain: yearRange,
    range: [0, width]
  });

  const yAvgTempScale = scaleLinear({
    domain: getRangeOf(climateData, "data"),
    range: [height, 0]
  });

  return (
    <>
      <svg width={width} height={height}>
        <Group>
          {GDP.filter(object => object.value)
            .map(({date, value}) => {
              const barHeight = height - yGDPScale(value);
              const barWidth = (width / ( xGDPScale.domain()[1] - xGDPScale.domain()[0])) - 2;
              return value && (
                <Bar
                  key={`bar-${value}`}
                  x={xGDPScale(date)}
                  y={height - barHeight - (bottomAxisHeight + bottomAxisMargin)}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  onMouseMove={() => {
                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                    showTooltip({
                      tooltipData: {
                        avgTemp: getTempForYear(climateData, date),
                        year: date,
                        GDP: value
                      },
                      tooltipTop: height - barHeight - (bottomAxisHeight + bottomAxisMargin),
                      tooltipLeft: xGDPScale(date),
                    });
                  }}
                  onMouseLeave={() => {
                    tooltipTimeout = window.setTimeout(() => {
                      hideTooltip();
                    }, 300);
                  }}
                />
              );
            })
          }

          <MarkerCircle id="marker-circle" fill={lineColor} size={1.5} refX={2} />
          <LinePath
            curve={curveBasisOpen}
            data={climateData}
            left={0}
            x={({year}) => xAvgTempScale(year)}
            y={({data}) => yAvgTempScale(data) + lineOffset }
            stroke={lineColor}
            strokeWidth={2}
            markerEnd="url(#marker-circle)"
          />

          <AxisBottom
            top={height - bottomAxisHeight}
            left={0}
            scale={xGDPScale}
            stroke={"#000"}
            strokeWidth={2}
            tickStroke={"#000"}
            tickFormat={value => value}
            tickLabelProps={() => ({
              fill: "#000",
              fontSize: 10,
              fontFamily: "Inter",
              textAnchor: "end",
              dy: "0.33em",
            })}
          />
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div><strong>{tooltipData.year}</strong></div>
          <div>{formatGDP(tooltipData.GDP)}</div>
          {tooltipData.avgTemp && <div>{tooltipData.avgTemp + "C"}</div>}
        </Tooltip>
      )}
    </>
  );
};

export default withTooltip(Graph);