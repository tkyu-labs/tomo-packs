#!/usr/bin/env bash
# The school information service (read-only, no key) with its address built in, so the agent never types it:
# a model writing the host itself once wrote "…gakuen.ac.jp" (the usual Japanese ending) and got no answer.
# Every skill that uses the service carries this same file (tools/validate.py checks that the copies are equal).
#
#   bash "<this folder>/school-api.sh" search   <<'JSON'   {"q": "…", "source": "…", …}   ranked passages
#   bash "<this folder>/school-api.sh" courses  <<'JSON'   {"form": "…", …}               courses by filters
#   bash "<this folder>/school-api.sh" calendar <<'JSON'   {"date": "…", "program": "…"}  the academic calendar
#   bash "<this folder>/school-api.sh" facets                                             values of every course field
#   bash "<this folder>/school-api.sh" course S-B231L03-01                                one course
#   bash "<this folder>/school-api.sh" document 12345                                     a whole page or PDF
#   bash "<this folder>/school-api.sh" --self-test                                        checks itself, no network
#
# Japanese goes only in the JSON body on standard input (a here-doc): Windows turns Japanese command-line arguments
# into "???". Output: the service's JSON (exit 0), or one line saying what to do next:
#   REQUEST ERROR …        (exit 2) the request was wrong: fix it as the message says and run it again
#   SERVICE UNAVAILABLE …  (exit 3) no answer after retries: tell the student, then use the skill's fallback
#   USAGE …                (exit 64) a wrong command name or argument
set -u
API="https://sitossapi.gakuen.ac/v1"

usage() {
  echo "USAGE: school-api.sh search|courses|calendar (JSON body as a here-doc) | facets | course <code> | document <id>." \
       "Copy the command from the skill; nothing else is needed." >&2
  exit 64
}

if [ "${1:-}" = "--self-test" ]; then
  case "$API" in https://*/v1) ;; *) echo "self-test: bad API address" >&2; exit 1 ;; esac
  command -v curl >/dev/null || { echo "self-test: curl is missing" >&2; exit 1; }
  echo "self-test ok: $API"
  exit 0
fi

method=GET
case "${1:-}" in
  search|courses|calendar)
    method=POST; path="/$1"
    body=$(cat)                       # the here-doc (empty when none was given)
    [ -n "${body//[[:space:]]/}" ] || body="{}" ;;
  facets)   path="/courses/facets" ;;
  course)   [[ "${2:-}" =~ ^[A-Za-z0-9-]+$ ]] || usage; path="/courses/$2" ;;
  document) [[ "${2:-}" =~ ^[0-9]+$ ]] || usage; path="/documents/$2" ;;
  *) usage ;;
esac

err=$(mktemp 2>/dev/null || echo "${TMPDIR:-/tmp}/school-api.$$")
# --retry: timeouts and HTTP 408 / 429 / 5xx are tried again (3 attempts in all)
if [ "$method" = POST ]; then
  out=$(printf '%s' "$body" | curl -sS --max-time 30 --retry 2 --retry-delay 2 -X POST "$API$path" \
        -H 'Content-Type: application/json' --data-binary @- -w '\n%{http_code}' 2>"$err")
else
  out=$(curl -sS --max-time 30 --retry 2 --retry-delay 2 "$API$path" -w '\n%{http_code}' 2>"$err")
fi
rc=$?
why=$(tr -d '\r' <"$err" | head -n 2 | tr '\n' ' ')
rm -f "$err"

if [ $rc -ne 0 ]; then
  case $rc in
    6)  reason="the service's host name could not be resolved (no internet, or a network that blocks it)" ;;
    7)  reason="the connection was refused" ;;
    28) reason="no answer within 30 seconds" ;;
    35|60) reason="the secure connection failed (a network that inspects HTTPS?)" ;;
    *)  reason="curl error $rc" ;;
  esac
  echo "SERVICE UNAVAILABLE: $reason. $why Tell the student the school information service cannot be reached from this computer right now, then use the fallback this skill names."
  exit 3
fi

code=${out##*$'\n'}
answer=${out%$'\n'*}
case "$code" in
  2??) printf '%s\n' "$answer"; exit 0 ;;
  429) echo "SERVICE UNAVAILABLE: the service is busy (HTTP 429) even after waiting. Tell the student, then use the fallback this skill names."; exit 3 ;;
  4??) echo "REQUEST ERROR (HTTP $code): $answer — the request was wrong, not the service. Fix it as the message says (filter values from facets, one value where one is expected) and run the command again; do not switch to the website for this."; exit 2 ;;
  *)   echo "SERVICE UNAVAILABLE: the service answered HTTP $code after retries. Tell the student, then use the fallback this skill names."; exit 3 ;;
esac
