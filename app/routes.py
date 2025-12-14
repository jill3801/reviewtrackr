from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from .models import db, Review
from .tmdb_service import TMDbService

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    return render_template('index.html')

@main_bp.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@main_bp.route('/api/reviews', methods=['GET', 'POST'])
def reviews():
    if request.method == 'POST':
        if not current_user.is_authenticated:
            return jsonify({'error': 'Must be logged in'}), 401
        
        data = request.get_json()
        new_review = Review(
            movie_title=data.get('movie_title'),
            comment=data.get('comment'),
            rating=data.get('rating'),
            user_id=current_user.id
        )
        db.session.add(new_review)
        db.session.commit()
        return jsonify({'message': 'Review added'}), 201
    
    # GET all reviews
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'movie_title': r.movie_title,
        'comment': r.comment,
        'rating': r.rating,
        'username': r.user.username,
        'created_at': r.created_at.isoformat()
    } for r in reviews])

# CRUD - UPDATE
@main_bp.route('/api/reviews/<int:review_id>', methods=['PUT'])
@login_required
def update_review(review_id):
    """Update a review"""
    review = Review.query.get_or_404(review_id)
    
    if review.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    review.comment = data.get('comment', review.comment)
    review.rating = data.get('rating', review.rating)
    db.session.commit()
    
    return jsonify({'message': 'Review updated successfully'}), 200

# CRUD - DELETE
@main_bp.route('/api/reviews/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review(review_id):
    """Delete a review"""
    review = Review.query.get_or_404(review_id)
    
    if review.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(review)
    db.session.commit()
    
    return jsonify({'message': 'Review deleted successfully'}), 200

# TMDb API ROUTES
@main_bp.route('/api/tmdb/upcoming')
def tmdb_upcoming():
    """Get upcoming movies from TMDb"""
    page = request.args.get('page', 1, type=int)
    tmdb = TMDbService()
    result = tmdb.get_upcoming_movies(page=page)
    return jsonify(result)

@main_bp.route('/api/tmdb/popular')
def tmdb_popular():
    """Get popular movies from TMDb"""
    page = request.args.get('page', 1, type=int)
    tmdb = TMDbService()
    result = tmdb.get_popular_movies(page=page)
    return jsonify(result)

@main_bp.route('/api/tmdb/load-movies')
def load_tmdb_movies():
    """Load movies from TMDb and return them for display"""
    page = request.args.get('page', 1, type=int)
    movie_type = request.args.get('type', 'upcoming')
    
    tmdb = TMDbService()
    
    if movie_type == 'popular':
        result = tmdb.get_popular_movies(page=page)
    else:
        result = tmdb.get_upcoming_movies(page=page)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 500