"use strict";
// ── Icons (inline SVG, lucide-style) ───────────────────────────────────────
const ICONS={
  cap:'<path d="M2 9.5 12 4.5l10 5-10 5z"/><path d="M6.5 11.8V16c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3v-4.2"/><path d="M22 9.5V15"/>',
  dashboard:'<rect x="3" y="3" width="7.5" height="9.5" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.8"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.8"/><rect x="3" y="15.5" width="7.5" height="5.5" rx="1.8"/>',
  students:'<circle cx="9" cy="8" r="3.4"/><path d="M2.6 20a6.6 6.6 0 0 1 12.8 0"/><path d="M16.5 4.6a3.4 3.4 0 0 1 0 6.6"/><path d="M17.8 14.2c2.2.9 3.6 2.7 3.6 5.2"/>',
  teachers:'<circle cx="12" cy="8" r="3.8"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  classes:'<path d="M14.5 21v-6.2a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1V21"/><path d="M3.5 10 12 3.5 20.5 10"/><path d="M5.5 8.6V21h13V8.6"/>',
  attendance:'<rect x="5" y="4" width="14" height="18" rx="2.2"/><path d="M9 2.2h6V6H9z"/><path d="M8.8 13l2.2 2.2 4.2-4.2"/>',
  fees:'<path d="M3.5 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M16.2 12h.01"/><path d="M3.5 9h17"/>',
  exams:'<path d="M4.5 19.5V5a2 2 0 0 1 2-2H20v16.5H6.5a2 2 0 0 0-2 2z"/><path d="M8.5 11.5l2 2 4.5-4.5"/><path d="M4.5 19.5A2 2 0 0 0 6.5 21.5H20"/>',
  timetable:'<rect x="3" y="5" width="18" height="16" rx="2.2"/><path d="M8 2.8v4.4M16 2.8v4.4M3 10.5h18"/>',
  notices:'<path d="M3 10.5v3.4a1 1 0 0 0 1 1h1.8L9 20.5h2.2v-5.4"/><path d="M11.2 15.1 21 17.2V5.3l-9.8 2.1z"/><path d="M11.2 7.4v7.7"/>',
  expenses:'<path d="M5.5 2.8h13v18.4l-2.2-1.6-2.1 1.6-2.2-1.6-2.1 1.6-2.2-1.6-2.2 1.6z"/><path d="M9.2 7.8h6M9.2 11.5h6M9.2 15.2h3.4"/>',
  settings:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8"/>',
  menu:'<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  mega:'<path d="M3 10.5v3.4a1 1 0 0 0 1 1h1.8L9 20.5h2.2v-5.4"/><path d="M11.2 15.1 21 17.2V5.3l-9.8 2.1z"/>',
  wallet:'<path d="M3.5 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M16.2 12h.01"/><path d="M3.5 9h17"/>'
};
function icon(n,s=18){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ICONS[n]+'</svg>';}

// ── Deterministic PRNG (same seed approach as the Next.js app) ────────────
function mulberry32(seed){return function(){let t=(seed+=0x6d2b79f5);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;}}
let rand=mulberry32(20261028);
const pick=a=>a[Math.floor(rand()*a.length)];
const between=(mn,mx)=>mn+Math.floor(rand()*(mx-mn+1));

// ── School profile ────────────────────────────────────────────────────────
const SCHOOL={name:"Iqra Model School",tagline:"Knowledge · Character · Excellence",
  address:"12-A Gulberg III, Lahore, Punjab",phone:"+92 300 1234567",
  email:"info@iqramodelschool.edu.pk",session:"2026 – 2027",principal:"Prof. Anwar Siddiqui"};

const CLASS_LEVELS=["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10"];
const CORE_SUBJECTS=["English","Urdu","Mathematics","Science","Islamiat","Social Studies"];
const SENIOR_SUBJECTS=["English","Urdu","Mathematics","Science","Islamiat","Social Studies","Computer"];
const HIGH_SCHOOL_SUBJECTS=["English","Urdu","Mathematics","Physics","Chemistry","Biology","Islamiat","Pakistan Studies"];
const PERIODS=["08:00 - 08:45","08:50 - 09:35","09:40 - 10:25","10:30 - 11:15","11:45 - 12:30","12:35 - 13:20","13:25 - 14:10","14:15 - 15:00"];
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat"];

// ── Teachers (same 16 staff members) ──────────────────────────────────────
const TEACHER_SEED=[
  ["Farhana Qureshi","Female","English","M.A English",65000],
  ["Muhammad Imran","Male","Mathematics","M.Sc Mathematics",70000],
  ["Sadia Kamran","Female","Science","M.Sc Physics",68000],
  ["Ahmed Nawaz","Male","Urdu","M.A Urdu",60000],
  ["Hafiza Maryam","Female","Islamiat","M.A Islamic Studies",58000],
  ["Bilal Hussain","Male","Computer","BS Computer Science",75000],
  ["Nadia Aslam","Female","Social Studies","M.A History",57000],
  ["Kashif Mehmood","Male","Mathematics","M.Phil Mathematics",80000],
  ["Rabia Anwar","Female","English","B.Ed, M.A English",62000],
  ["Usman Ghani","Male","Science","M.Sc Chemistry",66000],
  ["Saima Tariq","Female","Urdu","M.A Urdu",56000],
  ["Zubair Ahmed","Male","Social Studies","M.A Geography",59000],
  ["Rashid Minhas","Male","Physics","M.Sc Physics",72000],
  ["Ayesha Siddiqa","Female","Chemistry","M.Sc Chemistry",70000],
  ["Fizzah Nadeem","Female","Biology","M.Sc Botany",68000],
  ["Tariq Mehmood","Male","Pakistan Studies","M.A Pakistan Studies",58000]
];
const PREFIXES=["0300","0301","0321","0333","0345","0302"];
const makePhone=()=>pick(PREFIXES)+"-"+between(1000000,9999999);

function buildTeachers(){
  return TEACHER_SEED.map((t,i)=>{
    const [name,gender,subject,qual,salary]=t;
    return {id:"tch-"+(i+1),employeeNo:"EMP-"+(101+i),name,gender,subject,
      phone:makePhone(),email:name.toLowerCase().replace(/[^a-z]+/g,".")+"@iqramodel.edu.pk",
      qualification:qual,joinDate:between(2016,2024)+"-"+String(1+((i*5)%10)).padStart(2,"0")+"-"+String(between(1,28)).padStart(2,"0"),
      salary,status:i===10?"On Leave":"Active"};
  });
}

// ── Classes ───────────────────────────────────────────────────────────────
function buildClasses(teachers){
  return CLASS_LEVELS.map((name,i)=>{
    const matric=i>=8,senior=i>=4;
    return {id:"cls-"+(i+1),name,level:i+1,sections:i%3===2?["A"]:["A","B"],
      classTeacherId:teachers[i%teachers.length].id,monthlyFee:1800+i*400,
      subjects:matric?HIGH_SCHOOL_SUBJECTS:senior?SENIOR_SUBJECTS:CORE_SUBJECTS,roomNo:"R-"+(100+i)};
  });
}

