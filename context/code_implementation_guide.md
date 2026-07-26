# AI Code Generation Guide

## Purpose

This guide defines strict rules for AI-assisted code generation in this project.  
It ensures that all generated code is:

- Maintainable
- Consistent
- Scalable
- Easy to review
- Production-ready

---

# Core Principles

1. **Single Responsibility**
   - Each file should have one clear purpose.
   - Avoid mixing business logic, database logic, and routing.

2. **Modular Design**
   - Break large logic into smaller reusable functions.
   - Prefer composition over large monolithic files.

3. **Readability Over Cleverness**
   - Code must be easy to understand.
   - Avoid unnecessary abstraction.

4. **Consistency**
   - Follow naming conventions and project structure strictly.

---

# File Size Rule

## Hard Limit

- **Maximum: 500 lines per file**
- Ideal range: **100–300 lines**

## If Exceeded

Split into:

- Services
- Helpers
- Sub-modules
- Feature-based files

---

# Project Structure Rules

## Backend (FastAPI)

```text
app/
├── api/
├── services/
├── repositories/
├── models/
├── schemas/
├── utils/
```

## Responsibilities

| Layer | Responsibility |
|------|--------|
| api | Routes / endpoints only |
| services | Business logic |
| repositories | Database queries |
| models | Database structure |
| schemas | Validation |
| utils | Helpers |

---

# Coding Standards

## Naming Conventions

| Type | Convention | Example |
|------|----------|---------|
| Variables | snake_case | user_id |
| Functions | snake_case | get_user_movies |
| Classes | PascalCase | UserService |
| Constants | UPPER_CASE | MAX_LIMIT |

---

## Function Rules

- Max 50 lines per function
- Must do one thing only
- Use descriptive names

### Good

```python
def get_user_favorites(user_id: str):
    ...
```

### Bad

```python
def handle_all_user_data():
    ...
```

---

## API Layer Rules

### Do NOT put logic in routes

```python
@router.get("/movies/{id}")
async def get_movie(id: str):
    return await movie_service.get_movie(id)
```

---

## Service Layer Rules

- Contains all logic
- Can call:
  - repositories
  - external APIs
  - other services

---

## Repository Rules

- Only database access
- No business logic

```python
async def find_user_by_id(user_id: str):
    return await User.find_one(...)
```

---

# External API Integration Rules

## NEVER mix API logic in routes

Create a dedicated service:

```text
services/
    movie_service.py
```

---

## Example

```python
async def fetch_movie_from_api(movie_id: int):
    ...
```

---

## Combine Data in Service Layer

```python
async def get_movie(movie_id: int, user_id: str):
    movie_data = await fetch_movie_from_api(movie_id)
    user_data = await repo.get_user_movie_data(user_id, movie_id)

    return combine(movie_data, user_data)
```

---

# MongoDB Rules

## Store ONLY:

- User data
- Favorites
- Ratings
- Reviews
- Watch history
- Aggregated statistics

## DO NOT STORE:

- Full movie metadata
- Cast
- Synopsis
- Posters (unless cached)

---

# Data Handling Rules

## Always reference movies by external ID

```python
movie_id: int
```

---

## Example User Interaction

```json
{
  "user_id": "...",
  "movie_id": 12345,
  "rating": 9
}
```

---

# Validation Rules

Use Pydantic for all input/output.

```python
class RatingCreate(BaseModel):
    movie_id: int
    rating: int
```

---

# Error Handling

Always handle:

- Missing data
- API failures
- Invalid input

Example:

```python
if not movie:
    raise HTTPException(status_code=404, detail="Movie not found")
```

---

# Performance Rules

- Avoid N+1 queries
- Use indexes for frequent queries
- Cache frequently accessed data

---

# Splitting Strategy

If a file grows too large:

### Example

```text
movie_service.py (too big)
```

Split into:

```text
movie/
├── service.py
├── fetch.py
├── combine.py
```

---

# Reusability Rules

- Extract repeated logic into utils
- Avoid duplication

---

# Comments & Documentation

- Explain **why**, not what
- Keep comments minimal but meaningful

---

# AI Generation Constraints

When generating code:

1. Follow project structure strictly
2. Respect file size limits
3. Do not generate unused code
4. Avoid over-engineering
5. Prefer simple solutions first
6. Ensure code is runnable
7. Keep dependencies minimal

---

# Example Workflow

## When creating a feature

1. Define schema
2. Create repository method
3. Implement service logic
4. Add API route
5. Validate inputs
6. Test response

---

# Anti-Patterns (DO NOT DO)

❌ Put database logic in routes  
❌ Put API calls in frontend only  
❌ Store full movie objects in MongoDB  
❌ Create 1000-line files  
❌ Mix authentication and business logic  
❌ Duplicate logic across services  

---

# Final Rule

> If a file feels hard to read, it's too big or doing too much.

Refactor immediately.