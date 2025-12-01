from .auth import auth_bp
from .trading import trading_bp
from .health import health_bp

def register_routes(app):
  app.register_blueprint(auth_bp)
  app.register_blueprint(trading_bp)
  app.register_blueprint(health_bp)