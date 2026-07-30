"""Password hashing helpers built on Python's standard library."""

import base64
import hashlib
import hmac
import secrets

ALGORITHM = "pbkdf2_sha256"
ITERATIONS = 600_000
SALT_BYTES = 16


def hash_password(password: str) -> str:
    """Create a salted PBKDF2-SHA256 hash suitable for database storage."""
    salt = secrets.token_bytes(SALT_BYTES)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        ITERATIONS,
    )
    encoded_salt = base64.urlsafe_b64encode(salt).decode("ascii")
    encoded_hash = base64.urlsafe_b64encode(password_hash).decode("ascii")
    return f"{ALGORITHM}${ITERATIONS}${encoded_salt}${encoded_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Check a password against a stored hash without timing-based comparison."""
    try:
        algorithm, iterations_text, encoded_salt, encoded_hash = stored_hash.split("$", 3)
        if algorithm != ALGORITHM:
            return False

        iterations = int(iterations_text)
        if iterations <= 0:
            return False

        salt = base64.b64decode(encoded_salt, altchars=b"-_", validate=True)
        expected_hash = base64.b64decode(encoded_hash, altchars=b"-_", validate=True)
    except (ValueError, TypeError):
        return False

    candidate_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(candidate_hash, expected_hash)
