import pytest
from src.app import create_app
from src.extensions import db as _db
from src.models import User, Portfolio, Stock
from flask_jwt_extended import create_access_token
from src.config import TestConfig
import subprocess
import time
import signal
import os

@pytest.fixture(scope='function')
def app():
  app = create_app(TestConfig)
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
  #client.set_cookie(key="access_token_cookie",value=access_token)
  client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
  return client

@pytest.fixture
def db(app):
  return _db

@pytest.fixture
def test_user(db):
  user = User(username="test",email="test@p.com")
  user.set_password("12345678")
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

@pytest.fixture(scope="session", autouse=True)
def start_servers():
  flask_env = os.environ.copy()
  flask_env["FLASK_APP"] = "src/app.py"
  flask_proc = subprocess.Popen(
    ["flask", "run"],
    env=flask_env,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    preexec_fn=os.setsid
  )

  react_proc = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd="../frontend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    preexec_fn=os.setsid
  )
  time.sleep(6)
  yield
  for proc in (flask_proc, react_proc):
    try:
      os.killpg(os.getpgid(proc.pid), signal.SIGINT)
    except ProcessLookupError:
      pass
  time.sleep(1)

  for proc in (flask_proc, react_proc):
    if proc.poll() is None:
      proc.kill()
      proc.wait(timeout=5)
