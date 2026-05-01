<<<<<<< HEAD
from flask import Blueprint, request, jsonify
from database import db, User, UserRole
from auth_utils import admin_required, token_required, hash_password

user_bp = Blueprint('users', __name__, url_prefix='/users')

@user_bp.route('/', methods=['GET'])
@admin_required
def list_users(current_user):
    """Admin-only: list all users."""
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@user_bp.route('/me', methods=['GET'])
@token_required
def get_my_profile(current_user):
    """Any authenticated user can fetch their own profile."""
    return jsonify(current_user.to_dict())

@user_bp.route('/me/patients', methods=['GET'])
@token_required
def list_assigned_patients(current_user):
    """Example doctor-only endpoint (can be extended)."""
    if current_user.role != UserRole.DOCTOR:
         return jsonify({'message': 'Doctor privileges required!'}), 403
         
    return jsonify({
        "doctor_id": current_user.id,
        "doctor_name": current_user.name,
        "message": "Implement patient assignment linkage here.",
    })

@user_bp.route('/<int:user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    """Admin-only: fetch a single user by ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'detail': 'User not found.'}), 404
    return jsonify(user.to_dict())

@user_bp.route('/<int:user_id>', methods=['PATCH'])
@admin_required
def update_user(current_user, user_id):
    """Admin-only: update user fields."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'detail': 'User not found.'}), 404
        
    data = request.json
    if 'name' in data:
        user.name = data['name']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'role' in data:
        # Prevent non-existent roles or direct admin manipulation if needed
        new_role = data['role']
        if new_role == 'admin':
            user.role = UserRole.ADMIN
        elif new_role == 'doctor':
            user.role = UserRole.DOCTOR
            
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    """Admin-only: delete a user account."""
    if user_id == current_user.id:
        return jsonify({'detail': 'You cannot delete your own account.'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'detail': 'User not found.'}), 404
        
    db.session.delete(user)
    db.session.commit()
    return '', 204
=======
from flask import Blueprint, request, jsonify
from database import db, User, UserRole
from auth_utils import admin_required, token_required, hash_password

user_bp = Blueprint('users', __name__, url_prefix='/users')

@user_bp.route('/', methods=['GET'])
@admin_required
def list_users(current_user):
    """Admin-only: list all users."""
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@user_bp.route('/me', methods=['GET'])
@token_required
def get_my_profile(current_user):
    """Any authenticated user can fetch their own profile."""
    return jsonify(current_user.to_dict())

@user_bp.route('/me/patients', methods=['GET'])
@token_required
def list_assigned_patients(current_user):
    """Example doctor-only endpoint (can be extended)."""
    if current_user.role != UserRole.DOCTOR:
         return jsonify({'message': 'Doctor privileges required!'}), 403
         
    return jsonify({
        "doctor_id": current_user.id,
        "doctor_name": current_user.name,
        "message": "Implement patient assignment linkage here.",
    })

@user_bp.route('/<int:user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    """Admin-only: fetch a single user by ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'detail': 'User not found.'}), 404
    return jsonify(user.to_dict())

@user_bp.route('/<int:user_id>', methods=['PATCH'])
@admin_required
def update_user(current_user, user_id):
    """Admin-only: update user fields."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'detail': 'User not found.'}), 404
        
    data = request.json
    if 'name' in data:
        user.name = data['name']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'role' in data:
        # Prevent non-existent roles or direct admin manipulation if needed
        new_role = data['role']
        if new_role == 'admin':
            user.role = UserRole.ADMIN
        elif new_role == 'doctor':
            user.role = UserRole.DOCTOR
            
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    """Admin-only: delete a user account."""
    if user_id == current_user.id:
        return jsonify({'detail': 'You cannot delete your own account.'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'detail': 'User not found.'}), 404
        
    db.session.delete(user)
    db.session.commit()
    return '', 204
>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
