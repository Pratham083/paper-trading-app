from flask_jwt_extended import (
  create_access_token, create_refresh_token, set_access_cookies,  set_refresh_cookies,
  jwt_required, get_jwt_identity, unset_jwt_cookies, verify_jwt_in_request
)
from flask import Blueprint, request, jsonify, current_app
from src.models import User, Portfolio
from src.extensions import db
from src.schemas import login_schema, user_schema, account_update_schema
from marshmallow import ValidationError
from sqlalchemy import or_

from flask_jwt_extended import jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.post("/register")
def register():
  try:
    data = user_schema.load(request.get_json())
  except ValidationError as e:
    return jsonify({'error':e.messages}), 400
  username = data.get('username')
  email = data.get('email')
  password = data.get('password')
  user = User.query.filter(or_(User.username == username, User.email == email)).first()
  if user:
    if user.username == username:
      return jsonify({'error': 'sername already exists'}), 409
    if user.email == email:
      return jsonify({'error': 'email already exists'}), 409
  user = User(username=username, email=email)
  user.set_password(password)

  initial_balance = 100000.00
  user.portfolio = Portfolio(
    total_deposited=initial_balance,
    balance=initial_balance,
  )

  db.session.add(user)
  db.session.commit()
  db.session.refresh(user)

  return jsonify({'id':user.id,'username':user.username,'email':user.email}), 201

@auth_bp.post("/login")
def login():
  try:
    data = login_schema.load(request.get_json())
  except ValidationError as e:
    return jsonify({'error':e.messages}), 400
  
  identifier = data.get('identifier')
  password = data.get('password')
  user = User.query.filter(or_(User.username == identifier, User.email == identifier)).first()
  if not user or not user.check_password(password):
    return jsonify({'error':'bad credentials'}), 401
  
  access = create_access_token(identity=str(user.id))
  refresh = create_refresh_token(identity=str(user.id))

  resp = jsonify({'message': 'logged in'})
  
  set_access_cookies(resp, access)
  set_refresh_cookies(resp, refresh)

  cookies = resp.headers.getlist("Set-Cookie")
  resp.headers.remove("Set-Cookie")

  for value in cookies:
    low = value.lower()
    if "samesite=none" in low and "partitioned" not in low:
      if "csrf" not in low:
        value += "; Partitioned"
    resp.headers.add("Set-Cookie", value)

  return resp, 200

@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
  user_id = get_jwt_identity()
  access = create_access_token(identity=user_id)

  resp = jsonify({'message': 'token refreshed'})
  set_access_cookies(resp, access)
  return resp, 200

@auth_bp.post('/logout')
def logout():
  resp = jsonify({"message": "logged out"})
  unset_jwt_cookies(resp)
  return resp, 200

@auth_bp.get('/check')
@jwt_required()
def check():
  try:
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
      return {"authenticated": True}, 200
    else:
      return {"authenticated": False}, 401
  except Exception as e:
    return {"authenticated": False}, 401

@auth_bp.delete('/account/delete')
@jwt_required()
def delete_account():
  user_id = get_jwt_identity()
  user = User.query.get(user_id)

  if not user:
    return jsonify({'error': 'user not found'}), 404

  db.session.delete(user)
  db.session.commit()

  resp = jsonify({"message": "account deleted"})
  unset_jwt_cookies(resp)
  return resp, 200

@auth_bp.put('/account/update')
@jwt_required()
def update_account():
  user_id = get_jwt_identity()
  user = User.query.get(user_id)

  try:
    data = account_update_schema.load(request.get_json())
  except ValidationError as err:
    return jsonify({"error": err.messages}), 400

  if not user:
    return jsonify({'error': 'user not found'}), 404

  data = request.get_json() or {}

  new_username = data.get("username")
  new_email = data.get("email")
  new_password = data.get("new_password")
  current_password = data.get("current_password")

  if new_username and new_username != user.username:
    exists = User.query.filter(User.username == new_username).first()
    if exists:
      return jsonify({'error': 'username already taken'}), 409
    user.username = new_username

  if new_email and new_email != user.email:
    exists = User.query.filter(User.email == new_email).first()
    if exists:
      return jsonify({'error': 'email already taken'}), 409
    user.email = new_email

  if new_password and current_password:
    if not user.check_password(current_password):
      return jsonify({'error': 'password incorrect'}), 401
    user.set_password(new_password)

  db.session.commit()

  return jsonify({
    "message": "account updated",
    "username": user.username,
    "email": user.email
  }), 200

