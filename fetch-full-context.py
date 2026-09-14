#!/usr/bin/env python3
import os, urllib.request, json

api = "https://wf365.workforce365.ai/api"
key = os.environ["PAPERCLIP_API_KEY"]

def req(url):
    r = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"})
    return json.loads(urllib.request.urlopen(r).read())

# Get full comments for WOR-52
print("=== WOR-52 FULL COMMENTS ===")
comments = req(f"{api}/issues/be36fc02-f82d-4f88-971f-2b959e7f7edf/comments?order=asc")
for c in comments:
    author = c.get('authorAgentId', c.get('authorUserId', 'system'))
    body = c.get('body', '')[:300]
    print(f"[{c.get('createdAt')}] {author}: {body}")
    print()

# Get documents for WOR-52
print("=== WOR-52 DOCUMENTS ===")
docs = req(f"{api}/issues/be36fc02-f82d-4f88-971f-2b959e7f7edf/documents")
for d in docs:
    print(f"Key: {d.get('key')}, Title: {d.get('title')}, RevisionId: {d.get('revisionId')}")
    # Fetch document content
    doc_content = req(f"{api}/issues/be36fc02-f82d-4f88-971f-2b959e7f7edf/documents/{d['key']}")
    print(f"Body: {doc_content.get('body', '')[:500]}")
    print()

# Get full comments for WOR-36
print("=== WOR-36 FULL COMMENTS (last 20) ===")
comments = req(f"{api}/issues/1b90ba74-5e4f-4c64-ac30-bfd72801eebd/comments?order=desc")
for c in comments[:20]:
    author = c.get('authorAgentId', c.get('authorUserId', 'system'))
    body = c.get('body', '')[:300]
    print(f"[{c.get('createdAt')}] {author}: {body}")
    print()

# Get parent issue for WOR-36
print("=== WOR-36 PARENT ===")
parent = req(f"{api}/issues/8acff37d-3e62-40c2-9354-77f1eb932449")
print(f"Identifier: {parent.get('identifier')}")
print(f"Title: {parent.get('title')}")
print(f"Status: {parent.get('status')}")
print(f"Description: {parent.get('description', '')[:300]}")
