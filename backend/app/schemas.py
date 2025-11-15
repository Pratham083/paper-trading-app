from marshmallow import Schema, fields, validate, post_load
from app.models import User, Portfolio, Holding, Stock

class StockSchema(Schema):
  id = fields.Int(dump_only=True)
  symbol = fields.Str(required=True, validate=validate.Length(max=10))
  company = fields.Str(allow_none=True)
  country = fields.Str(allow_none=True)
  industry = fields.Str(allow_none=True)
  sector = fields.Str(allow_none=True)
  last_sale = fields.Float(allow_none=True)
  high = fields.Float(allow_none=True)
  low = fields.Float(allow_none=True)
  open = fields.Float(allow_none=True)
  prev_close = fields.Float(allow_none=True)
  pe_ratio = fields.Float(allow_none=True)
  dividend_yield = fields.Float(allow_none=True)
  volume = fields.Int(allow_none=True)
  market_cap = fields.Int(allow_none=True)
  revenue = fields.Int(allow_none=True)
  debt = fields.Int(allow_none=True)
  ipo_year = fields.Int(allow_none=True)
  last_updated = fields.DateTime()
stock_schema = StockSchema()

class HoldingSchema(Schema):
  id = fields.Int(dump_only=True)
  quantity = fields.Float(required=True)
  stock_id = fields.Int(required=True)
  portfolio_id = fields.Int(required=True)
  stock = fields.Nested(StockSchema, dump_only=True)
holding_schema = HoldingSchema()

class PortfolioSchema(Schema):
  id = fields.Int(dump_only=True)
  total_deposited = fields.Float(required=True)
  balance = fields.Float(required=True)
  user_id = fields.Int(dump_only=True)
  holdings = fields.List(fields.Nested(HoldingSchema), dump_only=True)
portfolio_schema = PortfolioSchema()

class UserSchema(Schema):
  id = fields.Int(dump_only=True)
  username = fields.Str(required=True, validate=validate.Length(max=50))
  email = fields.Email(required=True)
  password = fields.Str(load_only=True, required=True)
  created_at = fields.DateTime(dump_only=True)
  portfolio = fields.Nested(PortfolioSchema, dump_only=True)
user_schema = UserSchema()

class LoginSchema(Schema):
  identifier = fields.Str(required=True)
  password = fields.Str(load_only=True, required=True)
login_schema = LoginSchema()