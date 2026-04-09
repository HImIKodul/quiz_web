import sys, os

# Add the application directory to the sys.path
# This ensures that your app can find its own modules
sys.path.append(os.getcwd())

# Import the main Flask 'app' object from your app.py
from app import app as application

# If your app was created with 'application = Flask(__name__)' you could just import it
# Phusion Passenger looks for a symbol named 'application' by default.
