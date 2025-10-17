"use client";
import {createContext, useState} from "react";

const defaultProvider = {
  map: null,
  filteredData: null,
};

export const MapContext = createContext(defaultProvider);

const MapProvider = ({children}) => {
  const [map, setMap] = useState(defaultProvider.map);
  const [filteredData, setFilteredData] = useState(
    defaultProvider.filteredData
  );
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [mapScale, setMapScale] = useState("1:1,000,000");
  const [showGeoJson, setShowGeoJson] = useState(false);
  const [drawnGeojson, setDrawnGeojson] = useState(null)
    const [selectedArea, setSelectedArea] = useState(undefined);

  const values = {
    map,
    setMap,
    filteredData,
    setFilteredData,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    mapScale,
    setMapScale,
    showGeoJson, setShowGeoJson,
    drawnGeojson, setDrawnGeojson,
    selectedArea, setSelectedArea
  };

  return <MapContext.Provider value={values}>{children}</MapContext.Provider>;
};

export default MapProvider;
