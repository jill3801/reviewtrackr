from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
from .models import db, User
from flask import current_app

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    from flask_bcrypt import Bcrypt
    bcrypt = Bcrypt(current_app)
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    from flask_bcrypt import Bcrypt
    bcrypt = Bcrypt(current_app)
    
    if bcrypt.check_password_hash(user.password, password):
        login_user(user, remember=True)  # Added remember=True
        return jsonify({'message': 'Login successful', 'username': user.username}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200