#!/bin/bash
# Focused re-verification: dashboard stat parse, add-student UI flow (with
# shadcn Select interaction), DB persistence after reload.

cd /home/z/my-project
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "✔ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "✘ $1"; }

# ── Start dev server ───────────────────────────────────────────────────────
(setsid nohup bun run dev > dev.log 2>&1 < /dev/null &)
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/bootstrap --max-time 3)
  [ "$code" = "200" ] && { echo "server ready (${i}s)"; break; }
done

agent-browser close > /dev/null 2>&1
agent-browser open http://localhost:3000/ > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "Total Students" --timeout 25000 > /dev/null 2>&1

# ── Dashboard stat (line-based parse: title line → value line) ─────────────
DASH=$(agent-browser eval "document.body.innerText" 2>/dev/null)
STUDENTS_CARD=$(echo "$DASH" | awk '/^Total Students$/{getline; gsub(/[^0-9]/,""); print; exit}')
echo "  → Total Students = ${STUDENTS_CARD:-?}"
[ -n "$STUDENTS_CARD" ] && [ "$STUDENTS_CARD" -gt 0 ] 2>/dev/null && ok "backend data on dashboard" || bad "backend data on dashboard"

# ── Add student: open dialog ────────────────────────────────────────────────
agent-browser open "http://localhost:3000/#/students" > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "New Admission" --timeout 20000 > /dev/null 2>&1
sleep 1
agent-browser find text "New Admission" click > /dev/null 2>&1
sleep 1.2
agent-browser fill "#st-name" "Browser Verify Student" > /dev/null 2>&1
agent-browser fill "#st-father" "Verify Father" > /dev/null 2>&1

# Class = shadcn Select → click trigger (combobox labelled "Class"), pick first option
agent-browser find role combobox click --name "Class" > /dev/null 2>&1
sleep 0.8
agent-browser snapshot -i 2>/dev/null | rg -i "option" | head -4
agent-browser find role option click --name "Class 1" > /dev/null 2>&1
sleep 0.8
agent-browser screenshot scripts/verify-be2-form.png > /dev/null 2>&1

# Check the select shows a value before saving
SEL=$(agent-browser eval "document.querySelector('[aria-label=Class]')?.textContent ?? ''" 2>/dev/null)
echo "  → class select shows: '${SEL}'"

agent-browser find text "Admit Student" click > /dev/null 2>&1
sleep 3
STU2=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$STU2" | rg -q "Student admitted" && ok "toast 'Student admitted' shown" || echo "  (toast not captured — may have expired)"
TOTAL_AFTER=$(echo "$STU2" | rg -o 'of ([0-9]+)' -r '$1' | head -1)
echo "  → total after add = ${TOTAL_AFTER:-?}"
[ -n "$TOTAL_AFTER" ] && [ "$TOTAL_AFTER" -gt "$STUDENTS_CARD" ] 2>/dev/null && ok "student added via UI (${STUDENTS_CARD} → ${TOTAL_AFTER})" || bad "student add via UI"
echo "$STU2" | rg -q "Browser Verify Student" && ok "new student visible in list" || bad "new student in list"
agent-browser screenshot scripts/verify-be2-added.png > /dev/null 2>&1

# ── Persistence after reload ────────────────────────────────────────────────
agent-browser reload > /dev/null 2>&1
agent-browser wait --load networkidle > /dev/null 2>&1
agent-browser wait --text "New Admission" --timeout 20000 > /dev/null 2>&1
sleep 1.5
STU3=$(agent-browser eval "document.body.innerText" 2>/dev/null)
echo "$STU3" | rg -q "Browser Verify Student" && ok "added student persists after reload (DB-backed)" || bad "persistence after reload"

# ── Cleanup: delete the test student via API to restore demo data ──────────
DEL=$(curl -s http://localhost:3000/api/students | bun -e 'const d=await new Response(Bun.stdin.stream()).text();const j=JSON.parse(d);const s=j.find(x=>x.name==="Browser Verify Student");if(s){const r=await fetch("http://localhost:3000/api/students/"+s.id,{method:"DELETE"});console.log("deleted",s.id,r.status)}else{console.log("not found")}')
echo "  → cleanup: $DEL"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
exit $FAIL
