from flask import Flask
from flask_cors import CORS
from src.extensions import db, jwt
from src.config import DevConfig, TestConfig, ProdConfig
from src.errors import register_error_handlers
from src.routes import register_routes
from flask_migrate import Migrate
import os

def create_app(config_class=None):
  app = Flask(__name__)

  config_name = os.getenv("FLASK_CONFIG", "dev").lower()
  if config_class is None:
    if config_name == "test":
      config_class = TestConfig
    elif config_name == "prod":
      config_class = ProdConfig
    else:
      config_class = DevConfig
  
  app.config.from_object(config_class)

  db.init_app(app)
  migrate = Migrate(app, db)
  jwt.init_app(app)

  if not FRONTEND_URL.startswith(('http://', 'https://')):
    FRONTEND_URL = f"https://{FRONTEND_URL}"

  FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
  CORS(
    app,
    supports_credentials=True,
    origins=[FRONTEND_URL]
  )
  
  register_routes(app)
  register_error_handlers(app)

  return app

if __name__ == "__main__":
  app = create_app()
  app.run(debug=True)