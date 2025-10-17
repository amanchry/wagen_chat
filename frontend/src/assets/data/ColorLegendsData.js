// Value: [800, 600, 400, 200, 100, 50, 0],
// Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

// If value > 800 => #345ead
// If value > 600 => #5ba8d2
// If value > 400 => #c8ecf4
// If value > 200 => #fffbb1
// If value > 100 => #ffc469
// If value > 50 => #ff7c3d
// If value > 0 => #ca001b
// If value < 0 => #ca001b (last color)



export const ColorLegendsData = {
    Yearly_AETI: {
        Title: "Evapotranspiration (ET)",
        Unit: "AETI (mm/year)",
        Value: [1200, 1000, 800, 600, 400, 200, 0],
        Labels: [1200, 1000, 800, 600, 400, 200, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    Monthly_AETI: {
        Title: "Evapotranspiration (ET)",
        Unit: "AETI (mm/month)",
        Value: [20, 15, 10, 7, 4, 2, 0],
        Labels: [20, 15, 10, 7, 4, 2, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },

    Yearly_RET: {
        Title: "Ref. ET",
        Unit: "Ref. ET (mm/year)",
        Value: [1800, 1500, 1200, 900, 600, 300, 0],
        Labels: [1800, 1500, 1200, 900, 600, 300, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    Monthly_RET: {
        Title: "Ref. ET",
        Unit: "Ref. ET (mm/month)",
        Value: [300, 250, 200, 150, 100, 50, 0],
        Labels: [300, 250, 200, 150, 100, 50, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    Yearly_PCP_ET: {
        Title: "PCP-ET",
        Unit: "P-ET (mm/year)",
        Value: [600, 400, 200, 0, -200, -400, -600],
        Labels: [600, 400, 200, 0, -200, -400, -600],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    Monthly_PCP_ET: {
        Title: "PCP-ET",
        Unit: "P-ET (mm/month)",
        Value: [15, 10, 5, 0, -5, -10, -15],
        Labels: [15, 10, 5, 0, -5, -10, -15],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    Yearly_PCP: {
        Title: "Precipitation",
        Unit: "P (mm/year)",
        Value: [1200, 1000, 800, 600, 400, 200, 0],
        Labels:[1200, 1000, 800, 600, 400, 200, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    Monthly_PCP: {
        Title: "Precipitation",
        Unit: "P (mm/month)",
        Value: [40, 32, 24, 16, 8, 4, 0],
        Labels: [40, 32, 24, 16, 8, 4, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    // Biomass Legend= NPP*22022
    Yearly_TBP: {
        Title: "Biomass Production",
        Unit: "TBP (kg/ha/year)",
        Value: [24000, 20000, 16000, 12000, 8000, 4000, 0],
        Labels: [24000, 20000, 16000, 12000, 8000, 4000, 0],
        Colors: ["#00441B", "#0B7532", "#28924A", "#4AAF61", "#7FC97F", "#B1DFAA", "#F4FBF2"],

    },
    Monthly_TBP: {
        Title: "Biomass Production",
        Unit: "TBP (kg/ha/month)",
        Value: [200, 100, 50, 25, 10, 5, 0],
        Labels: [200, 100, 50, 25, 10, 5, 0],
        Colors: ["#00441B", "#0B7532", "#28924A", "#4AAF61", "#7FC97F", "#B1DFAA", "#F4FBF2"],

    },
    Yearly_ETB: {
        Title: "ET Blue",
        Unit: "ET Blue (mm/year)",
        Value: [900, 750, 600, 450, 300, 150, 0],
        Labels: [900, 750, 600, 450, 300, 150, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },
    Yearly_ETG: {
        Title: "ET Green",
        Unit: "ET Green (mm/year)",
        Value: [90, 75, 60, 45, 30, 15, 0],
        Labels: [90, 75, 60, 45, 30, 15, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },

    Yearly_WaterProductivity: {
        Title: "Biomass Water Productivity",
        Unit: "WP (kg/m³)",
        Value: [2.4, 2, 1.6, 1.2, 0.8, 0.4, 0],
        Labels: [2.4, 2, 1.6, 1.2, 0.8, 0.4, 0],
        Colors: ["#007938", "#90D857", "#D5F17E", "#FFF7A9", "#FFC568", "#FF793B", "#B9001F"],

    },



    Yearly_PET: {
        Title: "Potential ET",
        Unit: "Potential ET (mm/year)",
        Value: [6000, 5000, 4000, 3000, 2000, 1000, 0],
        Labels: [6000, 5000, 4000, 3000, 2000, 1000, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },









    Yearly_AridityIndex: {
        Title: "Aridity Index",
        Unit: "Aridity Index",
        Value: [1.2, 1, 0.8, 0.6, 0.4, 0.2, 0],
        Labels: [1.2, 1, 0.8, 0.6, 0.4, 0.2, 0],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1", "#ffc469", "#ff7c3d", "#ca001b"],

    },















    pcp_ssp585: {
        Title: "Precipitation (deviation)",
        Unit: "P (deviation) (mm/year)",
        Value: [200, 150, 100,50, 0, -50,-100, -150,-200],
        Labels: [200, 150, 100,50, 0, -50,-100, -150,-200],
        // Colors: ["#013087","#345ead", "#5ba8d2", "#6bcbff", "#c8ecf4", "#ff7c3d", "#ca001b"],
        Colors: ["#ca001b","#e43e21","#ff7c3d","#ffd96c","#fffbb1","#a5dde9","#5ba8d2","#436faa","#345ead"],

    },
    pcp_ssp245: {
        Title: "Precipitation (deviation)",
        Unit: "P (deviation) (mm/year)",
        Value: [200, 150, 100,50, 0, -50,-100, -150,-200],
        Labels: [200, 150, 100,50, 0, -50,-100, -150,-200],
        Colors: ["#ca001b","#e43e21","#ff7c3d","#ffd96c","#fffbb1","#a5dde9","#5ba8d2","#436faa","#345ead"],

    },
    tdeg_ssp245: {
        Title: "Temperature (deviation)",
        Unit: "T  (deviation) (°C)",
        Value: [2.5,2,1.5, 1, 0.5, 0, -0.5,-1,-1.5],
        Labels: [2.5,2,1.5, 1, 0.5, 0, -0.5,-1,-1.5],
        Colors: ["#ca001b","#e43e21","#ff7c3d","#ffd96c","#fffbb1","#a5dde9","#5ba8d2","#436faa","#345ead"],

    },
    tdeg_ssp585: {
        Title: "Temperature (deviation)",
        Unit: "T (deviation) (°C)",
        Value: [2.5,2,1.5, 1, 0.5, 0, -0.5,-1,-1.5],
        Labels: [2.5,2,1.5, 1, 0.5, 0, -0.5,-1,-1.5],
        Colors: ["#ca001b","#e43e21","#ff7c3d","#ffd96c","#fffbb1","#a5dde9","#5ba8d2","#436faa","#345ead"],

    },





    SPEI: {
        Title: "SPEI",
        Unit: "SPEI",
        Value: [2, 1.5, 1, -1, -1.5, -2],
        Labels: ['extremely wet', 'very wet', 'moderately wet', 'normal', 'moderately dry', 'severely dry', 'extremely dry'],
        // Colors: ["#04008B","#1771DE","#04F2FD", "#9AFA94", "#FDC403", "#DE2929", "#8B1A1B"],
        Colors: ["#345ead", "#5ba8d2", "#c8ecf4", "#fffbb1","#ffc469", "#ff7c3d", "#ca001b"],


    },

}

