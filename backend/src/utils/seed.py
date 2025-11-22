# add all stock symbols to the db
from src.app import create_app
from src.extensions import db
from src.models import Stock
import json

def seed_stocks():
  seed_json('src/seed_data/amex_full_tickers.json','AMEX')
  seed_json('src/seed_data/nasdaq_full_tickers.json','NASDAQ')
  seed_json('src/seed_data/nyse_full_tickers.json','NYSE')

def seed_json(filepath, exchange):
  try:
    with open(filepath) as f:
      data = json.load(f)
  except Exception as e:
    print(f"Failed to read {filepath}: {e}")
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
      print(f'failed to insert item {item}: {e}')
      break
  try:
    db.session.commit()
    print(f'Success. inserted {filepath} data')
  except Exception as e:
    db.session.rollback()
    print(f'failed to insert {filepath} data: {e}')

if __name__ == "__main__":
  app = create_app()
  with app.app_context():
    seed_stocks()