// ── Students ──────────────────────────────────────────────────────────────
const FIRST_M=["Ahmed","Muhammad","Bilal","Hamza","Usman","Ali","Hassan","Umar","Abdullah","Saad","Talha","Zain","Ibrahim","Faizan","Danish","Rehan"];
const FIRST_F=["Ayesha","Fatima","Maryam","Hira","Zainab","Amna","Sana","Iqra","Noor","Laiba","Mahnoor","Eman","Areeba","Sara","Kinza","Hafsa"];
const LASTS=["Khan","Ahmed","Raza","Malik","Butt","Sheikh","Qureshi","Siddiqui","Chaudhry","Mirza","Hashmi","Farooq","Nawaz","Iqbal","Aslam","Javed"];
const BLOOD=["A+","A-","B+","B-","O+","O-","AB+"];
const AREAS=["Gulberg III","Model Town","Johar Town","DHA Phase 4","Township","Cantt","Faisal Town","Iqbal Town"];

function buildStudents(classes){
  const perClass=[16,16,17,16,15,16,17,16,16,13]; // 158 total
  const out=[];let n=0;
  classes.forEach((c,ci)=>{
    const rolls={};
    for(let k=0;k<perClass[ci];k++){
      n++;
      const gender=rand()<0.5?"Male":"Female";
      const first=gender==="Male"?pick(FIRST_M):pick(FIRST_F);
      const last=pick(LASTS);
      const sec=c.sections.length===1?"A":(rand()<0.5?"A":"B");
      rolls[sec]=(rolls[sec]||0)+1;
      out.push({id:"std-"+String(n).padStart(3,"0"),
        name:first+" "+last,
        fatherName:pick(FIRST_M)+" "+last,
        gender,classId:c.id,section:sec,
        rollNo:"R-"+String(rolls[sec]).padStart(2,"0"),
        bloodGroup:pick(BLOOD),
        phone:makePhone(),
        address:between(1,240)+", "+pick(AREAS)+", Lahore",
        dob:(2012-c.level)+"-"+String(between(1,12)).padStart(2,"0")+"-"+String(between(1,28)).padStart(2,"0"),
        admissionDate:(2018-Math.floor(c.level/2))+"-0"+between(1,9)+"-"+String(between(10,28)),
        monthlyFee:c.monthlyFee,status:rand()<0.04?"Inactive":"Active"});
    }
  });
  return out;
}

// ── Attendance (last 7 school days ending Wed 28 Oct 2026) ────────────────
const TODAY="2026-10-28";
const ATT_DATES=["2026-10-21","2026-10-22","2026-10-23","2026-10-24","2026-10-26","2026-10-27","2026-10-28"];
function buildAttendance(students){
  const rows=[];
  students.forEach(s=>{
    if(s.status!=="Active")return;
    ATT_DATES.forEach(d=>{
      const r=rand();
      rows.push({studentId:s.id,date:d,status:r<0.92?"Present":r<0.96?"Absent":"Late"});
    });
  });
  return rows;
}

// ── Fee challans (May–Oct 2026) ───────────────────────────────────────────
const FEE_MONTHS=["2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"];
const MONTH_NAMES={ "2026-05":"May 2026","2026-06":"Jun 2026","2026-07":"Jul 2026","2026-08":"Aug 2026","2026-09":"Sep 2026","2026-10":"Oct 2026"};
function buildFees(students){
  const rows=[];let n=0;
  students.forEach(s=>{
    if(s.status!=="Active")return;
    FEE_MONTHS.forEach((m,mi)=>{
      n++;
      const r=rand();
      let status="Pending",paidDate=null;
      if(mi<5){ if(r<0.86){status="Paid";paidDate=m+"-"+String(between(3,12)).padStart(2,"0");} else if(r<0.94)status="Pending"; else status="Overdue"; }
      else { if(r<0.62){status="Paid";paidDate=m+"-"+String(between(2,20)).padStart(2,"0");} else if(r<0.85)status="Pending"; else status="Overdue"; }
      rows.push({id:"chl-"+String(n).padStart(4,"0"),challanNo:"CH-2026-"+String(n).padStart(4,"0"),
        studentId:s.id,month:m,amount:s.monthlyFee,issueDate:m+"-01",dueDate:m+"-10",status,paidDate});
    });
  });
  return rows;
}

// ── Exams & marks ─────────────────────────────────────────────────────────
const EXAMS=[{id:"exam-1",name:"First Term 2026",status:"Published",term:"First Term"},
  {id:"exam-2",name:"Mid Term 2026",status:"Upcoming",term:"Mid Term"}];
function buildMarks(students,classes){
  const marks=[];
  students.forEach(s=>{
    if(s.status!=="Active")return;
    const cls=classes.find(c=>c.id===s.classId);
    cls.subjects.forEach(sub=>{
      marks.push({examId:"exam-1",studentId:s.id,subject:sub,
        total:between(38,98),maxMarks:100});
    });
  });
  return marks;
}

// ── Timetable ─────────────────────────────────────────────────────────────
function buildTimetable(classes,teachers){
  const slots=[];
  classes.forEach(c=>{
    DAYS.forEach((d,di)=>{
      PERIODS.forEach((p,pi)=>{
        const subject=c.subjects[(di+pi)%c.subjects.length];
        const t=teachers.find(t=>t.subject===subject)||teachers.find(t=>t.id===c.classTeacherId);
        slots.push({classId:c.id,day:d,period:pi+1,time:p,subject,teacherId:t.id});
      });
    });
  });
  return slots;
}

// ── Notices & expenses ────────────────────────────────────────────────────
const NOTICES=[
  {id:"n1",title:"Mid Term Examination Schedule",type:"Urgent",date:"2026-10-24",body:"Mid Term papers for Class 1 to Class 10 begin on 9 November. The full date sheet has been shared with class teachers and is also available in the Exams section."},
  {id:"n2",title:"Fee Deadline — October Challans",type:"Warning",date:"2026-10-20",body:"October fee challans are due by 31 October. Unpaid challans after the due date will incur a Rs. 200 late fee surcharge as per school policy."},
  {id:"n3",title:"Parent–Teacher Meeting",type:"Event",date:"2026-10-18",body:"PTM for all classes will be held on Saturday, 7 November, 9:00 AM to 1:00 PM. Parents are requested to collect their child's First Term report card from the class teacher."},
  {id:"n4",title:"Annual Sports Gala 2026",type:"Event",date:"2026-10-12",body:"The Annual Sports Gala will be held on 14–15 November at the main ground. Trials for athletics, cricket and football start next week during games period."},
  {id:"n5",title:"Winter Uniform from 1 November",type:"Info",date:"2026-10-08",body:"Students must wear the complete winter uniform (navy sweater with school monogram) starting 1 November. Summer uniform will resume in March."},
  {id:"n6",title:"Admissions Open — Session 2027",type:"Info",date:"2026-09-30",body:"Limited seats available in Class 1, Class 6 and Class 9 for the 2027 session. Registration forms are available at the school office, Monday to Saturday, 8:30 AM – 2:00 PM."}
];
const EXPENSES=[
  {id:"x1",date:"2026-10-05",category:"Salaries",description:"Teaching & admin staff salaries — October",amount:1024000,status:"Paid"},
  {id:"x2",date:"2026-10-08",category:"Utilities",description:"Electricity bill — September",amount:86500,status:"Paid"},
  {id:"x3",date:"2026-10-11",category:"Transport",description:"Bus fleet fuel & maintenance",amount:52000,status:"Paid"},
  {id:"x4",date:"2026-10-14",category:"Academic",description:"Science lab equipment (Physics kits)",amount:74300,status:"Paid"},
  {id:"x5",date:"2026-10-17",category:"Facilities",description:"Classroom furniture — Class 3 wing",amount:38000,status:"Pending"},
  {id:"x6",date:"2026-10-19",category:"Facilities",description:"Cleaning supplies & sanitisation",amount:12500,status:"Paid"},
  {id:"x7",date:"2026-10-21",category:"IT",description:"Internet & computer lab licences",amount:9800,status:"Paid"},
  {id:"x8",date:"2026-10-24",category:"Events",description:"Annual Sports Gala arrangements",amount:21000,status:"Pending"},
  {id:"x9",date:"2026-09-28",category:"Academic",description:"Library books — English readers",amount:45600,status:"Paid"},
  {id:"x10",date:"2026-09-30",category:"Utilities",description:"Water supply tankers",amount:6400,status:"Paid"}
];

