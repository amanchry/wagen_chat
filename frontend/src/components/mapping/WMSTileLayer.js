import React, { useEffect } from "react";
import { useGlobal } from "@/hooks/useGlobal";
import PropTypes from "prop-types";
import Mask from "ol-ext/filter/Mask";
import Crop from "ol-ext/filter/Crop";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import { Tile as TileLayer } from "ol/layer";
import TileWMS from "ol/source/TileWMS";

/**
 * WMSTileLayer component for rendering a WMS raster layer in OpenLayers.
 *
 * Props:
 * - opacity: number
 * - attribution: string
 * - url: string (WMS endpoint)
 * - params: object (WMS params, e.g. { LAYERS: 'layername' })
 * - version: string (WMS version)
 * - transparent: boolean
 * - format: string (e.g. 'image/png')
 * - zIndex: number
 * - key: string (React key)
 */
const WMSTileLayer = ({
  opacity = 1,
  attribution = "",
  url,
  params = {},
  version = "1.1.0",
  transparent = true,
  format = "image/png",
  layerKey,
  zIndex = 1,
  time,
  projection,
  cropGeoJson = null,
  ...rest
}) => {
  const { map } = useGlobal();

  useEffect(() => {
    if (!map || !url || !cropGeoJson) return;

    // 1. Create the WMS layer
    const wmsSource = new TileWMS({
      url,
      params: {
        ...params,
        VERSION: version,
        TRANSPARENT: transparent,
        FORMAT: format,
        time:time,
      },
      projection: projection?projection:'EPSG:4326',  
      attributions: attribution,
    });
    const wmsLayer = new TileLayer({
      source: wmsSource,
      opacity,
      zIndex,
      ...rest,
    });


//     const wmsLayer = new TileLayer({
//   title: "ESA WorldCover 2021",
//   visible: true,
//   source: new TileWMS({
//     url: "https://services.terrascope.be/wms/v2?",
//      params: { 'LAYERS': 'WORLDCOVER_2021_MAP', 'TILED': true, 'FORMAT': 'image/png', 'TRANSPARENT': true, 'SRS': 'EPSG:3857'   },
//              projection: 'EPSG:3857',  

//   }),

// });


    // 2. Create a vector source for the crop polygon
    const cropSource = new VectorSource({
      features: new GeoJSON().readFeatures(cropGeoJson, {
        featureProjection: map.getView().getProjection(),
      }),
    });

    map.addLayer(wmsLayer);

    const crop = new Crop({
      feature: cropSource.getFeatures()[0],
      wrapX: true,
      inner: false, // Show inside the polygon
    });

    // 4. Add the filter to the WMS layer
    wmsLayer.addFilter(crop);

    var mask = new Mask({ 
      feature: cropSource.getFeatures()[0],
      wrapX: true,
      inner: false,
    });
    wmsLayer.addFilter(mask);

    return () => {
      wmsLayer.removeFilter(crop);
      wmsLayer.removeFilter(mask);
      map.removeLayer(wmsLayer);
    };
  }, [
    map,
    url,
    JSON.stringify(params),
    version,
    transparent,
    format,
    opacity,
    zIndex,
    attribution,
    cropGeoJson,
    layerKey
  ]);

  return null;
};

WMSTileLayer.propTypes = {
  opacity: PropTypes.number,
  attribution: PropTypes.string,
  url: PropTypes.string.isRequired,
  params: PropTypes.object,
  version: PropTypes.string,
  transparent: PropTypes.bool,
  format: PropTypes.string,
  zIndex: PropTypes.number,
  cropGeoJson: PropTypes.object, // Pass your crop polygon as GeoJSON
};

export default WMSTileLayer;
 