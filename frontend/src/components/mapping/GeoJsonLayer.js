import React, { useEffect, useRef } from 'react';
import { useGlobal } from '@/hooks/useGlobal';
import * as ol from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Overlay from 'ol/Overlay';

function GeoJsonLayer({ geoJsonData, style, onEachFeature, attribution, zIndex = 1, zoomToLocation, showHoverPopup = true, onFeatureClick }) {
    const { map } = useGlobal();
    const hasFitRef = useRef(false);
    const overlayRef = useRef();
    const tooltipRef = useRef();
    const layerRef = useRef();

    // Reset fit flag only when geoJsonData changes
    useEffect(() => {
        hasFitRef.current = false;
    }, [geoJsonData]);

    useEffect(() => {
        if (!map || !geoJsonData) return;

        const source = new VectorSource({
            features: new GeoJSON().readFeatures(geoJsonData),
            attributions: attribution,
            zIndex
        });
        const layer = new VectorLayer({
            source,
            style,
            zIndex,
        });
        map.addLayer(layer);

        // Only fit if we haven't already, and only if there are features
        const features = source.getFeatures();
        if (features && features.length > 0 && !hasFitRef.current) {
            const extent = source.getExtent();
            map.getView().fit(extent, {
                padding: [100, 100, 100, 100],
                maxZoom: 16,
                duration: 1000
            });
            hasFitRef.current = true;
        }

        // Store layer reference
        layerRef.current = layer;

        // Call onEachFeature if provided
        if (onEachFeature) {
            features.forEach((feature) => onEachFeature(feature, layer));
        }

        return () => {
            map.removeLayer(layer);
            layerRef.current = null;
            // Do NOT reset hasFitRef here
        };
    }, [map, geoJsonData, style, onEachFeature, attribution, zIndex]);

    // Add hover popup functionality
    useEffect(() => {
        if (!map || !showHoverPopup || !layerRef.current) return;

        // Create tooltip overlay if not already created
        if (!overlayRef.current) {
            const tooltip = document.createElement('div');
            tooltip.className = 'bg-white/95 border border-gray-300 px-2 py-1 rounded text-xs pointer-events-none shadow-md';
            tooltipRef.current = tooltip;
            
            const overlay = new Overlay({
                element: tooltip,
                offset: [10, 0],
                positioning: 'bottom-left',
            });
            map.addOverlay(overlay);
            overlayRef.current = overlay;
        }

        const handlePointerMove = (evt) => {
            let found = false;
            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (layer === layerRef.current) {
                    found = true;
                    const name = feature.get('name') || feature.get('COUNTRY') || feature.get('COUNTY') || feature.get('BASIN');
                    if (name) {
                        tooltipRef.current.innerHTML = name;
                        overlayRef.current.setPosition(evt.coordinate);
                    }
                }
            });
            if (!found) {
                overlayRef.current.setPosition(undefined);
            }
        };

        map.on('pointermove', handlePointerMove);
        
        return () => {
            map.un('pointermove', handlePointerMove);
            if (overlayRef.current) {
                map.removeOverlay(overlayRef.current);
                overlayRef.current = null;
                tooltipRef.current = null;
            }
        };
    }, [map, showHoverPopup, geoJsonData]);

    // Add click functionality
    useEffect(() => {
        if (!map || !onFeatureClick || !layerRef.current) return;

        const handleClick = (evt) => {
            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (layer === layerRef.current) {
                    const name = feature.get('name') || feature.get('COUNTRY') || feature.get('COUNTY') || feature.get('BASIN');
                    if (name && onFeatureClick) {
                        onFeatureClick(name);
                    }
                    return true; // Stop iteration
                }
            });
        };

        map.on('click', handleClick);
        
        return () => {
            map.un('click', handleClick);
        };
    }, [map, onFeatureClick, geoJsonData]);
    
    return null;
}

export default GeoJsonLayer;