
export const yearOptions = Array.from({ length: 6 }, (_, index) => {
  const year = 2018 + index;
  return { label: `${year}`, value: `${index}` }; // 👈 label = year, value = index
});




export const fillDensityColor = (ColorLegendsDataItem, density) => {
  if (!ColorLegendsDataItem) return null;

  // Check for density explicitly considering 0 as a valid value
  if (density !== undefined && density !== null) {
    const valueColorsMap = ColorLegendsDataItem.Value.map((value, index) => ({ value, color: ColorLegendsDataItem.Colors[index] }));

    for (let i = 0; i < valueColorsMap.length; i++) {
      if (density > valueColorsMap[i].value) {
        return valueColorsMap[i].color;
      }
    }

    // Default to the last color if no match found
    return ColorLegendsDataItem.Colors[ColorLegendsDataItem.Colors.length - 1];
  } else {
    return "rgba(0,0,0,0)";
  }
};


// export const fillDensityColor = (ColorLegendsDataItem, density) => {
//   if (!ColorLegendsDataItem ) return null;
//   if (density){
//     const valueColorsMap = ColorLegendsDataItem.Value.map((value, index) => ({ value, color: ColorLegendsDataItem.Colors[index] }));

//     for (let i = 0; i < valueColorsMap.length; i++) {
//       if (density > valueColorsMap[i].value) {
//         return valueColorsMap[i].color;
//       }
//     }
//     // return valueColorsMap[valueColorsMap.length - 1].color; // Default to the last color
//     return ColorLegendsDataItem.Colors[ColorLegendsDataItem.Colors.length - 1]; // Default to the last color

//   }else{
//  return "none"
//   }


// };


export const getSumAnnualDataFromMonthly = (monthlyData) => {
  const annualData = {};

  if (monthlyData !== "NA" && Array.isArray(monthlyData)) {
    monthlyData.forEach((value, index) => {
      const year = Math.floor(index / 12) + 2018; // Calculate year based on index
      if (!annualData[year]) {
        annualData[year] = 0; // Initialize year in annualData if not already present
      }
      annualData[year] += value; // Aggregate data for the year
    });

    // Return the accumulated values, rounded to two decimal places
    return Object.values(annualData).map(value => Math.round(value * 100) / 100);
  }

  // Return an empty array or another appropriate default value if data is "NA" or invalid
  return [];
}



export const getAnnualMeanDataFromMonthly = (monthlyData) => {
  const annualSums = {};
  const annualCounts = {};

  if (monthlyData !== "NA" && Array.isArray(monthlyData)) {
    monthlyData.forEach((value, index) => {
      const year = Math.floor(index / 12) + 2018; // Calculate year based on index
      if (!annualSums[year]) {
        annualSums[year] = 0; // Initialize year in annualSums if not already present
        annualCounts[year] = 0; // Initialize count for each year
      }
      annualSums[year] += value; // Aggregate data for the year
      annualCounts[year]++; // Increment count for the year
    });

    // Calculate the average for each year, rounded to two decimal places
    const annualAverages = {};
    Object.keys(annualSums).forEach(year => {
      annualAverages[year] = Math.round((annualSums[year] / annualCounts[year]) * 100) / 100;
    });

    // Return the averages
    return Object.values(annualAverages);
  }

  // Return an empty array if data is "NA" or invalid
  return [];
}



export const calculateMeanMonthly = (data) => {
  if (data.length !== 72) {
    return []
  }

  // Initialize an array to hold the sum of each month
  let monthlySums = Array(12).fill(0);
  let monthlyCounts = 6; // Since we have 6 years of data

  // Loop through the data and accumulate sums for each month
  for (let i = 0; i < data.length; i++) {
      let monthIndex = i % 12; // Calculate month index (0 for Jan, 1 for Feb, etc.)
      monthlySums[monthIndex] += data[i];
  }

  // Calculate the means by dividing each sum by the number of years (6), and return as integers
  let monthlyMeans = monthlySums.map(sum => Math.floor(sum / monthlyCounts));

  return monthlyMeans;
}



export const calculateAverageOfArray = (arr) => {
  if (arr==="NA") {
      return 0;
  }
  if (arr.length === 0) {
    return 0;
}

  const sum = arr.reduce((total, num) => total + num, 0);
  const average = sum / arr.length;
  return parseFloat(average.toFixed(3));
};


