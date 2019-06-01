# import necessary libraries
import os

import pandas as pd
import numpy as np

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_sqlalchemy import SQLAlchemy

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///data/overdose_deaths.sqlite", connect_args={'check_same_thread': False})

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
States_each_year = Base.classes.states_each_year
Counties_all_years = Base.classes.counties_all_years
States_prescribing_rate = Base.classes.states_prescribing_rate

# Create our session (link) from Python to the DB
session = Session(engine)


#################################################
# Flask Setup
#################################################
app = Flask(__name__)


@app.route("/")
def index():
    """Render Home Page."""
    return render_template("index.html")


@app.route("/api")
def list_endpoints():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/states<br/>"
        f"/api/&lt;state&gt;<br/>"
        f"/api/counties<br/>"
        f"/api/prescribing"
    )

@app.route("/api/states")
def list_states_data():
    results = session.query(
        States_each_year.id,
        States_each_year.state_code,
        States_each_year.state,
        States_each_year.year,
        States_each_year.heroin_deaths,
        States_each_year.other_opioids_deaths,
        States_each_year.methadone_deaths,
        States_each_year.other_synthetics_deaths,
        States_each_year.population,
        States_each_year.heroin_death_rate,
        States_each_year.other_opioids_death_rate,
        States_each_year.methadone_death_rate,
        States_each_year.other_synthetics_death_rate,
        States_each_year.prescribing_rate
    ).all()

    states = []
    for result in results:
        states.append({
            "id": result[0],
            "state_code": result[1],
            "state": result[2],
            "year": result[3],
            "heroin_deaths": result[4],
            "other_opioids_deaths": result[5],
            "methadone_deaths": result[6],
            "other_synthetics_deaths": result[7],
            "population": result[8],
            "heroin_death_rate": result[9],
            "other_opioids_death_rate": result[10],
            "methadone_death_rate": result[11],
            "other_synthetics_death_rate": result[12],
            "prescribing_rate": result[13]
        })

    return jsonify(states)


@app.route("/api/<state>")
def list_county_data_by_state(state):
    results = session.query(
        Counties_all_years.id,
        Counties_all_years.county_code,
        Counties_all_years.county,
        Counties_all_years.state,
        Counties_all_years.heroin_deaths,
        Counties_all_years.other_opioids_deaths,
        Counties_all_years.methadone_deaths,
        Counties_all_years.other_synthetics_deaths,
        Counties_all_years.population,
        Counties_all_years.heroin_death_rate,
        Counties_all_years.other_opioids_death_rate,
        Counties_all_years.methadone_death_rate,
        Counties_all_years.other_synthetics_death_rate,
        Counties_all_years.prescribing_rate_2006,
        Counties_all_years.prescribing_rate_2007,
        Counties_all_years.prescribing_rate_2008,
        Counties_all_years.prescribing_rate_2009,
        Counties_all_years.prescribing_rate_2010,
        Counties_all_years.prescribing_rate_2011,
        Counties_all_years.prescribing_rate_2012,
        Counties_all_years.prescribing_rate_2013,
        Counties_all_years.prescribing_rate_2014,
        Counties_all_years.prescribing_rate_2015,
        Counties_all_years.prescribing_rate_2016,
        Counties_all_years.prescribing_rate_2017,
        Counties_all_years.mean_prescribing_rate
    ).filter(func.lower(Counties_all_years.state)==state.lower())

    counties = []
    for result in results:
        counties.append({
            "id": result[0],
            "county_code": result[1],
            "county": result[2],
            "state": result[3],
            "heroin_deaths": result[4],
            "other_opioids_deaths": result[5],
            "methadone_deaths": result[6],
            "other_synthetics_deaths": result[7],
            "population": result[8],
            "heroin_death_rate": result[9],
            "other_opioids_death_rate": result[10],
            "methadone_death_rate": result[11],
            "other_synthetics_death_rate": result[12],
            "prescribing_rate_2006": result[13],
            "prescribing_rate_2007": result[14],
            "prescribing_rate_2008": result[15],
            "prescribing_rate_2009": result[16],
            "prescribing_rate_2010": result[17],
            "prescribing_rate_2011": result[18],
            "prescribing_rate_2012": result[19],
            "prescribing_rate_2013": result[20],
            "prescribing_rate_2014": result[21],
            "prescribing_rate_2015": result[22],
            "prescribing_rate_2016": result[23],
            "prescribing_rate_2017": result[24],
            "mean_prescribing_rate": result[25]
        })

    return jsonify(counties)


@app.route("/api/counties")
def list_counties_data():
    results = session.query(
        Counties_all_years.id,
        Counties_all_years.county_code,
        Counties_all_years.county,
        Counties_all_years.state,
        Counties_all_years.heroin_deaths,
        Counties_all_years.other_opioids_deaths,
        Counties_all_years.methadone_deaths,
        Counties_all_years.other_synthetics_deaths,
        Counties_all_years.population,
        Counties_all_years.heroin_death_rate,
        Counties_all_years.other_opioids_death_rate,
        Counties_all_years.methadone_death_rate,
        Counties_all_years.other_synthetics_death_rate,
        Counties_all_years.prescribing_rate_2006,
        Counties_all_years.prescribing_rate_2007,
        Counties_all_years.prescribing_rate_2008,
        Counties_all_years.prescribing_rate_2009,
        Counties_all_years.prescribing_rate_2010,
        Counties_all_years.prescribing_rate_2011,
        Counties_all_years.prescribing_rate_2012,
        Counties_all_years.prescribing_rate_2013,
        Counties_all_years.prescribing_rate_2014,
        Counties_all_years.prescribing_rate_2015,
        Counties_all_years.prescribing_rate_2016,
        Counties_all_years.prescribing_rate_2017,
        Counties_all_years.mean_prescribing_rate
    ).all()

    counties = []
    for result in results:
        counties.append({
            "id": result[0],
            "county_code": result[1],
            "county": result[2],
            "state": result[3],
            "heroin_deaths": result[4],
            "other_opioids_deaths": result[5],
            "methadone_deaths": result[6],
            "other_synthetics_deaths": result[7],
            "population": result[8],
            "heroin_death_rate": result[9],
            "other_opioids_death_rate": result[10],
            "methadone_death_rate": result[11],
            "other_synthetics_death_rate": result[12],
            "prescribing_rate_2006": result[13],
            "prescribing_rate_2007": result[14],
            "prescribing_rate_2008": result[15],
            "prescribing_rate_2009": result[16],
            "prescribing_rate_2010": result[17],
            "prescribing_rate_2011": result[18],
            "prescribing_rate_2012": result[19],
            "prescribing_rate_2013": result[20],
            "prescribing_rate_2014": result[21],
            "prescribing_rate_2015": result[22],
            "prescribing_rate_2016": result[23],
            "prescribing_rate_2017": result[24],
            "mean_prescribing_rate": result[25]
        })

    return jsonify(counties)


@app.route("/api/prescribing")
def list_prescribing_data():
    results = session.query(
        States_prescribing_rate.id,
        States_prescribing_rate.state,
        States_prescribing_rate.mean_prescribing_rate
    ).all()

    prescribing = []
    for result in results:
        prescribing.append({
            "id": result[0],
            "state": result[1],
            "mean_prescribing_rate": result[2]
        })

    return jsonify(prescribing)


@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404


if __name__ == "__main__":
    app.run(debug=True)
