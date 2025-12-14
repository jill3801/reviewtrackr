import requests
import os

class TMDbService:
    """
    Service to interact with The Movie Database (TMDb) API
    """
    
    def __init__(self):
        self.api_key = os.getenv('TMDB_API_KEY')
        self.base_url = 'https://api.themoviedb.org/3'
        self.image_base_url = 'https://image.tmdb.org/t/p/w500'
    
    def get_upcoming_movies(self, page=1):
        """
        Get upcoming movies
        """
        try:
            url = f'{self.base_url}/movie/upcoming'
            params = {
                'api_key': self.api_key,
                'language': 'en-US',
                'page': page
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            movies = []
            
            for movie in data.get('results', []):
                # Determine genre
                genre = 'Action'  # Default
                genre_ids = movie.get('genre_ids', [])
                if 10749 in genre_ids:  # Romance
                    genre = 'Romance'
                elif 35 in genre_ids:  # Comedy
                    genre = 'Comedy'
                elif 27 in genre_ids or 53 in genre_ids:  # Horror or Thriller
                    genre = 'Thriller'
                
                movies.append({
                    'id': movie.get('id'),
                    'title': movie.get('title'),
                    'release_date': movie.get('release_date', 'TBA'),
                    'rating': round(movie.get('vote_average', 0), 1),
                    'overview': movie.get('overview', ''),
                    'poster_url': f"{self.image_base_url}{movie.get('poster_path')}" if movie.get('poster_path') else None,
                    'genre': genre,
                    'predicted': 'Hit' if movie.get('vote_average', 0) >= 7.0 else 'Average'
                })
            
            return {
                'success': True,
                'movies': movies,
                'total_pages': data.get('total_pages', 1),
                'current_page': page,
                'count': len(movies)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_popular_movies(self, page=1):
        """
        Get popular movies
        """
        try:
            url = f'{self.base_url}/movie/popular'
            params = {
                'api_key': self.api_key,
                'language': 'en-US',
                'page': page
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            movies = []
            
            for movie in data.get('results', []):
                # Determine genre
                genre = 'Action'  # Default
                genre_ids = movie.get('genre_ids', [])
                if 10749 in genre_ids:
                    genre = 'Romance'
                elif 35 in genre_ids:
                    genre = 'Comedy'
                elif 27 in genre_ids or 53 in genre_ids:
                    genre = 'Thriller'
                
                movies.append({
                    'id': movie.get('id'),
                    'title': movie.get('title'),
                    'release_date': movie.get('release_date', 'TBA'),
                    'rating': round(movie.get('vote_average', 0), 1),
                    'overview': movie.get('overview', ''),
                    'poster_url': f"{self.image_base_url}{movie.get('poster_path')}" if movie.get('poster_path') else None,
                    'genre': genre,
                    'predicted': 'Hit' if movie.get('vote_average', 0) >= 7.0 else 'Average'
                })
            
            return {
                'success': True,
                'movies': movies,
                'total_pages': data.get('total_pages', 1),
                'current_page': page,
                'count': len(movies)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}