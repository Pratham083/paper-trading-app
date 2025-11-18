from .auth import auth_bp
from .trading import trading_bp

def register_routes(app):
  app.register_blueprint(auth_bp)
  app.register_blueprint(trading_bp)
