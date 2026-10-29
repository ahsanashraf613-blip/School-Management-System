#!/bin/bash
# Final comprehensive browser verification — everything in ONE call.
# Uses scoped snapshots + refs for the dialog and Radix select portal.

cd /home/z/my-project
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "✔ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "✘ $1"; }

# ── Start dev server ────────────────────────────────────────────────────────
(setsid nohup bun run dev > dev.log 2>&1 < /dev/null &)
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/bootstrap --max-time 3)
  [ "$code" = "200" ] && { echo "== server ready (${i}s) =="; break; }
done

agent-browser close > /dev/null 2>&1

# ── 1. Dashboard + backend data ─────────────────────────────────────────────
agent-browser open http://localhost:3000/ > /dev/null 2>&1
agent-browser wait --text "Total Students" --timeout 30000 > /dev/null 2>&1
sleep 1
TOTAL=$(agent-browser eval "const m=document.body.innerText.match(/Total Students\s*\n\s*(\d+)/); m?m[1]:'notfound'" 2>/dev/null | tr -d '"')
echo "  → Total Students = $TOTAL"
[ "$TOTAL" != "notfound" ] && [ "$TOTAL" -gt 0 ] 2>/dev/null && ok "dashboard shows backend data (133 expected)" || bad "dashboard backend data"
agent-browser eval "document.body.innerText.includes('Backend Connected')" 2>/dev/null | rg -q true && ok "'Backend Connected' badge" || bad "'Backend Connected' badge"
agent-browser screenshot scripts/verify-be3-dashboard.png > /dev/null 2>&1

# ── 2. Students view via deep link ─────────────────────────────────────────
agent-browser open "http://localhost:3000/#/students" > /dev/null 2>&1
agent-browser wait --text "New Admission" --timeout 25000 > /dev/null 2>&1
sleep 1
SHOWING=$(agent-browser eval "const m=document.body.innerText.match(/Showing[^\n]*/); m?m[0]:'notfound'" 2>/dev/null | tr -d '"')
echo "  → $SHOWING"
echo "$SHOWING" | rg -q "Showing 1–10 of $TOTAL" && ok "deep link #/students + pagination (of $TOTAL)" || bad "deep link #/students"

# ── 3. Open New Admission dialog, snapshot scoped ──────────────────────────
agent-browser find text "New Admission" click > /dev/null 2>&1
sleep 1.5
DIALOG=$(agent-browser eval "document.querySelector('[role=dialog]') ? 'open' : 'missing'" 2>/dev/null | tr -d '"')
echo "  → dialog: $DIALOG"
if [ "$DIALOG" = "open" ]; then
  ok "admission dialog opens"
  agent-browser snapshot -s "[role=dialog]" -i 2>/dev/null | head -30
else
  bad "admission dialog"
fi
