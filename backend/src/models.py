from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Float, BigInteger, text, Index
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from src.extensions import db
from src.utils.fetch_stock_data import fetch_stock_details

class User(db.Model):
  id = mapped_column(Integer, primary_key=True)
  username = mapped_column(String(50), unique=True, nullable=False)
  email = mapped_column(String(50), unique=True, nullable=False)
  password_hash = mapped_column(String(256), nullable=False)
  created_at = mapped_column(DateTime, default=datetime.now(timezone.utc))
  portfolio = relationship('Portfolio',back_populates='user',uselist=False, cascade='all, delete-orphan')
  
  def set_password(self, password):
    self.password_hash = generate_password_hash(password)

  def check_password(self, password):
    return check_password_hash(self.password_hash, password)
  
class Portfolio(db.Model):
  id = mapped_column(Integer, primary_key=True)
  total_deposited = mapped_column(Float, nullable=False)
  balance = mapped_column(Float, nullable=False)
  user_id = mapped_column(Integer, ForeignKey('user.id'), unique=True, nullable=False)
  
  user = relationship('User',back_populates='portfolio')
  holdings = relationship(
    'Holding',
    back_populates='portfolio',
    lazy='selectin',
    cascade='all, delete-orphan'
  )

class Holding(db.Model):
  id = mapped_column(Integer, primary_key=True)
  quantity = mapped_column(Float, nullable=False)
  book_cost = mapped_column(Float, nullable=False)
  stock_id = mapped_column(Integer, ForeignKey('stock.id'), nullable=False, index=True)
  portfolio_id = mapped_column(Integer, ForeignKey('portfolio.id'), nullable=False, index=True)
  
  portfolio = relationship('Portfolio',back_populates='holdings')
  stock = relationship('Stock')

  __table_args__ = (Index("idx_holding_portfolio_stock", "portfolio_id", "stock_id"),)

class Stock(db.Model):
  id = mapped_column(Integer, primary_key=True)

  symbol = mapped_column(String(10), unique=True, nullable=False)

  company = mapped_column(String(500), nullable=True)
  country = mapped_column(String(100), nullable=True)
  industry = mapped_column(String(100), nullable=True)
  sector = mapped_column(String(100), nullable=True)
  exchange = mapped_column(String(100), nullable=True)

  last_sale = mapped_column(Float, nullable=True)
  high = mapped_column(Float, nullable=True)
  low = mapped_column(Float, nullable=True)
  open = mapped_column(Float, nullable=True)
  prev_close = mapped_column(Float, nullable=True)
  pe_ratio = mapped_column(Float, nullable=True)
  dividend_yield = mapped_column(Float, nullable=True)

  volume = mapped_column(BigInteger, nullable=True)
  market_cap = mapped_column(BigInteger, nullable=True)
  revenue = mapped_column(BigInteger, nullable=True)
  debt = mapped_column(BigInteger, nullable=True)

  ipo_year = mapped_column(Integer, nullable=True)

  last_updated = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    nullable=False
  )

  def refresh_data(self, commit=True):
    lu = self.last_updated
    if lu.tzinfo is None:
        lu = lu.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) - lu > timedelta(minutes=15) or self.last_sale is None:
      stock_data = fetch_stock_details(self.symbol)

      for key, value in stock_data.items():
        if value is not None:
          setattr(self, key, value)

      self.last_updated = datetime.now(timezone.utc)
      if commit:
        db.session.commit()
  