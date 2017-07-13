import os
import string

from flask import Flask, render_template, url_for, request, redirect, flash, jsonify, abort
from flask import session as login_session

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import desc

from items_db import Base, Category, Items
# from users_db import User

import random
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
import httplib2
import json
from flask import make_response
import requests

cwd = os.getcwd()  # Get the current working directory (cwd)
files = os.listdir(cwd)  # Get all the files in that directory
print("Files in '%s': %s" % (cwd, files))

# load database
engine = create_engine('sqlite:///item.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

# engine_user = create_engine('sqlite:///user.db')
# Base.metadata.bind = engine_user
#
# DBSession_user = sessionmaker(bind=engine_user)
# session_user = DBSession_user()

app = Flask(__name__)

# root for login
# @app.route('/login/', methods = ['GET', "POST"])
# def login():
#     if request.method == 'POST':
#         username = request.form['username']
#         pwd = request.form['password']
#         if username is None or pwd is None:
#             abort(400)
#         login_session['logged_in'] = False
#         user = session_user.query(User).filter_by(name=username).first()
#         if user.verify_password(pwd):
#             login_session['logged_in'] = True
#
#         return redirect(url_for('show_main'))
#     else:
#         return render_template('login.html')
#
# @app.route('/logout/')
# def logout():
#     login_session['logged_in'] = False
#     return redirect(url_for('show_main'))

CLIENT_ID = json.loads(open('client_secrets.json', 'r').read())['web']['client_id']

# Create anti-forgery state token
@app.route('/login')
def login():
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in range(32))
    login_session['state'] = state
    return render_template('new_login.html', STATE=state)


@app.route('/gconnect', methods=['POST'])
def gconnect():
    # Validate state token
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        login_session['logged_in'] = False
        return response
    # Obtain authorization code
    code = request.data

    try:
        # Upgrade the authorization code into a credentials object
        oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        login_session['logged_in'] = False
        return response

    # Check that the access token is valid.
    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
           % access_token)
    h = httplib2.Http()
    result = json.loads(h.request(url, 'GET')[1])
    # If there was an error in the access token info, abort.
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        login_session['logged_in'] = False
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        login_session['logged_in'] = False
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(
            json.dumps("Token's client ID does not match app's."), 401)
        print
        "Token's client ID does not match app's."
        response.headers['Content-Type'] = 'application/json'
        login_session['logged_in'] = False
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')
    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(json.dumps('Current user is already connected.'),
                                 200)
        response.headers['Content-Type'] = 'application/json'
        login_session['logged_in'] = True
        return response

    # Store the access token in the session for later use.
    login_session['access_token'] = credentials.access_token
    login_session['gplus_id'] = gplus_id
    login_session['logged_in'] = True

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)

    data = answer.json()

    login_session['username'] = data['name']
    login_session['picture'] = data['picture']


    output = ''
    output += '<h1>Welcome, '
    output += login_session['username']
    output += '!</h1>'
    output += '<img src="'
    output += login_session['picture']
    output += ' " style = "width: 300px; height: 300px;border-radius: 150px;-webkit-border-radius: 150px;-moz-border-radius: 150px;"> '
    flash("you are now logged in as %s" % login_session['username'])
    print("done!")
    return output

    # DISCONNECT - Revoke a current user's token and reset their login_session


@app.route('/gdisconnect')
def logout():
    del login_session['access_token']
    del login_session['gplus_id']
    del login_session['username']
    del login_session['picture']
    login_session['logged_in'] = False

    return redirect(url_for('show_main'))

# @app.route('/create_account/', methods=['GET', "POST"])
# def create_account():
#     if request.method == 'POST':
#         username = request.form['username']
#         pwd = request.form['password']
#         if username is None or pwd is None:
#             abort(400)
#         if session_user.query(User).filter_by(name=username).first() is not None:
#             abort(400)  # existing user
#         user = User(name=username)
#         user.hash_passward(pwd)
#         session_user.add(user)
#         session_user.commit()
#         return redirect(url_for('login'))
#
#     else:
#         return render_template('create_account.html')

# API

@app.route('/catalog/<category_name>/json/')
def itemJSON(category_name):
    category = session.query(Category).filter_by(name = category_name).one()
    items = session.query(Items).filter_by(category_id = category.id).all()
    return jsonify(Items = [i.serialize for i in items])

#main page
@app.route('/')
@app.route('/catalog/')
def show_main():
    if login_session.get('logged_in'):
        categories = session.query(Category).all()
        items = session.query(Items).order_by(desc(Items.time)).all()
        return render_template('categorylogin.html', categories = categories, items = items)
    else:
        categories = session.query(Category).all()
        items = session.query(Items).order_by(desc(Items.time)).all()
        return render_template('category.html', categories = categories, items = items)



