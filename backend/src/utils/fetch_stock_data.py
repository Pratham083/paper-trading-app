import yfinance as yf
from datetime import datetime, timedelta, timezone
import pandas as pd
import numpy as np
import time
import requests

def safe_round(val):
  try:
    val = float(val)
    return round(val, 2)
  except Exception as e:
    return None

def fetch_stock_details(symbol, max_tries=3):
  for i in range(max_tries):
    ticker = yf.Ticker(symbol)

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
    time.sleep(0.1)

  if not stock_info.get('last_sale'):
     stock_info = fetch_alphavantage_details(symbol)

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
    ticker = yf.Ticker(symbol)
    try:
      hist = ticker.history(period=period, interval=periods[period])
      if hist.empty:
        if i == max_tries - 1:
          raise ValueError("No historical data available.")
        time.sleep(0.1)
        continue
      results['date'] = list(hist.index.tz_localize(None).strftime("%Y-%m-%d %H:%M:%S").astype(str))
      results['price'] = list(round(hist['Close'],2))
      break
    except Exception as e:
      if i == max_tries - 1:
          return {'date': [], 'price': []}
      time.sleep(0.1)
      continue
    

  return results

def fetch_alphavantage_details(symbol: str):
  AV_API_KEY = "BT0AGRTSB20OI4O2"

  base_url = "https://www.alphavantage.co/query"
  stock_info = {}
  
  quote_params = {
    "function": "GLOBAL_QUOTE",
    "symbol": symbol,
    "apikey": AV_API_KEY
  }
  try:
    quote_response = requests.get(base_url, params=quote_params, timeout=10).json()
    quote = quote_response.get("Global Quote", {})
    print(quote)
    
    if not quote or quote_response.get("Note"):
      return {}
    
    stock_info['last_sale'] = safe_round(quote.get('05. price'))
    stock_info['high'] = safe_round(quote.get('03. high'))
    stock_info['low'] = safe_round(quote.get('04. low'))
    stock_info['open'] = safe_round(quote.get('02. open'))
    stock_info['prev_close'] = safe_round(quote.get('08. previous close'))
    stock_info['volume'] = safe_round(quote.get('06. volume'))

    print(stock_info)

  except requests.exceptions.RequestException as e:
    print(f"Alpha Vantage Quote Request Failed: {e}")
    return {}

  overview_params = {
    "function": "OVERVIEW",
    "symbol": symbol,
    "apikey": AV_API_KEY
  }
  try:
    overview_response = requests.get(base_url, params=overview_params, timeout=10).json()
    
    if overview_response.get("Note"):
      print(f"Alpha Vantage Overview Error for {symbol}: {overview_response.get('Note')}")
    
    stock_info['pe_ratio'] = safe_round(overview_response.get('PERatio'))
    stock_info['dividend_yield'] = safe_round(overview_response.get('DividendYield'))
    stock_info['market_cap'] = safe_round(overview_response.get('MarketCapitalization'))
    stock_info['revenue'] = safe_round(overview_response.get('RevenueTTM'))
    stock_info['debt'] = safe_round(overview_response.get('TotalDebt'))

  except requests.exceptions.RequestException as e:
    print(f"Alpha Vantage request failed: {e}")

  return stock_info

#print('details:', fetch_stock_details('AAPL'))
#print('history: ',fetch_stock_history('AAPL','1d'))

#print('details:', fetch_alphavantage_details('AAPL'))