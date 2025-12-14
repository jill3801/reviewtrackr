from flask import Flask, send_from_directory
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from .models import db, User
from .config import Config
import os

bcrypt = Bcrypt()
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['REMEMBER_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = True
    
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'main.home'
    
    from .routes import main_bp
    from .auth import auth_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    @app.route('/scripts/<path:filename>')
    def serve_scripts(filename):
        scripts_dir = os.path.join(app.root_path, '..', 'scripts')
        return send_from_directory(scripts_dir, filename)
    
    @app.route('/images/<path:filename>')
    def serve_images(filename):
        images_dir = os.path.join(app.root_path, '..', 'images')
        return send_from_directory(images_dir, filename)
    
    with app.app_context():
        db.create_all()
    
    return app