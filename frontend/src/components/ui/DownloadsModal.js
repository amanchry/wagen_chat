import {  useEffect, useState, useRef } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Cross2Icon, DownloadIcon } from "@radix-ui/react-icons";
import { Button, IconButton } from "@radix-ui/themes";
import InputSelect from "./InputSelect";
import { YearsArray } from "@/helpers/dataVariables";



const DataLayers = [
  {
    name: "Annual Actual evapotranspiration (AETI)",
    value: "AETI",
    type: "raster",
    source: "WaPOR L2 V3",
    availableYears: YearsArray,
  },
  {
    name: "Annual  Ref. evapotranspiration (RET)",
    value: "RET",
    type: "raster",
    source: "WaPOR L2 V3",
    availableYears: YearsArray,

  },
  {
    name: "Annual  Precipitation (PCP)",
    value: "PCP",
    type: "raster",
    source: "CHIRPS v3",
    availableYears: YearsArray,
  },
  {
    name: "Annual  PCP-AETI",
    value: "PCP_minus_AETI",
    type: "raster",
    source: "",
    availableYears: YearsArray,
  },
  {
    name: "Annual Aridity Index",
    value: "Aridity_Index",
    type: "raster",
    source: "",
    availableYears: YearsArray,
  },
  {
    name: "Annual Biomass Production (TBP)",
    value: "TBP",
    type: "raster",
    source: "WaPOR L2 V3",
    availableYears: YearsArray,
  },
  {
    name: "Annual Blue evapotranspiration (ETb)",
    value: "ETb",
    type: "raster",
    source: "WaPOR L2 V3",
    availableYears: YearsArray,
  },
  {
    name: "Annual Green evapotranspiration (ETg)",
    value: "ETg",
    type: "raster",
    source: "WaPOR L2 V3",
    availableYears: YearsArray,
  },
  {
    name: "Annual Gross Biomass Water Productivity (GBWP)",
    value: "GBWP",
    type: "raster",
    source: "WaPOR L2 V3",
    availableYears: YearsArray,
  },



];




const DownloadsModal = ({ btnVarient = "soft", btnColor = "gray", btnRadius = "small" }) => {
  const [selectedData, setSelectedData] = useState("")
const [selectedTime, setSelectedTime] = useState("");
const [selectedFileFormat, setSelectedFileFormat] = useState("GeoTiff");

  const availableYears =
    DataLayers.find((layer) => layer.value === selectedData)?.availableYears ||
    [];
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <IconButton variant={btnVarient} color={btnColor} size="1" radius={btnRadius}>
          <DownloadIcon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2  w-[90vw] max-w-[526px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-lightGray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="m-0 text-2xl font-light text-dark">
            Download file
          </Dialog.Title>
          <ScrollArea.Root type="always" scrollbars="vertical" className="flex flex-col max-h-[70vh] min-h-[200px]">
            <ScrollArea.Viewport className="flex-1 w-full rounded">
              <Dialog.Description className="py-3 text-sm leading-normal text-gray2 mb-8 border-b border-[var(--gray-4)]">
                Select data and time period to download the dataset.
              </Dialog.Description>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray2" htmlFor="dataset">
                    Select Dataset<span className="text-red-600">*</span>
                  </label>
                  <InputSelect
                    options={DataLayers.map(layer => ({
                      label: `${layer.name}`,
                      value: layer.value,
                    }))}
                    onChange={value => setSelectedData(value)}
                    size="1"
                    className="w-full border-[var(--gray-5)] border text-xs py-2"
                    placeholder="Choose dataset"
                  />
                </div>
                {/* <div className=" flex flex-col gap-2">
                <label className="text-xs text-gray2" htmlFor="username">
                  Data frequency
                </label>
                <input
                  className="inputText focus:outline-none"
                  id="username"
                  defaultValue="Monthly"
                />
              </div> */}

                {/* <div className=" flex flex-col gap-2">
                <label className="text-xs text-gray2" htmlFor="username">
                  Area of Interest
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className=" flex flex-col gap-2">
                    <label
                      className="text-xs font-medium text-gray2"
                      htmlFor="username"
                    >
                      Selected (Location) Type
                    </label>
                    <input
                      className="inputText focus:outline-none"
                      id="username"
                      defaultValue="County"
                    />
                  </div>
                  <div className=" flex flex-col gap-2">
                    <label
                      className="text-xs font-medium text-gray2"
                      htmlFor="username"
                    >
                      Selected Location
                    </label>
                    <input
                      className="inputText focus:outline-none"
                      id="username"
                      disabled
                      defaultValue="Marsabit"
                    />
                  </div>
                </div>
              </div> */}
                {/* <div className=" flex flex-col gap-2">
                  <label className="text-xs text-gray2" htmlFor="username">
                    Time period of Dataset
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className=" flex flex-col gap-2">
                      <label
                        className="text-xs font-medium text-gray2"
                        htmlFor="username"
                      >
                        Start year<span className="text-red-600">*</span>
                      </label>
                      <InputSelect
                        options={YearsArray}
                        size="1"
                        //   value={vectorYears[0].value}
                        className="w-full border-[var(--gray-5)] border text-xs py-2"
                        placeholder="Select start year"
                      />
                    </div>
                    <div className=" flex flex-col gap-2">
                      <label
                        className="text-xs font-medium text-gray2"
                        htmlFor="username"
                      >
                        End year<span className="text-red-600">*</span>
                      </label>
                      <InputSelect
                        options={YearsArray}
                        size="1"
                        //   value={vectorYears[0].value}
                        className="w-full border-[var(--gray-5)] border text-xs py-2"
                        placeholder="Select end year"
                      />
                    </div>
                  </div>
                </div> */}

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray2" htmlFor="year">
                    Select Year<span className="text-red-600">*</span>
                  </label>
                  <InputSelect
                    options={availableYears}
                    size="1"
                    className="w-full border-[var(--gray-5)] border text-xs py-2"
                    placeholder="Select year"
                    onChange={value=> setSelectedTime(value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray2" htmlFor="fileFormat">
                    File Format<span className="text-red-600">*</span>
                  </label>
                  <InputSelect
                    options={["GeoTiff"]}
                    size="1"
                    value={selectedFileFormat}
                    className="w-full border-[var(--gray-5)] border text-xs py-2"
                    placeholder="Select file format"
                    onChange={value => setSelectedFileFormat(value)}
                  />
                </div>



                <div className="pt-10 w-full" >
                  <Button 
                   disabled
                  //  disabled={!selectedData || !selectedTime || !selectedFileFormat}
                    className="!w-full !p-2 !text-sm !h-auto !table" size="2" variant="soft" color="blue">
                    Download
                  </Button>
                </div>
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
          <Dialog.Close asChild>
            <button
              className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
};

export default DownloadsModal;
