# WOR-36 Run State — OAuth Flow

## Completed (run 79f8e2ec)
- Copied client_secret.json to ~/.hermes/google_client_secret.json
- Created Python venv at /tmp/google-oauth with all required deps
- Generated OAuth authorization URL and posted to issue comment ID 2311ed87

## Pending
- User needs to paste redirect URL from browser after authorizing
- Then: exchange auth code for refresh token, test services, connect to Sue

## Auth URL (generated)
https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=653010986637-mjbjjp9qfkucefnvc3p5k791vq0pphd4.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A1&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.modify+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcontacts.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdocuments&state=WVz2emX1L1XwVi8n1CDAx8bXWtr7qf&code_challenge=yjBIhJWfHrALnjWmDjgIAjCVXkt4dpzDeA3L2vFi5pM&code_challenge_method=S256&access_type=offline&prompt=consent

## Setup command
/tmp/google-oauth/bin/python ~/.hermes/skills/productivity/google-workspace/scripts/setup.py

## Next steps on user response
1. Run: /tmp/google-oauth/bin/python setup.py --auth-code "<user_pasted_url>"
2. Run: /tmp/google-oauth/bin/python setup.py --check
3. Test each service (gmail, calendar, drive, docs, sheets, people)
4. Connect services to Sue
5. Brief Sue on capabilities
