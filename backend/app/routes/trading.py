from flask_jwt_extended import (
  create_access_token, create_refresh_token, set_access_cookies,  set_refresh_cookies,
  jwt_required, get_jwt_identity, unset_jwt_cookies
)
from flask import Blueprint, request, jsonify
from .models import User, Portfolio, Holding, Stock
from .extensions import db
from .schemas import user_schema, portfolio_schema
from marshmallow import ValidationError

trading_bp = Blueprint("trading", __name__, url_prefix="/api")

@trading_bp.get("/portfolio")
@jwt_required()
def get_portfolio():
  user_id = get_jwt_identity()
  portfolio = Portfolio.query.filter_by(user_id=user_id).first()
  if not portfolio:
    return jsonify({'error':'user does not have a portfolio'}), 404
  
  portfolio_json = portfolio_schema.dump(portfolio)
  return jsonify(portfolio_json), 200
