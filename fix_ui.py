import sys

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if "page.click(\"#start-game\", force=True)" in content:
        content = content.replace("page.click(\"#start-game\", force=True)", "page.evaluate(\"document.getElementById('start-game').click();\")")
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

patch_file("verification/verify_milking_shearing.py")
