import React, { useEffect } from "react";

import {
  mapCenter,
  setDragging,
  setInitialMapZoom,
} from "@/helpers/mapFunction";


import GlobalBasins from '@/assets/data/shapefiles/Basins.json';
import GlobalCountries  from '@/assets/data/shapefiles/FAO_world_countries.json';


import GeoJsonLayer from "./GeoJsonLayer";
import { useSelectedFeatureContext } from "@/provider/SelectedFeatureContext";
import { useGlobal } from "@/hooks/useGlobal";
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';

const FiltereredDistrictsFeatures = ({
  DistrictStyle,
  DistrictOnEachfeature,
  layerKey,
  attribution,
}) => {
  const { selectedView, selectedFeatureName, dataView } =
    useSelectedFeatureContext();
  const {map} = useGlobal();
  const initialZoom = setInitialMapZoom();

  const selectedJSONData = () => {
    switch (dataView) {
      case "COUNTRY":
        return GlobalCountries;
      case "BASIN":
        return GlobalBasins;
      default:
        return null;
    }
  };

  let selectedFeatureData;
  const baseData = selectedJSONData();
  if (!baseData) {
    selectedFeatureData = { type: "FeatureCollection", features: [] };
  } else if (selectedFeatureName !== "All" && selectedFeatureName !== "") {
    selectedFeatureData = {
      type: "FeatureCollection",
      features: baseData.features.filter(
        item => item.properties[selectedView] === selectedFeatureName
      ),
    };
  } else {
    selectedFeatureData = {
      type: "FeatureCollection",
      features: baseData.features,
    };
  }

  useEffect(() => {
    if (!map || !selectedFeatureData) return;
    // Create features from GeoJSON
    const features = new GeoJSON().readFeatures(selectedFeatureData, {
      featureProjection: 'EPSG:4326',
    });

    // Get the extent of all features
    let extent;
    if (features.length > 0) {
      extent = features[0].getGeometry().getExtent();
      features.forEach((feature) => {
        extent = extent
          ? [
              Math.min(extent[0], feature.getGeometry().getExtent()[0]),
              Math.min(extent[1], feature.getGeometry().getExtent()[1]),
              Math.max(extent[2], feature.getGeometry().getExtent()[2]),
              Math.max(extent[3], feature.getGeometry().getExtent()[3]),
            ]
          : feature.getGeometry().getExtent();
      });
    }

    // Fit the map view to the extent, or set to default center/zoom
    if (map && map.getView && extent && extent[0] !== Infinity) {
      map.getView().fit(extent, { duration: 500, padding: [40, 40, 40, 40] });
    } else {
      map.getView().setCenter(mapCenter); // [lon, lat] in EPSG:4326
      map.getView().setZoom(initialZoom);
    }
  }, [selectedFeatureData, map, initialZoom]);

  return (
    <GeoJsonLayer
      key={`${layerKey}+${selectedFeatureName}+${selectedView}`}
      // style={{ fillColor: 'none', weight: 4, color: 'yellow', fillOpacity: "0.4" }}
      geoJsonData={selectedFeatureData}
      style={DistrictStyle}
      onEachFeature={DistrictOnEachfeature}
      attribution={attribution}
    />
  );
};

export default FiltereredDistrictsFeatures;
