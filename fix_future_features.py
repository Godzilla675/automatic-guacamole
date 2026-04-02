import re

with open('FUTURE_FEATURES.md', 'r') as f:
    content = f.read()

# Make sure "Implement Door Logic" or anything about physics issues is recorded.
new_bug = """- [ ] **Fix tests/test_implemented_features.js Failing Due to Slab Collision & Door Logic**: Some collision logic test scenarios assert true instead of false and fail randomly. Needs physics fixing.
"""

if "Fix tests/test_implemented_features.js" not in content:
    content = content.replace("### 22. Known Bugs & Issues\n", f"### 22. Known Bugs & Issues\n{new_bug}")

with open('FUTURE_FEATURES.md', 'w') as f:
    f.write(content)

