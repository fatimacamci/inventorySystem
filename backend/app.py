import os
import datetime as dt

from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# CORS: allow your Vite dev origin (adjust port if needed)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Never hardcode in real life – use env vars
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "change-me")
JWT_SECRET = os.environ.get("ADMIN_JWT_SECRET", "dev-secret-key")
JWT_ALGO = "HS256"


def create_token():
  """Create a short-lived admin JWT"""
  now = dt.datetime.utcnow()
  payload = {
      "sub": "admin",
      "role": "admin",
      "iat": now,
      "exp": now + dt.timedelta(hours=8),
  }
  return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
  data = request.get_json() or {}
  password = data.get("password")

  if not password:
      return jsonify({"error": "Password required"}), 400

  if password != ADMIN_PASSWORD:
      return jsonify({"error": "Invalid credentials"}), 401

  token = create_token()
  return jsonify({"token": token})


if __name__ == "__main__":
  app.run(port=5000, debug=True)
