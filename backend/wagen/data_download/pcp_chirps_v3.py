import os
import numpy as np
import rasterio
import json
from osgeo import ogr, gdal


def download_chirps_pcp_data(
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

    resampling=False

    filenames = []
    if temporal_resolution == "Annual":
        for year in range(first_year, last_year + 1):

            url = f"https://data.chc.ucsb.edu/products/CHIRPS/v3.0/annual/global/tifs/chirps-v3.0.{year}.tif"
            output_filename = f"PCP_{year}0101.tif"

            filenames.append((url, output_filename))


    elif temporal_resolution == "Monthly":
        for year in range(first_year, last_year + 1):
            for month in range(1, 13):
                url = f"https://data.chc.ucsb.edu/products/CHIRPS/v3.0/monthly/global/tifs/chirps-v3.0.{year}.{month:02d}.tif"
                output_filename = f"PCP_{year}{month:02d}01.tif"
                filenames.append((url, output_filename))

    else:
        raise ValueError("temporal_resolution must be 'Annual' or 'Monthly'")
    
    geom = ogr.CreateGeometryFromJson(json.dumps(
        geojson_obj["features"][0]["geometry"]
        if "features" in geojson_obj else geojson_obj["geometry"] if "geometry" in geojson_obj else geojson_obj
    ))
    wkt = geom.ExportToWkt()
    
        


    for url, output_filename in filenames:
        output_path = os.path.join(output_folder, output_filename)


        vsicurl_url = f"/vsicurl/{url}"



        if resampling:

            try:
                temp_full = os.path.join(output_folder, f"temp_full_{output_filename}")

                # Save full raster locally first
                gdal.Translate(
                    destName=temp_full, 
                    xRes=0.003,  # 300m resolution
                    yRes=0.003,
                    resampleAlg="near",
                    srcDS=vsicurl_url)
            except Exception as e:

                continue

            



            # 2. Resample and clip the downloaded raster
            warp_options = gdal.WarpOptions(
                cutlineWKT=wkt,
                cropToCutline=True,
                dstNodata=-9999,
                
            )
            gdal.Warp(destNameOrDestDS=output_path, srcDSOrSrcDSTab=temp_full, options=warp_options)


            # Remove intermediate file
            if os.path.exists(temp_full):
                os.remove(temp_full)


            print(f"✅ Processed and saved: {output_filename}")


        else:
            warp_options = gdal.WarpOptions(
                cutlineWKT=wkt,
                cropToCutline=True,
                dstNodata=-9999
            )
            gdal.Warp(destNameOrDestDS=output_path, srcDSOrSrcDSTab=vsicurl_url, options=warp_options)
                
            print(f"✅ Processed and saved: {output_filename}")

    return filenames