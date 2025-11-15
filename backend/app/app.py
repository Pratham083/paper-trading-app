from flask import Flask
from .extensions import db, jwt
from .config import DevConfig
from .errors import register_error_handlers
from .routes import register_routes

def create_app():
  app = Flask(__name__)
  
  app.config.from_object(DevConfig)

  db.init_app(app)
  jwt.init_app(app)

  register_routes(app)

  register_error_handlers(app)

  return app

if __name__ == "__main__":
  app = create_app()
  with app.app_context():
    db.create_all()
  app.run(debug=True)