export const calculateSumOfArray = (arr) => {
  return arr.reduce((acc, curr) => acc + curr, 0);
}



export const SelectedFeaturesAveragePCPTrendFunction = (data) => {
  let sumObject = {
    "PCP_trend": [],
  };


  data.forEach(obj => {
    sumObject["PCP_trend"] = averageArrayOfArrays(data.map(obj => [...obj["pcp_trendline"]]));

  });
  return sumObject;
}




export const SelectedFeaturesAverageClimateParaFunction = (data) => {
  let sumObject = {
    // "DISTRICT": [],
    "pcp_ssp585": [],
    "pcp_ssp245": [],
    "tdeg_ssp245": [],
    "tdeg_ssp585": [],
  };


  data.forEach(obj => {
    sumObject["pcp_ssp585"] = averageArrayOfArrays(data.map(obj => [...obj["pcp_ssp585"]]));
    sumObject["pcp_ssp245"] = averageArrayOfArrays(data.map(obj => [...obj["pcp_ssp245"]]));
    sumObject["tdeg_ssp245"] = averageArrayOfArrays(data.map(obj => [...obj["tdeg_ssp245"]]));
    sumObject["tdeg_ssp585"] = averageArrayOfArrays(data.map(obj => [...obj["tdeg_ssp585"]]));
    // sumObject["DISTRICT"].push(obj["DISTRICT"]);

  });


  return sumObject;
}



export const SelectedFeaturesAverageSPEIFunction = (data) => {
  let sumObject = {
    "DISTRICT": [],
    "spei_03": [],
    "spei_06": [],
    "spei_12": [],
  };

  data.forEach(obj => {
    if (Array.isArray(obj["spei_03"])) {
      sumObject["spei_03"].push(obj["spei_03"]);
    }
    if (Array.isArray(obj["spei_06"])) {
      sumObject["spei_06"].push(obj["spei_06"]);
    }
    if (Array.isArray(obj["spei_12"])) {
      sumObject["spei_12"].push(obj["spei_12"]);
    }
    sumObject["DISTRICT"].push(obj["DISTRICT"]);
  });

  sumObject["spei_03"] = sumObject["spei_03"].length > 0 ? averageArrayOfArrays(sumObject["spei_03"]) : [];
  sumObject["spei_06"] = sumObject["spei_06"].length > 0 ? averageArrayOfArrays(sumObject["spei_06"]) : [];
  sumObject["spei_12"] = sumObject["spei_12"].length > 0 ? averageArrayOfArrays(sumObject["spei_12"]) : [];

  return sumObject;
}


