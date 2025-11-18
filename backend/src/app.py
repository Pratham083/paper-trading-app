from flask import Flask
from src.extensions import db, jwt
from src.config import DevConfig
from src.errors import register_error_handlers
from src.routes import register_routes
from flask_migrate import Migrate

def create_app():
  app = Flask(__name__)
  
  app.config.from_object(DevConfig)

  db.init_app(app)
  migrate = Migrate(app, db)

  jwt.init_app(app)

  register_routes(app)

  register_error_handlers(app)

  return app

if __name__ == "__main__":
  app = create_app()
  app.run(debug=True)