(async function() {
    // API key
    const API_KEY = "pk.eyJ1IjoibWRvaWciLCJhIjoiY2p2am1sdXgyMGliNzQ0cXJ5bnpnM3V4cyJ9.p9ydINGmF7CEIV4VBA9sOA"

    // Retrieve GeoJSON and prescription rate/death rate data
    let stateBoundariesData = await d3.json('../static/js/state_boundaries.json');
    stateBoundariesData = stateBoundariesData.features

    let stateRatesData = await d3.csv('../static/js/states_rates.csv')

    // Transform prescription rate/death rate data into an object
    const stateRateReduce = stateRatesData.reduce((prevData, currentData) => {
        const state = currentData.state
        currentData.mean_prescribing_rate = +currentData.mean_prescribing_rate
        currentData.mean_opioids_death_rate = +currentData.mean_opioids_death_rate
        prevData[state.toLowerCase()] = currentData
        return prevData
    }, {})

    // Add rates to the GeoJSON properties using Object.assign()
    let states = stateBoundariesData.map(stateBoundary => {
        const state = stateBoundary.properties.NAME.toLowerCase()
        const property = stateRateReduce[state]
        stateBoundary.properties = Object.assign({}, stateBoundary.properties, property)
        return stateBoundary
    })

    // Create function to assign color based on prescription rate
    function prescriptionGetColor(r) {
            return r > 100 ? '#a50f15':
                    r > 90 && r <= 100 ? '#de2d26':
                    r > 80 && r <= 90 ? '#fb6a4a':
                    r > 70 && r <= 80 ? '#fc9272':
                    r > 60 && r <= 70 ? '#fcbba1':
                                        '#fee5d9'
    }

    // Create function to assign color based on death rate
    function deathGetColor(r) {
        return r > 10 ? '#006d2c':
                r > 8 && r <= 10 ? '#31a354':
                r > 6 && r <= 8 ? '#74c476':
                r > 4 && r <= 6 ? '#a1d99b':
                r > 2 && r <= 4 ? '#c7e9c0':
                                    '#edf8e9'
    }

    // Set style for prescription rate layer
    function prescriptionStyle(feature) {
        return {
            fillColor: prescriptionGetColor(feature.properties.mean_prescribing_rate),
            weight: 1.5,
            color: 'white',
            fillOpacity: 1
        }
    }

    // Set style for death rate layer
    function deathStyle(feature) {
        return {
            fillColor: deathGetColor(feature.properties.mean_opioids_death_rate),
            weight: 1.5,
            color: 'white',
            fillOpacity: 0.7
        }
    }

    // Define layers here so they're accessible to the event listeners
    let statePrescriptionRates
    let stateDeathRates

    // Event listener changes fill color of state
    function highlightFeature(e) {
        let layer = e.target
    
        layer.setStyle({
            fillColor: '#18C8ED',
            fillOpacity: 1
        })

        layer.bringToFront()
    }

    // Event listener resets state style for prescription rate layer
    function prescriptionResetHighlight(e) {
        statePrescriptionRates.resetStyle(e.target)
    }

    // Event listener resets state style for death rate layer
    function deathResetHighlight(e) {
        stateDeathRates.resetStyle(e.target)
    }

    // Assign events to event listener functions when adding to layers
    function prescriptionOnEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: prescriptionResetHighlight,
        })

        // Add tooltip for each state
        layer.bindTooltip(`<h5>${feature.properties.state}</h5>
            <p><strong>Mean prescribing rate:</strong> ${feature.properties.mean_prescribing_rate}<br>
            <strong>Mean death rate:</strong> ${feature.properties.mean_opioids_death_rate}</p>`
            )
    }

    function deathOnEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: deathResetHighlight,
        })

        // Add tooltip for each state
        layer.bindTooltip(`<h3>${feature.properties.state}</h3>
            <p><strong>Mean prescribing rate:</strong> ${feature.properties.mean_prescribing_rate}<br>
            <strong>Mean death rate:</strong> ${feature.properties.mean_opioids_death_rate}</p>`
            )
    }
    
    // Create GeoJSON layers for prescription rates and death rates
    statePrescriptionRates = L.geoJSON(states, {
        onEachFeature: prescriptionOnEachFeature,
        style: prescriptionStyle
    })

    stateDeathRates = L.geoJSON(states, {
        onEachFeature: deathOnEachFeature,
        style: deathStyle
    })

    // Define map layer
    const lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    })

    // Define baseMaps and overlayMaps objects to hold base and overlay layers
    const baseMaps = {
        'Base map' : lightMap
    }

    const overlayMaps = {
        'Prescribing rate': statePrescriptionRates,
        'Death rate': stateDeathRates
    }

    // Create map, specifying layers that will display on page load
    const map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3.5,
        layers: [lightMap, statePrescriptionRates]
    })

    // Create layer control and add to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
        hideSingleBase: true
    }).addTo(map)

    // Create legend and add to map
    const legend = L.control({position: 'bottomright'})

    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend'),
            prescriptionRates = [0, 60, 70, 80, 90, 100],
            deathRates = [0, 2, 4, 6, 8, 10]

        div.innerHTML = '<p><strong>Mean prescribing rate,<br>2006-17</strong></p>'

        for (var i = 0; i < prescriptionRates.length; i++) {
            div.innerHTML +=
                '<i style="background:' + prescriptionGetColor(prescriptionRates[i] + 1) + '"></i> ' +
                prescriptionRates[i] + (prescriptionRates[i + 1] ? '&ndash;' + prescriptionRates[i + 1] + '<br>' : '+' + '<hr>')
        }

        div.innerHTML += '<p><strong>Mean death rate<br>(prescription opioids),<br>2006-17</strong></p>'

        for (var i = 0; i < deathRates.length; i++) {
            div.innerHTML +=
                '<i style="background:' + deathGetColor(deathRates[i] + 1) + '"></i> ' +
                deathRates[i] + (deathRates[i + 1] ? '&ndash;' + deathRates[i + 1] + '<br>' : '+')
        }

        return div
    }

    legend.addTo(map)
})()