# For catalog
@app.route('/catalog/add/', methods=['GET', 'POST'])
def add_category():
    if login_session.get('logged_in'):
        if request.method == 'POST':
            new_category = Category(name = request.form['name'])
            session.add(new_category)
            session.commit()
            return redirect(url_for('show_main'))
        else:
            return render_template('add_category.html')
    else:
        return "<script>function myFunction() {alert('You are not authorized to add category. " \
               "Please login to add category.');}</script><body onload='myFunction()''>"

@app.route('/catalog/<category_name>/edit/', methods=['GET', 'POST'])
def edit_category(category_name):
    if login_session.get('logged_in'):
        change_category = session.query(Category).filter_by(name = category_name).one()
        change_list = session.query(Items).filter_by(catename = category_name).all()

        if request.method == 'POST':
            new_name = request.form['name']
            change_category.name = new_name
            session.add(change_category)
            session.commit()

            for item in change_list:
                item.catename = new_name
                item.item = change_category
                session.add(item)
                session.commit()

            return redirect(url_for('show_catalog_items', category_name = new_name))

        else:
            return render_template('edit_category.html', categories = category_name)
    else:
        return "<script>function myFunction() {alert('You are not authorized to edit category. " \
               "Please login to edit category.');}</script><body onload='myFunction()''>"


@app.route('/catalog/<category_name>/delete/', methods=['GET', 'POST'])
def delete_category(category_name):
    if login_session.get('logged_in'):
        delete_category = session.query(Category).filter_by(name = category_name).one()
        delete_list = session.query(Items).filter_by(catename = category_name).all()
        if request.method == 'POST':
            for item in delete_list:
                session.delete(item)
                session.commit()
            session.delete(delete_category)
            session.commit()

            return redirect(url_for('show_main'))
        else:
            return render_template('delete_category.html', categories = category_name)
    else:
        return "<script>function myFunction() {alert('You are not authorized to delete category. " \
               "Please login to delete category.');}</script><body onload='myFunction()''>"


# For items
@app.route('/catalog/<category_name>/items/')
def show_catalog_items(category_name):
    if login_session.get('logged_in'):
        category_list = session.query(Items).filter_by(catename=category_name).all()
        return render_template('item_listlogin.html', categories=category_name, items = category_list)
    else:
        category_list = session.query(Items).filter_by(catename=category_name).all()
        return render_template('item_list.html', categories=category_name, items = category_list)

@app.route('/catalog/<category_name>/add/', methods=['GET', 'POST'])
def add_catalog_items(category_name):
    if login_session.get('logged_in'):
        category = session.query(Category).filter_by(name=category_name).one()

        if request.method == 'POST':
            item_name = request.form['name']
            item_description = request.form['description']
            item_catename = category_name

            new_item = Items(name = item_name, description = item_description, catename = item_catename, item = category)
            session.add(new_item)
            session.commit()

            return redirect(url_for('show_main'))

        else:
            return render_template('add_item.html', categories = category_name)
    else:
        return "<script>function myFunction() {alert('You are not login, Please login'" \
               ");}</script><body onload='myFunction()''>"


@app.route('/catalog/<item_name>/')
def show_item_detail(item_name):
    if login_session.get('logged_in'):
        item_detail = session.query(Items).filter_by(name = item_name).one()
        return render_template('item_detaillogin.html', items = item_detail)
    else:
        item_detail = session.query(Items).filter_by(name=item_name).one()
        return render_template('item_detail.html', items=item_detail)


@app.route('/catalog/items/<item_name>/edit/', methods=['GET', 'POST'])
def edit_item(item_name):
    if login_session.get('logged_in'):
        if request.method == 'POST':
            catename = request.form['catename']
            new_category = session.query(Category).filter_by(name = catename).one()
            edit_item = session.query(Items).filter_by(name = item_name).one()
            edit_item.name = request.form['name']
            edit_item.description = request.form['description']
            edit_item.catename = catename
            edit_item.item = new_category
            session.add(edit_item)
            session.commit()

            return redirect(url_for('show_item_detail', item_name = edit_item.name))

        else:
            return render_template('edit_item.html', items = item_name)
    else:
        return "<script>function myFunction() {alert('You are not login, Please login'" \
               ");}</script><body onload='myFunction()''>"

@app.route('/catalog/items/<item_name>/delete/', methods=['GET', 'POST'])
def delete_item(item_name):
    if login_session.get('logged_in'):
        if request.method == 'POST':
            delete_item = session.query(Items).filter_by(name=item_name).one()
            session.delete(delete_item)
            session.commit()
            return redirect(url_for('show_main'))
        else:
            return render_template('delete_item.html', items = item_name)
    else:
        return "<script>function myFunction() {alert('You are not login, Please login'" \
               ");}</script><body onload='myFunction()''>"

if __name__ == '__main__':
    app.debug = True
    app.secret_key = os.urandom(12)
    app.run(host='localhost', port=5000)