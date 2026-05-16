# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify
from database import db, User, UserRole
from auth_utils import (
    hash_password, verify_password, validate_password_strength, 
    create_access_token, token_required, admin_required
)
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register_admin', methods=['POST'])
def register_admin():
    """Create the first admin user."""
    # Check if admin already exists
    if User.query.filter_by(role=UserRole.ADMIN).first():
        return jsonify({'detail': 'An admin user already exists.'}), 400
    
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return jsonify({'detail': 'Missing required fields'}), 400
        
    is_valid, message = validate_password_strength(password)
    if not is_valid:
        return jsonify({'detail': message}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'detail': 'Email is already registered.'}), 400
        
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.ADMIN,
        is_active=True
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@auth_bp.route('/create_doctor', methods=['POST'])
@admin_required
def create_doctor(current_user):
    """Admin-only endpoint for creating doctor accounts."""
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return jsonify({'detail': 'Missing required fields'}), 400
        
    is_valid, message = validate_password_strength(password)
    if not is_valid:
        return jsonify({'detail': message}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'detail': 'Email is already registered.'}), 400
        
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.DOCTOR,
        is_active=True
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate an admin or doctor and return a JWT access token."""
    # Support both JSON and Form data for compatibility
    if request.is_json:
        data = request.json
        email = data.get('email') or data.get('username')
        password = data.get('password')
    else:
        email = request.form.get('username') or request.form.get('email')
        password = request.form.get('password')
    
    if not email or not password:
        return jsonify({'detail': 'Email and password are required.'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return jsonify({'detail': 'Incorrect email or password.'}), 401
        
    if not user.is_active:
        return jsonify({'detail': 'User account is disabled.'}), 403
        
    role_val = user.role.value if hasattr(user.role, 'value') else user.role
    token_data = create_access_token(subject=user.id, role=role_val)
    return jsonify({
        'access_token': token_data['access_token'],
        'expires_at': token_data['expires_at'].isoformat(),
        'token_type': 'bearer'
    })

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    """Get the currently authenticated user."""
    return jsonify({'user': current_user.to_dict()})
