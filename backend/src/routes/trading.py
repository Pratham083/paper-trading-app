from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from flask import Blueprint, request, jsonify
from src.models import User, Portfolio, Holding, Stock
from src.extensions import db
from src.schemas import user_schema, portfolio_schema, holding_schema, stock_schema, protected_user_schema
from src.utils.fetch_stock_data import fetch_stock_history
from marshmallow import ValidationError
from datetime import date
from sqlalchemy import func, desc

trading_bp = Blueprint('trading', __name__, url_prefix='/api')

@trading_bp.before_request
def handle_options():
  if request.method == 'OPTIONS':
    return '', 200

@trading_bp.get('/portfolio',)
@jwt_required()
def get_portfolio():
  user_id = get_jwt_identity()
  user = User.query.get(user_id)

  if user.portfolio and user.portfolio.holdings:
    for holding in user.portfolio.holdings:
      if holding.stock:
        holding.stock.refresh_data(commit=False)
    db.session.commit()

  user_json = user_schema.dump(user)
  return jsonify(user_json), 200

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
    holding.book_cost += cost
  else:
    holding = Holding(quantity=quantity,book_cost=cost,portfolio_id=portfolio.id,stock_id=stock_id)
    db.session.add(holding)
  db.session.commit()
  
  return jsonify({
    'message':'stock purchased successfully',
    'holding': holding_schema.dump(holding)
  }), 200

@trading_bp.get('/holding/stock/<stock_id>')
@jwt_required()
def get_holding(stock_id):
  user_id = get_jwt_identity()
  portfolio = Portfolio.query.filter_by(user_id=user_id).first()

  stock = Stock.query.get(stock_id)
  stock.refresh_data()

  holding = Holding.query.filter_by(portfolio_id=portfolio.id,stock_id=stock_id).first()
  if not holding:
    return jsonify({'error': 'holding not found'}), 404
  
  return jsonify({'holding':holding_schema.dump(holding)}), 200


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
  
  book_cost_reduction = (holding.book_cost/holding.quantity)*quantity

  portfolio.balance += amount
  holding.quantity -= quantity
  holding.book_cost -= book_cost_reduction

  if holding.quantity == 0:
    db.session.delete(holding)
  db.session.commit()
  
  return jsonify({
    'message':'stock sold successfully',
    'holding': holding_schema.dump(holding)
  }), 200
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


# maybe change to store in leaderboard DB if have more time
daily_cache = {
  'date': None,
  'leaderboard': None,
  'user_ranks':None
}

@trading_bp.get('/leaderboard')
def leaderboard():
  page = int(request.args.get('page',1))
  size = int(request.args.get('size',10))
  offset = (page-1)*size

  today = date.today()

  if daily_cache['date'] != today or daily_cache['leaderboard'] is None:

    stock_ids = db.session.query(Holding.stock_id).join(Portfolio).distinct().all()
    stock_ids = [s[0] for s in stock_ids]

    stocks = Stock.query.filter(Stock.id.in_(stock_ids)).all()

    for stock in stocks:
      stock.refresh_data(commit=False)
    db.session.commit()

    user_totals = (
      db.session.query(
        Portfolio.user_id.label('user_id'),
        (Portfolio.balance + func.coalesce(func.sum(Holding.quantity * Stock.last_sale), 0)).label('total_value')
      )
      .outerjoin(Holding, Holding.portfolio_id == Portfolio.id)
      .outerjoin(Stock, Stock.id == Holding.stock_id)
      .group_by(Portfolio.user_id, Portfolio.balance)
      .subquery()
    )

    ranked = db.session.query(
      user_totals.c.user_id,
      user_totals.c.total_value,
      func.rank().over(order_by=user_totals.c.total_value.desc()).label('rank')
    ).subquery()

    all_ranks = db.session.query(ranked.c.user_id, ranked.c.total_value, ranked.c.rank).all()
    
    daily_cache['leaderboard'] = [
      {'user_id': row.user_id, 'rank': row.rank, 'total_value': row.total_value}
      for row in all_ranks
    ]
    daily_cache['user_ranks'] = {row['user_id']: row for row in daily_cache['leaderboard']}

  leaderboard_data = daily_cache['leaderboard']
  cur_page = leaderboard_data[offset:offset+size]

  #query users
  user_ids = [row['user_id'] for row in cur_page]
  users = User.query.filter(User.id.in_(user_ids)).all()
  users_dict = {user.id: user for user in users}

  result = []
  for row in cur_page:
    user = users_dict.get(row['user_id'])
    if user:
      result.append({
        'rank': row['rank'],
        'user': protected_user_schema.dump(user),
        'total_value': row['total_value']
      })

  user_rank = None
  try:
    verify_jwt_in_request(optional=True)
    current_user_id = int(get_jwt_identity())
  except Exception as e:
    current_user_id = None
  if current_user_id:
    user_row = daily_cache['user_ranks'].get(current_user_id)
    if user_row:
      user_rank = user_row['rank']

  total_users = len(leaderboard_data)
  total_pages = (total_users+size-1)//size
  return jsonify({
    'page': page,
    'size': size,
    'total_pages': total_pages,
    'total_users': total_users,
    'top_users': result,
    'my_rank': user_rank
  }), 200