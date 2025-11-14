import yfinance as yf
from datetime import datetime, timedelta, timezone
import pandas as pd
import numpy as np

def safe_round(val):
    return round(val, 2) if isinstance(val, (int, float)) else None

def fetch_stock_details(symbol):
  ticker = yf.Ticker(symbol)

  try:
    info = ticker.info
  except Exception as e:
    info = {}

  stock_info = {}
  
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

  return stock_info

#periods: 1d, 1wk, 1mo, 3mo, 1y, 5y
def fetch_stock_history(symbol, period):
    ticker = yf.Ticker(symbol)

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

    try:
        hist = ticker.history(period=period, interval=periods[period])
        if hist.empty:
            raise ValueError("No historical data available.")

        results['date'] = list(hist.index.tz_localize(None).strftime("%Y-%m-%d %H:%M:%S").astype(str))
        results['price'] = list(round(hist['Close'],2))
    except Exception as e:
        results['date'] = []
        results['price'] = []

    return results


#print('details:', fetch_stock_details('AAPL'))
#print('history: ',fetch_stock_history('AAPL','1d'))