from flask import Blueprint, request, jsonify, current_app
from models_simple import MongoDB
from auth import jwt_manager, token_required, validate_registration_data, validate_login_data
from werkzeug.security import check_password_hash

# Create auth blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Initialize MongoDB connection
mongo_db = MongoDB()

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input data
        errors = validate_registration_data(data.get('email'), data.get('password'))
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        
        # Check if user already exists
        existing_user = mongo_db.get_user_by_email(email)
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user_id = mongo_db.insert_user(email, password, first_name, last_name)
        
        # Generate JWT token
        token = jwt_manager.generate_token(user_id, email)
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.get_json()
        
        # Validate input data
        errors = validate_login_data(data.get('email'), data.get('password'))
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = mongo_db.get_user_by_email(email)
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate JWT token
        token = jwt_manager.generate_token(user['_id'], user['email'])
        
        return jsonify({
            'message': 'Login successful',
            'user_id': user['_id'],
            'email': user['email'],
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', ''),
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current user information"""
    try:
        user = mongo_db.get_user_by_id(request.current_user['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user_id': user['_id'],
            'email': user['email'],
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', ''),
            'created_at': user['created_at'] if isinstance(user['created_at'], str) else user['created_at'].isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user info', 'details': str(e)}), 500
