def test_get_portfolio(auth_client, test_user):
  resp = auth_client.get("/api/portfolio")
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['portfolio']['balance'] == 100000

def test_buy_stock(auth_client, test_user, sample_stock):
  resp = auth_client.post("/api/holding/buy", json={
    "stock_id": sample_stock.id,
    "quantity": 10
  })
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['message'] == "stock purchased successfully"

def test_sell_stock(auth_client, test_user, sample_stock):
  auth_client.post("/api/holding/buy", json={
    "stock_id": sample_stock.id,
    "quantity": 5
  })
  resp = auth_client.post("/api/holding/sell", json={
    "stock_id": sample_stock.id,
    "quantity": 3
  })
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['message'] == "stock sold successfully"

def test_stock_details(client, sample_stock):
  resp = client.get("/api/stock/details/AAPL")
  assert resp.status_code == 200
  data = resp.get_json()
  assert data['symbol'] == "AAPL"

def test_stock_history(client, sample_stock):
  resp = client.get("/api/stock/historical/AAPL")
  assert resp.status_code == 200
  data = resp.get_json()
  assert 'date' in data

def test_buy_stock_fail(auth_client, test_user, sample_stock):
  resp = auth_client.post("/api/holding/buy", json={
    "stock_id": sample_stock.id,
    "quantity": 10000
  })
  assert resp.status_code == 400

def test_sell_stock_fail(auth_client, test_user, sample_stock):
  auth_client.post("/api/holding/buy", json={
    "stock_id": sample_stock.id,
    "quantity": 5
  })
  resp = auth_client.post("/api/holding/sell", json={
    "stock_id": sample_stock.id,
    "quantity": 6
  })
  assert resp.status_code == 400

def test_leaderboard(auth_client, test_user, sample_stock):
  resp = auth_client.get("/api/leaderboard")
  assert resp.status_code == 200
  data = resp.get_json()

  assert data['page'] == 1
  assert data['size'] == 10
  assert data['total_pages'] == 1
  assert data['total_users'] == 1
  assert data['my_rank'] == 1

def test_get_holding(auth_client, test_user, sample_stock):
  auth_client.post("/api/holding/buy", json={
    "stock_id": sample_stock.id,
    "quantity": 5
  })
  resp = auth_client.get(f"/api/holding/stock/{sample_stock.id}")
  assert resp.status_code == 200
  data = resp.get_json()
  assert 'holding' in data
  assert data['holding']['stock_id'] == sample_stock.id
  assert data['holding']['quantity'] == 5
