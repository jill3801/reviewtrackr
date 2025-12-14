#!/bin/bash
pip install -r requirements.txt
python -c "from app import create_app; app = create_app(); app.app_context().push(); from app.models import db; db.create_all()"
gunicorn --bind=0.0.0.0:8000 --timeout 600 run:app