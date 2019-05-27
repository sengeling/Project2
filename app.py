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
from sqlalchemy import create_engine


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///data/states_each_year.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
States_each_year = Base.classes.states_each_year

# Create our session (link) from Python to the DB
session = Session(engine)


#################################################
# Flask Setup
#################################################
app = Flask(__name__)


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


#@app.route("/send", methods=["GET", "POST"])
#def send():
#    if request.method == "POST":
#        nickname = request.form["nickname"]
#        age = request.form["age"]

#        pet = Pet(nickname=nickname, age=age)
#        db.session.add(pet)
#        db.session.commit()

#        return "Thanks for the form data!"

#    return render_template("form.html")


@app.route("/api/states")
def list_data():
    results = session.query(States_each_year.state, States_each_year.year).all()

    states = []
    for result in results:
        states.append({
            "state": result[0],
            "year": result[1]
        })
    return jsonify(states)

if __name__ == "__main__":
    app.run(debug=True)
