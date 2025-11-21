import json

def test_register(client):
  resp = client.post('/auth/register', json={
    'username': 'register',
    'email': 'register@gmail.com',
    'password': '1234'
  })
  assert resp.status_code == 201
  data = resp.get_json()
  assert data['username'] == 'register'

def test_login(client, test_user):
  resp = client.post("/auth/login", json={
    "identifier": "test",
    "password": "1234"
  })
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['message'] == 'logged in'
