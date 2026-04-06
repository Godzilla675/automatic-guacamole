import re

with open('FUTURE_FEATURES.md', 'r') as f:
    content = f.read()

features = []
in_features = False

for line in content.split('\n'):
    if line.startswith('## Known Bugs & Issues'):
        break
    if '- [x]' in line:
        feature = line.replace('- [x]', '').strip()
        features.append(feature)

print("Features marked as implemented:")
for f in features:
    print(f"- {f}")
