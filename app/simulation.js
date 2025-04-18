// const fs = require('fs');
// Helper Functions
function getNormalDistributionValue(mean, std_dev) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let standardNormal = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return Math.max(0, Math.floor(mean + standardNormal * std_dev));
}

// First Step Compute the monthly cost for the bins for recyclable and garbage
function generateOriginalCompanyStats(state, combinedInputFormat) {
    state.RegularCostGarbage = combinedInputFormat.companySetting.regularBinCostMonthlyPerBin * combinedInputFormat.companySetting.generalBins;
    state.RegularCostRecyclable = combinedInputFormat.companySetting.recyclableBinCostMonthlyPerBin * combinedInputFormat.companySetting.recyclableBins;
    return state;
}

// Last Step Computes Annual Cost for the bins and then returns the final cost per month for benchmarking
function computeFinalCost(state) {
    // Compute the final cost based on the state
    const total_cost =
        state.RegularCostGarbage +
        state.RegularCostRecyclable +
        state.TotalCostAdhocGarbage +
        state.TotalCostAdhocRecyclable;
    return total_cost / 12;
}

function computeMonthlyAdhocCost(state) {
    // Compute the monthly adhoc cost based on the state
    const total_cost = state.TotalCostAdhocGarbage + state.TotalCostAdhocRecyclable;
    return total_cost / 12;
}
function getBinsLoad(state) {
    // Get the bins load based on the state and combined input format
    const binsLoad = {
        general: state.CurrentMaximalLoadInDay / 660,
        recyclable: state.CurrentMaximalLoadInDayRecyclable/ 660
    };
    return binsLoad;
}

