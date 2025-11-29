from flask import jsonify
from src.extensions import jwt

def register_error_handlers(app):
  @app.errorhandler(404)
  def not_found(e):
    return jsonify({"error": "not_found", "message": "Resource not found"}), 404

  @app.errorhandler(400)
  def bad_request(e):
    return jsonify({"error": "bad_request", "message": "Invalid request"}), 400

  @app.errorhandler(500)
  def server_error(e):
    return jsonify({"error": "server_error", "message": "An unexpected error occurred"}), 500

  @app.errorhandler(401)
  def handle_401(e):
    return {"error": "Unauthorized"}, 401
  
  @jwt.expired_token_loader
  def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "token_expired","message": "Token has expired"}), 401