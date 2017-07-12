from flask import Flask, render_template, url_for, request, redirect, flash, jsonify
from flask import session as login_session

app = Flask(__name__)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import desc
from items_db import Base, Category, Items

engine = create_engine('sqlite:///item.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

# root for login

@app.route('/login')
def login():
    pass

# main page
@app.route('/')
@app.route('/catalog/')
def show_main():
    categories = session.query(Category).all()
    items = session.query(Items).order_by(desc(Items.time)).all()
    return render_template('category.html', categories = categories, items = items)

# For catalog
@app.route('/catalog/add/', methods=['GET', 'POST'])
def add_category():
    if request.method == 'POST':
        new_category = Category(name = request.form['name'])
        session.add(new_category)
        session.commit()
        return redirect(url_for('show_main'))
    else:
        return render_template('add_category.html')

@app.route('/catalog/<category_name>/edit/', methods=['GET', 'POST'])
def edit_category(category_name):
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


@app.route('/catalog/<category_name>/delete/', methods=['GET', 'POST'])
def delete_category(category_name):
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


# For items
@app.route('/catalog/<category_name>/items/')
def show_catalog_items(category_name):
    category_list = session.query(Items).filter_by(catename=category_name).all()
    return render_template('item_list.html', categories=category_name, items = category_list)

@app.route('/catalog/<category_name>/add/', methods=['GET', 'POST'])
def add_catalog_items(category_name):
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

@app.route('/catalog/<item_name>/')
def show_item_detail(item_name):
    item_detail = session.query(Items).filter_by(name = item_name).one()
    return render_template('item_detail.html', items = item_detail)


@app.route('/catalog/items/<item_name>/edit/', methods=['GET', 'POST'])
def edit_item(item_name):
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

@app.route('/catalog/items/<item_name>/delete/', methods=['GET', 'POST'])
def delete_item(item_name):

    if request.method == 'POST':
        delete_item = session.query(Items).filter_by(name=item_name).one()
        session.delete(delete_item)
        session.commit()
        return redirect(url_for('show_main'))
    else:
        return render_template('delete_item.html', items = item_name)

@app.route('/catalog/<category_name>/json/')
def itemJSON(category_name):
    category = session.query(Category).filter_by(name = category_name).one()
    items = session.query(Items).filter_by(category_id = category.id).all()
    return jsonify(Items = [i.serialize for i in items])


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=8000)