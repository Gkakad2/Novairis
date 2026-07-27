from database.db import engine
from database.models import Base

Base.metadata.create_all(bind=engine)

print()

print("=" * 50)
print(" OSVF Database Created")
print("=" * 50)

print()
