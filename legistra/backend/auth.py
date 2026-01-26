import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import check_password_hash

class JWTManager:
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        app.config.setdefault('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        app.config.setdefault('JWT_ACCESS_TOKEN_EXPIRES', timedelta(hours=24))
        self.app = app
    
    def generate_token(self, user_id, email):
        """Generate JWT access token"""
        payload = {
            'user_id': user_id,
            'email': email,
            'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
            'iat': datetime.utcnow()
        }
        return jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )
    
    def verify_token(self, token):
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def get_user_from_token(self, token):
        """Get user from token"""
        payload = self.verify_token(token)
        if payload:
            return payload
        return None

# Global JWT manager instance
jwt_manager = JWTManager()

def token_required(f):
    """Decorator to require JWT token for endpoint access"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Verify token
        payload = jwt_manager.verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Add user info to request context
        request.current_user = {
            'user_id': payload['user_id'],
            'email': payload['email']
        }
        
        return f(*args, **kwargs)
    
    return decorated

def validate_registration_data(email, password):
    """Validate registration data"""
    errors = []
    
    # Email validation
    if not email:
        errors.append('Email is required')
    elif '@' not in email or '.' not in email:
        errors.append('Invalid email format')
    
    # Password validation
    if not password:
        errors.append('Password is required')
    elif len(password) < 6:
        errors.append('Password must be at least 6 characters long')
    
    return errors

def validate_login_data(email, password):
    """Validate login data"""
    errors = []
    
    if not email:
        errors.append('Email is required')
    
    if not password:
        errors.append('Password is required')
    
    return errors
