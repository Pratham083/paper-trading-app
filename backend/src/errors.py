from flask import jsonify

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
