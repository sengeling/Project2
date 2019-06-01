(async function() {
	// Get the basic prescribing data
	// This is also the quickest way to get state names and populate dropdown
	const prescribingData = await d3.json("/api/prescribing");

	const stateNames = prescribingData.map(d => d.state);
	
	populateDropdown(stateNames);
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