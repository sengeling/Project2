# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from sqlalchemy import func
import pandas as pd
from flask_sqlalchemy import SQLAlchemy

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################

# Need to change "bigfoot" to whatever the name
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/bigfoot.sqlite"

db = SQLAlchemy(app)