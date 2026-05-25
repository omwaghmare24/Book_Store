from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from models import db, Book, Category, Order, Contact

app = Flask(
    __name__,
    static_folder='static',
    template_folder='templates'
)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookstore.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()


# ─────────────────────────────────────────────
# FRONTEND ROUTES
# ─────────────────────────────────────────────

@app.route('/')
def home():

    books = Book.query.all()
    categories = Category.query.all()

    category_data = []

    for cat in categories:

        category_books = Book.query.filter_by(
            category=cat.name
        ).all()

        category_data.append({
            "name": cat.name,
            "books": category_books
        })

    # Best sellers: first 4 books (or all if fewer than 4)
    best_sellers = books[:4] if len(books) >= 4 else books

    return render_template(
        'index.html',
        books=books,
        categories=category_data,
        best_sellers=best_sellers
    )


@app.route('/admin-login')
def admin_login():
    return render_template('admin-login.html')


@app.route('/admin')
def admin_dashboard():
    return render_template('admin.html')


@app.route('/orders')
def orders():
    return render_template('orders.html')


@app.route('/customers')
def customers():
    return render_template('customers.html')


@app.route('/categories')
def categories():
    return render_template('categories.html')


@app.route('/add-books')
def add_books():
    return render_template('add-books.html')

# ─────────────────────────────────────────────
# AUTH API
# ─────────────────────────────────────────────

@app.route('/api/login', methods=['POST'])
def login():

    d = request.json

    if d['username'] == 'admin' and d['password'] == 'admin123':

        return jsonify({
            'success': True
        })

    return jsonify({
        'success': False
    }), 401


# ─────────────────────────────────────────────
# BOOKS API
# ─────────────────────────────────────────────

@app.route('/api/books', methods=['GET'])
def get_books():

    return jsonify([
        b.to_dict() for b in Book.query.all()
    ])


@app.route('/api/books', methods=['POST'])
def add_book():

    d = request.json

    b = Book(**d)

    db.session.add(b)
    db.session.commit()

    return jsonify({
        'id': b.id
    }), 201


@app.route('/api/books/<int:id>', methods=['PUT'])
def update_book(id):

    b = Book.query.get_or_404(id)

    for k, v in request.json.items():
        setattr(b, k, v)

    db.session.commit()

    return jsonify({
        'ok': True
    })


@app.route('/api/books/<int:id>', methods=['DELETE'])
def delete_book(id):

    db.session.delete(
        Book.query.get_or_404(id)
    )

    db.session.commit()

    return jsonify({
        'ok': True
    })


# ─────────────────────────────────────────────
# CATEGORY API
# ─────────────────────────────────────────────

@app.route('/api/categories', methods=['GET'])
def get_categories():

    return jsonify([
        c.to_dict() for c in Category.query.all()
    ])


@app.route('/api/categories', methods=['POST'])
def add_category():

    d = request.json

    c = Category(**d)

    db.session.add(c)
    db.session.commit()

    return jsonify({
        'id': c.id
    }), 201


@app.route('/api/categories/<int:id>', methods=['DELETE'])
def delete_category(id):

    db.session.delete(
        Category.query.get_or_404(id)
    )

    db.session.commit()

    return jsonify({
        'ok': True
    })


# ─────────────────────────────────────────────
# ORDERS API
# ─────────────────────────────────────────────

@app.route('/api/orders', methods=['GET'])
def get_orders():

    return jsonify([
        o.to_dict() for o in Order.query.all()
    ])


@app.route('/api/orders', methods=['POST'])
def add_order():

    d = request.json

    o = Order(**d)

    db.session.add(o)
    db.session.commit()

    return jsonify({
        'id': o.id
    }), 201


# ─────────────────────────────────────────────
# CONTACTS API
# ─────────────────────────────────────────────

@app.route('/api/contacts', methods=['GET'])
def get_contacts():

    return jsonify([
        c.to_dict() for c in Contact.query.order_by(Contact.id.desc()).all()
    ])


@app.route('/api/contacts', methods=['POST'])
def add_contact():

    d = request.json

    c = Contact(**d)

    db.session.add(c)
    db.session.commit()

    return jsonify({
        'id': c.id
    }), 201


@app.route('/api/contacts/unread-count', methods=['GET'])
def unread_contacts_count():

    count = Contact.query.filter_by(read=False).count()

    return jsonify({'count': count})


@app.route('/api/contacts/<int:id>/mark-read', methods=['PUT'])
def mark_contact_read(id):

    c = Contact.query.get_or_404(id)
    c.read = True
    db.session.commit()

    return jsonify({'ok': True})


@app.route('/api/contacts/clear', methods=['DELETE'])
def clear_contacts():

    Contact.query.delete()
    db.session.commit()

    return jsonify({'ok': True})


# ─────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True)