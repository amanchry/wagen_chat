import os
import numpy as np
import rasterio
from osgeo import gdal


def download_wapor_v3_L1_eta_data(
                    first_year, 
                    last_year, 
                    output_folder, 
                    geojson_boundary, 
                    temporal_resolution,
                    progress_hook=None,
                    ):
    """
    Downloads and processes remote sensing data for a given product and boundary.

    Parameters:
    - first_year: int, starting year
    - last_year: int, ending year
    - output_folder: str, folder to save processed data
    - geojson_boundary: str, path to GeoJSON boundary file
    - temporal_resolution: str, "Annual" or "Monthly"
    - progress_hook: optional callable with signature (processed, total, filename, event)
                   where event ∈ {"start", "skipped", "done", "failed"}
    """

    os.makedirs(output_folder, exist_ok=True)

    filenames = []
    if temporal_resolution == "Annual":
        for year in range(first_year, last_year + 1):

            url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L1-AETI-A/WAPOR-3.L1-AETI-A.{year}.tif"
            output_filename = f"AETI_{year}0101.tif"
            filenames.append((url, output_filename))


    elif temporal_resolution == "Monthly":
        for year in range(first_year, last_year + 1):
            for month in range(1, 13):
                url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L1-AETI-M/WAPOR-3.L1-AETI-M.{year}-{month:02d}.tif"
                output_filename = f"AETI_{year}{month:02d}01.tif"
                filenames.append((url, output_filename))

    elif temporal_resolution == "Dekadal":
        for year in range(first_year, last_year + 1):
            for month in range(1, 13):
                for dekad in range(1, 4):
                    url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L1-AETI-D/WAPOR-3.L1-AETI-D.{year}-{month:02d}-D{dekad}.tif"
                    output_filename = f"AETI_{year}{month:02d}D{dekad}.tif"
                    filenames.append((url, output_filename))

    else:
        raise ValueError("temporal_resolution must be 'Annual' or 'Monthly'")
        
    total = len(filenames)

    processed = 0

    for url, output_filename in filenames:
        output_path = os.path.join(output_folder, output_filename)

        

        temp_clip = os.path.join(output_folder, f"temp_{output_filename}")
        vsicurl_url = f"/vsicurl/{url}"

        if progress_hook:
            progress_hook(processed, total, output_filename, "start")
        
        if os.path.exists(output_path):
            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "skipped")
            continue



        print(f"Downloading...{url}")

        try:
            warp_options = gdal.WarpOptions(
                cutlineDSName=geojson_boundary,
                cropToCutline=True,
                dstNodata=-9999
            )
            gdal.Warp(destNameOrDestDS=temp_clip, srcDSOrSrcDSTab=vsicurl_url, options=warp_options)
        except Exception as e:
            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "failed")
            continue

        try:
            with rasterio.open(temp_clip) as src:
                profile = src.profile
                data = src.read(1)
                nodata = src.nodata

                data = np.where(data == nodata, -9999, data)
                scaled_data = np.where(data != -9999, data * 0.1, -9999)

                profile.update(
                    dtype=rasterio.float32,
                    nodata=-9999,
                    compress="LZW"
                )

                with rasterio.open(output_path, "w", **profile) as dst:
                    dst.write(scaled_data.astype(rasterio.float32), 1)

            if os.path.exists(temp_clip):
                os.remove(temp_clip)

            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "done")

            print(f"✅ Processed and saved: {output_filename}")
        except Exception:
            if os.path.exists(temp_clip):
                os.remove(temp_clip)
            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "failed")






def download_wapor_v3_L2_eta_data(
                    first_year, 
                    last_year, 
                    output_folder, 
                    geojson_boundary, 
                    temporal_resolution,
                    progress_hook=None,
                    ):
    """
    Downloads and processes remote sensing data for a given product and boundary.

    Parameters:
    - first_year: int, starting year
    - last_year: int, ending year
    - output_folder: str, folder to save processed data
    - geojson_boundary: str, path to GeoJSON boundary file
    - temporal_resolution: str, "Annual" or "Monthly"
    - progress_hook: optional callable with signature (processed, total, filename, event)
                   where event ∈ {"start", "skipped", "done", "failed"}
    """

    os.makedirs(output_folder, exist_ok=True)

    filenames = []
    if temporal_resolution == "Annual":
        for year in range(first_year, last_year + 1):

            url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L2-AETI-A/WAPOR-3.L2-AETI-A.{year}.tif"
            output_filename = f"AETI_{year}0101.tif"
            filenames.append((url, output_filename))


    elif temporal_resolution == "Monthly":
        for year in range(first_year, last_year + 1):
            for month in range(1, 13):
                url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L2-AETI-M/WAPOR-3.L2-AETI-M.{year}-{month:02d}.tif"
                output_filename = f"AETI_{year}{month:02d}01.tif"
                filenames.append((url, output_filename))

    elif temporal_resolution == "Dekadal":
        for year in range(first_year, last_year + 1):
            for month in range(1, 13):
                for dekad in range(1, 4):
                    url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L2-AETI-D/WAPOR-3.L2-AETI-D.{year}-{month:02d}-D{dekad}.tif"
                    output_filename = f"AETI_{year}{month:02d}D{dekad}.tif"
                    filenames.append((url, output_filename))

    else:
        raise ValueError("temporal_resolution must be 'Annual' or 'Monthly'")
        
    total = len(filenames)

    processed = 0

    for url, output_filename in filenames:
        output_path = os.path.join(output_folder, output_filename)

        

        temp_clip = os.path.join(output_folder, f"temp_{output_filename}")
        vsicurl_url = f"/vsicurl/{url}"

        if progress_hook:
            progress_hook(processed, total, output_filename, "start")
        
        if os.path.exists(output_path):
            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "skipped")
            continue



        print(f"Downloading...{url}")

        try:
            warp_options = gdal.WarpOptions(
                cutlineDSName=geojson_boundary,
                cropToCutline=True,
                dstNodata=-9999
            )
            gdal.Warp(destNameOrDestDS=temp_clip, srcDSOrSrcDSTab=vsicurl_url, options=warp_options)
        except Exception as e:
            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "failed")
            continue

        try:
            with rasterio.open(temp_clip) as src:
                profile = src.profile
                data = src.read(1)
                nodata = src.nodata

                data = np.where(data == nodata, -9999, data)
                scaled_data = np.where(data != -9999, data * 0.1, -9999)

                profile.update(
                    dtype=rasterio.float32,
                    nodata=-9999,
                    compress="LZW"
                )

                with rasterio.open(output_path, "w", **profile) as dst:
                    dst.write(scaled_data.astype(rasterio.float32), 1)

            if os.path.exists(temp_clip):
                os.remove(temp_clip)

            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "done")

            print(f"✅ Processed and saved: {output_filename}")
        except Exception:
            if os.path.exists(temp_clip):
                os.remove(temp_clip)
            processed += 1
            if progress_hook:
                progress_hook(processed, total, output_filename, "failed")