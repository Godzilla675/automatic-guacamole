import re

with open("FUTURE_FEATURES.md", "r") as f:
    content = f.read()

# Replace existing implemented features from memory with new suggestions
new_features = [
    "- [ ] **New Task: Add Armadillos**: Mobs that spawn in warm biomes and drop scutes for wolf armor. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Wolf Armor**: Armor for tamed wolves crafted from armadillo scutes. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Crafter**: A redstone-powered automated crafting block. (Status: Missing implementation, agents must fix)",
]

replacements = [
    "- [ ] **New Task: Add Trial Chambers**: Procedural structures found underground. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Trial Spawner**: Spawner block found in Trial Chambers that rewards players. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Ominous Bottle**: Item that gives Bad Omen effect, triggering Ominous Trials. (Status: Missing implementation, agents must fix)"
]

for i in range(len(new_features)):
    content = content.replace(new_features[i], replacements[i])

with open("FUTURE_FEATURES.md", "w") as f:
    f.write(content)