// ── Build the database ────────────────────────────────────────────────────
function buildDB(){
  rand=mulberry32(20261028); // reseed so Reset Demo Data reproduces the exact original dataset
  const teachers=buildTeachers();
  const classes=buildClasses(teachers);
  const students=buildStudents(classes);
  return {profile:SCHOOL,teachers,classes,students,
    attendance:buildAttendance(students),fees:buildFees(students),
    exams:EXAMS,marks:buildMarks(students,classes),
    timetable:buildTimetable(classes,teachers),notices:NOTICES,expenses:EXPENSES};
}
let DB=buildDB();
// ── Helpers ───────────────────────────────────────────────────────────────
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rs=n=>"Rs. "+Number(n||0).toLocaleString("en-PK");
const fmtD=d=>{const dt=new Date(d+"T00:00:00");return dt.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});};
const cls=id=>DB.classes.find(c=>c.id===id);
const stu=id=>DB.students.find(s=>s.id===id);
const tch=id=>DB.teachers.find(t=>t.id===id);
const activeStudents=()=>DB.students.filter(s=>s.status==="Active");
const HUES=[168,25,80,250,305,20,140,205,270,45,190,335];
function avatar(name){const h=HUES[(name.length+name.charCodeAt(0))%HUES.length];
  const ini=name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return '<div class="avatar" style="background:hsl('+h+',45%,42%)">'+esc(ini)+'</div>';}
function chip(text,kind){return '<span class="chip '+kind+'">'+esc(text)+'</span>';}
function statusChip(st){const map={Active:"ok",Present:"ok",Paid:"ok","On Leave":"info",Late:"warn",Pending:"warn",Overdue:"bad",Absent:"bad",Inactive:"mut"};
  return chip(st,map[st]||"mut");}
function gradeOf(p){return p>=80?["A+","a"]:p>=70?["A","a"]:p>=60?["B","b"]:p>=50?["C","c"]:p>=40?["D","c"]:["F","f"];}
function subjHue(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return HUES[h%HUES.length];}

// ── Toasts ────────────────────────────────────────────────────────────────
function toast(title,sub,kind){
  const t=document.createElement("div");t.className="toast"+(kind==="err"?" err":"");
  t.innerHTML="<b>"+esc(title)+"</b>"+(sub?"<span>"+esc(sub)+"</span>":"");
  $("toasts").appendChild(t);
  setTimeout(()=>{t.style.transition="opacity .3s,transform .3s";t.style.opacity="0";t.style.transform="translateY(8px)";
    setTimeout(()=>t.remove(),320);},3400);
}

