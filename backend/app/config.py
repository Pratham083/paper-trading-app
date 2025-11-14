import os
from datetime import timedelta

class Config:
  SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key")

  SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///paper_trading.db")
  SQLALCHEMY_TRACK_MODIFICATIONS = False

  JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
  JWT_TOKEN_LOCATION = ["cookies"]
  JWT_ACCESS_COOKIE_PATH = "/"
  JWT_REFRESH_COOKIE_PATH = "/auth/refresh"
  JWT_COOKIE_SAMESITE = "Lax"
  JWT_COOKIE_HTTPONLY = True
  JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
  JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

class DevConfig(Config):
  DEBUG = True
  JWT_COOKIE_SECURE = False

class ProdConfig(Config):
  DEBUG = False
  JWT_COOKIE_SECURE = True
