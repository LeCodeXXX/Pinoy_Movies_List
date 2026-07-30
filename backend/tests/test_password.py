"""Tests for password hashing helpers."""

from unittest import TestCase

from app.utils.password import hash_password, verify_password


class PasswordUtilityTests(TestCase):
    def test_hash_and_verify_password(self) -> None:
        stored_hash = hash_password("correct horse battery staple")

        self.assertNotIn("correct horse battery staple", stored_hash)
        self.assertTrue(verify_password("correct horse battery staple", stored_hash))
        self.assertFalse(verify_password("wrong password", stored_hash))

    def test_same_password_uses_unique_salts(self) -> None:
        first_hash = hash_password("same-password")
        second_hash = hash_password("same-password")

        self.assertNotEqual(first_hash, second_hash)

    def test_malformed_hash_is_rejected(self) -> None:
        self.assertFalse(verify_password("password", "not-a-password-hash"))