// ── Modal ─────────────────────────────────────────────────────────────────
function openModal(html){$("modal").innerHTML=html;$("overlay").classList.add("open");}
function closeModal(){$("overlay").classList.remove("open");}
$("overlay").addEventListener("click",e=>{if(e.target===$("overlay"))closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

// ── Theme ─────────────────────────────────────────────────────────────────
function applyTheme(dark){document.documentElement.classList.toggle("dark",dark);
  $("btn-theme").innerHTML=icon(dark?"sun":"moon");try{localStorage.setItem("skoolypro-theme",dark?"dark":"light");}catch(e){}}
try{if(localStorage.getItem("skoolypro-theme")==="dark")applyTheme(true);else applyTheme(false);}catch(e){applyTheme(false);}
$("btn-theme").addEventListener("click",()=>applyTheme(!document.documentElement.classList.contains("dark")));

// ── Sidebar ───────────────────────────────────────────────────────────────
const NAV=[
  {label:"Overview",items:[["dashboard","Dashboard","dashboard"]]},
  {label:"People",items:[["students","Students","students"],["teachers","Teachers","teachers"],["classes","Classes & Sections","classes"]]},
  {label:"Academics",items:[["attendance","Attendance","attendance"],["exams","Exams & Results","exams"],["timetable","Timetable","timetable"]]},
  {label:"Operations",items:[["fees","Fee Management","fees"],["notices","Notice Board","notices"],["expenses","Expenses","expenses"]]},
  {label:"System",items:[["settings","Settings","settings"]]}
];
const TITLES={dashboard:["Dashboard","School overview"],students:["Students","Admissions & records"],
  teachers:["Teachers","Faculty directory"],classes:["Classes & Sections","Class 1 — Class 10"],
  attendance:["Attendance","Daily register"],fees:["Fee Management","Challans & collection"],
  exams:["Exams & Results","Term results & grades"],timetable:["Timetable","Weekly class schedule"],
  notices:["Notice Board","School announcements"],expenses:["Expenses","Spending & utilities"],
  settings:["Settings","School profile"]};
function buildNav(){
  $("sb-nav").innerHTML=NAV.map(g=>'<div class="sb-group">'+g.label+'</div>'+g.items.map(it=>
    '<a href="#/'+it[0]+'" data-k="'+it[0]+'">'+icon(it[2])+esc(it[1])+'</a>').join("")).join("");
  $("logo-mark").innerHTML=icon("cap",22);
}
buildNav();
$("btn-menu").innerHTML=icon("menu");
$("btn-menu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("sb-school").textContent=SCHOOL.name;
const d=new Date(TODAY+"T08:00:00");
$("today-chip").textContent=d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});

// ── Router ────────────────────────────────────────────────────────────────
let UI={studentPage:1,studentQ:"",studentClass:"",studentStatus:"",
  feeMonth:"2026-10",feeStatus:"",feePage:1,attClass:"cls-1",examId:"exam-1",examClass:"cls-10",ttClass:"cls-10"};
function route(){
  const k=(location.hash||"#/dashboard").replace("#/","")||"dashboard";
  const fn=VIEWS[k]||VIEWS.dashboard;
  const t=TITLES[k]||TITLES.dashboard;
  $("pg-title").textContent=t[0];$("pg-sub").textContent=t[1];
  document.querySelectorAll("#sb-nav a").forEach(a=>a.classList.toggle("active",a.dataset.k===k));
  $("sidebar").classList.remove("open");
  renderInto(k);
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
function renderInto(k){const v=$("view");const fn=VIEWS[k]||VIEWS.dashboard;
  v.classList.remove("view-enter");void v.offsetWidth;
  v.innerHTML='<div class="view-enter">'+fn()+'</div>';
  if(BINDS[k])BINDS[k]();
  v.classList.add("view-enter");}
// ══ VIEWS ═════════════════════════════════════════════════════════════════
const VIEWS={},BINDS={};
const cOpts=()=>DB.classes.map(c=>[c.id,c.name]);
function opts(arr,cur){return arr.map(v=>'<option value="'+esc(v[0])+'"'+(v[0]===cur?" selected":"")+'>'+esc(v[1])+'</option>').join("");}

// ── Dashboard ─────────────────────────────────────────────────────────────
VIEWS.dashboard=function(){
  const act=activeStudents();
  const inactive=DB.students.length-act.length;
  const octPaid=DB.fees.filter(f=>f.month==="2026-10"&&f.status==="Paid").reduce((a,f)=>a+f.amount,0);
  const todayRows=DB.attendance.filter(a=>a.date===TODAY);
  const todayPct=Math.round(todayRows.filter(a=>a.status!=="Absent").length/todayRows.length*100);
  const onLeave=DB.teachers.filter(t=>t.status==="On Leave").length;
  const series=ATT_DATES.map(d=>{const rows=DB.attendance.filter(a=>a.date===d);
    return Math.round(rows.filter(a=>a.status!=="Absent").length/rows.length*100);});
  const dayLbl=ATT_DATES.map(d=>new Date(d+"T00:00:00").toLocaleDateString("en-GB",{weekday:"short"}));
  // SVG line chart
  const w=560,h=205,pad=34,lo=78,hi=102;
  const xs=i=>pad+i*(w-pad*2)/(series.length-1);
  const ys=v=>h-pad-(v-lo)*(h-pad*2)/(hi-lo);
  const pts=series.map((v,i)=>xs(i).toFixed(1)+","+ys(v).toFixed(1)).join(" ");
  const area="M"+xs(0).toFixed(1)+","+(h-pad)+" L"+series.map((v,i)=>xs(i).toFixed(1)+","+ys(v).toFixed(1)).join(" L")+" L"+xs(series.length-1).toFixed(1)+","+(h-pad)+" Z";
  const grid=[80,85,90,95,100].map(v=>'<line x1="'+pad+'" y1="'+ys(v)+'" x2="'+(w-pad)+'" y2="'+ys(v)+'" stroke="currentColor" stroke-opacity=".08"/>'+
    '<text x="'+(pad-7)+'" y="'+(ys(v)+3.5)+'" text-anchor="end" font-size="10" fill="currentColor" opacity=".45">'+v+'%</text>').join("");
  const dots=series.map((v,i)=>'<circle cx="'+xs(i).toFixed(1)+'" cy="'+ys(v).toFixed(1)+'" r="3.6" fill="var(--card)" stroke="var(--primary)" stroke-width="2"><title>'+dayLbl[i]+': '+v+'%</title></circle>').join("");
  // fee bars
  const feeM=FEE_MONTHS.map(m=>{const rows=DB.fees.filter(f=>f.month===m);
    return {m,c:rows.filter(f=>f.status==="Paid").reduce((a,f)=>a+f.amount,0),
      p:rows.filter(f=>f.status!=="Paid").reduce((a,f)=>a+f.amount,0)};});
  const fmax=Math.max.apply(null,feeM.map(x=>Math.max(x.c,x.p)));
  const bars=feeM.map(x=>'<div class="bar-g"><div class="bar-pair">'+
    '<div class="bar c" style="height:'+Math.max(2,Math.round(x.c/fmax*100))+'%" title="Collected '+rs(x.c)+'"></div>'+
    '<div class="bar p" style="height:'+Math.max(2,Math.round(x.p/fmax*100))+'%" title="Outstanding '+rs(x.p)+'"></div></div>'+
    '<div class="bar-lbl">'+MONTH_NAMES[x.m].slice(0,3)+'</div></div>').join("");
  // class distribution
  const dist=DB.classes.map(c=>({name:c.name,n:act.filter(s=>s.classId===c.id).length}));
  const dmax=Math.max.apply(null,dist.map(x=>x.n));
  const hbars=dist.map(x=>'<div class="hbar-row"><div class="hbar-name">'+esc(x.name)+'</div>'+
    '<div class="hbar-track"><div class="hbar-fill" style="width:'+Math.round(x.n/dmax*100)+'%"></div></div>'+
    '<div class="hbar-val">'+x.n+'</div></div>').join("");
  const stat=(lbl,val,foot,ic)=>'<div class="card card-hover stat"><div class="ico">'+icon(ic,19)+'</div>'+
    '<div class="lbl">'+lbl+'</div><div class="val mono">'+val+'</div><div class="foot">'+foot+'</div></div>';
  return '<div class="hero"><h2>'+esc(SCHOOL.name)+'</h2><p>'+esc(SCHOOL.tagline)+' — '+esc(SCHOOL.address)+'</p>'+
    '<div class="row"><span class="tag"><span class="live-dot"></span>Session '+esc(SCHOOL.session)+'</span>'+
    '<span class="tag">Principal: '+esc(SCHOOL.principal)+'</span><span class="tag">'+DB.classes.length+' Classes · '+DB.teachers.length+' Teachers</span></div></div>'+
    '<div class="stat-grid">'+
    stat("Total Students",act.length,"<b>+"+inactive+"</b> inactive · "+DB.students.length+" on record","students")+
    stat("Teaching Staff",DB.teachers.length,onLeave+" on leave · fully qualified","teachers")+
    stat("Fees Collected (Oct)",rs(octPaid),'<b>'+Math.round(octPaid/feeM[5].c*100||0)+'%</b> of October target',"wallet")+
    stat("Attendance Today",todayPct+"%",presentLate(todayRows)+" present &amp; late","attendance")+
    '</div>'+
    '<div class="grid-2">'+
    '<div class="card"><div class="card-h">Attendance Rate — Last 7 Days</div><div class="card-sub">Share of present &amp; late students per school day</div>'+
    '<div class="card-b"><svg viewBox="0 0 560 205" style="width:100%;color:var(--fg)" role="img" aria-label="Attendance trend"><defs>'+
    '<linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e8a66" stop-opacity=".26"/><stop offset="1" stop-color="#0e8a66" stop-opacity="0"/></linearGradient></defs>'+
    grid+'<path d="'+area+'" fill="url(#ga)"/><polyline points="'+pts+'" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round"/>'+dots+'</svg>'+
    '<div style="display:flex;justify-content:space-between;padding:2px 12px 0 34px">'+dayLbl.map(l=>'<span class="bar-lbl">'+l+'</span>').join("")+'</div></div></div>'+
    '<div class="card"><div class="card-h">Fee Collection by Month</div><div class="card-sub">Collected vs outstanding amounts per challan month</div>'+
    '<div class="card-b"><div class="bars">'+bars+'</div><div class="legend"><span><i style="background:#0e8a66"></i>Collected</span><span><i style="background:#d9a514"></i>Outstanding</span></div></div></div></div>'+
    '<div class="grid-3-2">'+
    '<div class="card"><div class="card-h" style="display:flex;justify-content:space-between;align-items:center">Latest Notices<a class="btn ghost sm" href="#/notices">View all</a></div>'+
    DB.notices.slice(0,3).map(n=>'<div class="notice"><div class="ico">'+icon("mega",17)+'</div><div style="flex:1;min-width:0">'+
    '<h4>'+esc(n.title)+' '+noticeChip(n.type)+'</h4><p>'+esc(n.body).slice(0,110)+'…</p></div><div class="when">'+fmtD(n.date)+'</div></div>').join("")+'</div>'+
    '<div class="card"><div class="card-h">Students by Class</div><div class="card-sub">Active enrolment across Class 1 – Class 10</div>'+
    '<div class="card-b" style="padding-top:16px">'+hbars+'</div></div></div>';
};
function presentLate(rows){return rows.filter(r=>r.status==="Present").length+rows.filter(r=>r.status==="Late").length;}
function noticeChip(t){return chip(t,t==="Urgent"?"bad":t==="Warning"?"warn":t==="Event"?"info":"acc");}
BINDS.dashboard=function(){};

// ── Students ──────────────────────────────────────────────────────────────
VIEWS.students=function(){
  const q=UI.studentQ.toLowerCase();
  const list=DB.students.filter(s=>(!UI.studentClass||s.classId===UI.studentClass)&&
    (!UI.studentStatus||s.status===UI.studentStatus)&&
    (!q||s.name.toLowerCase().indexOf(q)>=0||s.fatherName.toLowerCase().indexOf(q)>=0||s.id.indexOf(q)>=0));
  const per=10,pages=Math.max(1,Math.ceil(list.length/per));
  if(UI.studentPage>pages)UI.studentPage=pages;
  const rows=list.slice((UI.studentPage-1)*per,UI.studentPage*per);
  const tbl=rows.length?rows.map(s=>{const c=cls(s.classId);
    return '<tr><td class="mono" style="color:var(--muted-fg)">'+esc(s.id)+'</td>'+
    '<td><div class="who">'+avatar(s.name)+'<div><div class="nm">'+esc(s.name)+'</div><div class="sub">'+esc(s.gender)+' · '+esc(s.bloodGroup)+'</div></div></div></td>'+
    '<td>'+esc(c.name)+'-'+esc(s.section)+'</td><td style="color:var(--muted-fg)">'+esc(s.rollNo)+'</td>'+
    '<td>'+esc(s.fatherName)+'</td><td class="mono">'+esc(s.phone)+'</td>'+
    '<td class="mono">'+rs(s.monthlyFee)+'</td><td>'+statusChip(s.status)+'</td></tr>';}).join("")
    :'<tr><td colspan="8"><div class="empty">No students match your filters.</div></td></tr>';
  return '<div class="toolbar"><input id="st-q" class="input search" placeholder="Search name, father or ID…" value="'+esc(UI.studentQ)+'">'+
    '<select id="st-cls" class="select"><option value="">All Classes</option>'+opts(cOpts(),UI.studentClass)+'</select>'+
    '<select id="st-st" class="select"><option value="">All Statuses</option><option value="Active"'+(UI.studentStatus==="Active"?" selected":"")+'>Active</option><option value="Inactive"'+(UI.studentStatus==="Inactive"?" selected":"")+'>Inactive</option></select>'+
    '<div style="flex:1"></div><button id="btn-admit" class="btn primary">'+icon("plus",16)+'Admit Student</button></div>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Student</th><th>Class</th><th>Roll</th><th>Father Name</th><th>Phone</th><th>Monthly Fee</th><th>Status</th></tr></thead>'+
    '<tbody>'+tbl+'</tbody></table></div>'+
    '<div class="pager"><span>Showing '+(list.length?((UI.studentPage-1)*per+1):0)+'–'+Math.min(UI.studentPage*per,list.length)+' of '+list.length+' students</span>'+
    '<div class="btns"><button class="btn ghost sm" data-pg="-1"'+(UI.studentPage<=1?" disabled":"")+'>Previous</button>'+
    '<button class="btn ghost sm" data-pg="1"'+(UI.studentPage>=pages?" disabled":"")+'>Next</button></div></div>';
};
BINDS.students=function(){
  const qi=$("st-q");
  qi.oninput=function(){UI.studentQ=this.value;UI.studentPage=1;renderInto("students");
    const el=$("st-q");el.focus();el.setSelectionRange(el.value.length,el.value.length);};
  $("st-cls").onchange=function(){UI.studentClass=this.value;UI.studentPage=1;renderInto("students");};
  $("st-st").onchange=function(){UI.studentStatus=this.value;UI.studentPage=1;renderInto("students");};
  document.querySelectorAll("[data-pg]").forEach(b=>b.onclick=()=>{UI.studentPage+=parseInt(b.dataset.pg,10);renderInto("students");});
  $("btn-admit").onclick=openAdmit;
};
let NEW=0;
function openAdmit(){
  openModal('<div class="mh">Admit Student <span class="chip mut">demo</span><button class="icon-btn" onclick="closeModal()">✕</button></div>'+
    '<div class="mb"><div class="field"><label>Student Name *</label><input id="ad-name" class="input" placeholder="e.g. Areeba Khan"></div>'+
    '<div class="field"><label>Father Name *</label><input id="ad-father" class="input" placeholder="e.g. Tariq Khan"></div>'+
    '<div class="frow"><div class="field"><label>Class</label><select id="ad-cls" class="select">'+opts(cOpts(),"cls-1")+'</select></div>'+
    '<div class="field"><label>Gender</label><select id="ad-gen" class="select"><option>Male</option><option>Female</option></select></div></div>'+
    '<div class="field"><label>Guardian Phone</label><input id="ad-ph" class="input" placeholder="03xx-xxxxxxx"></div></div>'+
    '<div class="mf"><button class="btn ghost" onclick="closeModal()">Cancel</button><button id="admit-save" class="btn primary">Admit Student</button></div>');
  $("admit-save").onclick=()=>{
    const nm=$("ad-name").value.trim(),fn=$("ad-father").value.trim(),cid=$("ad-cls").value,g=$("ad-gen").value,ph=$("ad-ph").value.trim();
    if(!nm||!fn){toast("Missing information","Student name and father name are required","err");return;}
    const c=cls(cid),sec=c.sections[0];
    const roll="R-"+String(DB.students.filter(s=>s.classId===cid&&s.section===sec).length+1).padStart(2,"0");
    DB.students.push({id:"std-n"+(++NEW),name:nm,fatherName:fn,gender:g,classId:cid,section:sec,rollNo:roll,
      bloodGroup:"—",phone:ph||"03xx-xxxxxxx",address:"—",dob:"—",admissionDate:TODAY,monthlyFee:c.monthlyFee,status:"Active"});
    closeModal();toast("Student admitted",nm+" → "+c.name+" ("+roll+"). Demo data — not persisted.");
    if((location.hash||"").indexOf("students")>=0)renderInto("students");else location.hash="#/students";
  };
}

// ── Teachers ──────────────────────────────────────────────────────────────
VIEWS.teachers=function(){
  return '<div class="card-grid">'+DB.teachers.map(t=>
    '<div class="card card-hover tcard"><div class="hd">'+avatar(t.name)+
    '<div style="flex:1;min-width:0"><div class="nm" style="font-weight:650">'+esc(t.name)+'</div>'+
    '<div class="sub" style="font-size:11.5px;color:var(--muted-fg)">'+esc(t.employeeNo)+' · '+esc(t.email)+'</div></div>'+statusChip(t.status)+'</div>'+
    '<div class="bd"><div><b>'+esc(t.subject)+'</b> — '+esc(t.qualification)+'</div>'+
    '<div>'+esc(t.phone)+'</div><div>Joined '+fmtD(t.joinDate)+' · Salary <b>'+rs(t.salary)+'</b>/mo</div></div></div>').join("")+'</div>';
};
BINDS.teachers=function(){};

// ── Classes ───────────────────────────────────────────────────────────────
VIEWS.classes=function(){
  return '<div class="card-grid">'+DB.classes.map(c=>{
    const t=tch(c.classTeacherId),n=activeStudents().filter(s=>s.classId===c.id).length;
    return '<div class="card card-hover"><div class="hd" style="display:flex;align-items:center;gap:12px;padding:16px 18px 0">'+
    '<div class="avatar" style="background:linear-gradient(135deg,#0e8a66,#0b6b52)">'+c.level+'</div>'+
    '<div style="flex:1"><div style="font-weight:650">'+esc(c.name)+'</div>'+
    '<div class="sub" style="font-size:11.5px;color:var(--muted-fg)">Sections '+c.sections.join(" & ")+' · Room '+esc(c.roomNo)+'</div></div>'+
    '<span class="chip acc">'+n+' students</span></div>'+
    '<div class="bd" style="padding:12px 18px 16px;font-size:12.5px;color:var(--muted-fg);display:grid;gap:5px">'+
    '<div>Class Teacher: <b style="color:var(--fg);font-weight:600">'+esc(t?t.name:"—")+'</b></div>'+
    '<div>Monthly Fee: <b style="color:var(--fg);font-weight:600">'+rs(c.monthlyFee)+'</b></div>'+
    '<div class="subj-chips">'+c.subjects.map(s=>'<span class="chip mut">'+esc(s)+'</span>').join("")+'</div>'+
    '<div style="margin-top:6px"><a class="btn ghost sm" href="#/timetable" data-tt="'+c.id+'">View Timetable</a></div></div></div>';}).join("")+'</div>';
};
BINDS.classes=function(){document.querySelectorAll("[data-tt]").forEach(a=>a.onclick=()=>{UI.ttClass=a.dataset.tt;});};

// ── Attendance (live in-memory register for TODAY) ────────────────────────
const ATT={};
DB.attendance.filter(a=>a.date===TODAY).forEach(a=>{ATT[a.studentId]=a.status;});
VIEWS.attendance=function(){
  const list=DB.students.filter(s=>s.classId===UI.attClass&&s.status==="Active");
  const cnt={Present:0,Absent:0,Late:0};
  list.forEach(s=>{const st=ATT[s.id]||"Present";cnt[st]++;});
  const total=list.length||1;
  const rows=list.map(s=>{const st=ATT[s.id]||"Present";
    const b=(v,on)=>'<button class="btn sm '+(st===v?on:"")+'" data-act="att" data-id="'+s.id+'" data-st="'+v+'">'+v[0]+'</button>';
    return '<tr><td style="color:var(--muted-fg)">'+esc(s.rollNo)+'</td>'+
    '<td><div class="who">'+avatar(s.name)+'<div><div class="nm">'+esc(s.name)+'</div><div class="sub">'+esc(s.section)+'</div></div></div></td>'+
    '<td><div class="att-btns">'+b("Present","on-p")+b("Absent","on-a")+b("Late","on-l")+'</div></td>'+
    '<td>'+statusChip(st)+'</td></tr>';}).join("");
  return '<div class="toolbar"><select id="at-cls" class="select">'+opts(cOpts(),UI.attClass)+'</select>'+
    '<span class="chip mut">'+fmtD(TODAY)+' · '+list.length+' students</span><div style="flex:1"></div>'+
    chip("Present "+cnt.Present+" · "+Math.round(cnt.Present/total*100)+"%","ok")+
    chip("Absent "+cnt.Absent,"bad")+chip("Late "+cnt.Late,"warn")+
    '<button id="at-save" class="btn primary">Save Register</button></div>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Roll</th><th>Student</th><th>Mark</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
};
BINDS.attendance=function(){
  $("at-cls").onchange=function(){UI.attClass=this.value;renderInto("attendance");};
  document.querySelectorAll('[data-act="att"]').forEach(b=>b.onclick=()=>{
    ATT[b.dataset.id]=b.dataset.st;renderInto("attendance");});
  $("at-save").onclick=()=>toast("Attendance saved","Register for "+cls(UI.attClass).name+" · "+fmtD(TODAY)+" — demo only, not persisted");
};

// ── Fees ──────────────────────────────────────────────────────────────────
VIEWS.fees=function(){
  const mRows=DB.fees.filter(f=>f.month===UI.feeMonth);
  const collected=mRows.filter(f=>f.status==="Paid").reduce((a,f)=>a+f.amount,0);
  const pending=mRows.filter(f=>f.status==="Pending").reduce((a,f)=>a+f.amount,0);
  const overdue=mRows.filter(f=>f.status==="Overdue");
  const overdueAmt=overdue.reduce((a,f)=>a+f.amount,0);
  const list=mRows.filter(f=>!UI.feeStatus||f.status===UI.feeStatus);
  const per=12,pages=Math.max(1,Math.ceil(list.length/per));
  if(UI.feePage>pages)UI.feePage=pages;
  const rows=list.slice((UI.feePage-1)*per,UI.feePage*per);
  const tbl=rows.map(f=>{const s=stu(f.studentId),c=s?cls(s.classId):null;
    return '<tr><td class="mono" style="color:var(--muted-fg)">'+esc(f.challanNo)+'</td>'+
    '<td><div class="who">'+avatar(s?s.name:"?")+'<div><div class="nm">'+esc(s?s.name:"—")+'</div>'+
    '<div class="sub">'+esc(c?c.name:"")+'-'+esc(s?s.section:"")+'</div></div></div></td>'+
    '<td>'+MONTH_NAMES[f.month]+'</td><td class="mono">'+rs(f.amount)+'</td>'+
    '<td>'+statusChip(f.status)+'</td><td class="mono" style="color:var(--muted-fg)">'+(f.paidDate?fmtD(f.paidDate):"—")+'</td>'+
    '<td>'+(f.status!=="Paid"?'<button class="btn ghost sm" data-act="collect" data-id="'+f.id+'">Collect</button>':'<span class="chip ok">Settled</span>')+'</td></tr>';}).join("");
  const mini=(lbl,val,chipHtml)=>'<div class="card stat" style="padding:16px 18px"><div class="lbl">'+lbl+'</div>'+
    '<div class="val mono" style="font-size:20px;margin-top:4px">'+val+'</div><div style="margin-top:6px">'+chipHtml+'</div></div>';
  return '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">'+
    mini("Collected — "+MONTH_NAMES[UI.feeMonth],rs(collected),chip(Math.round(collected/(collected+pending+overdueAmt||1)*100)+"% of monthly target","ok"))+
    mini("Pending",rs(pending),chip(mRows.filter(f=>f.status==="Pending").length+" challans unpaid","warn"))+
    mini("Overdue",rs(overdueAmt),chip(overdue.length+" challans past due date","bad"))+'</div>'+
    '<div class="toolbar" style="margin-top:14px"><select id="fe-m" class="select">'+
    FEE_MONTHS.map(x=>'<option value="'+x+'"'+(x===UI.feeMonth?" selected":"")+'>'+MONTH_NAMES[x]+'</option>').join("")+'</select>'+
    '<select id="fe-st" class="select"><option value="">All Statuses</option>'+
    ["Paid","Pending","Overdue"].map(x=>'<option'+(UI.feeStatus===x?" selected":"")+'>'+x+'</option>').join("")+'</select>'+
    '<div style="flex:1"></div><span style="font-size:12.5px;color:var(--muted-fg)">'+list.length+' challans</span></div>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Challan</th><th>Student</th><th>Month</th><th>Amount</th><th>Status</th><th>Paid On</th><th></th></tr></thead>'+
    '<tbody>'+(tbl||'<tr><td colspan="7"><div class="empty">No challans for this filter.</div></td></tr>')+'</tbody></table></div>'+
    '<div class="pager"><span>Page '+UI.feePage+' of '+pages+'</span><div class="btns">'+
    '<button class="btn ghost sm" data-fp="-1"'+(UI.feePage<=1?" disabled":"")+'>Previous</button>'+
    '<button class="btn ghost sm" data-fp="1"'+(UI.feePage>=pages?" disabled":"")+'>Next</button></div></div>';
};
BINDS.fees=function(){
  $("fe-m").onchange=function(){UI.feeMonth=this.value;UI.feePage=1;renderInto("fees");};
  $("fe-st").onchange=function(){UI.feeStatus=this.value;UI.feePage=1;renderInto("fees");};
  document.querySelectorAll("[data-fp]").forEach(b=>b.onclick=()=>{UI.feePage+=parseInt(b.dataset.fp,10);renderInto("fees");});
  document.querySelectorAll('[data-act="collect"]').forEach(b=>b.onclick=()=>{
    const f=DB.fees.find(x=>x.id===b.dataset.id);
    if(f){f.status="Paid";f.paidDate=TODAY;toast("Payment recorded",f.challanNo+" marked Paid · "+rs(f.amount)+" — demo only");renderInto("fees");}});
};

// ── Exams & Results ───────────────────────────────────────────────────────
VIEWS.exams=function(){
  const exam=DB.exams.find(e=>e.id===UI.examId);
  const c=cls(UI.examClass);
  const head='<div class="toolbar"><select id="ex-id" class="select">'+
    DB.exams.map(e=>'<option value="'+e.id+'"'+(e.id===UI.examId?" selected":"")+'>'+esc(e.name)+' — '+e.status+'</option>').join("")+'</select>'+
    '<select id="ex-cls" class="select">'+opts(cOpts(),UI.examClass)+'</select><div style="flex:1"></div>'+
    chip(c.subjects.length+" subjects · max 100 marks","mut")+'</div>';
  if(exam.status!=="Published"){
    return head+'<div class="card"><div class="empty" style="padding:70px 20px">'+
    '<div style="margin-bottom:8px;opacity:.6">'+icon("exams",34)+'</div>'+
    '<b style="color:var(--fg)">'+esc(exam.name)+' — results not published yet</b>'+
    '<p style="margin:6px 0 0;color:var(--muted-fg)">Marks are being compiled. Published results appear here automatically, like First Term 2026 below.</p>'+
    '<div style="margin-top:14px"><button class="btn ghost" id="ex-view1">View First Term 2026</button></div></div></div>';
  }
  const students=DB.students.filter(s=>s.classId===c.id&&s.status==="Active");
  const rows=students.map(s=>{
    const ms=c.subjects.map(sub=>{const mk=DB.marks.find(m=>m.examId===exam.id&&m.studentId===s.id&&m.subject===sub);
      return mk?mk.total:null;});
    const valid=ms.filter(v=>v!=null);
    const avg=valid.length?Math.round(valid.reduce((a,v)=>a+v,0)/valid.length):0;
    const g=gradeOf(avg);
    return '<tr><td><div class="who">'+avatar(s.name)+'<div><div class="nm">'+esc(s.name)+'</div><div class="sub">'+esc(s.rollNo)+'</div></div></div></td>'+
    ms.map(v=>v==null?'<td style="color:var(--muted-fg)">—</td>':
      '<td class="mono" style="font-weight:600;color:'+(v>=80?"var(--primary)":v>=50?"var(--fg)":"var(--danger)")+'">'+v+'</td>').join("")+
    '<td class="mono" style="font-weight:700">'+avg+'%</td><td><span class="grade '+g[1]+'">'+g[0]+'</span></td></tr>';}).join("");
  const clsAvg=Math.round(students.reduce((a,s)=>{
    const ms=c.subjects.map(sub=>{const mk=DB.marks.find(m=>m.examId===exam.id&&m.studentId===s.id&&m.subject===sub);return mk?mk.total:0;});
    return a+ms.reduce((x,v)=>x+v,0)/ms.length;},0)/(students.length||1));
  return head+
  '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">'+
    '<div class="card stat" style="padding:16px 18px"><div class="lbl">Students Graded</div><div class="val mono" style="font-size:20px;margin-top:4px">'+students.length+'</div><div style="margin-top:6px">'+chip("all present","ok")+'</div></div>'+
    '<div class="card stat" style="padding:16px 18px"><div class="lbl">Class Average</div><div class="val mono" style="font-size:20px;margin-top:4px">'+clsAvg+'%</div><div style="margin-top:6px"><span class="grade '+gradeOf(clsAvg)[1]+'">'+gradeOf(clsAvg)[0]+'</span></div></div>'+
    '<div class="card stat" style="padding:16px 18px"><div class="lbl">Top Subject Hint</div><div class="val" style="font-size:15px;margin-top:4px;font-weight:650">First Term 2026</div><div style="margin-top:6px">'+chip("published · viva done","acc")+'</div></div></div>'+
  '<div class="tbl-wrap" style="margin-top:14px"><table class="tbl" style="min-width:'+(300+c.subjects.length*70)+'px"><thead><tr><th>Student</th>'+
  c.subjects.map(s=>'<th>'+esc(s)+'</th>').join("")+'<th>Avg</th><th>Grade</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
};
BINDS.exams=function(){
  $("ex-id").onchange=function(){UI.examId=this.value;renderInto("exams");};
  $("ex-cls").onchange=function(){UI.examClass=this.value;renderInto("exams");};
  const v=$("ex-view1");if(v)v.onclick=()=>{UI.examId="exam-1";renderInto("exams");};
};

// ── Timetable ─────────────────────────────────────────────────────────────
VIEWS.timetable=function(){
  const c=cls(UI.ttClass);
  const slots=DB.timetable.filter(t=>t.classId===c.id);
  const at=(d,p)=>slots.find(s=>s.day===d&&s.period===p);
  let grid='<div class="tt-head" style="display:flex;align-items:center">Time</div>';
  DAYS.forEach(d=>{grid+='<div class="tt-head" style="display:flex;align-items:center">'+d+'</div>';});
  PERIODS.forEach((p,pi)=>{
    grid+='<div class="tt-time">'+p+'</div>';
    DAYS.forEach(d=>{const s=at(d,pi+1);const t=s?tch(s.teacherId):null;
      grid+='<div class="tt-cell" style="--sh:'+subjHue(s?s.subject:"")+'"><b>'+esc(s?s.subject:"—")+'</b>'+
      '<span>'+esc(t?t.name.split(" ")[0]:"")+' · '+esc(t?t.subject:"")+'</span></div>';});
  });
  return '<div class="toolbar"><select id="tt-cls" class="select">'+opts(cOpts(),UI.ttClass)+'</select>'+
    '<span class="chip mut">Room '+esc(c.roomNo)+' · Sections '+c.sections.join(" & ")+'</span>'+
    '<div style="flex:1"></div><span class="chip acc">Class Teacher: '+esc((tch(c.classTeacherId)||{}).name||"—")+'</span></div>'+
    '<div class="card" style="padding:16px"><div class="tt-grid">'+grid+'</div></div>';
};
BINDS.timetable=function(){$("tt-cls").onchange=function(){UI.ttClass=this.value;renderInto("timetable");};};

// ── Notices ───────────────────────────────────────────────────────────────
VIEWS.notices=function(){
  return '<div class="card">'+DB.notices.map(n=>
    '<div class="notice"><div class="ico">'+icon("mega",17)+'</div>'+
    '<div style="flex:1;min-width:0"><h4>'+esc(n.title)+' '+noticeChip(n.type)+'</h4><p>'+esc(n.body)+'</p></div>'+
    '<div class="when">'+fmtD(n.date)+'</div></div>').join("")+'</div>';
};
BINDS.notices=function(){};

// ── Expenses ──────────────────────────────────────────────────────────────
VIEWS.expenses=function(){
  const oct=DB.expenses.filter(e=>e.date.indexOf("2026-10")===0);
  const octTotal=oct.reduce((a,e)=>a+e.amount,0);
  const pend=DB.expenses.filter(e=>e.status==="Pending");
  const cats={};DB.expenses.forEach(e=>{cats[e.category]=(cats[e.category]||0)+e.amount;});
  const cmax=Math.max.apply(null,Object.values(cats));
  const hbars=Object.keys(cats).sort((a,b)=>cats[b]-cats[a]).map(k=>
    '<div class="hbar-row"><div class="hbar-name" style="width:80px">'+esc(k)+'</div>'+
    '<div class="hbar-track"><div class="hbar-fill" style="width:'+Math.round(cats[k]/cmax*100)+'%"></div></div>'+
    '<div class="hbar-val" style="width:auto;font-size:10.5px;color:var(--muted-fg)">'+rs(cats[k])+'</div></div>').join("");
  const rows=DB.expenses.map(e=>'<tr><td class="mono" style="color:var(--muted-fg)">'+fmtD(e.date)+'</td>'+
    '<td>'+chip(e.category,"acc")+'</td><td>'+esc(e.description)+'</td>'+
    '<td class="mono r" style="font-weight:600">'+rs(e.amount)+'</td>'+
    '<td>'+(e.status==="Paid"?chip("Paid","ok"):chip("Pending","warn"))+'</td></tr>').join("");
  return '<div class="grid-3-2">'+
    '<div class="stat-grid" style="grid-template-columns:1fr 1fr;align-content:start">'+
    '<div class="card stat" style="padding:16px 18px"><div class="lbl">October Spend</div><div class="val mono" style="font-size:20px;margin-top:4px">'+rs(octTotal)+'</div><div style="margin-top:6px">'+chip(oct.length+" vouchers","mut")+'</div></div>'+
    '<div class="card stat" style="padding:16px 18px"><div class="lbl">Pending Payments</div><div class="val mono" style="font-size:20px;margin-top:4px">'+rs(pend.reduce((a,e)=>a+e.amount,0))+'</div><div style="margin-top:6px">'+chip(pend.length+" vouchers awaiting","warn")+'</div></div>'+
    '<div class="card" style="grid-column:1/-1"><div class="card-h">Spend by Category</div><div class="card-b" style="padding-top:16px">'+hbars+'</div></div></div>'+
    '<div class="card"><div class="card-h">Budget Health</div><div class="card-sub">Fees collected vs expenses — October 2026</div><div class="card-b">'+
    (()=>{const octPaid=DB.fees.filter(f=>f.month==="2026-10"&&f.status==="Paid").reduce((a,f)=>a+f.amount,0);
      const pct=Math.min(100,Math.round(octPaid/octTotal*100));
      return '<div class="hbar-row"><div class="hbar-name" style="width:52px">Fees</div><div class="hbar-track"><div class="hbar-fill" style="width:100%"></div></div><div class="hbar-val" style="width:auto;font-size:10.5px">'+rs(octPaid)+'</div></div>'+
      '<div class="hbar-row"><div class="hbar-name" style="width:52px">Spend</div><div class="hbar-track"><div class="hbar-fill" style="width:'+pct+'%;background:linear-gradient(90deg,#eec25c,#d9a514)"></div></div><div class="hbar-val" style="width:auto;font-size:10.5px">'+rs(octTotal)+'</div></div>'+
      '<p style="font-size:12.5px;color:var(--muted-fg);margin:12px 0 0">October fee collection covers <b style="color:var(--primary)">'+pct+'%</b> of monthly spending. Salaries remain the largest cost, followed by utilities and transport.</p>';})()+
    '</div></div></div>'+
    '<div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th class="r">Amount</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
};
BINDS.expenses=function(){};

// ── Settings ──────────────────────────────────────────────────────────────
VIEWS.settings=function(){
  const pRow=(k,v)=>'<div class="profile-row"><span class="k">'+k+'</span><span style="font-weight:600">'+v+'</span></div>';
  return '<div class="grid-2">'+
    '<div class="card"><div class="card-h">School Profile</div><div class="card-sub">Shown on fee challans, report cards and notices</div>'+
    '<div class="card-b">'+pRow("School Name",esc(SCHOOL.name))+pRow("Tagline",esc(SCHOOL.tagline))+
    pRow("Address",esc(SCHOOL.address))+pRow("Phone",esc(SCHOOL.phone))+pRow("Email",esc(SCHOOL.email))+
    pRow("Session",esc(SCHOOL.session))+pRow("Principal",esc(SCHOOL.principal))+
    pRow("Classes","Class 1 – Class 10")+pRow("Teaching Staff",DB.teachers.length+" members")+'</div></div>'+
    '<div class="card"><div class="card-h">About this HTML Edition</div><div class="card-sub">Standalone single-file demo</div>'+
    '<div class="card-b" style="display:grid;gap:12px;font-size:13.5px">'+
    '<p style="margin:0;color:var(--muted-fg)">This file is a <b style="color:var(--fg)">static HTML edition</b> of SkoolyPro. Everything — styles, data and logic — lives inside this one file, so it works offline: just double-click it. No server, no database, no installation.</p>'+
    '<p style="margin:0;color:var(--muted-fg)">Your full Next.js edition adds a REST API and an SQLite database, so changes there are <b style="color:var(--fg)">permanently saved</b>. In this HTML file, edits like admissions, attendance and fee collection live in memory and reset when you refresh the page.</p>'+
    '<div style="display:flex;gap:9px;flex-wrap:wrap">'+chip("No internet needed","ok")+chip("Open in any browser","ok")+chip("Demo data resets on refresh","warn")+'</div>'+
    '<div style="margin-top:4px"><button id="btn-reset" class="btn ghost">Reset Demo Data</button></div></div></div></div>';
};
BINDS.settings=function(){
  $("btn-reset").onclick=()=>{DB=buildDB();
    for(const k in ATT)delete ATT[k];
    DB.attendance.filter(a=>a.date===TODAY).forEach(a=>{ATT[a.studentId]=a.status;});
    toast("Demo data reset","All records restored to original seeded values");route();};
};

// ── Boot ──────────────────────────────────────────────────────────────────
route();