export const WaterProductivityWeightedMeanStatsFunction = (data) => {

  let sumObject = {
    "PCP_irrigated": [],
    "AETI_irrigated": [],
    "TBP_irrigated": [],
    "Area_irrigated": 0,

    "PCP_rainfed": [],
    "AETI_rainfed": [],
    "TBP_rainfed": [],
    "Area_rainfed": 0,

    "PCP_overall": [],
    "AETI_overall": [],
    "TBP_overall": [],
    "Area_overall": 0,
  };

  data.forEach(obj => {
    if (Array.isArray(obj["PCP_irrigated"])) {
      sumObject["PCP_irrigated"].push(obj["PCP_irrigated"]);
    }
    if (Array.isArray(obj["AETI_irrigated"])) {
      sumObject["AETI_irrigated"].push(obj["AETI_irrigated"]);
    }
    if (Array.isArray(obj["TBP_irrigated"])) {
      sumObject["TBP_irrigated"].push(obj["TBP_irrigated"]);
    }
    if (Array.isArray(obj["PCP_rainfed"])) {
      sumObject["PCP_rainfed"].push(obj["PCP_rainfed"]);
    }
    if (Array.isArray(obj["AETI_rainfed"])) {
      sumObject["AETI_rainfed"].push(obj["AETI_rainfed"]);
    }
    if (Array.isArray(obj["TBP_rainfed"])) {
      sumObject["TBP_rainfed"].push(obj["TBP_rainfed"]);
    }
    if (Array.isArray(obj["AETI_overall"])) {
      sumObject["AETI_overall"].push(obj["AETI_overall"]);
    }
    if (Array.isArray(obj["TBP_overall"])) {
      sumObject["TBP_overall"].push(obj["TBP_overall"]);
    }
    if (Array.isArray(obj["PCP_overall"])) {
      sumObject["PCP_overall"].push(obj["PCP_overall"]);
    }

    sumObject["Area_irrigated"] += obj["Area_irrigated"];
    sumObject["Area_rainfed"] += obj["Area_rainfed"];
    sumObject["Area_overall"] += obj["Area_overall"];
  });

  const irrigatedAreas = data.map(obj => obj["Area_irrigated"]);
  const rainfedAreas = data.map(obj => obj["Area_rainfed"]);
  const overallAreas = data.map(obj => obj["Area_overall"]);

  sumObject["PCP_irrigated"] = sumObject["PCP_irrigated"].length > 0 ? weighted_averageArrayOfArrays(sumObject["PCP_irrigated"], irrigatedAreas) : [];
  sumObject["AETI_irrigated"] = sumObject["AETI_irrigated"].length > 0 ? weighted_averageArrayOfArrays(sumObject["AETI_irrigated"], irrigatedAreas) : [];
  sumObject["TBP_irrigated"] = sumObject["TBP_irrigated"].length > 0 ? weighted_averageArrayOfArrays(sumObject["TBP_irrigated"], irrigatedAreas) : [];

  sumObject["PCP_rainfed"] = sumObject["PCP_rainfed"].length > 0 ? weighted_averageArrayOfArrays(sumObject["PCP_rainfed"], rainfedAreas) : [];
  sumObject["AETI_rainfed"] = sumObject["AETI_rainfed"].length > 0 ? weighted_averageArrayOfArrays(sumObject["AETI_rainfed"], rainfedAreas) : [];
  sumObject["TBP_rainfed"] = sumObject["TBP_rainfed"].length > 0 ? weighted_averageArrayOfArrays(sumObject["TBP_rainfed"], rainfedAreas) : [];

  sumObject["PCP_overall"] = sumObject["PCP_overall"].length > 0 ? weighted_averageArrayOfArrays(sumObject["PCP_overall"], overallAreas) : [];
  sumObject["AETI_overall"] = sumObject["AETI_overall"].length > 0 ? weighted_averageArrayOfArrays(sumObject["AETI_overall"], overallAreas) : [];
  sumObject["TBP_overall"] = sumObject["TBP_overall"].length > 0 ? weighted_averageArrayOfArrays(sumObject["TBP_overall"], overallAreas) : [];

  return sumObject;
}




