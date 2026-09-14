#!/usr/bin/env python3
import os, urllib.request, json, sys

api = "https://wf365.workforce365.ai/api"
key = os.environ["PAPERCLIP_API_KEY"]

def req(url):
    r = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"})
    return json.loads(urllib.request.urlopen(r).read())

# Get the current issue
task_id = os.environ["PAPERCLIP_TASK_ID"]
issue = req(f"{api}/issues/{task_id}")
print("=== CURRENT ISSUE ===")
print(json.dumps({k: issue.get(k) for k in ["id","identifier","title","status","description","priority","assigneeAgentId","assigneeUserId","blockedByIssueIds","parentId","projectId","goalId","createdAt","updatedAt","workMode","executionState","currentStageType","currentParticipant"]}, indent=2))

print()
print("=== INBOX ===")
inbox = req(f"{api}/agents/me/inbox-lite")
print(json.dumps(inbox, indent=2))
