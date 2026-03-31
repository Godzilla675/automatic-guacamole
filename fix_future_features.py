with open("FUTURE_FEATURES.md", "r") as f:
    lines = f.readlines()

to_remove = [
    391, # Implement Redstone Input Devices
    390, # Implement Redstone Repeaters
    389, # Implement Beacons
    388, # Implement Map item
    319, # Implement Beacons
]

new_lines = []
for i, line in enumerate(lines):
    if i + 1 not in to_remove:
        new_lines.append(line)

with open("FUTURE_FEATURES.md", "w") as f:
    f.writelines(new_lines)
to_remove = [318]

with open("FUTURE_FEATURES.md", "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i + 1 not in to_remove:
        new_lines.append(line)

with open("FUTURE_FEATURES.md", "w") as f:
    f.writelines(new_lines)
