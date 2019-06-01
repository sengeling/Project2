(async function() {
	// Get the basic prescribing data
	// This is also the quickest way to get state names and populate dropdown
	const prescribingData = await d3.json("/api/prescribing");
	const stateNames = prescribingData.map(d => d.state);
	
	populateDropdown(stateNames);
	
	// Initialize the time series plot with the first state in the menu
	menuChanged(stateNames[0]);

})();




// Function to populate the dropdown menu for selecting data by state
// stateNames: an array of strings which will become dropdown menu items
function populateDropdown (stateNames) {
	let dropDown = d3.select("#state-form");

	stateNames.forEach(s => {
		dropDown
			.append("option")
			.text(s)
			.property("value", s);
	});
}



// Event handler for when dropdown menu changes
function menuChanged (value) {
	updateTimePlot(value);
	updateScatterPlots(value);
}



// Function to create time series plot of prescription rates
// and death rates, at the state level.
async function updateTimePlot (value) {
	const rawStateData = await d3.json("/api/states");
	const data = rawStateData.filter(d => d.state == value);

	const prescribingData = data.filter(d => d.prescribing_rate > 0);

	const years = data.map(d => d.year);

	const heroinData = data.filter(d => d.heroin_death_rate > 0);
	const methadoneData = data.filter(d => d.methadone_death_rate > 0);
	const opioidData = data.filter(d => d.other_opioids_death_rate > 0);
	const syntheticData = data.filter(d => d.other_synthetics_death_rate > 0);

	const heroinTrace = {
		type: "scatter",
		name: "Heroin Death Rate",
		x: heroinData.map(d => d.year),
		y: heroinData.map(d => d.heroin_death_rate),
		line: {
			dash: 'dot'
		},
		marker: {
			symbol: 'triangle-right'
		}
	};

	const methadoneTrace = {
		type: "scatter",
		name: "Methadone Death Rate",
		x: methadoneData.map(d => d.year),
		y: methadoneData.map(d => d.methadone_death_rate),
		line: {
			dash: 'dash'
		},
		marker: {
			symbol: 'x'
		}
	};

	const opioidsTrace = {
		type: "scatter",
		name: "Prescription Opioid Death Rate",
		x: opioidData.map(d => d.year),
		y: opioidData.map(d => d.other_opioids_death_rate),
		marker: {
			symbol: 'circle-open'
		}
	};

	const syntheticTrace = {
		type: "scatter",
		name: "Synthetic Opioid Death Rate",
		x: syntheticData.map(d => d.year),
		y: syntheticData.map(d => d.other_synthetics_death_rate),
		line: {
			dash: 'dashdot'
		},
		marker: {
			symbol: 'square'
		}
	};

	const prescribingTrace = {
		type: "scatter",
		mode: "lines",
		name: "Opioid Prescription Rate",
		x: prescribingData.map(d => d.year),
		y: prescribingData.map(d => d.prescribing_rate),
		yaxis: 'y2',
		line: {
			color: 'black'
		}
	};

	const plotData = [heroinTrace, methadoneTrace, opioidsTrace, syntheticTrace, prescribingTrace];

	const layout = {
		yaxis: {
			title: "Deaths per 100,000 People"
		},
		yaxis2: {
			title: "Prescriptions per 100,000 People",
			overlaying: 'y',
			side: 'right'
		},
		showlegend: true,
		legend: {
			x: 0,
			y: 1
		}
	};

	Plotly.newPlot('time-series', plotData, layout);
}



// Function to calculate linear regression
function linearRegression(y, x) {
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {

        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
    }

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
    lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

    return lr;
}

// Function to create trace of linear regression
function bestFitTrace(lr, x, xaxis, yaxis) {
    xMin = Math.min(...x);
    xMax = Math.max(...x);
    m = lr['slope'];
    b = lr['intercept'];
    newX = [xMin, xMax];
    newY = [m * xMin + b, m * xMax + b];
    return {
        x: newX,
        y: newY,
        type: 'scatter',
        mode: 'lines',
        hoverinfo: 'x+y',
        xaxis: xaxis,
        yaxis: yaxis
    };
}

