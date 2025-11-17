from flask_jwt_extended import (
  create_access_token, create_refresh_token, set_access_cookies,  set_refresh_cookies,
  jwt_required, get_jwt_identity, unset_jwt_cookies
)
from flask import Blueprint, request, jsonify
from app.models import User, Portfolio
from app.extensions import db
from app.schemas import login_schema, user_schema
from marshmallow import ValidationError
from sqlalchemy import or_

from flask_jwt_extended import jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.post("/register")
def register():
  try:
    data = user_schema.load(request.get_json())
  except ValidationError:
    return jsonify({'error':'username, email, and password required'}), 400
  username = data.get('username')
  email = data.get('email')
  password = data.get('password')
  user = User.query.filter(or_(User.username == username, User.email == email)).first()
  if user:
    if user.username == username:
      return jsonify({'error': 'username already exists'}), 409
    if user.email == email:
      return jsonify({'error': 'email already exists'}), 409
  user = User(username=username)
  user.set_password(password)

  initial_balance = 100000.00
  user.portfolio = Portfolio(
    total_deposited=initial_balance,
    balance=initial_balance,
  )

  db.session.add(user)
  db.session.commit()
  db.session.refresh(user)

  return jsonify({'id':user.id,'username':user.username}), 201

@auth_bp.post("/login")
def login():
  try:
    data = login_schema.load(request.get_json())
  except ValidationError:
    return jsonify({'error':'username/email and password required'}), 400
  
  identifier = data.get('identifier')
  password = data.get('password')
  user = User.query.filter(or_(User.username == identifier, User.email == identifier)).first()
  if not user or not user.check_password(password):
    return jsonify({'error':'bad credentials'}), 401
  
  access = create_access_token(identity=user.id)
  refresh = create_refresh_token(identity=user.id)

  resp = jsonify({'message': 'logged in'})
  set_access_cookies(resp, access)
  set_refresh_cookies(resp, refresh)  

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
