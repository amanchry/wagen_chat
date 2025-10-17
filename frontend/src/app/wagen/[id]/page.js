"use client";

import LeftNav from "@/components/common/LeftNav";
import CollapsibleLeftDrawer from "@/components/common/CollapsibleLeftDrawer";
import { Box, Flex, IconButton, Separator, Radio, Text, Checkbox } from "@radix-ui/themes";
import { useGlobalStorage } from "@/provider/GlobalProvider";
import { useEffect, useState } from "react";
import ChatBox from "@/app/wagen/[id]/ChatBox";
import AppHeader from "@/components/common/AppHeader";
import GeoJsonLayer from "@/components/mapping/GeoJsonLayer";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

import { useGlobal } from "@/hooks/useGlobal";
import { CaretLeftIcon, LayersIcon } from "@radix-ui/react-icons";

import { useSelectedFeatureContext } from "@/provider/SelectedFeatureContext";
import GlobalBasins from '@/assets/data/shapefiles/Basins.json';
import GlobalCountries from '@/assets/data/shapefiles/FAO_world_countries.json';
import Map from "@/app/wagen/[id]/Map";
import OnMapControls from "@/components/mapping/OnMapControls";
import InputSelect from "@/components/ui/InputSelect";
import AccordionRoot from "@/components/ui/accordion/AccordionRoot";
import AccordionItem from "@/components/ui/accordion/AccordionItem";
import AccordionTrigger from "@/components/ui/accordion/AccordionTrigger";
import AccordionContent from "@/components/ui/accordion/AccordionContent";
import LayerListAccorduinsContainer from "@/components/mapping/LayerListAccorduinsContainer";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/provider/ToastContext";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import WMSTileLayer from "@/components/mapping/WMSTileLayer";




function HomePage() {
  const {
    selectedView,
    setSelectedView,
    selectedFeatureName,
    setSelectedFeatureName,
  } = useSelectedFeatureContext();


  const overlayDataLayers = [

    {
      id: 1,
      label: "World Major Rivers",
      value: "river",
      wmsUrl: "https://geoserver.waterinag.org/geoserver/Global/wms",
      layer: "Global:World_Rivers",
      attributions: ['Global Rivers']
    },
    {
      id: 2,
      label: "ESA Worldcover 10m: 2021",
      value: "esa_lulc",
      wmsUrl: "https://services.terrascope.be/wms/v2?",
      layer: "WORLDCOVER_2021_MAP",
      attributions: ['ESA Worldcover 10m <a href="https://esa-worldcover.org/" target="_blank" title="ESA Worldcover 10m">https://esa-worldcover.org/</a>']
    },

  ]
  const locationOpt1st = [
    {
      id: 1,
      label: "Country",
      value: "COUNTRY",
    },
    {
      id: 2,
      label: "Basin",
      value: "BASIN",
    },
  ];

  const [openDialog, setOpenDialog] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { showGeoJson, setShowGeoJson } = useGlobal();
  const { filteredData, setFilteredData } = useGlobal();
  const [activeOverlays, setActiveOverlays] = useState([]);

  const { drawnGeojson, setDrawnGeojson, selectedArea, setSelectedArea } = useGlobal();

  function handleOverlayToggle(layerValue) {
    setActiveOverlays((prev) =>
      prev.includes(layerValue)
        ? prev.filter((v) => v !== layerValue)
        : [...prev, layerValue]
    );
  }


  const { showToast } = useToast();
  const { data: session, status } = useSession()
  const token = session?.user?.token; // your NextAuth provider should expose token


  const [addedAreas, setAddedAreas] = useState([]);




  const { showLayers, setShowLayers } = useGlobalStorage();

  const handleDataViewChange = value => {
    setSelectedView(value);
    setSelectedFeatureName("")


  };



  const getUniqueValues = (view) => {
    const uniqueValues = new Set();

    if (selectedView === "COUNTRY") {
      GlobalCountries.features.forEach((item) => {
        uniqueValues.add(item.properties.name);
      });
    } else if (selectedView === "BASIN") {
      GlobalBasins.features.forEach((item) => {
        uniqueValues.add(item.properties.name);
      });
    } else {

      return [];
    }

    return Array.from(uniqueValues).sort();
  };

  const params = useParams();
  const ProjectId = params?.id;

  const handleAddArea = async () => {
    if (!drawnGeojson || !areaName.trim()) {
      showToast("⚠️ Please enter an area name.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/save-draw-polygon/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            name: areaName,
            geom: JSON.stringify(drawnGeojson),

            projectid: ProjectId

          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        showToast("✅ Area saved successfully!");
        setOpenDialog(false);
        fetchAreaList()
        setAreaName("");
        setDrawnGeojson(null);
      } else {
        showToast(data.message || "⚠️ Failed to save area.");
      }
    } catch (error) {
      console.error(error);
      showToast("⚠️ Error saving area.");
    }
  };

  const fetchAreaList = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/get-added-area-list/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        const areaOptions = data.map((area) => ({
          label: area.name,
          value: area.id,
        }));

        setAddedAreas(areaOptions);

      } else {
        showToast(data.message || "⚠️ Failed to load area list.");
      }
    } catch (error) {
      console.error("Error loading area list:", error);
      showToast("⚠️ Error fetching area list.");
    }
  };



  useEffect(() => {
    if (token) fetchAreaList();
  }, [token]);


