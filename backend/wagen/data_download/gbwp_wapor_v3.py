import os
import numpy as np
import rasterio
import json
from osgeo import ogr, gdal


def download_wapor_gbwp_data(
                           first_year, 
                    last_year, 
                    output_folder, 
                    geojson_obj, 
                    temporal_resolution,
):
    """
    Downloads and processes remote sensing data for a given product and boundary.

    Parameters:
    - first_year: int, starting year
    - last_year: int, ending year
    - output_folder: str, folder to save processed data
    - geojson_obj: obj, GeoJSON object
    - temporal_resolution: str, "Annual" or "Monthly"
    """

    os.makedirs(output_folder, exist_ok=True)

    filenames = []
    if temporal_resolution == "Annual":
        for year in range(first_year, last_year + 1):

            url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L1-GBWP-A/WAPOR-3.L1-GBWP-A.{year}.tif"
            output_filename = f"GBWP_{year}0101.tif"
            filenames.append((url, output_filename))


    else:
        raise ValueError("temporal_resolution must be 'Annual' or 'Monthly'")
        

    # Convert GeoJSON -> OGR Geometry -> WKT
    geom = ogr.CreateGeometryFromJson(json.dumps(
        geojson_obj["features"][0]["geometry"]
        if "features" in geojson_obj else geojson_obj["geometry"] if "geometry" in geojson_obj else geojson_obj
    ))
    wkt = geom.ExportToWkt()


    for url, output_filename in filenames:
        output_path = os.path.join(output_folder, output_filename)

    
        vsicurl_url = f"/vsicurl/{url}"

        temp_clip = os.path.join(output_folder, f"temp_clip_{output_filename}")


    

        try:
            # 2. Resample and clip the downloaded raster
            warp_options = gdal.WarpOptions(
                cutlineDSName=wkt,
                cropToCutline=True,
                dstNodata=-9999,
                
            )
            gdal.Warp(destNameOrDestDS=temp_clip, srcDSOrSrcDSTab=vsicurl_url, options=warp_options)
        except Exception as e:
            continue

        # Scale and write output with compression
        try:
            with rasterio.open(temp_clip) as src:
                profile = src.profile
                data = src.read(1)
                nodata = src.nodata

                data = np.where(data == nodata, -9999, data)
                scaled_data = np.where(data != -9999, data * 0.001, -9999)

                profile.update(
                    dtype=rasterio.float32,
                    nodata=-9999,
                    compress="LZW"
                )

                with rasterio.open(output_path, "w", **profile) as dst:
                    dst.write(scaled_data.astype(rasterio.float32), 1)


            if os.path.exists(temp_clip):
                os.remove(temp_clip)


            print(f"✅ Processed and saved: {output_filename}")


        except Exception as e:
            print(f"❌ Failed to process/write {output_filename}: {e}")


            if os.path.exists(temp_clip):
                os.remove(temp_clip)

    return filenames