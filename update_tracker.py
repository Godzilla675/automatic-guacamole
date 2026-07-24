with open("FUTURE_FEATURES.md", "r") as f:
    content = f.read()

new_features = [
    "- [ ] **New Task: Add Ender Pearls**: Item used to teleport. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Shields**: Item used to block incoming attacks. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Shulker Boxes**: Storage blocks that retain their inventory when broken. (Status: Missing implementation, agents must fix)"
]

replacements = [
    "- [ ] **New Task: Add Netherite Upgrade Smithing Template**: Required to upgrade diamond gear to netherite. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Chiseled Copper**: Decorative copper block variant. (Status: Missing implementation, agents must fix)",
    "- [ ] **New Task: Add Waxed Copper**: Copper that doesn't oxidize. (Status: Missing implementation, agents must fix)"
]

for i in range(len(new_features)):
    if new_features[i] in content:
        content = content.replace(new_features[i], replacements[i])

with open("FUTURE_FEATURES.md", "w") as f:
    f.write(content)
