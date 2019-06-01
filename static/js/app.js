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