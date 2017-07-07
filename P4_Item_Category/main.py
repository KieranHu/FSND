from flask import Flask, render_template, url_for, request, redirect, flash, jsonify
from flask import session as login_session

app = Flask(__name__)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_setup import Base, Restaurant, MenuItem

# root for login

@app.route('/login')
def login():
    pass

# main page
@app.route('/')
@app.route('/catalog/')
def show_main():

    return render_template('category.html', category = category, items = items)

# For catalog
@app.route('/catalog/add/', method=['GET', 'POST'])
def add_category():
    pass

@app.route('/catalog/edit/', method=['GET', 'POST'])
def edit_category():
    pass

@app.route('/catalog/delete/', method=['GET', 'POST'])
def delete_category():
    pass

# For items
@app.route('/catalog/<String: category_name>/items/')
def show_catalog_items(category_name):
    pass

@app.route('.catalog/<String: category_name>/add/', method=['GET', 'POST'])
def add_catalog_items(category_name):
    pass

@app.route('/catalog/<String: category_name>/<String: item_name>/')
def show_item_detail(category_name, item_name):
    pass

@app.route('/catalog/<String: category_name>/<String: item_name>/edit/', method=['GET', 'POST'])
def edit_item(category_name, item_name):
    pass

@app.route('/catalog/<String: category_name>/<String: item_name>/delete/', method=['GET', 'POST'])
def delete_item(category_name, item_name):
    pass