const handleAreaSelect = async (val) => {
  const selectedObj = addedAreas.find((item) => item.value === val);
  const areaId = parseInt(selectedObj.value);
  setSelectedArea(selectedObj || null);

  if (!selectedObj) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/get-area-geom/${areaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    const data = await res.json();

    if (res.ok && data.geometry) {
      setFilteredData({ type: "Feature", geometry: data.geometry });
    } else {
      showToast("⚠️ Failed to fetch area geometry.");
    }
  } catch (error) {
    console.error("Error fetching area geometry:", error);
    showToast("⚠️ Error fetching area geometry.");
  }
};








  useEffect(() => {
    setShowGeoJson(true);

    return () => {
      setShowGeoJson(false);
    };
  }, []);

  const getGeoJsonData = () => {
    switch (selectedView) {
      case "COUNTRY":
        return GlobalCountries;
      case "BASIN":
        return GlobalBasins;

      default:
        return null;
    }
  };

  const selectedFeatureData = () => {
    switch (selectedView) {
      case "BASIN":
        return GlobalBasins.features.find(
          feature => feature.properties.name === selectedFeatureName
        );
      case "COUNTRY":
        return GlobalCountries.features.find(
          feature => feature.properties.name === selectedFeatureName
        );
      default:
        return null;
    }
  };



  useEffect(() => {
    if (selectedFeatureData() === undefined || selectedFeatureData() === null) {
      // Only show country boundary when in country view
      setFilteredData(null);
      setDrawnGeojson(null)
    } else {
      setFilteredData(selectedFeatureData());

      const featureCollection = {
        type: "FeatureCollection",
        features: [selectedFeatureData()],
      };

      setDrawnGeojson(featureCollection)

    }
  }, [selectedFeatureData(), selectedView]);





  const { map } = useGlobal();

  // Handler to switch base map
  const handleBaseMapRadioChange = (e) => {
    if (!map) return;
    const value = e.target.value;
    // Find layers by title
    map.getLayers().forEach((layer) => {
      if (layer.get("title") === "street") {
        layer.setVisible(value === "Street");
      }
      if (layer.get("title") === "satellite") {
        layer.setVisible(value === "Hybrid");
      }
    });
  };


  return (
    <>
      <AppHeader />
      <Flex height="100vh" pt="49px" align="stretch">
        <Box>
          <LeftNav />
        </Box>
        <Separator orientation="vertical" size="4" />
        <CollapsibleLeftDrawer>
          <ChatBox />
        </CollapsibleLeftDrawer>
        <Box position="relative" width="100%">
          <Box className={`${isFullScreen ? "fixed z-20" : "absolute"} inset-0`}>
            <Map>

              <div className="absolute bottom-4 -translate-y-1/2 left-1/2  shadow-lg rounded-xl flex flex-col items-center  z-50 ">
                {drawnGeojson && (
                  <button
                    title="Save the Area"
                    onClick={() => setOpenDialog(true)}
                    className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Save Area
                  </button>
                )}
              </div>

              {showGeoJson && (
                <>
                  {/* Only show the main geojson layer for the selected view type */}
                  {selectedView && (
                    <GeoJsonLayer
                      geoJsonData={getGeoJsonData()}
                      zIndex={10}
                      showHoverPopup={true}
                      onFeatureClick={featureName => {
                        setSelectedFeatureName(featureName);
                      }}
                      style={
                        new Style({
                          fill: new Fill({
                            color: 'rgba(38, 76, 115, 0.2)'
                          }),
                          stroke: new Stroke({
                            color: "rgba(255, 255, 255, 0.75)",
                            width: 2,
                          }),
                        })
                      }
                    />
                  )}
                  {filteredData && (
                    <GeoJsonLayer
                      geoJsonData={filteredData}
                      zIndex={10}
                      style={
                        new Style({
                          fill: new Fill({
                            color: 'rgba(38, 76, 115, 0)'
                          }),
                          stroke: new Stroke({
                            color: "yellow",
                            width: 3,
                          }),
                        })
                      }
                    />
                  )}

                  {overlayDataLayers
                    .filter((layer) => activeOverlays.includes(layer.value))
                    .map((layer) => (
                      <WMSTileLayer
                        key={layer.value}
                        opacity={1}
                        attribution={layer.attributions.join(", ")}
                        url={layer.wmsUrl}
                        params={{
                          LAYERS: layer.layer,
                          TILED: true,
                          FORMAT: "image/png",
                          TRANSPARENT: true,
                        }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        layerKey={layer.value}
                        zIndex={5 + layer.id}
                        projection={layer.projection}
                      />
                    ))}


                </>
              )}

            </Map>
            <OnMapControls
              setIsFullScreen={setIsFullScreen}
              isFullScreen={isFullScreen}
            // statsHeight={statsHeight}
            // section={section}
            />
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              justify="between"
              height="90px"
              className="bg-linear-to-t from-black/0  to-black/85"
            ></Flex>
            <Flex
              position="absolute"
              top="5"
              left="5"
              className="bg-white rounded-sm border border-[var(--gray-4)] "
              id="selectLocation"
            >

              <InputSelect
                options={addedAreas}
                value={selectedArea?.value} // keep showing correct item
                onChange={handleAreaSelect}
                placeholder="Your added areas..."
                size="3"
                className="py-2 md:!min-w-44"
              />





            </Flex>
            <Box
              position="absolute"
              top="5"
              right="5"
              display={{
                initial: 'block',
                sm: "none",
              }}
              className="rounded-lg"
            >
              <IconButton
                variant="solid"
                size="2"
                className="!bg-white !text-dark"
                onClick={() => setShowLayers(!showLayers)}
              >
                <LayersIcon className="size-5" />
              </IconButton>
            </Box>


            <LayerListAccorduinsContainer>
              <AccordionRoot
                className="rounded-md md:shadow-[0_2px_10px] md:shadow-black/5 bg-white"
                type="single"
                defaultValue="item-3"
                collapsible
              >
                <AccordionItem
                  value="item-1"
                  className="mt-px focus-within:shadow-none overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10"
                >
                  <AccordionTrigger>Base Map</AccordionTrigger>
                  <AccordionContent>
                    <Flex align="start" direction="column" gap="1">
                      <Flex asChild gap="2">
                        <Text as="label" size="2" color="gray">
                          <Radio
                            name="map"
                            value="Street"
                            onChange={handleBaseMapRadioChange}
                          />
                          Street Map
                        </Text>
                      </Flex>

                      <Flex asChild gap="2">
                        <Text as="label" size="2" color="gray">
                          <Radio
                            name="map"
                            value="Hybrid"
                            defaultChecked
                            onChange={handleBaseMapRadioChange}
                          />
                          Hybrid Map
                        </Text>
                      </Flex>
                    </Flex>
                  </AccordionContent>
                </AccordionItem>
                {/* <AccordionItem
                  value="item-2"
                  className="mt-px focus-within:shadow-none overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10"
                >
                  <AccordionTrigger>Overlay Layers</AccordionTrigger>
                  <AccordionContent>
                    <Flex direction="column" gap="2">
                      {overlayDataLayers.map((layer) => (
                        <label
                          key={layer.id}
                          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={activeOverlays.includes(layer.value)}
                            onChange={() => handleOverlayToggle(layer.value)}
                          />
                          {layer.label}
                        </label>
                      ))}
                    </Flex>
                  </AccordionContent>
                </AccordionItem> */}
                <AccordionItem
                  value="item-3"
                  className="mt-px focus-within:shadow-none overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10"
                >
                  <AccordionTrigger>Data Layers</AccordionTrigger>
                  <AccordionContent className=" bg-gray-50/40 rounded-b-md">
                    <Flex direction="column" gap="3">

                      {/* 🔹 Boundary Type Section */}
                      <Box className="w-full">
                        <Text size="2" weight="medium" color="gray" mb="2" className="block tracking-wide text-xs text-gray-500">
                          Select Boundary
                        </Text>

                        {locationOpt1st.map((opt) => {
                          const isChecked = selectedView === opt.value;

                          return (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-2 py-1 rounded-md transition-all cursor-pointer`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (checked) handleDataViewChange(opt.value);
                                  else handleDataViewChange(null);
                                }}
                              />
                              <Text size="2" weight={isChecked ? "medium" : "regular"}>
                                {opt.label}
                              </Text>
                            </label>
                          );
                        })}

                      </Box>

                      {/* 🔹 Feature Selection */}
                      <Box className="w-full">
                        <Text size="2" weight="medium" color="gray" mb="2" className="block tracking-wide text-xs text-gray-500">
                          Select Feature
                        </Text>

                        <InputSelect
                          options={selectedView ? getUniqueValues(selectedView) : []}
                          value={selectedFeatureName}
                          onChange={setSelectedFeatureName}
                          size="3"
                          placeholder="Select"
                          className="py-2 w-full border border-gray-200 rounded-lg"
                        />
                      </Box>
                    </Flex>
                  </AccordionContent>

                </AccordionItem>

              </AccordionRoot>
            </LayerListAccorduinsContainer>


          </Box>
        </Box>
      </Flex>


      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 z-50">
            <Dialog.Title className="text-lg font-semibold mb-3">
              Save Area
            </Dialog.Title>

            <input
              type="text"
              placeholder="Enter area name..."
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleAddArea}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </>
  );
}

export default HomePage;
