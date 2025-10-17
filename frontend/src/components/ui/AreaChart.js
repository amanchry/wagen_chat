"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Box, Flex, IconButton } from "@radix-ui/themes";
import { EnterFullScreenIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import ExpandableCard from "./ExpandableCard";
import LandcoverDataTable from "../../app/water/evapotranspiration/AnnualTable";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const AreaChart = () => {
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartOptions = {
    chart: {
      id: "my-area-chart",
      type: "area",
      height: 350,
      stacked: false,
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      pan: {
        enabled: true,
        type: "x",
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: [2, 2], // Area charts have 0 width, line chart has 3px width
    },
    fill: {
      type: ["gradient", "solid"],
      gradient: {
        opacityFrom: 0.9,
        opacityTo: 0,
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetY: 30,
      labels: {
        colors: "#60646C",
      },
    },
    xaxis: {
      categories: [
        "2018-09-19T00:00:00.000Z",
        "2018-09-19T01:30:00.000Z",
        "2018-09-19T02:30:00.000Z",
        "2018-09-19T03:30:00.000Z",
        "2018-09-19T04:30:00.000Z",
        "2018-09-19T05:30:00.000Z",
        "2018-09-19T06:30:00.000Z",
        "2018-09-19T07:30:00.000Z",
        "2018-09-19T08:30:00.000Z",
        "2018-09-19T09:30:00.000Z",
        "2018-09-19T10:30:00.000Z",
        "2018-09-19T11:30:00.000Z",
      ],
      type: "datetime",
      labels: {
        style: {
          colors: "#60646C",
        },
      },
    },
    yaxis: {
      title: {
        style: {
          color: "#60646C",
        },
      },
    },
    colors: ["#0488AD", "#E5484D"],
    // title: {
    //   text: "Area Chart with Stacked Areas and Line",
    //   align: "left",
    //   style: {
    //     fontSize: "16px",
    //     fontWeight: "bold",
    //   },
    // },
  };

  const series = [
    {
      name: "Evapotranspiration (mm/month)",
      type: "area",
      data: [31, 40, 28, 51, 42, 109, 100, 91, 83, 78, 65, 45],
    },

    {
      name: "Ref. ET (mm/month)",
      type: "line",
      data: [15, 11, 32, 18, 9, 24, 11, 20, 25, 34, 28, 20],
    },
  ];

  const chartOptions1 = {
    chart: {
      id: "my-bar-chart",
      type: "bar",
      height: 350,
      stacked: false,
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      pan: {
        enabled: true,
        type: "x",
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        horizontal: true,
      },
    },
    // dataLabels: {
    //   enabled: false,
    // },
    // stroke: {
    //   curve: "smooth",
    //   width: [2, 2], // Area charts have 0 width, line chart has 3px width
    // },
    // fill: {
    //   type: ["gradient", "solid"],
    //   gradient: {
    //     opacityFrom: 0.9,
    //     opacityTo: 0,
    //   },
    // },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetY: 30,
      labels: {
        colors: "#60646C",
      },
    },

    xaxis: {
      categories: [
        "2024",
        "2023",
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
        "2017",
        "2016",
        "2015",
      ],
      labels: {
        style: {
          colors: "#60646C",
        },
      },
      // type: "datetime",
    },
    yaxis: {
      title: {
        style: {
          color: "#60646C",
        },
      },
    },
    colors: ["#3A5BC7"],
    // title: {
    //   text: "Area Chart with Stacked Areas and Line",
    //   align: "left",
    //   style: {
    //     fontSize: "16px",
    //     fontWeight: "bold",
    //   },
    // },
  };
  const series1 = [{
    data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
  }]

  return (
    <Flex direction="column" gap="5">
      <ExpandableCard
        title="Area Chart with Stacked Areas and Line"
        subTitle="Biomass per cubic meter of water used (kg/m³)"
        info="Expresses the quantity of Biomass Production (BP) in relation to the volume of water consumed (actual evapotranspiration), measured in kilograms of biomass produced per cubic meter of water (kg/m³). Here BWP is calculated by dividing annual BP by annual actual evapotranspiration. It provides insight into how efficiently water resources are used to produce biomass, such as crops or vegetation. BWP is also significant for managing and conserving water resources. It provides a clear picture of how water allocation impacts biomass production across different land uses and ecosystems. By understanding BWP, water managers can better plan and implement water distribution strategies that maximize biomass production without overexploiting water resources."
      >
        {/* Chart */}
        <Box className="bg-white rounded-lg " p="2" pb="4">
          {isClient && (
            <Chart
              options={chartOptions}
              series={series}
              type="area"
              height={350}
            />
          )}
          {!isClient && (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Loading chart...
            </div>
          )}
        </Box>
      </ExpandableCard>

      <ExpandableCard title="Landcover classes area (ha) by county">
        <Box p="3">
          <LandcoverDataTable />
        </Box>
      </ExpandableCard>

      <ExpandableCard
        title="Average annual evapotranspiration per county"
        subTitle="Biomass per cubic meter of water used (kg/m³)"
        info="Expresses the quantity of Biomass Production (BP) in relation to the volume of water consumed (actual evapotranspiration), measured in kilograms of biomass produced per cubic meter of water (kg/m³). Here BWP is calculated by dividing annual BP by annual actual evapotranspiration. It provides insight into how efficiently water resources are used to produce biomass, such as crops or vegetation. BWP is also significant for managing and conserving water resources. It provides a clear picture of how water allocation impacts biomass production across different land uses and ecosystems. By understanding BWP, water managers can better plan and implement water distribution strategies that maximize biomass production without overexploiting water resources."
      >
        {/* Chart */}
        <Box className="bg-white rounded-lg " p="2" pb="4">
          {isClient && (
            <Chart
              options={chartOptions1}
              series={series1}
              type="bar"
              height={350}
            />
          )}
          {!isClient && (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Loading chart...
            </div>
          )}
        </Box>
      </ExpandableCard>
    </Flex>
  );
};

export default AreaChart;
