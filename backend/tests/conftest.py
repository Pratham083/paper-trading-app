import pytest
from src.app import create_app
from src.extensions import db as _db
from src.models import User, Portfolio, Stock
from flask_jwt_extended import create_access_token

@pytest.fixture(scope='function')
def app():
  app = create_app()
  app.config.update(
    TESTING=True,
    SQLALCHEMY_DATABASE_URI='sqlite:///:memory:',
    JWT_COOKIE_SECURE=False,
    WTF_CSRF_ENABLED=False,
    JWT_COOKIE_CSRF_PROTECT=False
  )
  with app.app_context():
    _db.create_all()
    yield app
    _db.session.remove()
    _db.drop_all()

@pytest.fixture
def client(app):
  return app.test_client()

@pytest.fixture
def auth_client(app, test_user, access_token):
  client = app.test_client()
  client.set_cookie(
    key="access_token_cookie",
    value=access_token,
  )
  return client

@pytest.fixture
def db(app):
  return _db

@pytest.fixture
def test_user(db):
  user = User(username="test",email="test@p.com")
  user.set_password("1234")
  user.portfolio = Portfolio(balance=100000, total_deposited=100000)
  db.session.add(user)
  db.session.commit()
  return user

@pytest.fixture
def access_token(test_user):
  return create_access_token(identity=str(test_user.id))

@pytest.fixture
def sample_stock(db):
  stock = Stock(symbol="AAPL", company="apple", last_sale=150.0)
  db.session.add(stock)
  db.session.commit()
  return stock
