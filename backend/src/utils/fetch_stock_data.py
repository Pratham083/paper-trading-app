import yfinance as yf
from datetime import datetime, timedelta, timezone
import pandas as pd
import numpy as np
import requests

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
})

def safe_round(val):
  return round(val, 2) if isinstance(val, (int, float)) else None

def fetch_stock_details(symbol, max_tries=3):
  for i in range(max_tries):
    ticker = yf.Ticker(symbol, session=session)

    try:
      info = ticker.info
    except Exception as e:
      info = {}

    stock_info = {}
    
    if i == max_tries - 1 or info.get('regularMarketPrice') is not None:
      stock_info['last_sale'] = safe_round(info.get('regularMarketPrice'))
      stock_info['high'] = safe_round(info.get('dayHigh'))
      stock_info['low'] = safe_round(info.get('dayLow'))
      stock_info['open'] = safe_round(info.get('open'))
      stock_info['prev_close'] = safe_round(info.get('regularMarketPreviousClose'))
      stock_info['pe_ratio'] = safe_round(info.get('trailingPE'))
      stock_info['dividend_yield'] = safe_round(info.get('dividendYield'))
      stock_info['volume'] = safe_round(info.get('volume'))
      stock_info['market_cap'] = safe_round(info.get('marketCap'))
      stock_info['revenue'] = safe_round(info.get('totalRevenue'))
      stock_info['debt'] = safe_round(info.get('totalDebt'))
      break

  return stock_info

#periods: 1d, 1wk, 1mo, 3mo, 1y, 5y
def fetch_stock_history(symbol, period, max_tries=3):

  periods = {
    "1d": "15m",
    "1wk": "1h",
    "1mo": "1d",
    "3mo": "1wk",
    "1y": "1wk",
    "5y": "1mo"
  }

  results = {}

  if period not in periods.keys():
    raise ValueError('Not a valid period')
  for i in range(max_tries):
    ticker = yf.Ticker(symbol, session=session)
    try:
      hist = ticker.history(period=period, interval=periods[period])
      if hist.empty:
        if i == max_tries - 1:
          raise ValueError("No historical data available.")
        continue
      results['date'] = list(hist.index.tz_localize(None).strftime("%Y-%m-%d %H:%M:%S").astype(str))
      results['price'] = list(round(hist['Close'],2))
      break
    except Exception as e:
      if i == max_tries - 1:
          return {'date': [], 'price': []}
      continue

  return results


#print('details:', fetch_stock_details('AAPL'))
#print('history: ',fetch_stock_history('AAPL','1d'))