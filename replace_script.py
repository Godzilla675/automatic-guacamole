import re

with open("FUTURE_FEATURES.md", "r") as f:
    content = f.read()

# Make sure to check completed tasks
completed_features = [
    "New Task: Add Paintbrush",
    "New Task: Add Enderite",
    "New Task: Add Copper Bulbs",
    "New Task: Add Armadillos",
    "Add Grappling Hook",
    "Add Tuff Bricks",
    "Add Mules",
    "Add Goats"
]
for feature in completed_features:
    content = re.sub(r"- \[ \] \*\*" + feature, r"- [x] **" + feature, content)

with open("FUTURE_FEATURES.md", "w") as f:
    f.write(content)
