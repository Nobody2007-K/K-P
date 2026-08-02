"""
Run this script to generate the seed SQL with REAL Argon2 password hashes.
It prints SQL you can paste into Supabase SQL Editor.

Usage (from backend/ directory):
    pip install argon2-cffi
    python database/generate_seed_sql.py
"""

from argon2 import PasswordHasher

ph = PasswordHasher(
    memory_cost=65536,   # 64 MiB
    time_cost=3,
    parallelism=4,
)

kashish_hash  = ph.hash("Preshna")   # Kashish's password is "Preshna"
preshna_hash  = ph.hash("Kashish")   # Preshna's password is "Kashish"

print("-- ============================================================")
print("-- K&P Love — Seed SQL with REAL Argon2 hashes")
print("-- Paste this into Supabase → SQL Editor → Run")
print("-- ============================================================")
print()
print("-- First delete placeholders if you ran schema.sql already:")
print("DELETE FROM users WHERE username IN ('Kashish', 'Preshna');")
print()
print("INSERT INTO users (username, display_name, role, password_hash, online, created_at, updated_at)")
print("VALUES")
print(f"  ('Kashish', 'Kashish Shrestha', 'boyfriend', '{kashish_hash}', FALSE, NOW(), NOW()),")
print(f"  ('Preshna', 'Preshna GC',       'girlfriend', '{preshna_hash}', FALSE, NOW(), NOW())")
print("ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;")
print()
print("-- Verify:")
print("SELECT id, username, display_name, role, online FROM users;")
