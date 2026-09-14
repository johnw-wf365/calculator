#!/usr/bin/env python3
import subprocess

# Check git diff for WOR-52 related files
files = [
    "packages/shared/src/types/instance.ts",
    "packages/shared/src/validators/instance.ts",
    "server/src/services/instance-settings.ts",
    "server/src/routes/health.ts",
    "server/src/app.ts",
    "ui/src/pages/InstanceGeneralSettings.tsx",
]

for f in files:
    result = subprocess.run(["git", "diff", f], capture_output=True, text=True)
    if result.stdout.strip():
        print(f"=== {f} ===")
        print(result.stdout[:500])
        print()

# Check for any uncommitted new files
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True)
print("=== FULL GIT STATUS ===")
print(result.stdout)

# Check if there's a .env or process running
result = subprocess.run(["ps", "aux"], capture_output=True, text=True)
for line in result.stdout.split("\n"):
    if "paperclip" in line.lower() or "node" in line.lower():
        print(f"PROCESS: {line}")
