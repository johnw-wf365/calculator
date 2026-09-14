#!/usr/bin/env python3
import os, urllib.request, json

api = "https://wf365.workforce365.ai/api"
key = os.environ["PAPERCLIP_API_KEY"]

def req(url):
    r = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"})
    return json.loads(urllib.request.urlopen(r).read())

for issue_id in ["be36fc02-f82d-4f88-971f-2b959e7f7edf", "1b90ba74-5e4f-4c64-ac30-bfd72801eebd"]:
    print(f"\n{'='*60}")
    print(f"=== ISSUE {issue_id} ===")
    print(f"{'='*60}")
    issue = req(f"{api}/issues/{issue_id}")
    print(f"Identifier: {issue.get('identifier')}")
    print(f"Title: {issue.get('title')}")
    print(f"Status: {issue.get('status')}")
    print(f"Description: {issue.get('description')}")
    print(f"Priority: {issue.get('priority')}")
    print(f"ParentId: {issue.get('parentId')}")
    print(f"ActiveRun: {json.dumps(issue.get('activeRun'), indent=2)}")
    print(f"ActiveRecoveryAction: {json.dumps(issue.get('activeRecoveryAction'), indent=2)}")
    
    # Get comments
    comments = req(f"{api}/issues/{issue_id}/comments?order=desc")
    print(f"\n--- COMMENTS ({len(comments)}) ---")
    for c in comments[:10]:
        print(f"  [{c.get('createdAt')}] {c.get('authorAgentId', c.get('authorUserId', 'unknown'))}: {c.get('body', '')[:200]}")
    
    # Get documents
    docs = req(f"{api}/issues/{issue_id}/documents")
    print(f"\n--- DOCUMENTS ({len(docs)}) ---")
    for d in docs:
        print(f"  Key: {d.get('key')}, Title: {d.get('title')}, RevisionId: {d.get('revisionId')}")