// Simulation Logic Based on sim_time
function runOneIter(state, combinedInputFormat, sim_time, interThrowCounter) {

    // Fixed offset Start Time for Simulation to be 1500
    const garbageCollectionOffsetStartTime = 18; 
    const overflowThresholdRatio = 1.2; // 20% overflow threshold

    


    // Frequency of throwing garbage in bins (in hours) by default
    let interThrowInterval = [24]; 
    let interThrowCounterLocal = interThrowCounter

    if (parseInt(combinedInputFormat.companySetting.garbageTimesClearedPerDay) === 2){
        // If the times cleared is 2 then it is cleared at 1500 and at 2100 which is 6 hours gap then followed by a 18 hours gap
        interThrowInterval=[6,18]
    }

    


    // Step 1a Accumulate Garbage Every day 
    if ((sim_time - combinedInputFormat.garbageThrowingTime) % 24 === 0) {
        const loadAmountMean = parseInt(combinedInputFormat.foodOps.dailyLoadGeneral) + parseInt(combinedInputFormat.office.dailyLoadGeneral) + parseInt(combinedInputFormat.others.dailyLoadGeneral);
        state.CurrentTotalVolumeGarbage += getNormalDistributionValue(loadAmountMean,loadAmountMean * 0.1);
    }

    // Step 1b Accumulate Recyclable Every day
    if ((sim_time - combinedInputFormat.recyclableThrowingTime) % 24 === 0) {
        const loadAmountMean = parseInt(combinedInputFormat.foodOps.dailyLoadRecycled) + parseInt(combinedInputFormat.office.dailyLoadRecycled) + parseInt(combinedInputFormat.others.dailyLoadRecycled);
        state.CurrentTotalVolumeRecyclable += getNormalDistributionValue(loadAmountMean, loadAmountMean * 0.1);
    }


    // Independent Steps
    // Step 1c Every month add regular cost for bins to total cost
    if (sim_time % (30 * 24) === 0) {
        state.RegularCostGarbage += combinedInputFormat.companySetting.regularBinCostMonthlyPerBin * combinedInputFormat.companySetting.generalBins;
        state.RegularCostRecyclable += combinedInputFormat.companySetting.recyclableBinCostMonthlyPerBin * combinedInputFormat.companySetting.recyclableBins;
    }

    // Check if the bins are overfilled and is only first occurance 
    if (state.CurrentTotalVolumeGarbage >= overflowThresholdRatio* combinedInputFormat.companySetting.generalBins * 660 && state.GarbageAdhocTriggerDelay === 0 ) {
        state.GarbageBinsOverfilled += 1;
    }
    if (state.CurrentTotalVolumeRecyclable >= overflowThresholdRatio * combinedInputFormat.companySetting.recyclableBins * 660 && state.RecyclableAdhocTriggerDelay === 0) {
        state.RecyclableBinsOverfilled += 1;
    }

    // Maximal Load Tracking
    if ((sim_time - 1) % 24 === 0) {
        // Reset the maximal load every day after the tracker is updated
        state.CurrentMaximalLoadInDay = 0;
    }
    else {
        // Update the maximal load in a day
        state.CurrentMaximalLoadInDay = Math.max(state.CurrentMaximalLoadInDay, state.CurrentTotalVolumeGarbage);
    }
    if ((sim_time - 1) % (24*7) === 0) {
        // Reset the maximal load every week after the tracker is updated
        state.CurrentMaximalLoadInDayRecyclable = 0;
    }
    else {
        // Update the maximal load in a week
        state.CurrentMaximalLoadInDayRecyclable = Math.max(state.CurrentMaximalLoadInDayRecyclable, state.CurrentTotalVolumeRecyclable);
    }

    // Step 2A: Regular Clear Every Day for Garbage based on intervals
    // Doesn't use the interthrowcounter as it is not needed for 1 interval
    if (interThrowInterval.length === 1) {
        // Clear if time met
        if ((sim_time - garbageCollectionOffsetStartTime) % interThrowInterval[0] === 0) {
            state.CurrentTotalVolumeGarbage = 0;

        }
    }

    // Uses the interthrowcounter to check which modulo it should use to check if sim time is there for the garbage to be cleared
    else if (interThrowInterval.length === 2) {
        // Clear if time met
        if ((sim_time - garbageCollectionOffsetStartTime) % interThrowInterval[interThrowCounterLocal] === 0) {
            state.CurrentTotalVolumeGarbage = 0;
            interThrowCounterLocal = (interThrowCounterLocal + 1) % interThrowInterval.length;
        }
    }

    else {
        throw new Error("Invalid interThrowInterval length. Expected 1 or 2.");
    }

    // Step 2B: Regular Clear Every Week for Recyclable
    if ((sim_time - garbageCollectionOffsetStartTime) % (24 * 7) === 0) {
        state.CurrentTotalVolumeRecyclable = 0;
    }


    // Step 3 Adhoc Clearings for Garbage and Recyclable
    const maxGarbageVol = overflowThresholdRatio * combinedInputFormat.companySetting.generalBins * 660
    const maxRecyclableVol = overflowThresholdRatio * combinedInputFormat.companySetting.recyclableBins * 660


    // Adhoc Trigger Delay is 3 hours for garbage and 3 hour for recyclable
    if (state.CurrentTotalVolumeGarbage >= maxGarbageVol) {
        if (state.GarbageAdhocTriggerDelay === 0) {
            // Adhoc clearing for garbage
            console.log("Adhoc Garbage Clearing Triggered")
            // 3 hours delay for adhoc clearing
            state.GarbageAdhocTriggerDelay  = 3 ;
        }
        else if (state.GarbageAdhocTriggerDelay === 3 || state.GarbageAdhocTriggerDelay === 2) {
            state.GarbageAdhocTriggerDelay -= 1; // Decrease the delay
        }

        // Clear garbage if Adhoc Trigger Delay is 1
        if (state.GarbageAdhocTriggerDelay === 1) {
            state.NumberOfAdhocClearingsGarbage += 1;
            state.CurrentTotalVolumeGarbage = 0;
            state.GarbageAdhocTriggerDelay = 0; // Reset the delay
            state.TotalCostAdhocGarbage += parseInt(combinedInputFormat.companySetting.costAdhoc);
        }
    }

    if (state.CurrentTotalVolumeRecyclable >= maxRecyclableVol) {
        if (state.RecyclableAdhocTriggerDelay === 0) {
            state.RecyclableAdhocTriggerDelay = 3; // 3 hours delay for adhoc clearing
        }
        else if (state.RecyclableAdhocTriggerDelay === 3 || state.RecyclableAdhocTriggerDelay === 2) {
            state.RecyclableAdhocTriggerDelay -= 1; // Decrease the delay
        }
        // Clear recyclable if Adhoc Trigger Delay is 1
        if (state.RecyclableAdhocTriggerDelay === 1) {
            state.RecyclableAdhocTriggerDelay = 0; // Reset the delay
            state.NumberofAdhocClearingsRecyclable += 1;
            state.CurrentTotalVolumeRecyclable = 0;
            state.TotalCostAdhocRecyclable += parseInt(combinedInputFormat.companySetting.costAdhoc);
        }        
    }

    return state, interThrowCounterLocal;
}

