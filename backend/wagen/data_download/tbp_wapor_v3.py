import os
import numpy as np
import rasterio
import json
from osgeo import ogr, gdal


def download_wapor_v3_L1_tbp_data(
    first_year,
    last_year,
    output_folder,
    geojson_obj,
    temporal_resolution,
):
    """
    Downloads and processes TBP (WaPOR v3 L1) data and clips to the given boundary.

    Parameters:
    - first_year: int, starting year
    - last_year: int, ending year
    - output_folder: str, folder to save processed data
    - geojson_obj: obj, GeoJSON object
    - temporal_resolution: str, "Annual" or "Monthly"
    """

    os.makedirs(output_folder, exist_ok=True)

    # -------------------
    # Build file list
    # -------------------
    filenames = []
    if temporal_resolution == "Annual":
        for year in range(first_year, last_year + 1):
            filename = f"WAPOR-3.L1-TBP-A.{year}.tif"
            output_filename = f"TBP_{year}0101.tif"
            url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L1-TBP-A/{filename}"
            filenames.append((url, output_filename, "annual"))

    elif temporal_resolution == "Monthly":
        for year in range(first_year, last_year + 1):
            for month in range(1, 12 + 1):
                filename = f"WAPOR-3.L1-NPP-M.{year}-{month:02d}.tif"
                output_filename = f"TBP_{year}{month:02d}01.tif"
                url = f"https://gismgr.fao.org/DATA/WAPOR-3/MAPSET/L1-NPP-M/{filename}"
                filenames.append((url, output_filename, "monthly"))
    else:
        raise ValueError("temporal_resolution must be 'Annual' or 'Monthly'")


    # (Optional) cleaner errors/logs
    try:
        gdal.UseExceptions()
    except Exception:
        pass

    # ✅ Put GeoJSON into GDAL in-memory file
    cutline_path = "/vsimem/cutline.geojson"
    gdal.FileFromMemBuffer(cutline_path, json.dumps(geojson_obj).encode("utf-8"))

        

    # -------------------
    # Process loop
    # -------------------
    for url, output_filename, mode in filenames:
        output_path = os.path.join(output_folder, output_filename)
        temp_clip = os.path.join(output_folder, f"temp_{output_filename}")
        vsicurl_url = f"/vsicurl/{url}"


        print(f"⬇️ Downloading: {url}")

    
        try:
            warp_options = gdal.WarpOptions(
                cutlineDSName=cutline_path,
                cropToCutline=True,
                dstNodata=-9999,
            )
            # For annual, we can write directly. For monthly we’ll scale later.
            dest = temp_clip if mode == "monthly" else output_path
            gdal.Warp(destNameOrDestDS=dest, srcDSOrSrcDSTab=vsicurl_url, options=warp_options)
        except Exception as e:

            print(f"❌ GDAL warp failed for {output_filename}: {e}")
            continue

        if mode == "monthly":
            # Scale and compress
            try:
                with rasterio.open(temp_clip) as src:
                    profile = src.profile
                    data = src.read(1)
                    nodata = src.nodata

                    data = np.where(data == nodata, -9999, data)
                    scaled = np.where(data != -9999, data * 0.001 * 22.222, -9999)

                    profile.update(
                        dtype=rasterio.float32,
                        nodata=-9999,
                        compress="LZW",
                    )

                    with rasterio.open(output_path, "w", **profile) as dst:
                        dst.write(scaled.astype(rasterio.float32), 1)

                os.remove(temp_clip)
                print(f"✅ Processed and saved: {output_filename}")

            except Exception as e:
                print(f"❌ Failed to scale/write {output_filename}: {e}")
                if os.path.exists(temp_clip):
                    os.remove(temp_clip)

        else:
            # Annual = already saved
            print(f"✅ Saved: {output_filename}")


    return filenames