export const WaterProductivityMeanStatsFunction = (data) => {

  let sumObject = {
    // "DISTRICT": [],
    "PCP_irrigated": [],
    "AETI_irrigated": [],
    "NPP_irrigated": [],
    "Area_irrigated": 0,

    "PCP_rainfed": [],
    "AETI_rainfed": [],
    "NPP_rainfed": [],
    "Area_rainfed": 0,

    "PCP_overall":[],
    "AETI_overall": [],
    "NPP_overall": [],
    "Area_overall": [],


  };

  data.forEach(obj => {
    if (Array.isArray(obj["PCP_irrigated"])) {
      sumObject["PCP_irrigated"].push(obj["PCP_irrigated"]);
    }
    if (Array.isArray(obj["AETI_irrigated"])) {
      sumObject["AETI_irrigated"].push(obj["AETI_irrigated"]);
    }
    if (Array.isArray(obj["NPP_irrigated"])) {
      sumObject["NPP_irrigated"].push(obj["NPP_irrigated"]);
    }
    if (Array.isArray(obj["PCP_rainfed"])) {
      sumObject["PCP_rainfed"].push(obj["PCP_rainfed"]);
    }
    if (Array.isArray(obj["AETI_rainfed"])) {
      sumObject["AETI_rainfed"].push(obj["AETI_rainfed"]);
    }
    if (Array.isArray(obj["NPP_rainfed"])) {
      sumObject["NPP_rainfed"].push(obj["NPP_rainfed"]);
    }
    if (Array.isArray(obj["AETI_overall"])) {
      sumObject["AETI_overall"].push(obj["AETI_overall"]);
    }
    if (Array.isArray(obj["NPP_overall"])) {
      sumObject["NPP_overall"].push(obj["NPP_overall"]);
    }
    if (Array.isArray(obj["PCP_overall"])) {
      sumObject["PCP_overall"].push(obj["PCP_overall"]);
    }
    
    sumObject["Area_irrigated"] += obj["Area_irrigated"];
    sumObject["Area_rainfed"] += obj["Area_rainfed"];
    sumObject["Area_overall"] += obj["Area_overall"];
  });

  sumObject["PCP_irrigated"] = sumObject["PCP_irrigated"].length > 0 ? averageArrayOfArrays(sumObject["PCP_irrigated"]) : [];
  sumObject["AETI_irrigated"] = sumObject["AETI_irrigated"].length > 0 ? averageArrayOfArrays(sumObject["AETI_irrigated"]) : [];
  sumObject["NPP_irrigated"] = sumObject["NPP_irrigated"].length > 0 ? averageArrayOfArrays(sumObject["NPP_irrigated"]) : [];

  sumObject["PCP_rainfed"] = sumObject["PCP_rainfed"].length > 0 ? averageArrayOfArrays(sumObject["PCP_rainfed"]) : [];
  sumObject["AETI_rainfed"] = sumObject["AETI_rainfed"].length > 0 ? averageArrayOfArrays(sumObject["AETI_rainfed"]) : [];
  sumObject["NPP_rainfed"] = sumObject["NPP_rainfed"].length > 0 ? averageArrayOfArrays(sumObject["NPP_rainfed"]) : [];

  sumObject["AETI_overall"] = sumObject["AETI_overall"].length > 0 ? averageArrayOfArrays(sumObject["AETI_overall"]) : [];
  sumObject["NPP_overall"] = sumObject["NPP_overall"].length > 0 ? averageArrayOfArrays(sumObject["NPP_overall"]) : [];
  sumObject["PCP_overall"] = sumObject["PCP_overall"].length > 0 ? averageArrayOfArrays(sumObject["PCP_overall"]) : [];



  return sumObject;
}



// export const SelectedFeaturesSimpleAverageStatsFunction = (data) => {
//   let sumObject = {
//     "AREA": 0,
//     "PCP": [],
//     "AETI": [],
//     "NPP": [],
//     "RET": [],
//     "AridityIndex": [],
//     "ETG": [],
//     "ETB": [],
  
//   };


//   data.forEach(obj => {
//     sumObject["AREA"] += obj["AREA"];
//     sumObject["PCP"] = averageArrayOfArrays(data.map(obj => [...obj["PCP"]]));
//     sumObject["AETI"] = averageArrayOfArrays(data.map(obj => [...obj["AETI"]]));
//     sumObject["NPP"] = averageArrayOfArrays(data.map(obj => [...obj["NPP"]]));
//     sumObject["RET"] = averageArrayOfArrays(data.map(obj => [...obj["RET"]]));
//     sumObject["AridityIndex"] = averageArrayOfArrays(data.map(obj => [...obj["AridityIndex"]]));

//     sumObject["ETG"] = averageArrayOfArrays(data.map(obj => [...obj["ETG"]]));
//     sumObject["ETB"] = averageArrayOfArrays(data.map(obj => [...obj["ETB"]]));

//   });

//   return sumObject;
// }




export const SelectedFeaturesCroplandStatFunction = (data) => {
  let sumObject = {
    "Rainfed": 0,
    "WaPOR_LCC": [],
    // "ESA_Landcover": [],
    "Irrigated":0,
  };


  data.forEach(obj => {
    sumObject["Rainfed"] += obj["Rainfed"];
    sumObject["Irrigated"] += obj["Irrigated"];
    sumObject["WaPOR_LCC"] = sumArrayOfArrays(data.map(obj => [...obj["WaPOR_LCC"]]));
    // sumObject["ESA_Landcover"] = sumArrayOfArrays(data.map(obj => [...obj["ESA_Landcover"]]));

  });

  return sumObject;
}

export const sumArrayOfArrays = (arrays) => {
  if (arrays.length === 0 || arrays[0].length === 0) {
    return [];
  }

  const arrayLength = arrays[0].length;
  let sumArray = new Array(arrayLength).fill(0);

  arrays.forEach(array => {
    for (let i = 0; i < arrayLength; i++) {
      sumArray[i] += array[i];
    }
  });

  return sumArray;
}