// Main Loop to get output for the simulation
function completeSimulation(state,combinedInputFormat,cut_time, return_sample_intervals, garbageThrowingTime = 15, recyclableThrowingTime = 21) {
    let runSim = true;
    let sim_time = 1;
    let interThrowCounter = 0;
    combinedInputFormat.garbageThrowingTime = garbageThrowingTime;
    combinedInputFormat.recyclableThrowingTime = recyclableThrowingTime;
    // Generates State Tracker based on Intervals
    const returnStateList = [];
    while (runSim) {
        state,interThrowCounter = runOneIter(state, combinedInputFormat, sim_time,interThrowCounter);
        if (sim_time % return_sample_intervals === 0) {
            returnStateList.push({ ...state, sim_time: sim_time });
        }

        if (sim_time >= cut_time) {
            runSim = false;
            return returnStateList;
        } else {
            sim_time += 1;
        }
    }
}

function getRecommendations(finalState, binsOverfilled) {
    // If cost> 3000 then it is over the threshold
    let recommendations = "";
    const thresholdCost = 3000;
    if (finalState.NumberOfAdhocClearingsGarbage > 30) {
        recommendations += "Adhoc Garbage Clearings are too high>30. Consider increasing the number of bins.\n";
    }
    if (finalState.NumberofAdhocClearingsRecyclable > 30) {
        recommendations += "Adhoc Recyclable Clearings are too high>30. Consider increasing the number of bins.\n";
    }

    // Group by days in intervals of 7 days
    const dictDaysOverfilled = {}
    for (let i = 0; i < binsOverfilled.length; i++) {
        const date = binsOverfilled[i].date;
        const day = parseInt(date.split(" ")[1]) % 7 + 1; 
        if (!dictDaysOverfilled[day]) {
            dictDaysOverfilled[day] = { general: 0, recyclable: 0 };
        }
        dictDaysOverfilled[day].general += binsOverfilled[i].general;
    }

    // get top 2 days for bins overfilled
    const topDays = Object.entries(dictDaysOverfilled).sort((a, b) => {
        return (b[1].general + b[1].recyclable) - (a[1].general + a[1].recyclable);
    }).slice(0, 2);

    for (let i = 0; i < topDays.length; i++) {
        const day = topDays[i][0];
        const general = topDays[i][1].general;
        if (general > 10) {
            recommendations += `Consider adding more bin collections on Day ${day} as the number of overfills is ${general} times.\n`;
        }
    }
    if (recommendations === "") {
        recommendations = "No recommendations needed. The set up is working well.\n";
    }
    return recommendations;
}


