import os
import subprocess
import sys

def run_tests():
    test_dirs = ['verification', 'tests']
    results = {'passed': [], 'failed': []}

    print("Starting test runner...")

    for directory in test_dirs:
        if not os.path.exists(directory):
            print(f"Directory {directory} not found, skipping.")
            continue

        # Sort for consistent order
        for filename in sorted(os.listdir(directory)):
            filepath = os.path.join(directory, filename)

            if not os.path.isfile(filepath):
                continue

            cmd = []
            if filename.endswith('.py'):
                cmd = ['python3', filepath]
            elif filename.endswith('.js'):
                # Check if it is a mocha test
                is_mocha = False
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'describe(' in content or 'it(' in content:
                            is_mocha = True
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
                    results['failed'].append(filepath)
                    continue

                if is_mocha:
                    cmd = ['npx', 'mocha', filepath]
                else:
                    cmd = ['node', filepath]
            else:
                continue

            print(f"Running {filepath}...")
            try:
                # Capture output, with a timeout to prevent hangs
                # Some tests might be slow, so generous timeout
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

                if result.returncode == 0:
                    print(f"PASS: {filepath}")
                    results['passed'].append(filepath)
                else:
                    print(f"FAIL: {filepath}")
                    print("--- STDOUT ---")
                    print(result.stdout)
                    print("--- STDERR ---")
                    print(result.stderr)
                    print("--------------")
                    results['failed'].append(filepath)
            except subprocess.TimeoutExpired:
                print(f"TIMEOUT: {filepath}")
                results['failed'].append(filepath)
            except Exception as e:
                print(f"ERROR: {filepath} - {e}")
                results['failed'].append(filepath)

    print("\n\n=== Test Summary ===")
    print(f"Passed: {len(results['passed'])}")
    print(f"Failed: {len(results['failed'])}")

    if results['failed']:
        print("\nFailed Tests:")
        for t in results['failed']:
            print(f"- {t}")
        sys.exit(1)
    else:
        print("\nAll tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
