"use client";

import AppHeader from "@/components/common/AppHeader";
import LeftNav from "@/components/common/LeftNav";
import { Box, Flex, Text, Separator, Button } from "@radix-ui/themes";
import React from "react";
import { FileText, Play } from "lucide-react";

function WaterAccountingReport() {
  return (
    <>
      {/* 🔹 App Header */}
      <AppHeader />

      {/* 🔹 Page Layout */}
      <Flex
        height="100vh"
        pt="49px"
        align="stretch"
        justify="between"
        direction={{ sm: "row", initial: "column-reverse" }}
      >
        {/* ========== LEFT NAV ========== */}
        <Box>
          <LeftNav />
        </Box>

        {/* ========== MAIN CONTENT ========== */}
        <Box
          className="flex-1 overflow-y-auto p-8 bg-gray-50"
        >
          {/* Page Title */}
          <Box mb="5">
            <Text as="h1" weight="medium" size="8" className="text-gray-900">
              💧 Water Accounting Report Generator
            </Text>
            <Text as="p" size="3" className="text-gray-600 mt-2 leading-relaxed max-w-3xl">
              Generate satellite-based <strong>Water Accounting Reports</strong> for any
              selected area. This tool integrates precipitation, evapotranspiration,
              and other key components of the water balance to deliver insights into
              water availability, use, and productivity.
            </Text>
          </Box>

          <Separator my="5" size="4" />

          {/* Section: Instructions */}
          <Box mb="6">
            <Text as="h2" size="5" weight="medium" className="text-gray-800 mb-2">
              How It Works
            </Text>
            <Text as="p" size="3" className="text-gray-600 leading-relaxed max-w-2xl">
              1. Select your area of interest (AOI) on the map or upload a GeoJSON. <br />
              2. Choose datasets for <strong>Precipitation</strong> and <strong>Evapotranspiration</strong>. <br />
              3. Define your reporting period (start and end year). <br />
              4. <strong>Generate Report</strong> to visualize results and download your report in HTML or PDF format.
            </Text>
          </Box>

          
        </Box>
      </Flex>
    </>
  );
}

export default WaterAccountingReport;
