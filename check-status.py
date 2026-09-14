#!/usr/bin/env python3
import os, urllib.request, json

api = "https://wf365.workforce365.ai/api"
key = os.environ["PAPERCLIP_API_KEY"]

def req(url):
    r = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"})
    return json.loads(urllib.request.urlopen(r).read())

# Check health endpoint to see what commit is running
import urllib.request
try:
    resp = urllib.request.urlopen("https://wf365.workforce365.ai/api/health")
    health = json.loads(resp.read())
    print("=== HEALTH CHECK ===")
    print(json.dumps(health, indent=2))
except Exception as e:
    print(f"Health check failed: {e}")

# Check if there are more recent comments on WOR-52 after the recovery was created
print("\n=== WOR-52 LATEST COMMENTS ===")
comments = req(f"{api}/issues/be36fc02-f82d-4f88-971f-2b959e7f7edf/comments?order=desc")
for c in comments[:5]:
    print(f"[{c.get('createdAt')}] author={c.get('authorAgentId', c.get('authorUserId', 'system'))}: {c.get('body', '')[:200]}")
    print()

# Check if there are more recent comments on WOR-36 after the recovery was created
print("=== WOR-36 LATEST COMMENTS ===")
comments = req(f"{api}/issues/1b90ba74-5e4f-4c64-ac30-bfd72801eebd/comments?order=desc")
for c in comments[:5]:
    print(f"[{c.get('createdAt')}] author={c.get('authorAgentId', c.get('authorUserId', 'system'))}: {c.get('body', '')[:200]}")
    print()

# Check the current state of the repo
print("=== GIT STATUS ===")
import subprocess
result = subprocess.run(["git", "log", "--oneline", "-5"], capture_output=True, text=True)
print(result.stdout)
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True)
print(result.stdout)
