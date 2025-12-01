import json

def test_register(client):
  resp = client.post('/auth/register', json={
    'username': 'register',
    'email': 'register@gmail.com',
    'password': '12345678'
  })
  assert resp.status_code == 201
  data = resp.get_json()
  assert data['username'] == 'register'

def test_login(client, test_user):
  resp = client.post("/auth/login", json={
    "identifier": "test",
    "password": "12345678"
  })
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['message'] == 'logged in'

def test_update_account(test_user, auth_client):
  resp = auth_client.put("/auth/account/update", json={
    "username": "testy",
    "email": "testy@gmail.com",
  })
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['username'] == 'testy'
  assert data['email'] == 'testy@gmail.com'

def test_delete_account(test_user, auth_client):
  resp = auth_client.delete("/auth/account/delete")
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['message'] == 'account deleted'

def test_login_fail(client, test_user):
  resp = client.post("/auth/login", json={
    "identifier": "test",
    "password": "12"
  })
  assert resp.status_code == 401

def test_register_fail(client):
  resp = client.post('/auth/register', json={
    'username': 're',
    'email': 'regist',
    'password': '1234'
  })
  assert resp.status_code == 400
  data = resp.get_json()
  assert 'username' in data['error']
  assert 'email' in data['error']
  assert 'password' in data['error']

def test_delete_account_no_auth(client, test_user):
  resp = client.delete("/auth/account/delete")
  assert resp.status_code == 401

def test_update_account_no_auth(client, test_user):
  resp = client.put("/auth/account/update", json={
    "identifier": "testy",
    "email": "testy@gmail.com",
  })
  assert resp.status_code == 401