#!/bin/bash
# FINAL comprehensive browser verification — SkoolyPro backend integration.
# All checks in ONE call. Role-based clicks; ref parsing from scoped snapshots.

cd /home/z/my-project
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "✔ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "✘ $1"; }
refof() { echo "$1" | rg "$2" | rg -o 'ref=e[0-9]+' | head -1 | rg -o 'e[0-9]+'; }

# ── Start dev server ────────────────────────────────────────────────────────
(setsid nohup bun run dev > dev.log 2>&1 < /dev/null &)
for i in $(seq 1 60); do
  sleep 1
  c1=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/bootstrap --max-time 3)
  c2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ --max-time 5)
  [ "$c1" = "200" ] && [ "$c2" = "200" ] && { echo "== server + page ready (${i}s) =="; break; }
done

agent-browser close > /dev/null 2>&1

# ── 1. Dashboard renders with backend data ──────────────────────────────────
agent-browser open http://localhost:3000/ > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "Total Students" --timeout 30000 > /dev/null 2>&1
sleep 1
# stat labels may be CSS-uppercased → case-insensitive match
TOTAL=$(agent-browser eval "const m=document.body.innerText.match(/total students\s*\n\s*([\d,]+)/i); m?m[1].replace(/,/g,''):'notfound'" 2>/dev/null | tr -d '"')
echo "  → Total Students = $TOTAL"
[ "$TOTAL" != "notfound" ] && [ "$TOTAL" -gt 0 ] 2>/dev/null && ok "dashboard stat card shows backend data" || bad "dashboard stat card"
agent-browser eval "document.body.innerText" 2>/dev/null | rg -qi "Backend Connected" && ok "'Backend Connected' badge in sidebar" || bad "'Backend Connected' badge"
agent-browser screenshot scripts/verify-be4-dashboard.png > /dev/null 2>&1

# ── 2. Deep link → students view ────────────────────────────────────────────
agent-browser open "http://localhost:3000/#/students" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "New Admission" --timeout 30000 > /dev/null 2>&1
sleep 1
SHOWING=$(agent-browser eval "const m=document.body.innerText.match(/Showing[^\n]+/); m?m[0]:'notfound'" 2>/dev/null | tr -d '"')
echo "  → $SHOWING"
echo "$SHOWING" | rg -q "of $TOTAL" && ok "deep link #/students + pagination consistent" || bad "deep link #/students"

# ── 3. Add student through the UI (dialog + Radix select) ───────────────────
agent-browser find role button click --name "New Admission" > /dev/null 2>&1
sleep 1.5
DLG=$(agent-browser eval "document.querySelectorAll('[role=dialog]').length" 2>/dev/null | tr -d '"')
[ "$DLG" = "1" ] && ok "admission dialog opens" || { bad "admission dialog (got $DLG)"; echo "RESULT: $PASS/$FAIL"; exit 1; }

SNAP=$(agent-browser snapshot -s "[role=dialog]" -i 2>/dev/null)
echo "  → dialog controls:"; echo "$SNAP" | rg 'textbox|combobox|button' | head -12 | sed 's/^/    /'
NAME_REF=$(refof "$SNAP" 'Student Name')
FATH_REF=$(refof "$SNAP" 'Father Name')
CLS_REF=$(refof "$SNAP" 'combobox.*Class|Class.*combobox')
agent-browser fill "@$NAME_REF" "Browser Verify Student" > /dev/null 2>&1
agent-browser fill "@$FATH_REF" "Verify Father" > /dev/null 2>&1
agent-browser click "@$CLS_REF" > /dev/null 2>&1
sleep 1
OPT_REF=$(refof "$(agent-browser snapshot -i 2>/dev/null)" 'option "Class 1"')
agent-browser click "@$OPT_REF" > /dev/null 2>&1
sleep 0.8
CLSVAL=$(agent-browser eval "document.querySelector('[role=dialog] [aria-label=Class]')?.textContent ?? 'none'" 2>/dev/null | tr -d '"')
echo "  → class select now shows: '$CLSVAL'"
echo "$CLSVAL" | rg -q "Class 1" && ok "class chosen via Radix select" || bad "class select"
agent-browser screenshot scripts/verify-be4-form.png > /dev/null 2>&1

ADMIT_REF=$(refof "$(agent-browser snapshot -s '[role=dialog]' -i 2>/dev/null)" 'Admit Student')
agent-browser click "@$ADMIT_REF" > /dev/null 2>&1
sleep 3
PAGE=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$PAGE" | rg -q "Browser Verify Student" && ok "new student appears in list" || bad "new student in list"
AFTER=$(echo "$PAGE" | rg -o 'of ([0-9]+)' -r '$1' | head -1)
echo "  → total after add = ${AFTER:-?}"
[ -n "$AFTER" ] && [ "$AFTER" -gt "$TOTAL" ] 2>/dev/null && ok "count increased ($TOTAL → $AFTER)" || bad "count increase"
echo "$PAGE" | rg -q "Student admitted" && ok "'Student admitted' toast" || echo "  (toast already expired — acceptable)"
agent-browser screenshot scripts/verify-be4-added.png > /dev/null 2>&1

# ── 4. Persistence: reload → still there (server DB, not client state) ──────
agent-browser reload > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "New Admission" --timeout 30000 > /dev/null 2>&1
sleep 1.5
RE=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$RE" | rg -q "Browser Verify Student" && ok "student persists after full reload (SQLite-backed)" || bad "persistence after reload"
RSHOW=$(echo "$RE" | rg -o 'Showing[^\n]+' | head -1)
echo "  → after reload: $RSHOW"

# ── 5. Server-side truth check (direct API) ─────────────────────────────────
API_COUNT=$(curl -s http://localhost:3000/api/students | bun -e 'const j=await new Response(Bun.stdin.stream()).text();console.log(JSON.parse(j).length)')
echo "  → GET /api/students count = $API_COUNT"
[ "$API_COUNT" = "$AFTER" ] && ok "API student count matches UI" || bad "API vs UI count"

# ── 6. Fees + timetable render from API ─────────────────────────────────────
agent-browser open "http://localhost:3000/#/fees" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1; sleep 1.5
agent-browser eval "document.body.innerText" 2>/dev/null | rg -qi "challan" && ok "fees view renders challans" || bad "fees view"
agent-browser screenshot scripts/verify-be4-fees.png > /dev/null 2>&1
agent-browser open "http://localhost:3000/#/timetable" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1; sleep 1.5
agent-browser eval "document.body.innerText" 2>/dev/null | rg -qi "monday" && ok "timetable grid renders" || bad "timetable"

# ── 7. Errors ────────────────────────────────────────────────────────────────
ERRS=$(agent-browser errors 2>/dev/null)
[ -z "$ERRS" ] && ok "no page errors" || bad "page errors: $(echo "$ERRS" | head -3)"

# ── 8. Cleanup: remove test student via API ─────────────────────────────────
CLEAN=$(bun -e 'const j=await (await fetch("http://localhost:3000/api/students")).json();const s=j.find(x=>x.name==="Browser Verify Student");if(s){const r=await fetch("http://localhost:3000/api/students/"+s.id,{method:"DELETE"});console.log("deleted:"+r.status)}else{console.log("none")}' 2>/dev/null)
echo "  → cleanup: $CLEAN"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
exit $FAIL
