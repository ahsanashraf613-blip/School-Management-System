#!/bin/bash
# Verify the standalone HTML edition renders + navigates + dark mode works
cd /home/z/my-project
B="agent-browser"
F="file:///home/z/my-project/download/school-management.html"

echo "== 1. Open dashboard =="
$B set viewport 1440 900
$B open "$F"
sleep 2
$B snapshot > scripts/html-snap-dashboard.txt 2>&1
echo "-- key texts found:"
rg -o "Iqra Model School|Total Students|Teaching Staff|Fees Collected \(Oct\)|Attendance Today|Students by Class|Latest Notices" scripts/html-snap-dashboard.txt | sort -u
$B screenshot scripts/verify-html-dashboard.png

echo "== 2. Students view =="
$B open "$F#/students"
sleep 1.5
$B snapshot > scripts/html-snap-students.txt 2>&1
rg -o "Admit Student|Showing 1–10 of|All Classes" scripts/html-snap-students.txt | sort -u
$B screenshot scripts/verify-html-students.png

echo "== 3. Fees view =="
$B open "$F#/fees"
sleep 1.5
$B snapshot > scripts/html-snap-fees.txt 2>&1
rg -o "Collected — Oct 2026|Challan|Collect" scripts/html-snap-fees.txt | sort -u | head -5
$B screenshot scripts/verify-html-fees.png

echo "== 4. Timetable (Class 10) =="
$B open "$F#/timetable"
sleep 1.5
$B snapshot > scripts/html-snap-tt.txt 2>&1
rg -o "Physics|Chemistry|Pakistan Studies|Class Teacher" scripts/html-snap-tt.txt | sort -u
$B screenshot scripts/verify-html-timetable.png

echo "== 5. Exams =="
$B open "$F#/exams"
sleep 1.5
$B screenshot scripts/verify-html-exams.png

echo "== 6. Dark mode toggle =="
$B find role button click --name "Toggle dark mode" || echo "(toggle click failed)"
sleep 1.2
$B screenshot scripts/verify-html-dark.png

echo "== 7. Console errors =="
$B console 2>&1 | rg -i "error|uncaught" | head -10 || echo "(no console errors)"

echo "== DONE =="
ls -la scripts/verify-html-*.png