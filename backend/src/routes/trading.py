from flask_jwt_extended import (
  create_access_token, create_refresh_token, set_access_cookies,  set_refresh_cookies,
  jwt_required, get_jwt_identity, unset_jwt_cookies, verify_jwt_in_request
)
from flask import Blueprint, request, jsonify
from src.models import User, Portfolio, Holding, Stock
from src.extensions import db
from src.schemas import user_schema, portfolio_schema, holding_schema, stock_schema
from src.utils.fetch_stock_data import fetch_stock_history
from marshmallow import ValidationError

trading_bp = Blueprint("trading", __name__, url_prefix="/api")

@trading_bp.before_request
def handle_options():
  if request.method == "OPTIONS":
    return '', 200

@trading_bp.get("/portfolio",)
@jwt_required()
def get_portfolio():
  user_id = get_jwt_identity()
  portfolio = Portfolio.query.filter_by(user_id=user_id).first()
  if not portfolio:
    return jsonify({'error':'user does not have a portfolio'}), 404
  
  portfolio_json = portfolio_schema.dump(portfolio)
  return jsonify(portfolio_json), 200

@trading_bp.route('/holding/buy', methods=['POST','OPTIONS'])
@jwt_required()
def buy_stock():
  user_id = get_jwt_identity()
  try:
    data = holding_schema.load(request.get_json())
  except ValidationError:
    return jsonify({'error':'stock_id and quantity required'}), 400
  stock_id = data.get('stock_id')
  quantity = data.get('quantity')

  if quantity < 1:
    return jsonify({'error':'quantity must be greater than 0'}), 400

  stock = Stock.query.get(stock_id)
  if stock is None:
    return jsonify({'error':'stock does not exist'}), 404

  portfolio = Portfolio.query.filter_by(user_id=user_id).first()
  if portfolio is None:
    return jsonify({'error': 'portfolio not found'}), 404

  stock.refresh_data()

  if stock.last_sale is None:
    return jsonify({'error': 'stock price unavailable'}), 503

  cost = quantity*stock.last_sale
  if portfolio.balance < cost:
    return jsonify({'error':'not enough funds'}), 400
  
  holding = Holding.query.filter_by(portfolio_id=portfolio.id,stock_id=stock_id).first()

  portfolio.balance -= cost
  if holding:
    holding.quantity += quantity
  else:
    newHolding = Holding(quantity=quantity,portfolio_id=portfolio.id,stock_id=stock_id)
    db.session.add(newHolding)
  db.session.commit()
  
  return jsonify({'message':'stock purchased successfully'}), 200


@trading_bp.route('/holding/sell', methods=['POST','OPTIONS'])
@jwt_required()
def sell_stock():
  user_id = get_jwt_identity()
  try:
    data = holding_schema.load(request.get_json())
  except ValidationError:
    return jsonify({'error':'stock_id and quantity required'}), 400
  stock_id = data.get('stock_id')
  quantity = data.get('quantity')

  if quantity < 1:
    return jsonify({'error':'quantity must be greater than 0'}), 400

  stock = Stock.query.get(stock_id)
  if stock is None:
    return jsonify({'error':'stock does not exist'}), 404

  portfolio = Portfolio.query.filter_by(user_id=user_id).first()
  if portfolio is None:
    return jsonify({'error': 'portfolio not found'}), 404

  stock.refresh_data()

  if stock.last_sale is None:
    return jsonify({'error': 'stock price unavailable'}), 503

  amount = quantity*stock.last_sale
  
  holding = Holding.query.filter_by(portfolio_id=portfolio.id,stock_id=stock_id).first()
  if holding is None or holding.quantity < quantity:
    return jsonify({'error':f'you do not own enough shares'}), 400
  
  portfolio.balance += amount
  holding.quantity -= quantity
  if holding.quantity == 0:
    db.session.delete(holding)
  db.session.commit()
  
  return jsonify({'message':'stock sold successfully'}), 200

#stock/all (sends to client for search, only symbol and company)
@trading_bp.get('/stock/all')
def get_all_stocks():
  stocks = Stock.query.all()
  res = [{'id':stock.id,'symbol':stock.symbol,'company':stock.company} for stock in stocks]
  return jsonify({'stocks':res}), 200

#for the stock details page
@trading_bp.get('/stock/details/<symbol>')
def get_stock_details(symbol):
  stock = Stock.query.filter_by(symbol=symbol.upper()).first()
  if stock is None:
    return jsonify({'error':'stock symbol not found'}), 404
  stock.refresh_data()
  return jsonify(stock_schema.dump(stock)), 200

@trading_bp.get('/stock/historical/<symbol>')
def get_stock_history(symbol):
  period = request.args.get('period', '1d')
  symbol = symbol.upper()
  stock = Stock.query.filter_by(symbol=symbol).first()
  if stock is None:
    return jsonify({'error': 'stock symbol not found'}), 404
  try:
    history = fetch_stock_history(symbol, period)
  except Exception as e:
    return jsonify({'error':str(e)}), 503

  if history is None or not history.get('date') or not history.get('price'):
    return jsonify({'error': 'stock historical data unavailable'}), 503

  return jsonify(history), 200