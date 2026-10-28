#!/bin/bash
# Final end-to-end browser verification for SkoolyPro backend integration.
# Runs the dev server + agent-browser checks in ONE call (processes are
# reaped between Bash tool invocations in this sandbox).

cd /home/z/my-project
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "✔ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "✘ $1"; }

# ── 1. Start dev server ────────────────────────────────────────────────────
(setsid nohup bun run dev > dev.log 2>&1 < /dev/null &)
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/bootstrap --max-time 3)
  [ "$code" = "200" ] && { echo "server ready (${i}s)"; break; }
done

# ── 2. Dashboard renders with backend data ─────────────────────────────────
agent-browser open http://localhost:3000/ > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "Total Students" --timeout 25000 > /dev/null 2>&1
agent-browser screenshot scripts/verify-be-dashboard.png > /dev/null 2>&1

DASH=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$DASH" | rg -q "Total Students" && ok "dashboard renders (Total Students card present)" || bad "dashboard render"
STUDENTS_CARD=$(echo "$DASH" | rg -A1 "Total Students" | head -2 | tail -1 | tr -dc '0-9')
echo "  → Total Students = ${STUDENTS_CARD:-?}"
[ -n "$STUDENTS_CARD" ] && [ "$STUDENTS_CARD" -gt 0 ] 2>/dev/null && ok "backend data displayed (students > 0)" || bad "backend data on dashboard"
echo "$DASH" | rg -qi "Backend Connected" && ok "'Backend Connected' badge shown" || bad "backend badge"

# ── 3. Deep link #/students loads students view directly (lazy-init fix) ───
agent-browser open "http://localhost:3000/#/students" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "New Admission" --timeout 20000 > /dev/null 2>&1
STU=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$STU" | rg -q "Showing .* of " && ok "deep link #/students lands on students view (lazy useState init works)" || bad "deep link #/students"
echo "  → $(echo "$STU" | rg -o 'Showing [0-9]+–[0-9]+ of [0-9]+' | head -1)"
agent-browser screenshot scripts/verify-be-students.png > /dev/null 2>&1

# ── 4. Add a student through the UI → persists in DB ──────────────────────
agent-browser find text "New Admission" click > /dev/null 2>&1
sleep 1
agent-browser fill "#st-name" "Browser Verify Student" > /dev/null 2>&1 \
  || agent-browser eval "document.getElementById('st-name')?.focus()" > /dev/null 2>&1
agent-browser fill "#st-father" "Verify Father" > /dev/null 2>&1
agent-browser screenshot scripts/verify-be-addform.png > /dev/null 2>&1
agent-browser find text "Admit Student" click > /dev/null 2>&1
sleep 2.5
STU2=$(agent-browser eval "document.body.innerText" 2>/dev/null)
TOTAL_AFTER=$(echo "$STU2" | rg -o 'of ([0-9]+)' -r '$1' | head -1)
echo "  → total students after add = ${TOTAL_AFTER:-?}"
[ -n "$TOTAL_AFTER" ] && [ "$TOTAL_AFTER" -gt "$STUDENTS_CARD" ] 2>/dev/null \
  && ok "student added via UI (count ${STUDENTS_CARD} → ${TOTAL_AFTER})" || bad "student add via UI"
echo "$STU2" | rg -q "Browser Verify Student" && ok "new student visible in list" || bad "new student in list"

# ── 5. Persistence: reload → data still there (served by API/DB) ──────────
agent-browser reload > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "New Admission" --timeout 20000 > /dev/null 2>&1
sleep 1
STU3=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$STU3" | rg -q "Browser Verify Student" && ok "added student persists after reload (DB-backed)" || bad "persistence after reload"

# ── 6. Fees view via deep link ────────────────────────────────────────────
agent-browser open "http://localhost:3000/#/fees" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
sleep 1
FEE=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$FEE" | rg -qi "challan" && ok "fees view shows challans from API" || bad "fees view"
agent-browser screenshot scripts/verify-be-fees.png > /dev/null 2>&1

# ── 7. Timetable + notices quick checks ───────────────────────────────────
agent-browser open "http://localhost:3000/#/timetable" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1; sleep 1
TT=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$TT" | rg -qi "monday" && ok "timetable weekly grid renders" || bad "timetable"
agent-browser open "http://localhost:3000/#/notices" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1; sleep 1
NT=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$NT" | rg -qi "notice" && ok "notices view renders" || bad "notices"
agent-browser screenshot scripts/verify-be-notices.png > /dev/null 2>&1

# ── 8. Console + page errors ───────────────────────────────────────────────
ERRS=$(agent-browser errors 2>/dev/null)
CONS=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "api-error|Server error" | head -5)
[ -z "$ERRS" ] && ok "no page errors" || bad "page errors: $ERRS"
[ -z "$CONS" ] && ok "no console errors" || bad "console errors: $CONS"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
exit $FAIL
