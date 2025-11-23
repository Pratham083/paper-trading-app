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