export const averageArrayOfArrays = (arrays) => {
  if (arrays.length === 0 || arrays[0].length === 0) {
    return [];
  }

  const numArrays = arrays.length;
  const arrayLength = arrays[0].length;

  let sumArray = new Array(arrayLength).fill(0);

  arrays.forEach(array => {
    for (let i = 0; i < arrayLength; i++) {
      sumArray[i] += array[i];
    }
  });

  let averages = sumArray.map(sum => Math.round((sum / numArrays) * 1000) / 1000);
  return averages;
}






export const SelectedFeaturesWeightedHydronomicFunc = (data) => {
  let sumObject = {
    "AETI": [],
    "PCP": [],
    "ZonesArea": [],
  };

  // Return early if data is empty to avoid errors
  if (data.length === 0) {
    return sumObject;
  }

  const areas = data.map(obj => obj["ZonesArea"]);

  sumObject["AETI"] = weighted_averageArrayOfArrays_fromAreaArray(data.map(obj => [...obj["AETI"]]), areas);
  sumObject["PCP"] = weighted_averageArrayOfArrays_fromAreaArray(data.map(obj => [...obj["PCP"]]), areas);
  sumObject["ZonesArea"] = areas[0].map((_, i) => areas.reduce((sum, arr) => sum + arr[i], 0));

  return sumObject;
};



const weighted_averageArrayOfArrays_fromAreaArray = (arrays, weights) => {
  if (arrays.length === 0 || arrays[0].length === 0 || weights.length === 0) {
    return [];
  }

  const numArrays = arrays.length;
  const arrayLength = arrays[0].length;

  let sumArray = new Array(arrayLength).fill(0);
  let totalWeights = new Array(arrayLength).fill(0);

  arrays.forEach((array, index) => {
    const weightArray = weights[index];
    for (let i = 0; i < arrayLength; i++) {
      sumArray[i] += array[i] * weightArray[i];
      totalWeights[i] += weightArray[i];
    }
  });

  let weightedAverages = sumArray.map((sum, idx) => totalWeights[idx] !== 0 ? Math.round((sum / totalWeights[idx]) * 1000) / 1000 : 0);
  return weightedAverages;
};

// export const convertToTimestamps = (dateStrings) => {
//   return dateStrings.map(dateString => {
//       const [year, month] = dateString.split("-");
//       const date = new Date(year, month - 1);  
//       return date.getTime();  // Gets the timestamp in milliseconds
//   });
// }




export const SelectedFeaturesWeightedAverageStatsFunction = (data) => {
  let sumObject = {
    "AREA": 0,
    "PCP": [],
    "AETI": [],
    "TBP": [],
    "RET": [],
    "ETB": [],
  };

  const areas = data.map(obj => obj["AREA"]);


  data.forEach(obj => {
    sumObject["AREA"] += obj["AREA"];
    sumObject["PCP"] = weighted_averageArrayOfArrays(data.map(obj => [...obj["PCP"]]), areas);
    sumObject["AETI"] = weighted_averageArrayOfArrays(data.map(obj => [...obj["AETI"]]), areas);
    sumObject["TBP"] = weighted_averageArrayOfArrays(data.map(obj => [...obj["TBP"]]), areas);
    sumObject["RET"] = weighted_averageArrayOfArrays(data.map(obj => [...obj["RET"]]), areas);
    sumObject["ETB"] = weighted_averageArrayOfArrays(data.map(obj => [...obj["ETB"]]), areas);
  });

  return sumObject;
}


export const weighted_averageArrayOfArrays = (arrays, weights) => {
  if (arrays.length === 0 || arrays[0].length === 0 || weights.length === 0) {
    return [];
  }

  const numArrays = arrays.length;
  const arrayLength = arrays[0].length;

  let sumArray = new Array(arrayLength).fill(0);
  let totalWeights = new Array(arrayLength).fill(0);

  arrays.forEach((array, index) => {
    const weight = weights[index];
    for (let i = 0; i < arrayLength; i++) {
      sumArray[i] += array[i] * weight;
      totalWeights[i] += weight;
    }
  });

  let weightedAverages = sumArray.map((sum, idx) => Math.round((sum / totalWeights[idx]) * 1000) / 1000);
  return weightedAverages;
}


