from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Book(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(200), nullable=False)
    author   = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    price    = db.Column(db.String(50))
    image    = db.Column(db.String(500))
    desc     = db.Column(db.Text)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'author': self.author,
                'category': self.category, 'price': self.price,
                'image': self.image, 'desc': self.desc}

class Category(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), unique=True, nullable=False)
    icon       = db.Column(db.String(100))
    is_default = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name,
                'icon': self.icon, 'is_default': self.is_default}

class Order(db.Model):
    id    = db.Column(db.Integer, primary_key=True)
    book  = db.Column(db.String(200))
    name  = db.Column(db.String(200))
    email = db.Column(db.String(200))
    price = db.Column(db.String(50))
    date  = db.Column(db.String(50))

    def to_dict(self):
        return {'id': self.id, 'book': self.book, 'name': self.name,
                'email': self.email, 'price': self.price, 'date': self.date}

class Contact(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    name    = db.Column(db.String(200))
    email   = db.Column(db.String(200))
    subject = db.Column(db.String(300))
    message = db.Column(db.Text)
    date    = db.Column(db.String(50))
    read    = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email,
                'subject': self.subject, 'message': self.message,
                'date': self.date, 'read': self.read}