// Function to do update scatterplots
// Value is the name of the state
async function updateScatterPlots (value) {
	const data = await d3.json("/api/"+value);

	const heroinF = data.filter(d => d.heroin_death_rate > 0);
	const heroinX = heroinF.map(d => d.mean_prescribing_rate);
	const heroinY = heroinF.map(d => d.heroin_death_rate);

	const opioidF = data.filter(d => d.other_opioids_death_rate > 0);
	const opioidX = opioidF.map(d => d.mean_prescribing_rate);
	const opioidY = opioidF.map(d => d.other_opioids_death_rate);

	const methadoneF = data.filter(d => d.methadone_death_rate > 0);
	const methadoneX = methadoneF.map(d => d.mean_prescribing_rate);
	const methadoneY = methadoneF.map(d => d.methadone_death_rate);

	const syntheticF = data.filter(d => d.other_synthetics_death_rate > 0);
	const syntheticX = syntheticF.map(d => d.mean_prescribing_rate);
	const syntheticY = syntheticF.map(d => d.other_synthetics_death_rate);

	let heroinTrace = {
		x: heroinX,
		y: heroinY,
		type: 'scatter',
		mode: 'markers',
		hoverinfo: 'x+y'
	};

	let opioidTrace = {
		x: opioidX,
		y: opioidY,
		xaxis: 'x2',
		yaxis: 'y2',
		type: 'scatter',
		mode: 'markers',
		hoverinfo: 'x+y'
	};

	let methadoneTrace = {
		x: methadoneX,
		y: methadoneY,
		xaxis: 'x3',
		yaxis: 'y3',
		type: 'scatter',
		mode: 'markers',
		hoverinfo: 'x+y'
	};

	let syntheticTrace = {
		x: syntheticX,
		y: syntheticY,
		xaxis: 'x4',
		yaxis: 'y4',
		type: 'scatter',
		mode: 'markers',
		hoverinfo: 'x+y'
	};

    lrHeroin = linearRegression(heroinY, heroinX);
    lrHeroinTrace = bestFitTrace(lrHeroin, heroinX, "x", "y");

    lrOpioid = linearRegression(opioidY, opioidX);
    lrOpioidTrace = bestFitTrace(lrOpioid, opioidX, "x2", "y2");

    lrMeth = linearRegression(methadoneY, methadoneX);
    lrMethTrace = bestFitTrace(lrMeth, methadoneX, "x3", "y3");

    lrSynth = linearRegression(syntheticY, syntheticX);
    lrSynthTrace = bestFitTrace(lrSynth, syntheticX, "x4", "y4");

    let scatterData = [heroinTrace, opioidTrace, methadoneTrace, syntheticTrace, lrHeroinTrace, lrOpioidTrace, lrMethTrace, lrSynthTrace];

	//let scatterData = [heroinTrace, opioidTrace, methadoneTrace, syntheticTrace];

	let layout = {
		grid: {rows: 2, columns: 2, pattern: 'independent'},
		title: "Prescription Rates (X Axis) vs. Death Rates (Y Axis)",
		showlegend: false,
		xaxis4: {
			tick0: 10,
			dtick: 20
		},
		yaxis: {
			dtick: 1,
			title: 'Heroin'
		},
		yaxis2: {
			dtick: 1,
			title: 'Opioids'
		},
		yaxis3: {
			rangemode: 'tozero',
			tick0: 0,
			dtick: 0.5,
			title: 'Methadone'
		},
		yaxis4: {
			rangemode: 'tozero',
			tick0: 0,
			dtick: 0.5,
			title: 'Synthetic'
		}
	};

	Plotly.newPlot('scatterplots', scatterData, layout);
}