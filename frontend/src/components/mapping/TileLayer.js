import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Tile as OLTileLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import { useGlobal } from "@/hooks/useGlobal";
import Mask from "ol-ext/filter/Mask";
import Crop from "ol-ext/filter/Crop";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";

/**
 * TileLayer component for rendering a raster XYZ tile layer in OpenLayers.
 *
 * Props:
 * - opacity: number
 * - attribution: string
 * - url: string (XYZ tile endpoint)
 * - zIndex: number
 * - key: string (React key)
 * - filteredData: GeoJSON object for crop mask (from useGlobal)
 */
const TileLayer = ({
  opacity = 1,
  attribution = "",
  url,
  zIndex = 1,
  ...rest
}) => {
  const { map, filteredData } = useGlobal();

  useEffect(() => {
    if (!map || !url) return;
    const source = new XYZ({
      url,
      attributions: attribution,
    });
    const layer = new OLTileLayer({
      source,
      opacity,
      zIndex,
      ...rest,
    });

    let mask, crop, cropSource;
    // Only apply mask if filteredData is present and valid
    if (
      filteredData &&
      filteredData.type === "Feature"
    ) {
      cropSource = new VectorSource({
        features: new GeoJSON().readFeatures(filteredData, {
          featureProjection: map.getView().getProjection(),
        }),
      });
      
      crop = new Crop({
        feature: cropSource.getFeatures()[0],
        wrapX: true,
        inner: false, // Show inside the polygon
      });

      layer.addFilter(crop);

      mask = new Mask({
        source: cropSource,
        wrapX: true,
        inner: false, // Show inside the polygon
      });
      layer.addFilter(mask);
    }

    map.addLayer(layer);
    return () => {
      layer.removeFilter(crop);
      layer.removeFilter(mask);
      map.removeLayer(layer);
    };
  }, [map, url, opacity, zIndex, attribution, filteredData]);

  return null;
};

TileLayer.propTypes = {
  opacity: PropTypes.number,
  attribution: PropTypes.string,
  url: PropTypes.string.isRequired,
  zIndex: PropTypes.number,
};

export default TileLayer;
