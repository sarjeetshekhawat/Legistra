import subprocess
import sys
import os

# Change to backend directory
os.chdir('legistra/backend')

# Start the Flask app
print("Starting Flask backend...")
subprocess.run([sys.executable, 'app.py'])