function processStateListToOutputDict(stateList,cutTime){
    // Process the state list to get the output format
    const outputDict = {
        "binsLoad": [],
        "binsOverfilled": [],
        "adhocTrips": [],
        "statistics": {}
    }
    

    const binsLoad = []
    const binsOverfilled = []
    const adhocTrips = []


    for (let i = 0; i < stateList.length; i++) {
        const state = stateList[i];
        let prevState = null; // Initialize prevState to null
        if (i === 0) {
            prevState = {
                CurrentTotalVolumeGarbage: 0,
                CurrentTotalVolumeRecyclable: 0,
                GarbageBinsOverfilled: 0,
                RecyclableBinsOverfilled: 0,
                NumberOfAdhocClearingsGarbage: 0,
                NumberofAdhocClearingsRecyclable: 0,
                RegularCostGarbage: 0,
                RegularCostRecyclable: 0,
                TotalCostAdhocGarbage: 0,
                TotalCostAdhocRecyclable: 0,
            };
        }
        else {
            prevState = stateList[i - 1];
        }

        const binsLoadState = getBinsLoad(state);
        const day = `Day ${Math.ceil(state.sim_time / 24)}`;

        binsLoad.push({
            date: day,
            general: binsLoadState.general,
            recyclable: binsLoadState.recyclable
        });

        // Calculate the number of bins overfilled for that day
        binsOverfilled.push({
            date: day,
            general: state.GarbageBinsOverfilled - prevState.GarbageBinsOverfilled,
            recyclable: state.RecyclableBinsOverfilled - prevState.RecyclableBinsOverfilled
        });
        
        // Calculate the number of adhoc trips for that day
        adhocTrips.push({
            date: day,
            value: state.NumberOfAdhocClearingsGarbage - prevState.NumberOfAdhocClearingsGarbage + state.NumberofAdhocClearingsRecyclable - prevState.NumberofAdhocClearingsRecyclable
        });
    }
    outputDict.binsLoad = binsLoad;
    outputDict.binsOverfilled = binsOverfilled;
    outputDict.adhocTrips = adhocTrips;

    // Baseline statistics
    outputDict.statistics = {
        "averageMonthlyCost": computeFinalCost(stateList[stateList.length - 1]),
        "monthlyAdhocCost": computeMonthlyAdhocCost(stateList[stateList.length - 1]),
        "monthsElapsed": cutTime/24/30,
        "recommendations": getRecommendations(stateList[stateList.length - 1], binsOverfilled),
    }

    return outputDict
}




function generateResult(combinedInputFormat, logging = false) {
    // Global Simulation States
    // Input States global Unchanged universal
    const initState = {
        CurrentTotalVolumeGarbage: 0,
        CurrentTotalVolumeRecyclable: 0,
        GarbageBinsOverfilled: 0,
        RecyclableBinsOverfilled: 0,
        NumberOfAdhocClearingsGarbage: 0,
        NumberofAdhocClearingsRecyclable: 0,
        RegularCostGarbage: 0,
        RegularCostRecyclable: 0,
        TotalCostAdhocGarbage: 0,
        TotalCostAdhocRecyclable: 0,
        GarbageAdhocTriggerDelay: 0,
        RecyclableAdhocTriggerDelay: 0,
        CurrentMaximalLoadInDay: 0,
        CurrentMaximalLoadInDayRecyclable: 0,
    };
    // Simulation Parameters
    const cutTime = 24 * 365; 
    // Report Everyday
    const reportingInterval = 24;
    // Input Format for the simulation
    const oriState = generateOriginalCompanyStats(initState, combinedInputFormat);
    const returnStateList = completeSimulation(oriState, combinedInputFormat, cutTime, reportingInterval);
    const finalOutput = processStateListToOutputDict(returnStateList,cutTime);

    if (logging) {
        // Logging the output
        fs.writeFile('simulation_results.json', JSON.stringify(returnStateList, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Simulation results saved to simulation_results.json');
            }
        });

        fs.writeFile('simulation_output.json', JSON.stringify(finalOutput, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Simulation output saved to simulation_output.json');
            }
        });
    }

    return finalOutput;
}

const combinedInputFormat = {
    "foodOps": {
        "dailyLoadGeneral": 620,
        "dailyLoadRecycled": 20,
    },
    "office": {
        "dailyLoadGeneral": 400,
        "dailyLoadRecycled": 20,

    },
    "others": {
        "dailyLoadGeneral": 1000,
        "dailyLoadRecycled": 20,
    },
    "companySetting" :{
        "costAdhoc": 100,
        "regularBinCostMonthlyPerBin": 500,
        "recyclableBinCostMonthlyPerBin": 200,
        "generalBins": 3,
        "recyclableBins": 1,
        "garbageTimesClearedPerDay": 2 // 1 or 2 only
    }    
}
exports.generateResult = generateResult;

// console.log(generateResult(combinedInputFormat, true));