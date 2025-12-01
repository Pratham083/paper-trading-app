# add all stock symbols to the db
from src.app import create_app
from src.extensions import db
from src.models import Stock
import json
import csv

def seed_stocks():
  seed_json('src/seed_data/amex_full_tickers.json','AMEX')
  seed_json('src/seed_data/nasdaq_full_tickers.json','NASDAQ')
  seed_json('src/seed_data/nyse_full_tickers.json','NYSE')
  seed_txt("src/seed_data/nasdaqlisted.txt", exchange="NASDAQ")
  seed_txt("src/seed_data/otherlisted.txt")

def seed_json(filepath, exchange):
  try:
    with open(filepath) as f:
      data = json.load(f)
  except Exception as e:
    #print(f"Failed to read {filepath}: {e}")
    return
  
  for item in data:
    try:
      symbol = item.get('symbol')
      company = item.get('name')
      if company and len(company) > 500:
        company = company[:500]
      if symbol:
        symbol = symbol.upper()
        if not Stock.query.filter_by(symbol=symbol).first():
          stock = Stock(symbol=symbol,company=company,exchange=exchange)
          db.session.add(stock)
    except Exception as e:
      db.session.rollback()
      #print(f'failed to insert item {item}: {e}')
      break
  try:
    db.session.commit()
    #print(f'Success. inserted {filepath} data')
  except Exception as e:
    db.session.rollback()
    #print(f'failed to insert {filepath} data: {e}')

def seed_txt(filepath, exchange=None):
  try:
    with open(filepath, "r") as f:
      reader = csv.DictReader(f, delimiter="|")
      rows = [row for row in reader if row.get("Symbol") or row.get("ACT Symbol")]
  except Exception as e:
    #print(f"Failed to read {filepath}: {e}")
    return
  
  exchange_map = {
    "A": "NYSE",
    "N": "NYSE",
    "P": "NYSE",
    "Z": "BATS",
  }

  for row in rows:
    try:
      symbol = (row.get("Symbol") or row.get("ACT Symbol"))

      name = row.get("Security Name")
      if not exchange:
        exchange = exchange_map.get(row.get("Exchange"))

      if not symbol or not name:
        continue

      symbol = symbol.upper()
      if len(name) > 500:
        name = name[:500]

      if not Stock.query.filter_by(symbol=symbol).first():
        stock = Stock(symbol=symbol, company=name, exchange=exchange)
        db.session.add(stock)

    except Exception as e:
      db.session.rollback()
      #print(f"Failed to insert row {row}: {e}")
      break

  try:
    db.session.commit()
    #print(f"Success: inserted data from {filepath}")
  except Exception as e:
    db.session.rollback()
    #print(f"Failed commit for {filepath}: {e}")

if __name__ == "__main__":
  app = create_app()
  with app.app_context():
    seed_stocks()
