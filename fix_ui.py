with open("js/ui.js", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const def = window.BLOCKS[Object.keys(window.BLOCKS).find" in line:
        lines[i] = "                let def = null; if (item && item.type !== undefined) { def = window.BLOCKS[Object.keys(window.BLOCKS).find(k => window.BLOCKS[k].id === item.type)]; }\n"

with open("js/ui.js", "w") as f:
    f.writelines(lines)
