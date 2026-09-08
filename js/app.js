/* ============================================================
   HỆ THỐNG PHỤC VỤ DẠY HỌC
   Tác giả: Lương Khánh Tường — ĐT/Zalo: 0916780807
   Ứng dụng một file HTML: chạy ngoại tuyến (localStorage)
   hoặc đồng bộ nhiều máy qua Firebase (Auth Google + Firestore).
   ============================================================ */

/* ---------- 1. CẤU HÌNH FIREBASE (điền để dùng nhiều máy) ---------- */
var FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
/* Email quản trị mặc định — thay bằng Gmail của bạn */
var ADMIN_EMAILS = ["luongkhanhtuong@gmail.com"];

/* ---------- 2. Tiện ích ---------- */
var LS = "HTPVDH_v1";
var uid = function(p){ return (p||"id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); };
var $ = function(id){ return document.getElementById(id); };
var esc = function(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
var rnd = function(a,b){ return Math.floor(Math.random()*(b-a+1))+a; };
var pick = function(arr){ return arr[Math.floor(Math.random()*arr.length)]; };
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
function seeded(seedStr){ var h=2166136261; for(var i=0;i<seedStr.length;i++){h^=seedStr.charCodeAt(i);h=Math.imul(h,16777619);} 
  return function(){ h+=0x6D2B79F5; var t=h; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
function shuffleSeed(a,rng){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(rng()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t;} return a; }
function fmtDT(v){ if(!v) return "—"; var d=new Date(v); if(isNaN(d)) return "—";
  return d.toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"}); }
function toLocalInput(d){ var p=function(n){return String(n).padStart(2,"0")};
  return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes()); }
function norm(s){ return String(s==null?"":s).trim().toLowerCase().replace(/\s+/g," ").replace(/,/g,"."); }
function toast(msg){ var t=document.createElement("div"); t.className="toast"; t.textContent=msg;
  document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2600); }
function modal(html){ var m=document.createElement("div"); m.className="modal";
  m.innerHTML='<div class="box">'+html+'</div>';
  m.addEventListener("click", function(e){ if(e.target===m) m.remove(); });
  document.body.appendChild(m); return m; }
function closeModal(el){ var m=el.closest(".modal"); if(m) m.remove(); }

/* ---------- 3. Dữ liệu chương trình (Kết nối tri thức với cuộc sống) ---------- */
var SUBJECTS = ["Toán","Ngữ văn","Tiếng Anh","Vật lí","Hoá học","Sinh học","Lịch sử","Địa lí","Giáo dục KT&PL","Tin học","Công nghệ"];
var GRADES = [10,11,12];

var CURRICULUM = {
 "Toán":{10:["Mệnh đề – Tập hợp","Bất phương trình bậc nhất hai ẩn","Hệ thức lượng trong tam giác","Vectơ","Thống kê – Số gần đúng","Hàm số bậc hai và đồ thị","Phương pháp toạ độ trong mặt phẳng","Đại số tổ hợp","Xác suất"],
   11:["Hàm số lượng giác và phương trình lượng giác","Dãy số – Cấp số cộng – Cấp số nhân","Giới hạn – Hàm số liên tục","Quan hệ song song trong không gian","Mẫu số liệu ghép nhóm","Hàm số mũ và lôgarit","Quan hệ vuông góc trong không gian","Đạo hàm","Xác suất có điều kiện"],
   12:["Ứng dụng đạo hàm để khảo sát hàm số","Vectơ và hệ trục toạ độ trong không gian","Các số đặc trưng đo mức độ phân tán","Nguyên hàm – Tích phân","Phương pháp toạ độ trong không gian","Xác suất có điều kiện"]},
 "Ngữ văn":{10:["Sức hấp dẫn của truyện kể","Vẻ đẹp của thơ ca","Nghệ thuật thuyết phục trong văn nghị luận","Sức sống của sử thi","Tích trò sân khấu dân gian"],
   11:["Câu chuyện và điểm nhìn trong truyện kể","Cấu tứ và hình ảnh trong thơ trữ tình","Cấu trúc của văn bản nghị luận","Tự sự trong truyện thơ và thơ trữ tình","Nhân vật và xung đột trong bi kịch"],
   12:["Khả năng lớn lao của tiểu thuyết","Những thế giới thơ","Lập luận trong văn bản nghị luận","Yếu tố kì ảo trong truyện kể","Đối diện với cái phi lí"]},
 "Tiếng Anh":{10:["Family life","Humans and the environment","Music","For a better community","Inventions","Gender equality","Viet Nam and international organisations"],
   11:["Generation gap","Relationships","Becoming independent","Caring for those in need","Global warming","Preserving cultural identity","Education options for school-leavers"],
   12:["Life stories we admire","A multicultural world","Green living","Urbanisation","The world of work","Artificial intelligence","Viet Nam and international organisations"]},
 "Vật lí":{10:["Mở đầu – Sai số phép đo","Động học","Động lực học","Năng lượng – Công – Công suất","Động lượng","Chuyển động tròn – Biến dạng của vật rắn"],
   11:["Dao động","Sóng","Điện trường","Dòng điện – Mạch điện"],
   12:["Vật lí nhiệt","Khí lí tưởng","Từ trường","Vật lí hạt nhân và phóng xạ"]},
 "Hoá học":{10:["Cấu tạo nguyên tử","Bảng tuần hoàn các nguyên tố hoá học","Liên kết hoá học","Phản ứng oxi hoá – khử","Năng lượng hoá học","Tốc độ phản ứng","Nguyên tố nhóm VIIA"],
   11:["Cân bằng hoá học","Nitrogen và sulfur","Đại cương hoá học hữu cơ","Hydrocarbon","Dẫn xuất halogen – Alcohol – Phenol","Hợp chất carbonyl – Carboxylic acid"],
   12:["Ester – Lipid","Carbohydrate","Hợp chất chứa nitrogen","Polymer","Pin điện và điện phân","Đại cương kim loại","Nguyên tố nhóm IA, IIA","Phức chất – Sơ lược kim loại chuyển tiếp"]},
 "Sinh học":{10:["Giới thiệu chung về thế giới sống","Sinh học tế bào","Chuyển hoá vật chất và năng lượng ở tế bào","Chu kì tế bào và phân bào","Sinh học vi sinh vật và virus"],
   11:["Trao đổi chất và chuyển hoá năng lượng ở sinh vật","Cảm ứng ở sinh vật","Sinh trưởng và phát triển ở sinh vật","Sinh sản ở sinh vật","Cơ thể là một thể thống nhất"],
   12:["Di truyền phân tử","Di truyền nhiễm sắc thể","Di truyền quần thể và di truyền học người","Tiến hoá","Sinh thái học và môi trường"]},
 "Lịch sử":{10:["Lịch sử và Sử học","Vai trò của Sử học","Một số nền văn minh thế giới thời kì cổ – trung đại","Các cuộc cách mạng công nghiệp","Văn minh Đông Nam Á","Một số nền văn minh trên đất nước Việt Nam"],
   11:["Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản","Chủ nghĩa xã hội từ 1917 đến nay","Quá trình giành độc lập của các dân tộc Đông Nam Á","Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam","Một số cuộc cải cách lớn trong lịch sử Việt Nam","Lịch sử bảo vệ chủ quyền Biển Đông"],
   12:["Thế giới trong và sau Chiến tranh lạnh","ASEAN – Những chặng đường lịch sử","Cách mạng tháng Tám 1945 và các cuộc kháng chiến","Công cuộc Đổi mới ở Việt Nam từ 1986","Lịch sử đối ngoại của Việt Nam","Hồ Chí Minh trong lịch sử Việt Nam"]},
 "Địa lí":{10:["Sử dụng bản đồ","Trái Đất","Thạch quyển","Khí quyển – Thuỷ quyển","Sinh quyển – Đất","Địa lí dân cư","Địa lí các ngành kinh tế"],
   11:["Một số vấn đề về kinh tế – xã hội thế giới","Khu vực Mỹ Latinh","Liên minh châu Âu","Khu vực Đông Nam Á","Khu vực Tây Nam Á","Hoa Kỳ – Trung Quốc – Nhật Bản"],
   12:["Địa lí tự nhiên Việt Nam","Địa lí dân cư Việt Nam","Địa lí các ngành kinh tế","Địa lí các vùng kinh tế","Phát triển kinh tế biển đảo","Thực hành kĩ năng Atlat, bảng số liệu, biểu đồ"]},
 "Giáo dục KT&PL":{10:["Nền kinh tế và các chủ thể của nền kinh tế","Thị trường và cơ chế thị trường","Ngân sách nhà nước và thuế","Sản xuất kinh doanh và các mô hình sản xuất kinh doanh","Hệ thống chính trị nước CHXHCN Việt Nam","Hiến pháp nước CHXHCN Việt Nam"],
   11:["Cạnh tranh, cung – cầu trong kinh tế thị trường","Lạm phát, thất nghiệp","Thị trường lao động và việc làm","Ý tưởng, cơ hội kinh doanh","Đạo đức kinh doanh","Quyền bình đẳng của công dân"],
   12:["Tăng trưởng và phát triển kinh tế","Hội nhập kinh tế quốc tế","Bảo hiểm và an sinh xã hội","Lập kế hoạch kinh doanh","Trách nhiệm xã hội của doanh nghiệp","Một số quyền và nghĩa vụ của công dân","Pháp luật quốc tế"]},
 "Tin học":{10:["Máy tính và xã hội tri thức","Mạng máy tính và Internet","Đạo đức, pháp luật và văn hoá trong môi trường số","Ứng dụng tin học","Giải quyết vấn đề với sự trợ giúp của máy tính (Python)"],
   11:["Hệ điều hành và phần mềm ứng dụng","Cơ sở dữ liệu","Thiết kế và lập trình hướng đối tượng","Thiết kế trang web","Kĩ thuật số và dữ liệu lớn"],
   12:["Máy tính và xã hội tri thức","Kết nối mạng và IoT","Thực hành thiết kế web","Trí tuệ nhân tạo","Hướng nghiệp với tin học"]},
 "Công nghệ":{10:["Đại cương về công nghệ","Vẽ kĩ thuật","Thiết kế kĩ thuật","Trồng trọt và đất trồng","Công nghệ giống cây trồng"],
   11:["Chăn nuôi và giống vật nuôi","Công nghệ thức ăn chăn nuôi","Cơ khí chế tạo","Động cơ đốt trong","Phòng, trị bệnh cho vật nuôi"],
   12:["Kĩ thuật điện","Công nghệ vi điều khiển","Lâm nghiệp và thuỷ sản","Công nghệ chăn nuôi hiện đại","Hướng nghiệp kĩ thuật – công nghệ"]}
};

/* Cấu trúc chấm mặc định theo định dạng đề THPT 2026 */
var SCORING = {
  "Toán":      {tn:{n:12,p:0.25}, ds:{n:4, p:1.0, rule:[0.1,0.25,0.5,1.0]}, tln:{n:6, p:0.5}},
  "default":   {tn:{n:18,p:0.25}, ds:{n:4, p:1.0, rule:[0.1,0.25,0.5,1.0]}, tln:{n:6, p:0.25}},
  "Ngữ văn":   {tn:{n:0, p:0},    ds:{n:0, p:0,  rule:[0.1,0.25,0.5,1.0]}, tln:{n:0, p:0}},
  "Tiếng Anh": {tn:{n:40,p:0.25}, ds:{n:0, p:0,  rule:[0.1,0.25,0.5,1.0]}, tln:{n:0, p:0}}
};
function scoringOf(sub){ var s = SCORING[sub] || SCORING["default"]; return JSON.parse(JSON.stringify(s)); }

/* ---------- 4. Kho dữ liệu ---------- */
var COLS = ["settings","users","classes","questions","exams","submissions","lessons","assignments","progress"];
var S = { settings:{school:"", adminEmails:ADMIN_EMAILS.slice(), updatedAt:0},
  users:[], classes:[], questions:[], exams:[], submissions:[], lessons:[], assignments:[], progress:[] };
var CLOUD = false, fb = null, fdb = null, fauth = null;
var ME = null;

var Store = {
  loadLocal: function(){
    try{ var raw = localStorage.getItem(LS); if(raw){ var d = JSON.parse(raw);
      COLS.forEach(function(c){ if(d[c]) S[c] = d[c]; }); } }catch(e){ console.warn(e); }
  },
  saveLocal: function(){ try{ localStorage.setItem(LS, JSON.stringify(S)); }catch(e){ toast("Bộ nhớ trình duyệt đã đầy."); } },
  save: function(col){
    Store.saveLocal();
    if(CLOUD && fdb){
      var payload = (col==="settings") ? {data:S.settings} : {data:S[col]};
      fdb.collection("htpvdh").doc(col).set(payload).catch(function(e){ toast("Không lưu được lên máy chủ: "+e.message); });
    }
  },
  saveAll: function(){ COLS.forEach(function(c){ Store.save(c); }); },
  connectCloud: function(cb){
    if(!FIREBASE_CONFIG.apiKey){ cb(false); return; }
    var load = function(src){ return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); };
    var base = "https://www.gstatic.com/firebasejs/10.12.2/";
    load(base+"firebase-app-compat.js")
      .then(function(){ return load(base+"firebase-auth-compat.js"); })
      .then(function(){ return load(base+"firebase-firestore-compat.js"); })
      .then(function(){
        fb = window.firebase; fb.initializeApp(FIREBASE_CONFIG);
        fauth = fb.auth(); fdb = fb.firestore(); CLOUD = true;
        var pending = COLS.length;
        COLS.forEach(function(col){
          fdb.collection("htpvdh").doc(col).onSnapshot(function(doc){
            if(doc.exists && doc.data() && doc.data().data!==undefined){
              S[col] = doc.data().data; Store.saveLocal();
              if(ME && $("app").style.display==="block") Router.refreshSoft();
            }
            if(pending>0){ pending--; if(pending===0) cb(true); }
          }, function(){ if(pending>0){ pending--; if(pending===0) cb(true);} });
        });
        setTimeout(function(){ if(pending>0){ pending=0; cb(true); } }, 4000);
      })
      .catch(function(){ cb(false); });
  }
};

/* ---------- 5. Đăng nhập / phân quyền ---------- */
var Gate = {
  tab: function(k){
    $("tabT").classList.toggle("on", k==="gv"); $("tabS").classList.toggle("on", k==="hs");
    $("paneGV").classList.toggle("hidden", k!=="gv"); $("paneHS").classList.toggle("hidden", k!=="hs");
  }
};

function roleOfEmail(email){
  var e = (email||"").toLowerCase();
  if(S.settings.adminEmails.map(function(x){return x.toLowerCase();}).indexOf(e) >= 0) return "admin";
  var u = S.users.filter(function(x){ return (x.email||"").toLowerCase()===e; })[0];
  return u ? u.role : null;
}

var Auth = {
  google: function(asRole){
    if(!CLOUD || !fauth){ toast("Chưa cấu hình Firebase — hãy dùng chế độ ngoại tuyến bên dưới."); return; }
    var pr = new fb.auth.GoogleAuthProvider();
    fauth.signInWithPopup(pr).then(function(r){
      var email = r.user.email, name = r.user.displayName || email;
      var role = roleOfEmail(email) || (asRole==="student" ? "student" : "teacher");
      var cls = S.classes.filter(function(c){ return (c.students||[]).some(function(s){ return norm(s.email)===norm(email); }); })[0];
      if(cls) role = roleOfEmail(email)==="admin" ? "admin" : (role==="admin"?"admin":"student");
      var st = cls ? (cls.students.filter(function(s){ return norm(s.email)===norm(email); })[0]) : null;
      Auth.enter(st && role==="student"
        ? { id:"hs_"+cls.id+"_"+(st.code||norm(st.name)), email:email, name:st.name, role:"student", classId:cls.id }
        : { id: r.user.uid, email: email, name: name, role: role });
    }).catch(function(e){ toast("Đăng nhập thất bại: "+e.message); });
  },
  local: function(role){
    var email = ($("gvMail").value||"").trim();
    if(!email){ toast("Nhập email để ghi nhận người dùng."); return; }
    var r = roleOfEmail(email) || role;
    if(role==="admin" && S.settings.adminEmails.length===0) { S.settings.adminEmails.push(email); Store.save("settings"); r="admin"; }
    Auth.enter({ id:"local_"+norm(email), email:email, name:email.split("@")[0], role:r });
  },
  student: function(){
    var code = ($("hsClass").value||"").trim(), name = ($("hsName").value||"").trim();
    if(!code || !name){ toast("Nhập mã lớp và họ tên."); return; }
    var cls = S.classes.filter(function(c){ return norm(c.code)===norm(code); })[0];
    if(!cls){ toast("Không tìm thấy mã lớp này."); return; }
    var st = cls.students.filter(function(s){ return norm(s.name)===norm(name) || norm(s.code)===norm(name); })[0];
    if(!st){ toast("Tên/mã học sinh không có trong danh sách lớp."); return; }
    Auth.enter({ id:"hs_"+cls.id+"_"+(st.code||norm(st.name)), email:st.email||"", name:st.name, role:"student", classId:cls.id });
  },
  enter: function(user){
    var found = S.users.filter(function(u){ return u.id===user.id; })[0];
    if(!found){ S.users.push(user); Store.save("users"); }
    else { found.name = user.name; if(user.classId) found.classId = user.classId; if(user.role!=="student") found.role = found.role||user.role; user = found; }
    ME = user;
    sessionStorage.setItem("HTPVDH_me", JSON.stringify(ME));
    $("gate").style.display = "none"; $("app").style.display = "block";
    $("who").innerHTML = esc(ME.name) + "<br>" + '<span class="pill '+(ME.role==="admin"?"amber":ME.role==="teacher"?"":"teal")+'">'
      + (ME.role==="admin"?"Quản trị":ME.role==="teacher"?"Giáo viên":"Học sinh") + "</span>";
    Router.buildNav(); Router.go(ME.role==="student" ? "hsHome" : "home");
  },
  logout: function(){
    sessionStorage.removeItem("HTPVDH_me");
    if(CLOUD && fauth) fauth.signOut();
    location.reload();
  }
};

/* ---------- 6. Điều hướng ---------- */
var MENU = {
  admin: [
    ["Điều hành", [["home","Bảng điều khiển"],["classes","Lớp học"],["bank","Ngân hàng câu hỏi"],["exams","Đề kiểm tra"],["lessons","Bài học"],["assign","Giao việc"],["reports","Kết quả & tiến độ"]]],
    ["Quản trị", [["admin","Người dùng & hệ thống"],["gen","Cập nhật câu hỏi tự động"],["guide","Hướng dẫn đưa lên hosting"]]]
  ],
  teacher: [
    ["Dạy học", [["home","Bảng điều khiển"],["classes","Lớp học"],["bank","Ngân hàng câu hỏi"],["exams","Đề kiểm tra"],["lessons","Bài học"],["assign","Giao việc"],["reports","Kết quả & tiến độ"]]],
    ["Khác", [["guide","Hướng dẫn sử dụng"]]]
  ],
  student: [
    ["Học tập", [["hsHome","Việc của tôi"],["hsLearn","Bài học"],["hsExam","Bài kiểm tra"],["hsProgress","Tiến độ của tôi"]]]
  ]
};

var Router = {
  cur: "home",
  buildNav: function(){
    var box = $("navBox"); box.innerHTML = "";
    (MENU[ME.role]||MENU.teacher).forEach(function(g){
      var h = document.createElement("div"); h.className="nav-group"; h.textContent = g[0]; box.appendChild(h);
      g[1].forEach(function(it){
        var b = document.createElement("button"); b.className="nav"; b.dataset.k = it[0]; b.textContent = it[1];
        b.onclick = function(){ Router.go(it[0]); document.getElementById("side").classList.remove("open"); };
        box.appendChild(b);
      });
    });
  },
  go: function(k){
    Router.cur = k;
    Array.prototype.forEach.call(document.querySelectorAll(".nav"), function(n){ n.classList.toggle("on", n.dataset.k===k); });
    var fn = Views[k]; $("view").scrollTop = 0; window.scrollTo(0,0);
    $("view").innerHTML = fn ? fn() : "<div class='card'>Chức năng đang cập nhật.</div>";
    if(Views["after_"+k]) Views["after_"+k]();
    var lbl=""; (MENU[ME.role]||[]).forEach(function(g){ g[1].forEach(function(it){ if(it[0]===k) lbl=it[1]; }); });
    $("topTitle").textContent = lbl;
  },
  refreshSoft: function(){ if(["exam_do","learn_do"].indexOf(Router.cur)<0) Router.go(Router.cur); }
};
/* ---------- 7. Hàm dùng chung cho nghiệp vụ ---------- */
function myClasses(){ return ME.role==="admin" ? S.classes : S.classes.filter(function(c){ return c.owner===ME.email || !c.owner; }); }
function classById(id){ return S.classes.filter(function(c){ return c.id===id; })[0]; }
function examById(id){ return S.exams.filter(function(e){ return e.id===id; })[0]; }
function lessonById(id){ return S.lessons.filter(function(l){ return l.id===id; })[0]; }
function qById(id){ return S.questions.filter(function(q){ return q.id===id; })[0]; }
function optSubjects(sel){ return SUBJECTS.map(function(s){ return '<option '+(s===sel?"selected":"")+'>'+s+'</option>'; }).join(""); }
function optGrades(sel){ return GRADES.map(function(g){ return '<option '+(g==sel?"selected":"")+'>'+g+'</option>'; }).join(""); }
function optChapters(sub,gr,sel){
  var list = (CURRICULUM[sub]&&CURRICULUM[sub][gr])?CURRICULUM[sub][gr]:[];
  return list.map(function(c){ return '<option '+(c===sel?"selected":"")+'>'+esc(c)+'</option>'; }).join("");
}
function typeName(t){ return t==="TN"?"Trắc nghiệm nhiều lựa chọn": t==="DS"?"Đúng/Sai": "Trả lời ngắn"; }
function levelName(l){ return l==="NB"?"Nhận biết": l==="TH"?"Thông hiểu": "Vận dụng"; }

/* ---------- 8. Giao diện ---------- */
var Views = {};

Views.home = function(){
  var cls = myClasses(), nSt = cls.reduce(function(a,c){ return a + (c.students||[]).length; }, 0);
  var openAssign = S.assignments.filter(function(a){ return !a.dueAt || new Date(a.dueAt) > new Date(); });
  return ''
  + '<div class="page-head"><div><h1>Xin chào, '+esc(ME.name)+'</h1>'
  + '<p>Toàn bộ lớp học, ngân hàng câu hỏi, đề kiểm tra và bài học nằm trong một hệ thống duy nhất. Bắt đầu từ việc tạo lớp, sau đó nhập đề hoặc bấm tạo bài học tự động.</p></div>'
  + '<div>'+(CLOUD?'<span class="pill ok">Đang đồng bộ Firebase</span>':'<span class="pill gray">Chế độ ngoại tuyến</span>')+'</div></div>'
  + '<div class="grid g3">'
  + '<div class="kpi"><b>'+cls.length+'</b><span>lớp đang phụ trách</span></div>'
  + '<div class="kpi"><b>'+nSt+'</b><span>học sinh</span></div>'
  + '<div class="kpi"><b>'+S.questions.length+'</b><span>câu hỏi trong ngân hàng</span></div>'
  + '<div class="kpi"><b>'+S.lessons.length+'</b><span>bài học lý thuyết + bài tập</span></div>'
  + '<div class="kpi"><b>'+S.exams.length+'</b><span>đề kiểm tra</span></div>'
  + '<div class="kpi"><b>'+openAssign.length+'</b><span>việc đang giao</span></div>'
  + '</div>'
  + '<div class="card" style="margin-top:14px"><h3>Bắt đầu nhanh</h3><div class="row">'
  + '<button class="btn" onclick="Router.go(\'classes\')">Tạo lớp và nhập danh sách</button>'
  + '<button class="btn ghost" onclick="Router.go(\'bank\')">Nhập đề theo mẫu</button>'
  + '<button class="btn teal" onclick="Router.go(\'lessons\')">Tạo bài học tự động</button>'
  + '<button class="btn amber" onclick="Router.go(\'exams\')">Ra đề ngẫu nhiên</button>'
  + '</div></div>'
  + '<div class="card"><h3>Việc đang giao cho học sinh</h3>'
  + (openAssign.length ? '<div class="tablewrap"><table><tr><th>Nội dung</th><th>Loại</th><th>Lớp</th><th>Hạn nộp</th></tr>'
      + openAssign.map(function(a){ var c=classById(a.classId);
        return '<tr><td>'+esc(a.title)+'</td><td>'+(a.type==="exam"?"Bài kiểm tra":"Bài học")+'</td><td>'+esc(c?c.name:"—")+'</td><td>'+fmtDT(a.dueAt)+'</td></tr>'; }).join("")
      + '</table></div>' : '<p class="muted">Chưa giao việc nào. Vào mục Giao việc để đặt bài và giờ kết thúc.</p>')
  + '</div>';
};

/* ---------- LỚP HỌC ---------- */
Views.classes = function(){
  var cls = myClasses();
  return ''
  + '<div class="page-head"><div><h1>Lớp học</h1><p>Mỗi lớp có một mã lớp riêng. Học sinh dùng mã lớp và họ tên (hoặc mã học sinh) để vào hệ thống.</p></div></div>'
  + '<div class="card"><h3>Tạo lớp mới</h3>'
  + '<div class="row"><div class="field"><label>Tên lớp</label><input id="cName" placeholder="12A1"></div>'
  + '<div class="field"><label>Mã lớp (học sinh dùng để đăng nhập)</label><input id="cCode" placeholder="12A1-2026"></div>'
  + '<div class="field"><label>Môn phụ trách</label><select id="cSub">'+optSubjects("Toán")+'</select></div>'
  + '<div class="field"><label>Khối</label><select id="cGrade">'+optGrades(12)+'</select></div></div>'
  + '<div class="field"><label>Danh sách học sinh theo mẫu — mỗi dòng: <code>Mã HS ; Họ và tên ; Ngày sinh ; Email</code> (chỉ cần họ tên là đủ)</label>'
  + '<textarea id="cList" placeholder="HS001 ; Nguyễn Văn An ; 12/03/2008 ; an.nv@gmail.com&#10;HS002 ; Trần Thị Bình ; 05/09/2008"></textarea></div>'
  + '<button class="btn" onclick="Cls.create()">Tạo lớp</button> '
  + '<button class="btn ghost" onclick="Cls.sample()">Điền danh sách mẫu</button></div>'
  + '<div class="card"><h3>Danh sách lớp ('+cls.length+')</h3>'
  + (cls.length? '<div class="tablewrap"><table><tr><th>Lớp</th><th>Mã lớp</th><th>Môn</th><th>Sĩ số</th><th></th></tr>'
    + cls.map(function(c){ return '<tr><td><b>'+esc(c.name)+'</b><br><small>'+esc(c.owner||"")+'</small></td><td><code>'+esc(c.code)+'</code></td>'
      + '<td>'+esc(c.subject)+' · Khối '+c.grade+'</td><td>'+(c.students||[]).length+'</td>'
      + '<td style="white-space:nowrap"><button class="btn sm ghost" onclick="Cls.open(\''+c.id+'\')">Xem</button> '
      + '<button class="btn sm danger" onclick="Cls.del(\''+c.id+'\')">Xoá</button></td></tr>'; }).join("")
    + '</table></div>' : '<p class="muted">Chưa có lớp nào. Tạo lớp đầu tiên ở khung bên trên.</p>')
  + '</div>';
};

var Cls = {
  sample: function(){ $("cList").value = "HS001 ; Nguyễn Văn An ; 12/03/2008\nHS002 ; Trần Thị Bình ; 05/09/2008\nHS003 ; Lê Minh Châu ; 21/11/2008\nHS004 ; Phạm Quốc Dũng ; 02/07/2008"; },
  parseList: function(txt){
    return (txt||"").split(/\n+/).map(function(l){ return l.trim(); }).filter(Boolean).map(function(l,i){
      var p = l.split(/[;|\t]/).map(function(x){ return x.trim(); });
      if(p.length===1) return { code:"HS"+String(i+1).padStart(3,"0"), name:p[0], dob:"", email:"" };
      return { code:p[0]||("HS"+String(i+1).padStart(3,"0")), name:p[1]||"", dob:p[2]||"", email:p[3]||"" };
    }).filter(function(s){ return s.name; });
  },
  create: function(){
    var name=$("cName").value.trim(), code=$("cCode").value.trim();
    if(!name||!code){ toast("Nhập tên lớp và mã lớp."); return; }
    if(S.classes.some(function(c){ return norm(c.code)===norm(code); })){ toast("Mã lớp đã tồn tại."); return; }
    S.classes.push({ id:uid("cls"), name:name, code:code, subject:$("cSub").value, grade:+$("cGrade").value,
      owner:ME.email, students:Cls.parseList($("cList").value), createdAt:Date.now() });
    Store.save("classes"); toast("Đã tạo lớp "+name); Router.go("classes");
  },
  del: function(id){ if(!confirm("Xoá lớp này? Kết quả liên quan vẫn được giữ.")) return;
    S.classes = S.classes.filter(function(c){ return c.id!==id; }); Store.save("classes"); Router.go("classes"); },
  open: function(id){
    var c = classById(id);
    var m = modal('<h2>'+esc(c.name)+' <span class="pill">'+esc(c.code)+'</span></h2>'
      + '<p class="muted">'+esc(c.subject)+' · Khối '+c.grade+' · '+(c.students||[]).length+' học sinh</p>'
      + '<div class="field"><label>Sửa danh sách (mỗi dòng: Mã ; Họ tên ; Ngày sinh ; Email)</label>'
      + '<textarea id="edList">'+esc((c.students||[]).map(function(s){ return [s.code,s.name,s.dob||"",s.email||""].join(" ; "); }).join("\n"))+'</textarea></div>'
      + '<button class="btn" onclick="Cls.saveList(\''+id+'\',this)">Lưu danh sách</button> '
      + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
    return m;
  },
  saveList: function(id, el){
    var c = classById(id); c.students = Cls.parseList(document.getElementById("edList").value);
    Store.save("classes"); toast("Đã lưu danh sách"); closeModal(el); Router.go("classes");
  }
};

/* ---------- NGÂN HÀNG CÂU HỎI ---------- */
var BankF = { sub:"Toán", grade:12, chapter:"", type:"" };

Views.bank = function(){
  var qs = Bank.filtered();
  return ''
  + '<div class="page-head"><div><h1>Ngân hàng câu hỏi</h1><p>Ba dạng câu hỏi theo định dạng thi tốt nghiệp THPT 2026: trắc nghiệm nhiều lựa chọn, đúng/sai bốn ý, trả lời ngắn.</p></div>'
  + '<button class="btn ghost" onclick="Bank.helpTemplate()">Xem mẫu nhập đề</button></div>'
  + '<div class="card"><div class="row">'
  + '<div class="field"><label>Môn</label><select id="fSub" onchange="Bank.setF()">'+optSubjects(BankF.sub)+'</select></div>'
  + '<div class="field"><label>Khối</label><select id="fGrade" onchange="Bank.setF()">'+optGrades(BankF.grade)+'</select></div>'
  + '<div class="field"><label>Chương / chủ đề</label><select id="fChap" onchange="Bank.setF()"><option value="">Tất cả</option>'+optChapters(BankF.sub,BankF.grade,BankF.chapter)+'</select></div>'
  + '<div class="field"><label>Dạng câu hỏi</label><select id="fType" onchange="Bank.setF()">'
  + '<option value="">Tất cả</option><option value="TN" '+(BankF.type==="TN"?"selected":"")+'>Trắc nghiệm</option>'
  + '<option value="DS" '+(BankF.type==="DS"?"selected":"")+'>Đúng/Sai</option><option value="TLN" '+(BankF.type==="TLN"?"selected":"")+'>Trả lời ngắn</option></select></div>'
  + '</div></div>'
  + '<div class="card"><h3>Nhập đề theo mẫu</h3>'
  + '<div class="field"><textarea id="impText" placeholder="Dán nội dung theo mẫu vào đây rồi bấm Nhập vào ngân hàng"></textarea></div>'
  + '<div class="row"><button class="btn" onclick="Bank.importText()">Nhập vào ngân hàng</button>'
  + '<button class="btn ghost" onclick="Bank.fillSample()">Dán ví dụ mẫu</button>'
  + '<button class="btn ghost" onclick="Bank.addManual()">Soạn thủ công một câu</button></div></div>'
  + '<div class="card"><h3>'+qs.length+' câu hỏi phù hợp bộ lọc</h3>'
  + (qs.length? qs.slice(0,60).map(Bank.render).join("") : '<p class="muted">Chưa có câu hỏi. Nhập đề theo mẫu, hoặc dùng mục Cập nhật câu hỏi tự động để sinh câu hỏi mới.</p>')
  + (qs.length>60? '<p class="muted">Hiển thị 60 câu đầu tiên.</p>':'')
  + '</div>';
};

var Bank = {
  setF: function(){
    BankF.sub = $("fSub").value; BankF.grade = +$("fGrade").value;
    BankF.chapter = $("fChap") ? $("fChap").value : ""; BankF.type = $("fType").value;
    Router.go("bank");
  },
  filtered: function(){
    return S.questions.filter(function(q){
      return q.subject===BankF.sub && q.grade==BankF.grade
        && (!BankF.chapter || q.chapter===BankF.chapter) && (!BankF.type || q.type===BankF.type);
    });
  },
  render: function(q){
    var body = "";
    if(q.type==="TN") body = (q.options||[]).map(function(o,i){
      var L = "ABCD"[i]; return '<div class="opt '+(q.answer===L?"right":"")+'"><b>'+L+'.</b> '+esc(o)+'</div>'; }).join("");
    if(q.type==="DS") body = (q.statements||[]).map(function(s,i){
      return '<div class="dsrow"><span class="st"><b>'+"abcd"[i]+')</b> '+esc(s.t)+'</span><span class="pill '+(s.ok?"ok":"rose")+'">'+(s.ok?"Đúng":"Sai")+'</span></div>'; }).join("");
    if(q.type==="TLN") body = '<div class="pill ok">Đáp án: '+esc(q.short)+'</div>';
    return '<div class="qitem"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">'
      + '<span class="pill">'+typeName(q.type)+'</span><span class="pill gray">'+levelName(q.level||"NB")+'</span>'
      + '<span class="pill teal">'+esc(q.chapter||"")+'</span>'
      + (q.source==="auto"?'<span class="pill amber">Máy sinh</span>':'')
      + '<span style="flex:1"></span><button class="btn sm danger" onclick="Bank.del(\''+q.id+'\')">Xoá</button></div>'
      + '<div>'+QC(q)+'</div>' + body
      + (q.explain? '<div class="muted" style="margin-top:6px"><b>Lời giải:</b> '+esc(q.explain)+'</div>':'') + '</div>';
  },
  del: function(id){ S.questions = S.questions.filter(function(q){ return q.id!==id; }); Store.save("questions"); Router.go("bank"); },
  helpTemplate: function(){
    modal('<h2>Mẫu nhập đề</h2><pre class="log">'
      + esc('[TN] Đạo hàm của hàm số y = x^2 tại x = 3 bằng bao nhiêu?\nA. 3\nB. 6\nC. 9\nD. 2\nDA: B\nGT: y\' = 2x nên y\'(3) = 6.\nMUC: NB\n\n[DS] Cho hàm số y = x^3 - 3x. Xét tính đúng sai:\na) Hàm số có hai điểm cực trị | D\nb) Hàm số đồng biến trên R | S\nc) y\' = 3x^2 - 3 | D\nd) Đồ thị đi qua gốc toạ độ | D\n\n[TLN] Tính tích phân của f(x) = 2x trên đoạn [0;3].\nDA: 9\nMUC: TH')
      + '</pre><ul class="help"><li><code>[TN]</code> trắc nghiệm 4 lựa chọn, <code>DA:</code> ghi A/B/C/D.</li>'
      + '<li><code>[DS]</code> đúng/sai, mỗi ý kết thúc bằng <code>| D</code> (đúng) hoặc <code>| S</code> (sai).</li>'
      + '<li><code>[TLN]</code> trả lời ngắn, <code>DA:</code> ghi kết quả.</li>'
      + '<li><code>MUC:</code> NB / TH / VD — mức độ, có thể bỏ trống.</li>'
      + '<li>Môn, khối, chương lấy theo bộ lọc đang chọn ở phía trên.</li></ul>'
      + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
  },
  fillSample: function(){
    $("impText").value = "[TN] Đạo hàm của hàm số y = x^2 tại x = 3 bằng bao nhiêu?\nA. 3\nB. 6\nC. 9\nD. 2\nDA: B\nGT: y' = 2x nên y'(3) = 6.\nMUC: NB\n\n[DS] Cho hàm số y = x^3 - 3x. Xét tính đúng sai của các khẳng định sau:\na) Hàm số có hai điểm cực trị | D\nb) Hàm số đồng biến trên R | S\nc) y' = 3x^2 - 3 | D\nd) Đồ thị hàm số đi qua gốc toạ độ | D\n\n[TLN] Tính tích phân của f(x) = 2x trên đoạn [0;3].\nDA: 9\nMUC: TH";
  },
  parse: function(text, meta){
    var blocks = text.split(/\n\s*\n/), out = [];
    blocks.forEach(function(b){
      var lines = b.split(/\n/).map(function(l){ return l.trim(); }).filter(Boolean);
      if(!lines.length) return;
      var m = lines[0].match(/^\[(TN|DS|TLN)\]\s*(.*)$/i);
      if(!m) return;
      var q = { id:uid("q"), subject:meta.sub, grade:meta.grade, chapter:meta.chapter, type:m[1].toUpperCase(),
        content:m[2], level:"NB", options:[], statements:[], short:"", explain:"", source:"manual", createdAt:Date.now() };
      lines.slice(1).forEach(function(l){
        var o = l.match(/^([A-D])[.)]\s*(.+)$/);
        var s = l.match(/^([a-d])[.)]\s*(.+?)\s*\|\s*([DSĐdsđ])\s*$/);
        var da = l.match(/^DA\s*[:=]\s*(.+)$/i);
        var gt = l.match(/^GT\s*[:=]\s*(.+)$/i);
        var mu = l.match(/^MUC\s*[:=]\s*(.+)$/i);
        if(s){ q.statements.push({ t:s[2], ok:/[DĐdđ]/.test(s[3]) }); }
        else if(o){ q.options.push(o[2]); }
        else if(da){ if(q.type==="TN") q.answer = da[1].trim().toUpperCase().charAt(0); else q.short = da[1].trim(); }
        else if(gt){ q.explain = gt[1]; }
        else if(mu){ q.level = mu[1].trim().toUpperCase().slice(0,2)==="TH"?"TH": mu[1].trim().toUpperCase().slice(0,2)==="VD"?"VD":"NB"; }
        else { q.content += " " + l; }
      });
      if(q.type==="TN" && q.options.length<2) return;
      if(q.type==="DS" && q.statements.length<2) return;
      if(q.type==="TLN" && !q.short) return;
      out.push(q);
    });
    return out;
  },
  importText: function(){
    var txt = $("impText").value;
    if(!txt.trim()){ toast("Chưa có nội dung để nhập."); return; }
    var chap = BankF.chapter || ((CURRICULUM[BankF.sub]||{})[BankF.grade]||["Chưa phân chương"])[0];
    var qs = Bank.parse(txt, { sub:BankF.sub, grade:BankF.grade, chapter:chap });
    if(!qs.length){ toast("Không đọc được câu hỏi nào — kiểm tra lại mẫu."); return; }
    S.questions = S.questions.concat(qs); Store.save("questions");
    toast("Đã nhập "+qs.length+" câu hỏi vào ngân hàng"); Router.go("bank");
  },
  addManual: function(){
    modal('<h2>Soạn một câu hỏi</h2>'
      + '<div class="field"><label>Dạng</label><select id="mType" onchange="Bank.manualSwap()">'
      + '<option value="TN">Trắc nghiệm nhiều lựa chọn</option><option value="DS">Đúng/Sai</option><option value="TLN">Trả lời ngắn</option></select></div>'
      + '<div class="field"><label>Nội dung câu hỏi</label><textarea id="mContent" style="min-height:70px"></textarea></div>'
      + '<div id="mBody"></div>'
      + '<div class="field"><label>Mức độ</label><select id="mLevel"><option value="NB">Nhận biết</option><option value="TH">Thông hiểu</option><option value="VD">Vận dụng</option></select></div>'
      + '<div class="field"><label>Lời giải (không bắt buộc)</label><input id="mExplain"></div>'
      + '<button class="btn" onclick="Bank.saveManual(this)">Lưu câu hỏi</button> <button class="btn ghost" onclick="closeModal(this)">Huỷ</button>');
    Bank.manualSwap();
  },
  manualSwap: function(){
    var t = document.getElementById("mType").value, h="";
    if(t==="TN") h = ["A","B","C","D"].map(function(L){ return '<div class="field"><label>Phương án '+L+'</label><input id="mo'+L+'"></div>'; }).join("")
      + '<div class="field"><label>Đáp án đúng</label><select id="mAns"><option>A</option><option>B</option><option>C</option><option>D</option></select></div>';
    if(t==="DS") h = ["a","b","c","d"].map(function(L){ return '<div class="row"><div class="field" style="flex:3"><label>Ý '+L+'</label><input id="ms'+L+'"></div>'
      + '<div class="field"><label>Kết luận</label><select id="mv'+L+'"><option value="D">Đúng</option><option value="S">Sai</option></select></div></div>'; }).join("");
    if(t==="TLN") h = '<div class="field"><label>Đáp án ngắn</label><input id="mShort" placeholder="VD: 9 hoặc 12,5"></div>';
    document.getElementById("mBody").innerHTML = h;
  },
  saveManual: function(el){
    var t = document.getElementById("mType").value;
    var chap = BankF.chapter || ((CURRICULUM[BankF.sub]||{})[BankF.grade]||["Chưa phân chương"])[0];
    var q = { id:uid("q"), subject:BankF.sub, grade:BankF.grade, chapter:chap, type:t,
      content:document.getElementById("mContent").value.trim(), level:document.getElementById("mLevel").value,
      explain:document.getElementById("mExplain").value.trim(), options:[], statements:[], short:"", source:"manual", createdAt:Date.now() };
    if(!q.content){ toast("Chưa nhập nội dung câu hỏi."); return; }
    if(t==="TN"){ ["A","B","C","D"].forEach(function(L){ q.options.push(document.getElementById("mo"+L).value.trim()); });
      q.answer = document.getElementById("mAns").value; }
    if(t==="DS"){ ["a","b","c","d"].forEach(function(L){ var v=document.getElementById("ms"+L).value.trim();
      if(v) q.statements.push({ t:v, ok:document.getElementById("mv"+L).value==="D" }); }); }
    if(t==="TLN") q.short = document.getElementById("mShort").value.trim();
    S.questions.push(q); Store.save("questions"); closeModal(el); toast("Đã lưu câu hỏi"); Router.go("bank");
  }
};
/* ---------- ĐỀ KIỂM TRA ---------- */
Views.exams = function(){
  var cfg = scoringOf("Toán");
  var chapters = (CURRICULUM["Toán"][12]||[]);
  return ''
  + '<div class="page-head"><div><h1>Đề kiểm tra</h1><p>Hệ thống rút câu hỏi ngẫu nhiên từ ngân hàng cho từng học sinh, tính giờ làm bài và tự chấm theo cấu trúc điểm bạn chọn.</p></div></div>'
  + '<div class="card"><h3>Tạo đề mới</h3>'
  + '<div class="row"><div class="field"><label>Tên đề</label><input id="eTitle" placeholder="Kiểm tra giữa kì I"></div>'
  + '<div class="field"><label>Môn</label><select id="eSub" onchange="Exam.onSub()">'+optSubjects("Toán")+'</select></div>'
  + '<div class="field"><label>Khối</label><select id="eGrade" onchange="Exam.onSub()">'+optGrades(12)+'</select></div></div>'
  + '<div class="field"><label>Chương / chủ đề lấy câu hỏi (giữ Ctrl để chọn nhiều, bỏ trống là lấy tất cả)</label>'
  + '<select id="eChaps" multiple size="5">'+chapters.map(function(c){return '<option>'+esc(c)+'</option>';}).join("")+'</select></div>'
  + '<h4 style="margin-top:10px">Cấu trúc và cách chấm</h4>'
  + '<div class="row">'
  + '<div class="field"><label>Phần I — trắc nghiệm: số câu</label><input id="eTnN" type="number" value="'+cfg.tn.n+'"></div>'
  + '<div class="field"><label>Điểm mỗi câu phần I</label><input id="eTnP" type="number" step="0.05" value="'+cfg.tn.p+'"></div>'
  + '<div class="field"><label>Phần II — đúng/sai: số câu</label><input id="eDsN" type="number" value="'+cfg.ds.n+'"></div>'
  + '<div class="field"><label>Điểm tối đa mỗi câu phần II</label><input id="eDsP" type="number" step="0.05" value="'+cfg.ds.p+'"></div>'
  + '<div class="field"><label>Phần III — trả lời ngắn: số câu</label><input id="eTlnN" type="number" value="'+cfg.tln.n+'"></div>'
  + '<div class="field"><label>Điểm mỗi câu phần III</label><input id="eTlnP" type="number" step="0.05" value="'+cfg.tln.p+'"></div>'
  + '</div>'
  + '<div class="field"><label>Thang điểm phần đúng/sai theo số ý trả lời đúng (1 ý; 2 ý; 3 ý; 4 ý)</label><input id="eDsRule" value="'+cfg.ds.rule.join("; ")+'"></div>'
  + '<div class="row"><div class="field"><label>Thời gian làm bài (phút)</label><input id="eDur" type="number" value="90"></div>'
  + '<div class="field"><label>Mở bài từ</label><input id="eStart" type="datetime-local" value="'+toLocalInput(new Date())+'"></div>'
  + '<div class="field"><label>Giờ kết thúc</label><input id="eEnd" type="datetime-local" value="'+toLocalInput(new Date(Date.now()+7*864e5))+'"></div></div>'
  + '<div class="row"><div class="field"><label>Đảo thứ tự phương án</label><select id="eShuffle"><option value="1">Có</option><option value="0">Không</option></select></div>'
  + '<div class="field"><label>Cho học sinh xem đáp án sau khi nộp</label><select id="eShow"><option value="1">Có</option><option value="0">Không</option></select></div></div>'
  + '<button class="btn" onclick="Exam.create()">Tạo đề</button> <span id="poolInfo" class="muted"></span></div>'
  + '<div class="card"><h3>Đề đã tạo ('+S.exams.length+')</h3>'
  + (S.exams.length? '<div class="tablewrap"><table><tr><th>Tên đề</th><th>Môn</th><th>Cấu trúc</th><th>Thời gian</th><th>Hạn</th><th></th></tr>'
    + S.exams.slice().reverse().map(function(e){
      return '<tr><td><b>'+esc(e.title)+'</b></td><td>'+esc(e.subject)+' · K'+e.grade+'</td>'
        + '<td>'+e.cfg.tn.n+' TN · '+e.cfg.ds.n+' Đ/S · '+e.cfg.tln.n+' TLN<br><small>Tối đa '+Exam.maxScore(e).toFixed(2)+' điểm</small></td>'
        + '<td>'+e.duration+' phút</td><td>'+fmtDT(e.endAt)+'</td>'
        + '<td style="white-space:nowrap"><button class="btn sm ghost" onclick="Exam.preview(\''+e.id+'\')">Xem thử</button> '
        + '<button class="btn sm teal" onclick="Router.go(\'assign\')">Giao</button> '
        + '<button class="btn sm danger" onclick="Exam.del(\''+e.id+'\')">Xoá</button></td></tr>'; }).join("")
    + '</table></div>' : '<p class="muted">Chưa có đề nào.</p>') + '</div>';
};

var Exam = {
  onSub: function(){
    var sub=$("eSub").value, gr=+$("eGrade").value, cfg=scoringOf(sub);
    $("eChaps").innerHTML = ((CURRICULUM[sub]||{})[gr]||[]).map(function(c){ return '<option>'+esc(c)+'</option>'; }).join("");
    $("eTnN").value=cfg.tn.n; $("eTnP").value=cfg.tn.p; $("eDsN").value=cfg.ds.n; $("eDsP").value=cfg.ds.p;
    $("eTlnN").value=cfg.tln.n; $("eTlnP").value=cfg.tln.p;
    var pool = S.questions.filter(function(q){ return q.subject===sub && q.grade==gr; });
    $("poolInfo").textContent = "Ngân hàng hiện có " + pool.length + " câu cho môn này.";
  },
  after: function(){ Exam.onSub(); },
  maxScore: function(e){
    return e.cfg.tn.n*e.cfg.tn.p + e.cfg.ds.n*e.cfg.ds.p + e.cfg.tln.n*e.cfg.tln.p;
  },
  create: function(){
    var title=$("eTitle").value.trim(); if(!title){ toast("Nhập tên đề."); return; }
    var chaps = Array.prototype.filter.call($("eChaps").options, function(o){ return o.selected; }).map(function(o){ return o.value; });
    var rule = $("eDsRule").value.split(/[;,]/).map(function(x){ return parseFloat(x.trim())||0; });
    while(rule.length<4) rule.push(0);
    var e = { id:uid("ex"), title:title, subject:$("eSub").value, grade:+$("eGrade").value, chapters:chaps,
      cfg:{ tn:{n:+$("eTnN").value, p:+$("eTnP").value}, ds:{n:+$("eDsN").value, p:+$("eDsP").value, rule:rule},
            tln:{n:+$("eTlnN").value, p:+$("eTlnP").value} },
      duration:+$("eDur").value, startAt:$("eStart").value, endAt:$("eEnd").value,
      shuffle:$("eShuffle").value==="1", showResult:$("eShow").value==="1", owner:ME.email, createdAt:Date.now() };
    var need = e.cfg.tn.n + e.cfg.ds.n + e.cfg.tln.n;
    if(Exam.pool(e).length < need){ if(!confirm("Ngân hàng chưa đủ câu hỏi cho cấu trúc này. Vẫn tạo đề?")) return; }
    S.exams.push(e); Store.save("exams"); toast("Đã tạo đề"); Router.go("exams");
  },
  del: function(id){ if(!confirm("Xoá đề này?")) return;
    S.exams = S.exams.filter(function(e){ return e.id!==id; }); Store.save("exams"); Router.go("exams"); },
  pool: function(e){
    return S.questions.filter(function(q){
      return q.subject===e.subject && q.grade==e.grade && (!e.chapters.length || e.chapters.indexOf(q.chapter)>=0);
    });
  },
  /* Sinh đề riêng cho từng học sinh, cố định theo mã học sinh */
  paper: function(e, studentId){
    var rng = seeded(e.id + "|" + studentId);
    var pool = Exam.pool(e);
    var take = function(type, n){
      var arr = shuffleSeed(pool.filter(function(q){ return q.type===type; }), rng).slice(0, n);
      return arr;
    };
    var tn = take("TN", e.cfg.tn.n), ds = take("DS", e.cfg.ds.n), tln = take("TLN", e.cfg.tln.n);
    if(e.shuffle){
      tn = tn.map(function(q){
        var idx = shuffleSeed([0,1,2,3].slice(0,(q.options||[]).length), rng);
        var oldAns = "ABCD".indexOf(q.answer);
        var opts = idx.map(function(i){ return q.options[i]; });
        var newAns = "ABCD"[idx.indexOf(oldAns)] || q.answer;
        return Object.assign({}, q, { options:opts, answer:newAns });
      });
    }
    var code = "M" + String(Math.floor(rng()*900)+100);
    return { code:code, tn:tn, ds:ds, tln:tln };
  },
  grade: function(e, paper, ans){
    var det = [], total = 0;
    paper.tn.forEach(function(q){
      var ok = ans[q.id] === q.answer; var pt = ok ? e.cfg.tn.p : 0; total += pt;
      det.push({ id:q.id, part:"I", ok:ok, pt:pt, given:ans[q.id]||"", right:q.answer });
    });
    paper.ds.forEach(function(q){
      var right = 0, given = ans[q.id] || {};
      q.statements.forEach(function(s,i){ if(given[i] !== undefined && (given[i]===true)===!!s.ok) right++; });
      var pt = right>0 ? (e.cfg.ds.rule[right-1]||0) : 0;
      if(e.cfg.ds.p !== 1 && e.cfg.ds.rule[3]) pt = pt * (e.cfg.ds.p / e.cfg.ds.rule[3]);
      total += pt;
      det.push({ id:q.id, part:"II", ok:right===q.statements.length, pt:pt, right:right, given:given });
    });
    paper.tln.forEach(function(q){
      var ok = norm(ans[q.id]) === norm(q.short); var pt = ok ? e.cfg.tln.p : 0; total += pt;
      det.push({ id:q.id, part:"III", ok:ok, pt:pt, given:ans[q.id]||"", right:q.short });
    });
    return { score: Math.round(total*100)/100, max: Exam.maxScore(e), detail: det };
  },
  preview: function(id){
    var e = examById(id), p = Exam.paper(e, "GV_PREVIEW");
    var html = '<h2>'+esc(e.title)+' <span class="pill">Mã đề '+p.code+'</span></h2>'
      + '<p class="muted">'+esc(e.subject)+' · Khối '+e.grade+' · '+e.duration+' phút · tối đa '+Exam.maxScore(e).toFixed(2)+' điểm</p>';
    html += '<h3>Phần I. Trắc nghiệm nhiều lựa chọn</h3>' + p.tn.map(function(q,i){
      return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
        + (q.options||[]).map(function(o,j){ return '<div class="opt '+("ABCD"[j]===q.answer?"right":"")+'"><b>'+"ABCD"[j]+'.</b> '+esc(o)+'</div>'; }).join("")+'</div>'; }).join("");
    html += '<h3>Phần II. Đúng/Sai</h3>' + p.ds.map(function(q,i){
      return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
        + q.statements.map(function(s,j){ return '<div class="dsrow"><span class="st"><b>'+"abcd"[j]+')</b> '+esc(s.t)+'</span><span class="pill '+(s.ok?"ok":"rose")+'">'+(s.ok?"Đúng":"Sai")+'</span></div>'; }).join("")+'</div>'; }).join("");
    html += '<h3>Phần III. Trả lời ngắn</h3>' + p.tln.map(function(q,i){
      return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)+'<div class="pill ok" style="margin-top:6px">Đáp án: '+esc(q.short)+'</div></div>'; }).join("");
    html += '<div class="sep"></div><button class="btn ghost" onclick="closeModal(this)">Đóng</button> <button class="btn" onclick="window.print()">In đề</button>';
    modal(html);
  }
};
Views.after_exams = function(){ Exam.onSub(); };

/* ---------- BÀI HỌC ---------- */
Views.lessons = function(){
  var ls = S.lessons.filter(function(l){ return l.subject===BankF.sub && l.grade==BankF.grade; });
  return ''
  + '<div class="page-head"><div><h1>Bài học</h1><p>Mỗi bài gồm phần lý thuyết và bài tập theo ba dạng câu hỏi chuẩn. Học sinh làm tới đâu, phần trăm hoàn thành cập nhật tới đó.</p></div></div>'
  + '<div class="card"><div class="row">'
  + '<div class="field"><label>Môn</label><select id="lSub" onchange="Les.setF()">'+optSubjects(BankF.sub)+'</select></div>'
  + '<div class="field"><label>Khối</label><select id="lGrade" onchange="Les.setF()">'+optGrades(BankF.grade)+'</select></div>'
  + '<div class="field" style="display:flex;align-items:flex-end"><button class="btn teal block" onclick="Les.autoBuild()">Tạo bài học tự động cho môn này</button></div>'
  + '</div><small class="muted">Hệ thống dựng khung bài theo chương trình Kết nối tri thức, rút bài tập từ ngân hàng câu hỏi; chương nào thiếu câu hỏi sẽ được sinh tự động và đánh dấu để bạn duyệt lại.</small></div>'
  + '<div class="card"><h3>'+ls.length+' bài học</h3>'
  + (ls.length ? '<div class="tablewrap"><table><tr><th>Bài</th><th>Chương</th><th>Bài tập</th><th></th></tr>'
    + ls.map(function(l){ return '<tr><td><b>'+esc(l.title)+'</b></td><td>'+esc(l.chapter)+'</td><td>'+(l.items||[]).length+' câu</td>'
      + '<td style="white-space:nowrap"><button class="btn sm ghost" onclick="Les.open(\''+l.id+'\')">Mở</button> '
      + '<button class="btn sm danger" onclick="Les.del(\''+l.id+'\')">Xoá</button></td></tr>'; }).join("")
    + '</table></div>' : '<p class="muted">Chưa có bài học cho môn này. Bấm nút tạo tự động ở trên.</p>') + '</div>';
};

var Les = {
  setF: function(){ BankF.sub = $("lSub").value; BankF.grade = +$("lGrade").value; Router.go("lessons"); },
  del: function(id){ S.lessons = S.lessons.filter(function(l){ return l.id!==id; }); Store.save("lessons"); Router.go("lessons"); },
  autoBuild: function(){
    var sub = BankF.sub, gr = BankF.grade, chaps = (CURRICULUM[sub]||{})[gr] || [];
    var made = 0, gen = 0;
    chaps.forEach(function(ch){
      if(S.lessons.some(function(l){ return l.subject===sub && l.grade==gr && l.chapter===ch; })) return;
      var pool = S.questions.filter(function(q){ return q.subject===sub && q.grade==gr && q.chapter===ch; });
      var items = [];
      ["TN","DS","TLN"].forEach(function(t){
        var have = shuffle(pool.filter(function(q){ return q.type===t; })).slice(0,3);
        if(have.length < 2){
          var need = 2 - have.length;
          var made2 = Gen.make(sub, gr, ch, t, need);
          S.questions = S.questions.concat(made2); gen += made2.length; have = have.concat(made2);
        }
        items = items.concat(have.map(function(q){ return q.id; }));
      });
      S.lessons.push({ id:uid("ls"), subject:sub, grade:gr, chapter:ch, title:ch,
        theory: Les.theory(sub, ch), items: items, createdAt:Date.now() });
      made++;
    });
    Store.save("questions"); Store.save("lessons");
    toast("Đã tạo "+made+" bài học, sinh thêm "+gen+" câu hỏi"); Router.go("lessons");
  },
  theory: function(sub, ch){
    return [
      { h:"Mục tiêu bài học", body:"Sau bài học, học sinh nêu được các khái niệm cốt lõi của chủ đề “"+ch+"”, vận dụng vào bài tập cơ bản và giải thích được kết quả nhận được." },
      { h:"Kiến thức trọng tâm", body:"Tóm tắt định nghĩa, tính chất và công thức chính của chủ đề “"+ch+"” trong chương trình "+sub+" (bộ Kết nối tri thức với cuộc sống). Giáo viên bổ sung nội dung chi tiết và hình ảnh minh hoạ tại đây." },
      { h:"Ví dụ mẫu", body:"Ví dụ có lời giải chi tiết, đi từ dạng nhận biết đến vận dụng, giúp học sinh nắm quy trình làm bài." },
      { h:"Lỗi thường gặp", body:"Những nhầm lẫn phổ biến khi làm bài phần “"+ch+"” và cách phòng tránh." }
    ];
  },
  open: function(id){
    var l = lessonById(id);
    var qs = (l.items||[]).map(qById).filter(Boolean);
    var html = '<h2>'+esc(l.title)+'</h2><p class="muted">'+esc(l.subject)+' · Khối '+l.grade+'</p>'
      + l.theory.map(function(t,i){ return '<div class="field"><label>'+esc(t.h)+'</label><textarea id="th'+i+'" style="min-height:70px">'+esc(t.body)+'</textarea></div>'; }).join("")
      + '<h3>Bài tập ('+qs.length+' câu)</h3>' + qs.map(Bank.render).join("")
      + '<div class="sep"></div><button class="btn" onclick="Les.saveTheory(\''+id+'\',this)">Lưu lý thuyết</button> '
      + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>';
    modal(html);
  },
  saveTheory: function(id, el){
    var l = lessonById(id);
    l.theory.forEach(function(t,i){ var e=document.getElementById("th"+i); if(e) t.body = e.value; });
    Store.save("lessons"); toast("Đã lưu"); closeModal(el);
  }
};

/* ---------- GIAO VIỆC ---------- */
Views.assign = function(){
  var cls = myClasses();
  return ''
  + '<div class="page-head"><div><h1>Giao việc</h1><p>Chọn lớp, chọn bài học hoặc đề kiểm tra, đặt giờ kết thúc. Sau giờ kết thúc học sinh không nộp được nữa.</p></div></div>'
  + '<div class="card"><div class="row">'
  + '<div class="field"><label>Lớp</label><select id="aClass">'+cls.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+' — '+esc(c.code)+'</option>'; }).join("")+'</select></div>'
  + '<div class="field"><label>Loại</label><select id="aType" onchange="Asg.swap()"><option value="lesson">Bài học</option><option value="exam">Bài kiểm tra</option></select></div>'
  + '<div class="field"><label>Nội dung</label><select id="aRef"></select></div>'
  + '<div class="field"><label>Giờ kết thúc</label><input id="aDue" type="datetime-local" value="'+toLocalInput(new Date(Date.now()+3*864e5))+'"></div>'
  + '</div><button class="btn" onclick="Asg.create()">Giao cho lớp</button></div>'
  + '<div class="card"><h3>Đã giao ('+S.assignments.length+')</h3>'
  + (S.assignments.length? '<div class="tablewrap"><table><tr><th>Nội dung</th><th>Loại</th><th>Lớp</th><th>Hạn</th><th>Trạng thái</th><th></th></tr>'
    + S.assignments.slice().reverse().map(function(a){ var c=classById(a.classId); var over = a.dueAt && new Date(a.dueAt)<new Date();
      return '<tr><td>'+esc(a.title)+'</td><td>'+(a.type==="exam"?"Kiểm tra":"Bài học")+'</td><td>'+esc(c?c.name:"—")+'</td><td>'+fmtDT(a.dueAt)+'</td>'
       + '<td>'+(over?'<span class="pill gray">Đã hết hạn</span>':'<span class="pill ok">Đang mở</span>')+'</td>'
       + '<td><button class="btn sm danger" onclick="Asg.del(\''+a.id+'\')">Thu hồi</button></td></tr>'; }).join("")
    + '</table></div>' : '<p class="muted">Chưa giao việc nào.</p>') + '</div>';
};
var Asg = {
  swap: function(){
    var t = $("aType").value, c = classById($("aClass").value);
    var list = t==="lesson"
      ? S.lessons.filter(function(l){ return !c || l.subject===c.subject; })
      : S.exams.filter(function(e){ return !c || e.subject===c.subject; });
    $("aRef").innerHTML = list.map(function(x){ return '<option value="'+x.id+'">'+esc(x.title)+'</option>'; }).join("")
      || '<option value="">— chưa có nội dung —</option>';
  },
  create: function(){
    var ref = $("aRef").value; if(!ref){ toast("Chưa có nội dung để giao."); return; }
    var t = $("aType").value;
    var obj = t==="lesson" ? lessonById(ref) : examById(ref);
    S.assignments.push({ id:uid("as"), type:t, refId:ref, classId:$("aClass").value, title:obj.title,
      dueAt:$("aDue").value, owner:ME.email, createdAt:Date.now() });
    Store.save("assignments"); toast("Đã giao việc"); Router.go("assign");
  },
  del: function(id){ S.assignments = S.assignments.filter(function(a){ return a.id!==id; }); Store.save("assignments"); Router.go("assign"); }
};
Views.after_assign = function(){ if($("aRef")) Asg.swap(); };

/* ---------- KẾT QUẢ & TIẾN ĐỘ ---------- */
Views.reports = function(){
  var cls = myClasses();
  return '<div class="page-head"><div><h1>Kết quả và tiến độ</h1><p>Điểm bài kiểm tra và phần trăm hoàn thành bài học của từng học sinh.</p></div></div>'
  + '<div class="card"><div class="field"><label>Chọn lớp</label><select id="rClass" onchange="Rep.draw()">'
  + cls.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+'</option>'; }).join("")+'</select></div></div>'
  + '<div id="repBox"></div>';
};
Views.after_reports = function(){ if($("rClass")) Rep.draw(); };

var Rep = {
  draw: function(){
    var c = classById($("rClass").value); if(!c){ $("repBox").innerHTML=""; return; }
    var subs = S.submissions.filter(function(s){ return s.classId===c.id; });
    var exams = S.assignments.filter(function(a){ return a.classId===c.id && a.type==="exam"; })
      .map(function(a){ return examById(a.refId); }).filter(Boolean);
    var lessons = S.assignments.filter(function(a){ return a.classId===c.id && a.type==="lesson"; })
      .map(function(a){ return lessonById(a.refId); }).filter(Boolean);
    var html = '<div class="card"><h3>Điểm bài kiểm tra</h3><div class="tablewrap"><table><tr><th>Học sinh</th>'
      + exams.map(function(e){ return '<th>'+esc(e.title)+'</th>'; }).join("") + '</tr>'
      + (c.students||[]).map(function(st){
          var sid = "hs_"+c.id+"_"+(st.code||norm(st.name));
          return '<tr><td>'+esc(st.name)+'</td>' + exams.map(function(e){
            var sb = subs.filter(function(x){ return x.examId===e.id && x.studentId===sid; })[0];
            return '<td>'+(sb? '<b>'+sb.score.toFixed(2)+'</b> <small class="muted">/'+sb.max.toFixed(1)+'</small>' : '<span class="muted">—</span>')+'</td>';
          }).join("") + '</tr>';
        }).join("") + '</table></div>'
      + (exams.length? '' : '<p class="muted">Lớp này chưa được giao bài kiểm tra nào.</p>') + '</div>';

    html += '<div class="card"><h3>Phần trăm hoàn thành bài học</h3><div class="tablewrap"><table><tr><th>Học sinh</th>'
      + lessons.map(function(l){ return '<th>'+esc(l.title)+'</th>'; }).join("") + '<th>Trung bình</th></tr>'
      + (c.students||[]).map(function(st){
          var sid = "hs_"+c.id+"_"+(st.code||norm(st.name)), tot=0;
          var cells = lessons.map(function(l){
            var p = S.progress.filter(function(x){ return x.studentId===sid && x.lessonId===l.id; })[0];
            var v = p? p.percent : 0; tot += v;
            return '<td><div class="bar"><i style="width:'+v+'%"></i></div><small>'+v+'%</small></td>';
          }).join("");
          var avg = lessons.length? Math.round(tot/lessons.length) : 0;
          return '<tr><td>'+esc(st.name)+'</td>'+cells+'<td><b>'+avg+'%</b></td></tr>';
        }).join("") + '</table></div>'
      + (lessons.length? '' : '<p class="muted">Lớp này chưa được giao bài học nào.</p>') + '</div>';
    $("repBox").innerHTML = html;
  }
};
/* ---------- HỌC SINH ---------- */
function myAssignments(){
  return S.assignments.filter(function(a){ return a.classId===ME.classId; });
}
function isOpen(a){ return !a.dueAt || new Date(a.dueAt) > new Date(); }
function mySub(examId){ return S.submissions.filter(function(s){ return s.examId===examId && s.studentId===ME.id; })[0]; }
function myProg(lessonId){ return S.progress.filter(function(p){ return p.lessonId===lessonId && p.studentId===ME.id; })[0]; }

Views.hsHome = function(){
  var list = myAssignments();
  var c = classById(ME.classId);
  var done = list.filter(function(a){ return a.type==="exam" ? !!mySub(a.refId) : (myProg(a.refId)||{}).percent===100; }).length;
  return '<div class="page-head"><div><h1>Chào '+esc(ME.name)+'</h1>'
    + '<p>Lớp '+esc(c?c.name:"")+'. Dưới đây là những việc thầy cô đã giao, kèm hạn hoàn thành.</p></div></div>'
    + '<div class="grid g3"><div class="kpi"><b>'+list.length+'</b><span>việc được giao</span></div>'
    + '<div class="kpi"><b>'+done+'</b><span>đã hoàn thành</span></div>'
    + '<div class="kpi"><b>'+list.filter(isOpen).length+'</b><span>còn hạn</span></div></div>'
    + '<div class="card" style="margin-top:14px"><h3>Việc cần làm</h3>'
    + (list.length ? '<div class="tablewrap"><table><tr><th>Nội dung</th><th>Loại</th><th>Hạn</th><th>Tình trạng</th><th></th></tr>'
      + list.map(function(a){
          var open = isOpen(a);
          var st = a.type==="exam" ? (mySub(a.refId)? '<span class="pill ok">Đã nộp · '+mySub(a.refId).score.toFixed(2)+' điểm</span>' : (open?'<span class="pill amber">Chưa làm</span>':'<span class="pill gray">Hết hạn</span>'))
                 : '<div class="bar"><i style="width:'+((myProg(a.refId)||{}).percent||0)+'%"></i></div><small>'+(((myProg(a.refId)||{}).percent)||0)+'%</small>';
          var btn = a.type==="exam"
            ? (mySub(a.refId)? '<button class="btn sm ghost" onclick="Do.review(\''+a.refId+'\')">Xem lại</button>'
               : (open? '<button class="btn sm" onclick="Do.start(\''+a.refId+'\')">Làm bài</button>' : ''))
            : '<button class="btn sm teal" onclick="Do.learn(\''+a.refId+'\')">Học</button>';
          return '<tr><td><b>'+esc(a.title)+'</b></td><td>'+(a.type==="exam"?"Kiểm tra":"Bài học")+'</td><td>'+fmtDT(a.dueAt)+'</td><td>'+st+'</td><td>'+btn+'</td></tr>';
        }).join("") + '</table></div>' : '<p class="muted">Chưa có việc nào được giao.</p>') + '</div>';
};

Views.hsLearn = function(){
  var list = myAssignments().filter(function(a){ return a.type==="lesson"; });
  return '<div class="page-head"><div><h1>Bài học</h1><p>Đọc lý thuyết rồi làm bài tập. Mỗi câu làm đúng sẽ tăng phần trăm hoàn thành.</p></div></div>'
   + (list.length ? list.map(function(a){ var l = lessonById(a.refId); if(!l) return "";
      var p = (myProg(l.id)||{}).percent||0;
      return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">'
        + '<div><b>'+esc(l.title)+'</b><br><small class="muted">'+esc(l.subject)+' · '+(l.items||[]).length+' bài tập · hạn '+fmtDT(a.dueAt)+'</small></div>'
        + '<div style="min-width:160px"><div class="bar"><i style="width:'+p+'%"></i></div><small>'+p+'% hoàn thành</small></div>'
        + '<button class="btn teal" onclick="Do.learn(\''+l.id+'\')">'+(p?"Tiếp tục":"Bắt đầu")+'</button></div></div>'; }).join("")
     : '<div class="card"><p class="muted">Chưa có bài học nào được giao.</p></div>');
};

Views.hsExam = function(){
  var list = myAssignments().filter(function(a){ return a.type==="exam"; });
  return '<div class="page-head"><div><h1>Bài kiểm tra</h1><p>Mỗi bạn nhận một đề riêng do hệ thống rút ngẫu nhiên. Bài tự nộp khi hết giờ.</p></div></div>'
   + (list.length ? list.map(function(a){ var e = examById(a.refId); if(!e) return "";
      var sb = mySub(e.id), open = isOpen(a);
      return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">'
        + '<div><b>'+esc(e.title)+'</b><br><small class="muted">'+esc(e.subject)+' · '+e.duration+' phút · '
        + e.cfg.tn.n+' TN, '+e.cfg.ds.n+' Đ/S, '+e.cfg.tln.n+' TLN · hạn '+fmtDT(a.dueAt)+'</small></div>'
        + (sb ? '<div><span class="pill ok">'+sb.score.toFixed(2)+'/'+sb.max.toFixed(1)+' điểm</span></div>'
             + '<button class="btn ghost" onclick="Do.review(\''+e.id+'\')">Xem lại bài</button>'
             : (open ? '<button class="btn" onclick="Do.start(\''+e.id+'\')">Vào làm bài</button>' : '<span class="pill gray">Đã hết hạn</span>'))
        + '</div></div>'; }).join("")
     : '<div class="card"><p class="muted">Chưa có bài kiểm tra nào.</p></div>');
};

Views.hsProgress = function(){
  var ls = myAssignments().filter(function(a){ return a.type==="lesson"; });
  var ex = S.submissions.filter(function(s){ return s.studentId===ME.id; });
  var avg = ls.length ? Math.round(ls.reduce(function(t,a){ return t + ((myProg(a.refId)||{}).percent||0); },0)/ls.length) : 0;
  var mark = ex.length ? (ex.reduce(function(t,s){ return t + s.score/s.max*10; },0)/ex.length).toFixed(2) : "—";
  return '<div class="page-head"><div><h1>Tiến độ của tôi</h1><p>Theo dõi mức hoàn thành bài học và điểm các bài kiểm tra đã nộp.</p></div></div>'
   + '<div class="grid g3"><div class="kpi"><b>'+avg+'%</b><span>hoàn thành bài học</span></div>'
   + '<div class="kpi"><b>'+mark+'</b><span>điểm trung bình quy về thang 10</span></div>'
   + '<div class="kpi"><b>'+ex.length+'</b><span>bài đã nộp</span></div></div>'
   + '<div class="card" style="margin-top:14px"><h3>Từng bài học</h3><div class="tablewrap"><table><tr><th>Bài</th><th>Hoàn thành</th></tr>'
   + ls.map(function(a){ var l=lessonById(a.refId); if(!l) return ""; var p=(myProg(l.id)||{}).percent||0;
       return '<tr><td>'+esc(l.title)+'</td><td><div class="bar"><i style="width:'+p+'%"></i></div><small>'+p+'%</small></td></tr>'; }).join("")
   + '</table></div></div>'
   + '<div class="card"><h3>Bài kiểm tra đã nộp</h3><div class="tablewrap"><table><tr><th>Đề</th><th>Mã đề</th><th>Điểm</th><th>Nộp lúc</th></tr>'
   + ex.map(function(s){ var e=examById(s.examId);
       return '<tr><td>'+esc(e?e.title:"—")+'</td><td>'+esc(s.code)+'</td><td><b>'+s.score.toFixed(2)+'</b>/'+s.max.toFixed(1)+'</td><td>'+fmtDT(s.submittedAt)+'</td></tr>'; }).join("")
   + '</table></div></div>';
};

/* ---------- LÀM BÀI ---------- */
var Do = { timer:null, paper:null, exam:null, ans:{}, deadline:0 };

Do.start = function(examId){
  var e = examById(examId); if(!e) return;
  Do.exam = e; Do.paper = Exam.paper(e, ME.id); Do.ans = {};
  Do.deadline = Date.now() + e.duration*60000;
  Router.cur = "exam_do";
  Array.prototype.forEach.call(document.querySelectorAll(".nav"), function(n){ n.classList.remove("on"); });
  $("view").innerHTML = Do.renderPaper();
  Do.tick();
  Do.timer = setInterval(Do.tick, 1000);
};

Do.renderPaper = function(){
  var e = Do.exam, p = Do.paper, h = "";
  h += '<div class="page-head"><div><h1>'+esc(e.title)+'</h1>'
     + '<p>Mã đề '+p.code+' · '+esc(ME.name)+' · tối đa '+Exam.maxScore(e).toFixed(2)+' điểm</p></div>'
     + '<div class="timer" id="clock">--:--</div></div>';
  if(p.tn.length){
    h += '<div class="card"><h3>Phần I. Trắc nghiệm nhiều lựa chọn</h3><p class="muted">Mỗi câu '+e.cfg.tn.p+' điểm.</p>'
      + p.tn.map(function(q,i){ return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
        + (q.options||[]).map(function(o,j){ var L="ABCD"[j];
          return '<label class="opt" id="o_'+q.id+'_'+L+'"><input type="radio" name="'+q.id+'" onchange="Do.pick(\''+q.id+'\',\''+L+'\')"><span><b>'+L+'.</b> '+esc(o)+'</span></label>'; }).join("")
        + '</div>'; }).join("") + '</div>';
  }
  if(p.ds.length){
    h += '<div class="card"><h3>Phần II. Trắc nghiệm đúng/sai</h3><p class="muted">Đúng 1 ý '+e.cfg.ds.rule[0]+' điểm; 2 ý '+e.cfg.ds.rule[1]+'; 3 ý '+e.cfg.ds.rule[2]+'; 4 ý '+e.cfg.ds.rule[3]+'.</p>'
      + p.ds.map(function(q,i){ return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
        + q.statements.map(function(s,j){
          return '<div class="dsrow"><span class="st"><b>'+"abcd"[j]+')</b> '+esc(s.t)+'</span>'
            + '<label class="opt" style="margin:0"><input type="radio" name="'+q.id+'_'+j+'" onchange="Do.ds(\''+q.id+'\','+j+',true)"> Đúng</label>'
            + '<label class="opt" style="margin:0"><input type="radio" name="'+q.id+'_'+j+'" onchange="Do.ds(\''+q.id+'\','+j+',false)"> Sai</label></div>'; }).join("")
        + '</div>'; }).join("") + '</div>';
  }
  if(p.tln.length){
    h += '<div class="card"><h3>Phần III. Trả lời ngắn</h3><p class="muted">Mỗi câu '+e.cfg.tln.p+' điểm. Ghi kết quả, dùng dấu phẩy hoặc chấm cho số thập phân.</p>'
      + p.tln.map(function(q,i){ return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
        + '<div class="field" style="margin-top:8px;max-width:260px"><input placeholder="Đáp án" oninput="Do.short(\''+q.id+'\',this.value)"></div></div>'; }).join("") + '</div>';
  }
  h += '<div class="card center"><button class="btn" onclick="Do.submit(false)">Nộp bài</button> '
     + '<button class="btn ghost" onclick="Do.quit()">Thoát không nộp</button></div>';
  return h;
};

Do.pick = function(qid, L){
  Do.ans[qid] = L;
  Do.paper.tn.forEach(function(q){ if(q.id===qid) ["A","B","C","D"].forEach(function(x){
    var el = document.getElementById("o_"+qid+"_"+x); if(el) el.classList.toggle("sel", x===L); }); });
};
Do.ds = function(qid, i, v){ Do.ans[qid] = Do.ans[qid] || {}; Do.ans[qid][i] = v; };
Do.short = function(qid, v){ Do.ans[qid] = v; };
Do.tick = function(){
  var left = Math.max(0, Math.floor((Do.deadline - Date.now())/1000));
  var el = $("clock"); if(!el){ clearInterval(Do.timer); return; }
  var m = String(Math.floor(left/60)).padStart(2,"0"), s = String(left%60).padStart(2,"0");
  el.textContent = "Còn " + m + ":" + s;
  el.classList.toggle("warn", left < 300);
  if(left<=0){ clearInterval(Do.timer); Do.submit(true); }
};
Do.quit = function(){ if(!confirm("Thoát mà không nộp? Bài làm hiện tại sẽ mất.")) return;
  clearInterval(Do.timer); Router.go("hsExam"); };
Do.submit = function(auto){
  if(!auto && !confirm("Nộp bài ngay bây giờ?")) return;
  clearInterval(Do.timer);
  var e = Do.exam, r = Exam.grade(e, Do.paper, Do.ans);
  var sub = { id:uid("sb"), examId:e.id, studentId:ME.id, studentName:ME.name, classId:ME.classId,
    code:Do.paper.code, qids:{ tn:Do.paper.tn.map(function(q){return q.id;}), ds:Do.paper.ds.map(function(q){return q.id;}), tln:Do.paper.tln.map(function(q){return q.id;}) },
    answers:Do.ans, score:r.score, max:r.max, detail:r.detail, submittedAt:Date.now(), auto:!!auto };
  S.submissions.push(sub); Store.save("submissions");
  var pct = r.max? Math.round(r.score/r.max*100) : 0;
  var html = '<h2>Đã nộp bài</h2><p class="muted">'+esc(e.title)+' · mã đề '+Do.paper.code+(auto?' · hệ thống tự nộp khi hết giờ':'')+'</p>'
    + '<div class="grid g3"><div class="kpi"><b>'+r.score.toFixed(2)+'</b><span>trên '+r.max.toFixed(1)+' điểm</span></div>'
    + '<div class="kpi"><b>'+(r.max? (r.score/r.max*10).toFixed(2) : "—")+'</b><span>quy về thang 10</span></div>'
    + '<div class="kpi"><b>'+pct+'%</b><span>mức đạt</span></div></div>'
    + '<div class="sep"></div>'
    + (e.showResult? '<button class="btn" onclick="closeModal(this);Do.review(\''+e.id+'\')">Xem đáp án</button> ' : '')
    + '<button class="btn ghost" onclick="closeModal(this);Router.go(\'hsHome\')">Về trang chính</button>';
  modal(html);
};

Do.review = function(examId){
  var e = examById(examId), sb = mySub(examId);
  if(!sb){ toast("Chưa có bài nộp."); return; }
  var find = function(id){ return qById(id); };
  var h = '<h2>'+esc(e.title)+' — '+sb.score.toFixed(2)+'/'+sb.max.toFixed(1)+' điểm</h2><p class="muted">Mã đề '+esc(sb.code)+'</p>';
  h += '<h3>Phần I</h3>' + sb.qids.tn.map(function(id,i){ var q=find(id); if(!q) return "";
    var d = sb.detail.filter(function(x){ return x.id===id; })[0]||{};
    return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
      + '<div><span class="pill '+(d.ok?"ok":"rose")+'">Bạn chọn '+(d.given||"—")+'</span> <span class="pill teal">Đáp án '+esc(d.right||"")+'</span></div>'
      + (q.explain? '<div class="muted"><b>Lời giải:</b> '+esc(q.explain)+'</div>':'')+'</div>'; }).join("");
  h += '<h3>Phần II</h3>' + sb.qids.ds.map(function(id,i){ var q=find(id); if(!q) return "";
    var d = sb.detail.filter(function(x){ return x.id===id; })[0]||{};
    return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
      + q.statements.map(function(s,j){ var g = (d.given||{})[j];
        return '<div class="dsrow"><span class="st"><b>'+"abcd"[j]+')</b> '+esc(s.t)+'</span>'
          + '<span class="pill '+((g===!!s.ok)?"ok":"rose")+'">Bạn: '+(g===undefined?"bỏ trống":(g?"Đúng":"Sai"))+'</span>'
          + '<span class="pill teal">Đáp án: '+(s.ok?"Đúng":"Sai")+'</span></div>'; }).join("")
      + '<div><span class="pill">Được '+((d.pt||0).toFixed(2))+' điểm</span></div></div>'; }).join("");
  h += '<h3>Phần III</h3>' + sb.qids.tln.map(function(id,i){ var q=find(id); if(!q) return "";
    var d = sb.detail.filter(function(x){ return x.id===id; })[0]||{};
    return '<div class="qitem"><b>Câu '+(i+1)+'.</b> '+QC(q)
      + '<div><span class="pill '+(d.ok?"ok":"rose")+'">Bạn trả lời: '+esc(d.given||"—")+'</span> <span class="pill teal">Đáp án: '+esc(d.right||"")+'</span></div></div>'; }).join("");
  h += '<div class="sep"></div><button class="btn ghost" onclick="closeModal(this)">Đóng</button>';
  modal(h);
};

/* ---------- HỌC BÀI (theo dõi phần trăm) ---------- */
Do.learn = function(lessonId){
  var l = lessonById(lessonId); if(!l){ toast("Không tìm thấy bài học."); return; }
  var a = myAssignments().filter(function(x){ return x.refId===lessonId; })[0];
  var pr = myProg(lessonId) || { id:uid("pg"), studentId:ME.id, classId:ME.classId, lessonId:lessonId, done:{}, percent:0 };
  Router.cur = "learn_do";
  var qs = (l.items||[]).map(qById).filter(Boolean);
  var h = '<div class="page-head"><div><h1>'+esc(l.title)+'</h1><p>'+esc(l.subject)+' · Khối '+l.grade
        + (a && a.dueAt ? ' · hạn '+fmtDT(a.dueAt) : '') + '</p></div>'
        + '<div style="min-width:150px"><div class="bar"><i id="lbar" style="width:'+pr.percent+'%"></i></div><small id="lpct">'+pr.percent+'% hoàn thành</small></div></div>';
  h += '<div class="card">' + l.theory.map(function(t,i){
      return '<h3>'+esc(t.h)+'</h3><p>'+esc(t.body)+'</p>'
        + '<label class="opt"><input type="checkbox" '+(pr.done["th"+i]?"checked":"")+' onchange="Do.mark(\''+lessonId+'\',\'th'+i+'\',this.checked)"><span>Đã đọc xong mục này</span></label>'; }).join("<div class='sep'></div>") + '</div>';
  h += '<div class="card"><h3>Bài tập</h3>' + qs.map(function(q,i){ return Do.exItem(lessonId, q, i, pr); }).join("") + '</div>';
  h += '<div class="card center"><button class="btn ghost" onclick="Router.go(\'hsLearn\')">Quay lại danh sách bài học</button></div>';
  $("view").innerHTML = h;
};

Do.exItem = function(lessonId, q, i, pr){
  var done = pr.done["q"+q.id];
  var body = "";
  if(q.type==="TN") body = (q.options||[]).map(function(o,j){ var L="ABCD"[j];
    return '<label class="opt '+(done? (L===q.answer?"right":"") : "")+'"><input type="radio" name="L'+q.id+'" onchange="Do.answer(\''+lessonId+'\',\''+q.id+'\',\''+L+'\')"><span><b>'+L+'.</b> '+esc(o)+'</span></label>'; }).join("");
  if(q.type==="DS") body = q.statements.map(function(s,j){
    return '<div class="dsrow"><span class="st"><b>'+"abcd"[j]+')</b> '+esc(s.t)+'</span>'
      + '<label class="opt" style="margin:0"><input type="radio" name="L'+q.id+'_'+j+'" onchange="Do.answerDS(\''+lessonId+'\',\''+q.id+'\','+j+',true)"> Đúng</label>'
      + '<label class="opt" style="margin:0"><input type="radio" name="L'+q.id+'_'+j+'" onchange="Do.answerDS(\''+lessonId+'\',\''+q.id+'\','+j+',false)"> Sai</label></div>'; }).join("");
  if(q.type==="TLN") body = '<div class="field" style="max-width:260px;margin-top:8px"><input placeholder="Nhập đáp án rồi bấm Kiểm tra" id="LT'+q.id+'">'
    + '</div><button class="btn sm" onclick="Do.answer(\''+lessonId+'\',\''+q.id+'\',document.getElementById(\'LT'+q.id+'\').value)">Kiểm tra</button>';
  return '<div class="qitem" id="li_'+q.id+'"><div style="margin-bottom:6px"><span class="pill">'+typeName(q.type)+'</span> '
    + (done? '<span class="pill ok">Đã làm đúng</span>':'') + '</div><b>Câu '+(i+1)+'.</b> '+QC(q)+body
    + '<div id="fb_'+q.id+'" class="muted" style="margin-top:6px">'+(done && q.explain? "<b>Lời giải:</b> "+esc(q.explain):"")+'</div></div>';
};

Do.saveProg = function(lessonId, pr){
  var l = lessonById(lessonId);
  var total = (l.theory||[]).length + (l.items||[]).length;
  var n = Object.keys(pr.done).filter(function(k){ return pr.done[k]; }).length;
  pr.percent = total? Math.round(n/total*100) : 0;
  pr.updatedAt = Date.now();
  var idx = S.progress.findIndex(function(x){ return x.id===pr.id; });
  if(idx<0) S.progress.push(pr); else S.progress[idx] = pr;
  Store.save("progress");
  if($("lbar")){ $("lbar").style.width = pr.percent+"%"; $("lpct").textContent = pr.percent+"% hoàn thành"; }
};
Do.mark = function(lessonId, key, v){
  var pr = myProg(lessonId) || { id:uid("pg"), studentId:ME.id, classId:ME.classId, lessonId:lessonId, done:{}, percent:0 };
  pr.done[key] = v; Do.saveProg(lessonId, pr);
};
Do.answer = function(lessonId, qid, val){
  var q = qById(qid), ok;
  if(q.type==="TN") ok = (val===q.answer); else ok = (norm(val)===norm(q.short));
  var fb = $("fb_"+qid);
  fb.innerHTML = ok ? '<span class="pill ok">Chính xác</span> ' + (q.explain? "<b>Lời giải:</b> "+esc(q.explain):"")
                    : '<span class="pill rose">Chưa đúng, thử lại nhé</span>';
  if(ok) Do.mark(lessonId, "q"+qid, true);
};
Do.answerDS = function(lessonId, qid, j, v){
  var q = qById(qid);
  Do._ds = Do._ds || {}; Do._ds[qid] = Do._ds[qid] || {}; Do._ds[qid][j] = v;
  var all = q.statements.every(function(s,i){ return Do._ds[qid][i] !== undefined; });
  if(!all) return;
  var right = q.statements.filter(function(s,i){ return Do._ds[qid][i] === !!s.ok; }).length;
  var fb = $("fb_"+qid);
  if(right===q.statements.length){ fb.innerHTML = '<span class="pill ok">Đúng cả bốn ý</span> ' + (q.explain? "<b>Lời giải:</b> "+esc(q.explain):"");
    Do.mark(lessonId, "q"+qid, true);
  } else fb.innerHTML = '<span class="pill amber">Đúng '+right+'/'+q.statements.length+' ý — xem lại các ý còn lại</span>';
};
/* ---------- 9. BỘ SINH CÂU HỎI TỰ ĐỘNG ---------- */
var Gen = {
  /* Bộ sinh Toán: tính toán được nên đáp án luôn đúng */
  math: [
    { key:/đạo hàm|khảo sát|cực trị/i, tn:function(){ var a=rnd(2,9), b=rnd(1,9), x=rnd(1,5);
        var val = 2*a*x + b;
        return { c:"Cho hàm số y = "+a+"x² + "+b+"x + "+rnd(1,9)+". Giá trị của y'("+x+") bằng", o:[val, val+a, val-b, 2*a*x], ans:0,
          e:"y' = "+(2*a)+"x + "+b+" nên y'("+x+") = "+val+"." }; },
      tln:function(){ var a=rnd(2,6), b=rnd(1,9);
        return { c:"Cho hàm số y = "+a+"x³ + "+b+"x. Tính y'(1).", ans:String(3*a+b), e:"y' = "+(3*a)+"x² + "+b+", thay x = 1." }; },
      ds:function(){ var a=rnd(1,4);
        return { c:"Cho hàm số y = x³ − "+(3*a*a)+"x. Xét tính đúng sai của các khẳng định:",
          st:[["Hàm số có hai điểm cực trị",true],["y' = 3x² − "+(3*a*a),true],["Hàm số đồng biến trên toàn bộ tập số thực",false],["Đồ thị hàm số đi qua gốc toạ độ",true]],
          e:"y' = 3x² − "+(3*a*a)+" đổi dấu hai lần nên hàm số có hai cực trị." }; } },
    { key:/nguyên hàm|tích phân/i, tn:function(){ var a=rnd(2,6), b=rnd(1,5);
        var val = a*b*b;
        return { c:"Tính tích phân của f(x) = "+(2*a)+"x trên đoạn [0; "+b+"].", o:[val, val+a, 2*a*b, a*b], ans:0,
          e:"∫"+(2*a)+"x dx = "+a+"x², thay cận: "+a+"·"+b+"² = "+val+"." }; },
      tln:function(){ var a=rnd(2,7);
        return { c:"Tính tích phân của f(x) = 3x² trên đoạn [0; "+a+"].", ans:String(a*a*a), e:"∫3x² dx = x³, thay cận được "+a+"³." }; },
      ds:function(){ var a=rnd(2,5);
        return { c:"Cho f(x) = "+(2*a)+"x. Xét tính đúng sai:",
          st:[["Một nguyên hàm của f(x) là "+a+"x²",true],["Tích phân của f trên [0;1] bằng "+a,true],["f là hàm số chẵn",false],["Đồ thị của f là một đường thẳng qua gốc toạ độ",true]],
          e:"F(x) = "+a+"x² + C." }; } },
    { key:/cấp số|dãy số/i, tn:function(){ var u=rnd(1,9), d=rnd(2,7), n=rnd(5,12);
        var val = u + (n-1)*d;
        return { c:"Cấp số cộng có u₁ = "+u+" và công sai d = "+d+". Số hạng u"+n+" bằng", o:[val, val+d, u+n*d, u*d], ans:0,
          e:"uₙ = u₁ + (n−1)d = "+u+" + "+(n-1)+"·"+d+" = "+val+"." }; },
      tln:function(){ var u=rnd(1,6), q=rnd(2,3), n=rnd(3,6);
        return { c:"Cấp số nhân có u₁ = "+u+", công bội q = "+q+". Tính u"+n+".", ans:String(u*Math.pow(q,n-1)), e:"uₙ = u₁·qⁿ⁻¹." }; },
      ds:function(){ var u=rnd(2,8), d=rnd(2,5);
        return { c:"Cho cấp số cộng u₁ = "+u+", d = "+d+". Xét tính đúng sai:",
          st:[["u₂ = "+(u+d),true],["Dãy số tăng",d>0],["u₃ = "+(u+3*d),false],["Tổng 2 số hạng đầu bằng "+(2*u+d),true]],
          e:"Áp dụng uₙ = u₁ + (n−1)d." }; } },
    { key:/xác suất/i, tn:function(){ var a=rnd(2,6), b=rnd(2,6); var tot=a+b;
        return { c:"Một hộp có "+a+" viên bi đỏ và "+b+" viên bi xanh. Lấy ngẫu nhiên một viên. Xác suất lấy được bi đỏ là",
          o:[(a+"/"+tot), (b+"/"+tot), (a+"/"+b), ("1/"+tot)], ans:0, e:"P = số bi đỏ / tổng số bi = "+a+"/"+tot+"." }; },
      tln:function(){ var n=rnd(3,6);
        return { c:"Có bao nhiêu cách xếp "+n+" học sinh vào một hàng ngang?", ans:String((function(k){var r=1;for(var i=2;i<=k;i++)r*=i;return r;})(n)), e:"Số hoán vị "+n+"! ." }; },
      ds:function(){ var a=rnd(2,5), b=rnd(2,5);
        return { c:"Hộp có "+a+" bi đỏ, "+b+" bi xanh, lấy ngẫu nhiên 1 viên. Xét tính đúng sai:",
          st:[["Không gian mẫu có "+(a+b)+" phần tử",true],["Xác suất lấy được bi xanh là "+b+"/"+(a+b),true],["Tổng xác suất hai biến cố bằng 1",true],["Hai biến cố này xung khắc là sai",false]],
          e:"Hai biến cố lấy bi đỏ và bi xanh là xung khắc." }; } },
    { key:/toạ độ|vectơ|không gian/i, tn:function(){ var a=rnd(1,6), b=rnd(1,6), c=rnd(1,6);
        return { c:"Trong không gian Oxyz, cho vectơ u = ("+a+"; "+b+"; "+c+"). Toạ độ của 2u là",
          o:["("+2*a+"; "+2*b+"; "+2*c+")", "("+a+"; "+b+"; "+c+")", "("+(a+2)+"; "+(b+2)+"; "+(c+2)+")", "("+2*a+"; "+b+"; "+c+")"], ans:0,
          e:"Nhân vectơ với số thực thì nhân từng toạ độ." }; },
      tln:function(){ var a=rnd(1,5), b=rnd(1,5);
        return { c:"Trong không gian Oxyz, cho A("+a+";0;0) và B(0;"+b+";0). Tính OA² + OB².", ans:String(a*a+b*b), e:"OA = "+a+", OB = "+b+"." }; },
      ds:function(){ var a=rnd(1,5);
        return { c:"Trong không gian Oxyz cho điểm M("+a+"; 0; 0). Xét tính đúng sai:",
          st:[["M thuộc trục Ox",true],["Khoảng cách từ M đến gốc toạ độ bằng "+a,true],["M thuộc mặt phẳng (Oyz)",false],["Hình chiếu của M lên trục Oy là gốc toạ độ",true]],
          e:"Điểm có tung độ và cao độ bằng 0 nằm trên Ox." }; } }
  ],
  mathFallback: {
    tn:function(){ var a=rnd(2,12), b=rnd(2,12);
      return { c:"Giá trị của biểu thức "+a+" × "+b+" − "+a+" bằng", o:[a*b-a, a*b, a*b+a, a+b], ans:0, e:a+"×"+b+" = "+a*b+", trừ "+a+" được "+(a*b-a)+"." }; },
    tln:function(){ var a=rnd(10,60), b=rnd(2,9);
      return { c:"Tính "+a+" chia cho "+b+", làm tròn đến hàng phần trăm.", ans:String(Math.round(a/b*100)/100).replace(".",","), e:a+"/"+b+" ≈ "+(Math.round(a/b*100)/100)+"." }; },
    ds:function(){ var a=rnd(2,9);
      return { c:"Xét số nguyên n = "+a+". Các khẳng định sau đúng hay sai?",
        st:[["n là số nguyên dương",true],["n² = "+(a*a),true],["n là số chẵn",a%2===0],["n + 1 chia hết cho 2",(a+1)%2===0]], e:"Kiểm tra trực tiếp với n = "+a+"." }
    }
  },
  /* Khung câu hỏi cho các môn còn lại: tạo bản nháp bám chương, giáo viên duyệt lại nội dung */
  shells: {
    TN: ["Nội dung nào sau đây phản ánh đúng đặc điểm cơ bản của chủ đề “{CH}” trong chương trình {SUB} {GR}?",
         "Khi tìm hiểu chủ đề “{CH}”, kết luận nào sau đây là chính xác?",
         "Ý nào dưới đây không thuộc nội dung của chủ đề “{CH}”?"],
    DS: ["Đọc đoạn thông tin về chủ đề “{CH}” ({SUB} {GR}) và cho biết các nhận định sau đúng hay sai:"],
    TLN:["Nêu ngắn gọn kết quả/số liệu quan trọng nhất em rút ra khi học chủ đề “{CH}” ({SUB} {GR})."]
  },
  make: function(sub, grade, chapter, type, n){
    var out = [];
    for(var i=0;i<n;i++){
      var q = { id:uid("q"), subject:sub, grade:grade, chapter:chapter, type:type,
        level: pick(["NB","TH","VD"]), source:"auto", createdAt:Date.now(), options:[], statements:[], short:"", explain:"", draft:false };
      if(sub==="Toán"){
        var g = Gen.math.filter(function(m){ return m.key.test(chapter); })[0] || Gen.mathFallback;
        var fn = g[type.toLowerCase()] || Gen.mathFallback[type.toLowerCase()];
        var d = fn();
        q.content = d.c; q.explain = d.e || "";
        if(type==="TN"){ var opts = d.o.map(String); var right = opts[d.ans];
          var mix = shuffle(opts); q.options = mix; q.answer = "ABCD"[mix.indexOf(right)]; }
        if(type==="TLN") q.short = d.ans;
        if(type==="DS") q.statements = d.st.map(function(s){ return { t:s[0], ok:s[1] }; });
      } else {
        q.draft = true;
        var tpl = pick(Gen.shells[type]).replace(/\{CH\}/g, chapter).replace(/\{SUB\}/g, sub).replace(/\{GR\}/g, grade);
        q.content = tpl;
        if(type==="TN"){ q.options = ["Phương án đúng — giáo viên bổ sung nội dung","Phương án nhiễu 1","Phương án nhiễu 2","Phương án nhiễu 3"]; q.answer="A"; }
        if(type==="DS") q.statements = [1,2,3,4].map(function(k){ return { t:"Nhận định "+k+" về "+chapter+" — giáo viên bổ sung", ok:k%2===1 }; });
        if(type==="TLN") q.short = "…";
        q.explain = "Câu hỏi do hệ thống tạo khung, cần giáo viên hoàn thiện nội dung trước khi dùng.";
      }
      out.push(q);
    }
    return out;
  },
  /* Sinh bằng AI (tuỳ chọn): dùng Google Gemini, khoá API do quản trị nhập */
  ai: function(sub, grade, chapter, count, log, done){
    var key = S.settings.aiKey;
    if(!key){ done(0); return; }
    var prompt = "Bạn là giáo viên "+sub+" ở Việt Nam. Soạn "+count+" câu hỏi cho khối "+grade
      + ", chủ đề \""+chapter+"\" theo sách Kết nối tri thức với cuộc sống, đúng định dạng thi tốt nghiệp THPT 2026. "
      + "Gồm cả ba dạng: [TN] trắc nghiệm 4 phương án, [DS] đúng/sai 4 ý, [TLN] trả lời ngắn. "
      + "Trả về đúng định dạng văn bản sau, các câu cách nhau một dòng trống, không thêm lời dẫn:\n"
      + "[TN] nội dung\nA. ...\nB. ...\nC. ...\nD. ...\nDA: B\nGT: giải thích ngắn\nMUC: NB\n\n"
      + "[DS] nội dung\na) ý | D\nb) ý | S\nc) ý | D\nd) ý | S\nGT: ...\n\n[TLN] nội dung\nDA: kết quả\nGT: ...";
    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+encodeURIComponent(key), {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ contents:[{ parts:[{ text: prompt }] }] })
    }).then(function(r){ return r.json(); }).then(function(j){
      var text = (((j.candidates||[])[0]||{}).content||{}).parts ? j.candidates[0].content.parts.map(function(p){return p.text||"";}).join("\n") : "";
      var qs = Bank.parse(text, { sub:sub, grade:grade, chapter:chapter });
      qs.forEach(function(q){ q.source="auto"; });
      S.questions = S.questions.concat(qs);
      log("AI đã tạo "+qs.length+" câu cho: "+chapter);
      done(qs.length);
    }).catch(function(e){ log("Lỗi gọi AI: "+e.message); done(0); });
  }
};

Views.gen = function(){
  return '<div class="page-head"><div><h1>Cập nhật câu hỏi tự động</h1>'
   + '<p>Bấm cập nhật để hệ thống sinh thêm câu hỏi mới cho các chương đã chọn. Môn Toán sinh câu tính toán có đáp án chính xác; các môn khác sinh khung câu hỏi để giáo viên hoàn thiện, hoặc nhờ AI soạn nếu đã nhập khoá API.</p></div></div>'
   + '<div class="card"><div class="row">'
   + '<div class="field"><label>Phạm vi môn</label><select id="gSub"><option value="">Tất cả các môn</option>'+optSubjects("")+'</select></div>'
   + '<div class="field"><label>Khối</label><select id="gGrade"><option value="">Cả ba khối</option>'+optGrades("")+'</select></div>'
   + '<div class="field"><label>Số câu mỗi dạng cho mỗi chương</label><input id="gN" type="number" value="2" min="1" max="10"></div>'
   + '<div class="field"><label>Nguồn sinh</label><select id="gMode"><option value="local">Bộ sinh có sẵn (không cần mạng)</option><option value="ai">Nhờ AI soạn (cần khoá API)</option></select></div>'
   + '</div><button class="btn amber" onclick="GenUI.run()">CẬP NHẬT CÂU HỎI</button> '
   + '<button class="btn ghost" onclick="GenUI.clearAuto()">Xoá các câu do máy sinh</button></div>'
   + '<div class="card"><h3>Nhật ký</h3><div class="log" id="genLog">Sẵn sàng.</div></div>';
};

var GenUI = {
  run: function(){
    var sub = $("gSub").value, gr = $("gGrade").value, n = +$("gN").value || 2, mode = $("gMode").value;
    var subs = sub ? [sub] : SUBJECTS, grades = gr ? [+gr] : GRADES;
    var box = $("genLog"); box.textContent = "Bắt đầu lúc " + new Date().toLocaleTimeString("vi-VN") + "\n";
    var log = function(t){ box.textContent += t + "\n"; box.scrollTop = box.scrollHeight; };
    if(mode==="ai" && !S.settings.aiKey){ log("Chưa có khoá API. Vào mục Người dùng & hệ thống để nhập."); return; }
    var total = 0, jobs = [];
    subs.forEach(function(sb){ grades.forEach(function(g){ ((CURRICULUM[sb]||{})[g]||[]).forEach(function(ch){ jobs.push([sb,g,ch]); }); }); });
    if(mode==="local"){
      jobs.forEach(function(j){
        ["TN","DS","TLN"].forEach(function(t){
          var made = Gen.make(j[0], j[1], j[2], t, n);
          S.questions = S.questions.concat(made); total += made.length;
        });
        log("+ " + j[0] + " " + j[1] + " — " + j[2]);
      });
      Store.save("questions");
      log("Xong. Đã thêm " + total + " câu hỏi. Tổng ngân hàng: " + S.questions.length + " câu.");
      toast("Đã cập nhật " + total + " câu hỏi");
    } else {
      var i = 0;
      var next = function(){
        if(i >= jobs.length){ Store.save("questions"); log("Xong. Tổng ngân hàng: " + S.questions.length + " câu."); return; }
        var j = jobs[i++];
        log("Đang nhờ AI soạn: " + j[0] + " " + j[1] + " — " + j[2]);
        Gen.ai(j[0], j[1], j[2], n*3, log, function(){ setTimeout(next, 1200); });
      };
      next();
    }
  },
  clearAuto: function(){
    if(!confirm("Xoá tất cả câu hỏi do máy sinh? Câu hỏi bạn tự nhập vẫn giữ nguyên.")) return;
    var before = S.questions.length;
    S.questions = S.questions.filter(function(q){ return q.source!=="auto"; });
    Store.save("questions"); toast("Đã xoá " + (before - S.questions.length) + " câu");
  }
};

/* ---------- 10. QUẢN TRỊ ---------- */
Views.admin = function(){
  return '<div class="page-head"><div><h1>Người dùng và hệ thống</h1><p>Cấp quyền, sao lưu dữ liệu và cấu hình kết nối.</p></div></div>'
   + '<div class="card"><h3>Quản trị viên</h3>'
   + '<div class="field"><label>Email quản trị (mỗi dòng một email)</label><textarea id="admList" style="min-height:70px">'+esc(S.settings.adminEmails.join("\n"))+'</textarea></div>'
   + '<div class="field"><label>Tên trường</label><input id="admSchool" value="'+esc(S.settings.school||"")+'"></div>'
   + '<div class="field"><label>Khoá API Google Gemini (tuỳ chọn — dùng cho chức năng nhờ AI soạn câu hỏi)</label><input id="admKey" value="'+esc(S.settings.aiKey||"")+'" placeholder="AIza..."></div>'
   + '<button class="btn" onclick="Adm.saveSettings()">Lưu cấu hình</button></div>'
   + '<div class="card"><h3>Người dùng ('+S.users.length+')</h3><div class="tablewrap"><table><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th></th></tr>'
   + S.users.map(function(u){ return '<tr><td>'+esc(u.name)+'</td><td>'+esc(u.email||"—")+'</td><td>'
     + '<select onchange="Adm.role(\''+u.id+'\',this.value)"><option value="student" '+(u.role==="student"?"selected":"")+'>Học sinh</option>'
     + '<option value="teacher" '+(u.role==="teacher"?"selected":"")+'>Giáo viên</option>'
     + '<option value="admin" '+(u.role==="admin"?"selected":"")+'>Quản trị</option></select></td>'
     + '<td><button class="btn sm danger" onclick="Adm.delUser(\''+u.id+'\')">Xoá</button></td></tr>'; }).join("")
   + '</table></div></div>'
   + '<div class="card"><h3>Sao lưu và phục hồi</h3>'
   + '<div class="row"><button class="btn ghost" onclick="Adm.export()">Tải file sao lưu (.json)</button>'
   + '<button class="btn ghost" onclick="document.getElementById(\'impFile\').click()">Phục hồi từ file</button>'
   + '<button class="btn danger" onclick="Adm.reset()">Xoá toàn bộ dữ liệu</button></div>'
   + '<input type="file" id="impFile" accept="application/json" class="hidden" onchange="Adm.import(this)">'
   + '<p class="muted" style="margin-top:8px">'+(CLOUD? "Đang đồng bộ với Firebase — dữ liệu dùng chung cho mọi máy."
      : "Đang chạy ngoại tuyến: dữ liệu chỉ nằm trên máy này. Muốn dùng chung nhiều máy, hãy điền FIREBASE_CONFIG trong file HTML.")+'</p></div>';
};
var Adm = {
  saveSettings: function(){
    S.settings.adminEmails = $("admList").value.split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean);
    S.settings.school = $("admSchool").value.trim();
    S.settings.aiKey = $("admKey").value.trim();
    Store.save("settings"); toast("Đã lưu cấu hình");
  },
  role: function(id, r){ var u = S.users.filter(function(x){ return x.id===id; })[0]; if(u){ u.role = r; Store.save("users"); toast("Đã đổi vai trò"); } },
  delUser: function(id){ S.users = S.users.filter(function(u){ return u.id!==id; }); Store.save("users"); Router.go("admin"); },
  export: function(){
    var data = {}; COLS.forEach(function(c){ data[c] = S[c]; });
    var blob = new Blob([JSON.stringify(data,null,1)], {type:"application/json"});
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "sao-luu-he-thong-day-hoc-" + new Date().toISOString().slice(0,10) + ".json"; a.click();
  },
  import: function(input){
    var f = input.files[0]; if(!f) return;
    var r = new FileReader();
    r.onload = function(){ try{ var d = JSON.parse(r.result);
      COLS.forEach(function(c){ if(d[c]) S[c] = d[c]; });
      Store.saveAll(); toast("Đã phục hồi dữ liệu"); Router.go("admin");
    }catch(e){ toast("File không hợp lệ."); } };
    r.readAsText(f);
  },
  reset: function(){
    if(!confirm("Xoá toàn bộ lớp, câu hỏi, đề, bài học và kết quả? Không khôi phục được.")) return;
    if(!confirm("Xác nhận lần nữa: xoá tất cả dữ liệu?")) return;
    S.users=[]; S.classes=[]; S.questions=[]; S.exams=[]; S.submissions=[]; S.lessons=[]; S.assignments=[]; S.progress=[];
    Store.saveAll(); toast("Đã xoá dữ liệu"); Router.go("admin");
  }
};

/* ---------- 11. HƯỚNG DẪN ---------- */
Views.guide = function(){
  return '<div class="page-head"><div><h1>Đưa hệ thống lên hosting miễn phí</h1>'
   + '<p>Toàn bộ hệ thống nằm trong một file HTML duy nhất. Chỉ cần tải file này lên bất kì hosting tĩnh nào là học sinh vào học được.</p></div></div>'
   + '<div class="card"><h3>Cách nhanh nhất — Netlify Drop (2 phút)</h3>'
   + '<div class="guide-step"><b>1.</b> Tạo một thư mục, đổi tên file thành <code>index.html</code>.</div>'
   + '<div class="guide-step"><b>2.</b> Mở <code>app.netlify.com/drop</code>, kéo thả thư mục vào trang.</div>'
   + '<div class="guide-step"><b>3.</b> Netlify trả về địa chỉ dạng <code>ten-cua-ban.netlify.app</code>. Gửi địa chỉ đó cho học sinh.</div>'
   + '<div class="guide-step"><b>4.</b> Đăng nhập tài khoản Netlify để giữ trang vĩnh viễn và đổi tên miền phụ theo ý muốn.</div></div>'
   + '<div class="card"><h3>Cách bền lâu — GitHub Pages</h3>'
   + '<div class="guide-step"><b>1.</b> Tạo tài khoản GitHub, bấm New repository, đặt tên ví dụ <code>day-hoc</code>, chọn Public.</div>'
   + '<div class="guide-step"><b>2.</b> Bấm Add file → Upload files, tải file <code>index.html</code> lên, bấm Commit.</div>'
   + '<div class="guide-step"><b>3.</b> Vào Settings → Pages, mục Source chọn nhánh <code>main</code>, thư mục <code>/root</code>, bấm Save.</div>'
   + '<div class="guide-step"><b>4.</b> Sau 1–2 phút trang chạy tại <code>https://taikhoan.github.io/day-hoc/</code>.</div>'
   + '<div class="guide-step"><b>5.</b> Muốn sửa nội dung: upload đè file mới, trang tự cập nhật.</div></div>'
   + '<div class="card"><h3>Bật đăng nhập Gmail nhanh nhất (không sửa file HTML)</h3><div class="guide-step"><b>1.</b> Vào <code>console.firebase.google.com</code> tạo project, bật <b>Authentication → Sign-in method → Google</b>, tạo <b>Firestore Database</b>.</div><div class="guide-step"><b>2.</b> Project settings → Your apps → chọn Web → sao chép khối <code>firebaseConfig</code>.</div><div class="guide-step"><b>3.</b> Trong app, đăng nhập quản trị → <b>Người dùng &amp; hệ thống → Dán cấu hình Firebase</b> → dán vào và bấm lưu. App tải về tệp <code>firebase-config.json</code>.</div><div class="guide-step"><b>4.</b> Tải tệp <code>firebase-config.json</code> lên hosting, cùng thư mục với <code>index.html</code>, rồi tải lại trang.</div><div class="guide-step"><b>5.</b> Authentication → Settings → Authorized domains: thêm tên miền hosting (ví dụ <code>luongkhanhtuongthptbtdong-arch.github.io</code>).</div><div class="guide-step"><b>6.</b> Giáo viên bấm <b>Đăng ký giáo viên bằng Gmail</b>, chọn môn; quản trị vào <b>Người dùng &amp; hệ thống</b> bấm <b>Duyệt</b>.</div></div><div class="card"><h3>Dùng chung dữ liệu cho nhiều máy — Firebase (miễn phí)</h3>'
   + '<p>Nếu không cấu hình bước này, mỗi máy giữ dữ liệu riêng và không đăng nhập Gmail được. Cấu hình xong thì giáo viên đăng nhập bằng Gmail, điểm và tiến độ của học sinh về chung một nơi.</p>'
   + '<div class="guide-step"><b>1.</b> Vào <code>console.firebase.google.com</code>, bấm Add project, đặt tên rồi tạo.</div>'
   + '<div class="guide-step"><b>2.</b> Build → Authentication → Sign-in method → bật <b>Google</b>.</div>'
   + '<div class="guide-step"><b>3.</b> Build → Firestore Database → Create database → chọn chế độ production, vùng asia-southeast1.</div>'
   + '<div class="guide-step"><b>4.</b> Project settings → mục Your apps → chọn biểu tượng Web → đăng kí app → sao chép khối <code>firebaseConfig</code>.</div>'
   + '<div class="guide-step"><b>5.</b> Mở file HTML bằng Notepad, dán các giá trị vào biến <code>FIREBASE_CONFIG</code> ở đầu phần script, và ghi Gmail của bạn vào <code>ADMIN_EMAILS</code>.</div>'
   + '<div class="guide-step"><b>6.</b> Authentication → Settings → Authorized domains: thêm tên miền hosting của bạn.</div>'
   + '<div class="guide-step"><b>7.</b> Firestore → Rules, dán quy tắc sau rồi Publish:</div>'
   + '<pre class="log">rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{db}/documents {\n    match /htpvdh/{doc} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n  }\n}</pre>'
   + '<p class="muted">Quy tắc trên cho phép mọi người đọc, chỉ tài khoản đã đăng nhập mới ghi. Đủ dùng trong phạm vi một trường; nếu cần chặt hơn hãy giới hạn theo danh sách email.</p></div>'
   + '<div class="card"><h3>Quy trình dạy học gợi ý</h3>'
   + '<ol class="help"><li>Tạo lớp, dán danh sách học sinh theo mẫu, gửi mã lớp cho học sinh.</li>'
   + '<li>Nhập đề theo mẫu hoặc bấm Cập nhật câu hỏi tự động để có ngân hàng ban đầu.</li>'
   + '<li>Bấm Tạo bài học tự động cho từng môn, sửa lại phần lý thuyết cho sát bài dạy.</li>'
   + '<li>Tạo đề kiểm tra, chọn cấu trúc chấm theo môn, đặt thời gian làm bài.</li>'
   + '<li>Vào Giao việc, chọn lớp và đặt giờ kết thúc.</li>'
   + '<li>Theo dõi điểm và phần trăm hoàn thành ở mục Kết quả và tiến độ.</li></ol></div>'
   + '<div class="card"><h3>Ngân hàng dùng chung và mẫu nhập</h3><ol class="help"><li>Quản trị vào <b>Cây chương trình</b> để sửa danh sách bài của từng chương và các dạng của từng môn (tối thiểu bảy dạng mỗi bài).</li><li>Vào <b>Sinh ngân hàng theo chương – bài – dạng</b>, chọn phạm vi rồi bấm SINH CÂU HỎI. Nên chạy từng môn cho nhẹ.</li><li>Giáo viên đăng ký tài khoản ở màn hình đăng nhập; quản trị duyệt trong mục Người dùng &amp; hệ thống. Sau khi duyệt, giáo viên dùng chung toàn bộ ngân hàng.</li><li>Giáo viên tải mẫu nhập câu hỏi (Word hoặc .txt) và mẫu danh sách lớp ngay trong trang Ngân hàng câu hỏi.</li><li>Công thức soạn bằng MathType: đặt <code>MathType → Preferences → Cut and Copy Preferences → LaTeX</code>, rồi copy từ Word dán vào phần mềm; hệ thống hiển thị công thức bằng MathJax.</li></ol></div><div class="card center"><p class="muted">HỆ THỐNG PHỤC VỤ DẠY HỌC · Tác giả Lương Khánh Tường · ĐT/Zalo: 0916780807</p></div>';
};

/* ============================================================
   PHẦN MỞ RỘNG
   - Cây chương trình: Chương → Bài → Dạng (ít nhất 7 dạng mỗi bài)
   - Quản trị bấm một nút sinh toàn bộ ngân hàng câu hỏi cho mọi môn
   - Giáo viên đăng ký tài khoản, quản trị duyệt, dùng chung ngân hàng
   - Mẫu nhập câu hỏi và danh sách lớp tải về được; công thức soạn bằng MathType
   ============================================================ */

/* --- Thư viện dạng bài theo môn (mỗi môn 8 dạng) --- */
var DANG_LIB = {
 "Toán":["Nhận dạng khái niệm, định nghĩa","Tính toán trực tiếp theo công thức","Xét tính đúng sai của khẳng định","Tìm điều kiện của tham số","Bài toán ngược, tìm dữ kiện","Đọc đồ thị, bảng biểu, hình vẽ","Vận dụng thực tiễn","Bài tập tổng hợp nhiều bước"],
 "Ngữ văn":["Nhận biết thể loại và phương thức biểu đạt","Xác định chi tiết, hình ảnh tiêu biểu","Phân tích tác dụng của biện pháp tu từ","Nêu chủ đề và thông điệp","So sánh, liên hệ giữa các văn bản","Viết đoạn nghị luận ngắn","Đọc hiểu ngữ liệu ngoài sách giáo khoa","Vận dụng vào đời sống"],
 "Tiếng Anh":["Phát âm và trọng âm","Từ vựng theo ngữ cảnh","Ngữ pháp trong câu","Viết lại câu, biến đổi câu","Đọc hiểu đoạn văn","Điền từ vào đoạn trống","Giao tiếp trong tình huống","Tìm lỗi sai"],
 "Vật lí":["Nhận biết đại lượng và đơn vị","Áp dụng công thức cơ bản","Đọc đồ thị và bảng số liệu","Bài tập định lượng nhiều bước","Xét tính đúng sai của phát biểu","Thí nghiệm và xử lí sai số","Ứng dụng kĩ thuật, đời sống","Bài toán tổng hợp"],
 "Hoá học":["Nhận biết chất và danh pháp","Viết, cân bằng phương trình hoá học","Tính theo phương trình hoá học","Bài tập hỗn hợp","Nhận biết và tách chất","Thí nghiệm, hiện tượng quan sát","Ứng dụng thực tiễn và môi trường","Xét tính đúng sai"],
 "Sinh học":["Nhận biết khái niệm, cấu trúc","Cơ chế và quá trình sinh học","Bài tập di truyền có tính toán","Đọc sơ đồ, bảng, đồ thị","Thí nghiệm và giải thích kết quả","Liên hệ thực tiễn và sức khoẻ","Xét tính đúng sai","Vận dụng cao, tổng hợp"],
 "Lịch sử":["Nhận biết sự kiện và mốc thời gian","Nhân vật lịch sử và vai trò","Nguyên nhân, diễn biến, kết quả","Ý nghĩa và bài học lịch sử","Khai thác tư liệu, lược đồ","So sánh các sự kiện, giai đoạn","Liên hệ với hiện tại","Xét tính đúng sai của nhận định"],
 "Địa lí":["Nhận biết đặc điểm tự nhiên, kinh tế","Sử dụng Atlat Địa lí Việt Nam","Nhận xét bảng số liệu","Chọn dạng biểu đồ thích hợp","Giải thích nguyên nhân","So sánh các vùng, khu vực","Liên hệ thực tiễn địa phương","Xét tính đúng sai"],
 "Giáo dục KT&PL":["Nhận biết khái niệm kinh tế và pháp luật","Xác định hành vi đúng hoặc sai","Xử lí tình huống pháp luật","Tính toán kinh tế đơn giản","Phân tích thông tin, số liệu","Quyền và nghĩa vụ của công dân","Liên hệ bản thân, gia đình","Xét tính đúng sai"],
 "Tin học":["Nhận biết khái niệm, thiết bị","Đọc hiểu đoạn chương trình","Viết lệnh, mô tả thuật toán","Tìm lỗi và sửa lỗi","Xác định kết quả đầu ra","An toàn và đạo đức số","Ứng dụng phần mềm thực tế","Xét tính đúng sai"],
 "Công nghệ":["Nhận biết khái niệm, dụng cụ","Đọc bản vẽ, sơ đồ kĩ thuật","Quy trình kĩ thuật","Tính toán kĩ thuật","Chẩn đoán hư hỏng và xử lí","An toàn lao động","Ứng dụng trong sản xuất, đời sống","Xét tính đúng sai"]
};
function dangOf(sub){ var d = (S.settings.dang||{})[sub]; return (d && d.length) ? d : (DANG_LIB[sub] || DANG_LIB["Toán"]); }
function treeKey(sub,gr,ch){ return sub+"|"+gr+"|"+ch; }
function baiOf(sub,gr,ch){
  var t = (S.settings.tree||{})[treeKey(sub,gr,ch)];
  if(t && t.length) return t;
  return ["Bài 1. "+ch+" — Khái niệm và tính chất cơ bản",
          "Bài 2. "+ch+" — Các dạng bài tập cơ bản",
          "Bài 3. "+ch+" — Vận dụng và thực hành"];
}
function optList(arr, sel){ return arr.map(function(x){ return '<option '+(x===sel?"selected":"")+'>'+esc(x)+'</option>'; }).join(""); }

/* --- Hiển thị công thức: MathType chép ra dạng LaTeX $...$ --- */
function mj(){ try{ if(window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise(); }catch(e){} }
(function(){
  var g = Router.go; Router.go = function(k){ g(k); setTimeout(mj,0); };
  var m = window.modal; window.modal = function(h){ var r = m(h); setTimeout(mj,0); return r; };
  var ds = Do.start; Do.start = function(id){ ds(id); setTimeout(mj,0); };
  var dl = Do.learn; Do.learn = function(id){ dl(id); setTimeout(mj,0); };
})();

/* --- Menu bổ sung --- */
MENU.admin = [
  ["Điều hành", [["home","Bảng điều khiển"],["classes","Lớp học"],["bank","Ngân hàng câu hỏi"],["exams","Đề kiểm tra"],["lessons","Bài học"],["assign","Giao việc"],["reports","Kết quả & tiến độ"]]],
  ["Quản trị", [["gen","Sinh ngân hàng theo chương – bài – dạng"],["tree","Cây chương trình"],["admin","Người dùng & hệ thống"],["guide","Hướng dẫn đưa lên hosting"]]]
];
MENU.teacher = [
  ["Dạy học", [["home","Bảng điều khiển"],["classes","Lớp học"],["bank","Ngân hàng câu hỏi"],["exams","Đề kiểm tra"],["lessons","Bài học"],["assign","Giao việc"],["reports","Kết quả & tiến độ"]]],
  ["Khác", [["guide","Hướng dẫn sử dụng"]]]
];

/* ============================================================
   A. SINH NGÂN HÀNG THEO CÂY CHƯƠNG – BÀI – DẠNG
   ============================================================ */
Gen.shells2 = {
  TN: ['Ở dạng “{D}” của {B}, phương án nào sau đây đúng?',
       'Khi luyện dạng “{D}” trong {B}, kết luận nào sau đây chính xác?',
       'Ý nào dưới đây không phù hợp với dạng “{D}” của {B}?'],
  DS: ['Đọc thông tin về {B} (dạng “{D}”) và cho biết các nhận định sau đúng hay sai:'],
  TLN:['Với dạng “{D}” trong {B}, hãy nêu ngắn gọn kết quả hoặc từ khoá cần điền.']
};
Gen.makeInTree = function(sub, grade, chapter, bai, dang, type, n){
  var out = Gen.make(sub, grade, chapter, type, n);
  out.forEach(function(q){
    q.lesson = bai; q.dang = dang;
    if(sub !== "Toán"){
      q.content = pick(Gen.shells2[type]).replace(/\{D\}/g, dang).replace(/\{B\}/g, bai);
      q.draft = true;
    }
  });
  return out;
};

Views.gen = function(){
  var sub = BankF.sub, gr = BankF.grade;
  return '<div class="page-head"><div><h1>Sinh ngân hàng theo chương – bài – dạng</h1>'
   + '<p>Hệ thống duyệt toàn bộ cây chương trình: mỗi chương chia thành các bài, mỗi bài có ít nhất bảy dạng, mỗi dạng sinh câu hỏi cho cả ba dạng thức thi. Giáo viên đã được duyệt tài khoản dùng chung ngân hàng này.</p></div></div>'
   + '<div class="card"><div class="row">'
   + '<div class="field"><label>Môn</label><select id="gSub"><option value="">Tất cả các môn</option>'+optSubjects(sub)+'</select></div>'
   + '<div class="field"><label>Khối</label><select id="gGrade"><option value="">Cả ba khối</option>'+optGrades(gr)+'</select></div>'
   + '<div class="field"><label>Số câu mỗi dạng (cho mỗi dạng thức)</label><input id="gN" type="number" value="1" min="1" max="5"></div>'
   + '<div class="field"><label>Dạng thức sinh</label><select id="gTypes" multiple size="3">'
   + '<option value="TN" selected>Trắc nghiệm nhiều lựa chọn</option><option value="DS" selected>Đúng/Sai</option><option value="TLN" selected>Trả lời ngắn</option></select></div>'
   + '</div>'
   + '<div class="row"><button class="btn amber" onclick="GenTree.run()">SINH CÂU HỎI</button>'
   + '<button class="btn ghost" onclick="GenTree.estimate()">Ước tính số câu</button>'
   + '<button class="btn ghost" onclick="GenUI.clearAuto()">Xoá câu do máy sinh</button></div>'
   + '<p class="muted" style="margin-top:8px">Môn Toán sinh câu tính toán có đáp án chính xác. Các môn còn lại sinh khung câu hỏi theo đúng chương – bài – dạng, được đánh dấu <span class="pill amber">Bản nháp</span> để giáo viên hoàn thiện nội dung, hoặc nhờ AI soạn nếu đã nhập khoá API ở mục Người dùng & hệ thống.</p></div>'
   + '<div class="card"><h3>Nhật ký sinh câu hỏi</h3><div class="log" id="genLog">Chọn phạm vi rồi bấm SINH CÂU HỎI.</div>'
   + '<div class="bar" style="margin-top:10px"><i id="genBar" style="width:0%"></i></div></div>';
};

var GenTree = {
  jobs: function(){
    var sub = $("gSub").value, gr = $("gGrade").value;
    var subs = sub ? [sub] : SUBJECTS, grades = gr ? [+gr] : GRADES, jobs = [];
    subs.forEach(function(sb){ grades.forEach(function(g){
      ((CURRICULUM[sb]||{})[g]||[]).forEach(function(ch){
        baiOf(sb,g,ch).forEach(function(b){
          dangOf(sb).forEach(function(d){ jobs.push([sb,g,ch,b,d]); });
        });
      });
    }); });
    return jobs;
  },
  types: function(){ var t = Array.prototype.filter.call($("gTypes").options, function(o){ return o.selected; }).map(function(o){ return o.value; });
    return t.length? t : ["TN","DS","TLN"]; },
  estimate: function(){
    var n = +$("gN").value||1, jobs = GenTree.jobs(), t = GenTree.types().length;
    $("genLog").textContent = "Phạm vi hiện tại: " + jobs.length + " lượt (chương × bài × dạng)\n"
      + "Sẽ sinh khoảng " + (jobs.length*n*t).toLocaleString("vi-VN") + " câu hỏi.\n"
      + (jobs.length*n*t > 8000 ? "Số lượng rất lớn — nên sinh theo từng môn để trình duyệt nhẹ hơn." : "Mức này chạy tốt.");
  },
  run: function(){
    var n = +$("gN").value||1, types = GenTree.types(), jobs = GenTree.jobs();
    var est = jobs.length*n*types.length;
    if(est > 8000 && !confirm("Sẽ sinh khoảng "+est+" câu hỏi, có thể nặng cho trình duyệt. Vẫn tiếp tục?")) return;
    var box = $("genLog"), bar = $("genBar"), i = 0, total = 0;
    box.textContent = "Bắt đầu " + new Date().toLocaleTimeString("vi-VN") + "\n";
    var step = function(){
      var t0 = Date.now();
      while(i < jobs.length && Date.now()-t0 < 120){
        var j = jobs[i++];
        types.forEach(function(t){
          var made = Gen.makeInTree(j[0], j[1], j[2], j[3], j[4], t, n);
          S.questions = S.questions.concat(made); total += made.length;
        });
        if(i % 25 === 0 || i === jobs.length) box.textContent += j[0]+" "+j[1]+" · "+j[2]+" · "+j[3]+" · "+j[4]+"\n";
      }
      bar.style.width = Math.round(i/jobs.length*100) + "%";
      box.scrollTop = box.scrollHeight;
      if(i < jobs.length){ setTimeout(step, 0); }
      else {
        Store.save("questions");
        box.textContent += "\nHoàn tất: đã sinh " + total + " câu. Ngân hàng hiện có " + S.questions.length + " câu.\n";
        toast("Đã sinh " + total + " câu hỏi");
      }
    };
    setTimeout(step, 0);
  }
};

/* ============================================================
   B. CÂY CHƯƠNG TRÌNH (quản trị sửa bài và dạng)
   ============================================================ */
Views.tree = function(){
  var sub = BankF.sub, gr = BankF.grade;
  var chaps = (CURRICULUM[sub]||{})[gr] || [];
  return '<div class="page-head"><div><h1>Cây chương trình</h1>'
   + '<p>Sửa danh sách bài của từng chương và danh sách dạng của từng môn. Bộ sinh câu hỏi và ngân hàng đều bám theo cây này.</p></div></div>'
   + '<div class="card"><div class="row">'
   + '<div class="field"><label>Môn</label><select id="tSub" onchange="Tree.setF()">'+optSubjects(sub)+'</select></div>'
   + '<div class="field"><label>Khối</label><select id="tGrade" onchange="Tree.setF()">'+optGrades(gr)+'</select></div></div></div>'
   + '<div class="card"><h3>Các dạng của môn '+esc(sub)+' ('+dangOf(sub).length+' dạng)</h3>'
   + '<div class="field"><textarea id="tDang" style="min-height:150px">'+esc(dangOf(sub).join("\n"))+'</textarea></div>'
   + '<button class="btn" onclick="Tree.saveDang()">Lưu danh sách dạng</button> '
   + '<button class="btn ghost" onclick="Tree.resetDang()">Trả về mặc định</button>'
   + '<p class="muted">Mỗi dòng một dạng. Nên giữ tối thiểu bảy dạng cho mỗi bài.</p></div>'
   + chaps.map(function(ch,i){
      return '<div class="card"><h3>'+esc(ch)+'</h3>'
        + '<div class="field"><label>Danh sách bài (mỗi dòng một bài)</label>'
        + '<textarea id="tb'+i+'" style="min-height:90px">'+esc(baiOf(sub,gr,ch).join("\n"))+'</textarea></div>'
        + '<button class="btn sm" onclick="Tree.saveBai('+i+')">Lưu bài của chương này</button> '
        + '<span class="muted">'+ (baiOf(sub,gr,ch).length*dangOf(sub).length) +' cặp bài × dạng</span></div>'; }).join("");
};
var Tree = {
  setF: function(){ BankF.sub = $("tSub").value; BankF.grade = +$("tGrade").value; Router.go("tree"); },
  saveDang: function(){
    S.settings.dang = S.settings.dang || {};
    var arr = $("tDang").value.split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean);
    if(arr.length < 7 && !confirm("Danh sách chỉ có "+arr.length+" dạng, ít hơn bảy. Vẫn lưu?")) return;
    S.settings.dang[BankF.sub] = arr; Store.save("settings"); toast("Đã lưu danh sách dạng"); Router.go("tree");
  },
  resetDang: function(){ if(S.settings.dang) delete S.settings.dang[BankF.sub]; Store.save("settings"); Router.go("tree"); },
  saveBai: function(i){
    var ch = ((CURRICULUM[BankF.sub]||{})[BankF.grade]||[])[i];
    S.settings.tree = S.settings.tree || {};
    var arr = document.getElementById("tb"+i).value.split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean);
    S.settings.tree[treeKey(BankF.sub, BankF.grade, ch)] = arr;
    Store.save("settings"); toast("Đã lưu "+arr.length+" bài"); Router.go("tree");
  }
};

/* ============================================================
   C. NGÂN HÀNG: lọc theo chương – bài – dạng, mẫu tải về, nhập file
   ============================================================ */
BankF.bai = ""; BankF.dang = ""; BankF.draft = "";

Bank.filtered = function(){
  return S.questions.filter(function(q){
    return q.subject===BankF.sub && q.grade==BankF.grade
      && (!BankF.chapter || q.chapter===BankF.chapter)
      && (!BankF.bai || q.lesson===BankF.bai)
      && (!BankF.dang || q.dang===BankF.dang)
      && (!BankF.type || q.type===BankF.type)
      && (BankF.draft!=="1" || q.draft);
  });
};
Bank.setF = function(){
  BankF.sub = $("fSub").value; BankF.grade = +$("fGrade").value;
  BankF.chapter = $("fChap").value; BankF.type = $("fType").value;
  BankF.bai = $("fBai") ? $("fBai").value : ""; BankF.dang = $("fDang") ? $("fDang").value : "";
  BankF.draft = $("fDraft") ? $("fDraft").value : "";
  Router.go("bank");
};
Bank.onChapChange = function(){
  BankF.sub = $("fSub").value; BankF.grade = +$("fGrade").value; BankF.chapter = $("fChap").value; BankF.bai = "";
  Router.go("bank");
};
Bank.render = function(q){
  var body = "";
  if(q.type==="TN") body = (q.options||[]).map(function(o,i){
    var L = "ABCD"[i]; return '<div class="opt '+(q.answer===L?"right":"")+'"><b>'+L+'.</b> '+esc(o)+'</div>'; }).join("");
  if(q.type==="DS") body = (q.statements||[]).map(function(s,i){
    return '<div class="dsrow"><span class="st"><b>'+"abcd"[i]+')</b> '+esc(s.t)+'</span><span class="pill '+(s.ok?"ok":"rose")+'">'+(s.ok?"Đúng":"Sai")+'</span></div>'; }).join("");
  if(q.type==="TLN") body = '<div class="pill ok">Đáp án: '+esc(q.short)+'</div>';
  return '<div class="qitem"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">'
    + '<span class="pill">'+typeName(q.type)+'</span><span class="pill gray">'+levelName(q.level||"NB")+'</span>'
    + (q.lesson? '<span class="pill teal">'+esc(q.lesson)+'</span>':'<span class="pill teal">'+esc(q.chapter||"")+'</span>')
    + (q.dang? '<span class="pill">'+esc(q.dang)+'</span>':'')
    + (q.draft? '<span class="pill amber">Bản nháp</span>': (q.source==="auto"?'<span class="pill gray">Máy sinh</span>':''))
    + '<span style="flex:1"></span>'
    + (q.draft? '<button class="btn sm ghost" onclick="Bank.edit(\''+q.id+'\')">Hoàn thiện</button> ':'')
    + '<button class="btn sm danger" onclick="Bank.del(\''+q.id+'\')">Xoá</button></div>'
    + '<div>'+QC(q)+'</div>' + body
    + (q.explain? '<div class="muted" style="margin-top:6px"><b>Lời giải:</b> '+esc(q.explain)+'</div>':'') + '</div>';
};
Bank.edit = function(id){
  var q = qById(id);
  var h = '<h2>Hoàn thiện câu hỏi</h2><p class="muted">'+esc(q.subject)+' · Khối '+q.grade+' · '+esc(q.chapter)+(q.lesson? ' · '+esc(q.lesson):'')+(q.dang? ' · '+esc(q.dang):'')+'</p>'
    + '<div class="field"><label>Nội dung (công thức viết trong hai dấu $, ví dụ $x^2+1$)</label><textarea id="eqC" style="min-height:80px">'+QC(q)+'</textarea></div>';
  if(q.type==="TN") h += ["A","B","C","D"].map(function(L,i){ return '<div class="field"><label>Phương án '+L+'</label><input id="eqo'+i+'" value="'+esc((q.options||[])[i]||"")+'"></div>'; }).join("")
    + '<div class="field"><label>Đáp án</label><select id="eqA">'+["A","B","C","D"].map(function(L){ return '<option '+(q.answer===L?"selected":"")+'>'+L+'</option>'; }).join("")+'</select></div>';
  if(q.type==="DS") h += (q.statements||[]).map(function(s,i){ return '<div class="row"><div class="field" style="flex:3"><label>Ý '+"abcd"[i]+'</label><input id="eqs'+i+'" value="'+esc(s.t)+'"></div>'
    + '<div class="field"><label>Kết luận</label><select id="eqv'+i+'"><option value="D" '+(s.ok?"selected":"")+'>Đúng</option><option value="S" '+(!s.ok?"selected":"")+'>Sai</option></select></div></div>'; }).join("");
  if(q.type==="TLN") h += '<div class="field"><label>Đáp án ngắn</label><input id="eqS" value="'+esc(q.short||"")+'"></div>';
  h += '<div class="field"><label>Lời giải</label><textarea id="eqE" style="min-height:60px">'+esc(q.explain||"")+'</textarea></div>'
    + '<button class="btn" onclick="Bank.saveEdit(\''+id+'\',this)">Lưu và bỏ đánh dấu nháp</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>';
  modal(h);
};
Bank.saveEdit = function(id, el){
  var q = qById(id);
  q.content = document.getElementById("eqC").value.trim();
  if(q.type==="TN"){ q.options = [0,1,2,3].map(function(i){ return document.getElementById("eqo"+i).value.trim(); });
    q.answer = document.getElementById("eqA").value; }
  if(q.type==="DS") q.statements.forEach(function(s,i){ s.t = document.getElementById("eqs"+i).value.trim(); s.ok = document.getElementById("eqv"+i).value==="D"; });
  if(q.type==="TLN") q.short = document.getElementById("eqS").value.trim();
  q.explain = document.getElementById("eqE").value.trim();
  q.draft = false; Store.save("questions"); closeModal(el); toast("Đã lưu"); Router.go("bank");
};

Views.bank = function(){
  var qs = Bank.filtered();
  var chaps = (CURRICULUM[BankF.sub]||{})[BankF.grade] || [];
  var bais = BankF.chapter ? baiOf(BankF.sub, BankF.grade, BankF.chapter) : [];
  var nDraft = S.questions.filter(function(q){ return q.draft; }).length;
  return ''
  + '<div class="page-head"><div><h1>Ngân hàng câu hỏi</h1>'
  + '<p>Ngân hàng dùng chung: quản trị sinh sẵn theo chương – bài – dạng, giáo viên đã được duyệt tài khoản dùng ngay và nhập thêm đề của mình.</p></div>'
  + '<div><span class="pill">'+S.questions.length+' câu</span> '+(nDraft? '<span class="pill amber">'+nDraft+' bản nháp</span>':'')+'</div></div>'
  + '<div class="card"><div class="row">'
  + '<div class="field"><label>Môn</label><select id="fSub" onchange="Bank.onChapChange()">'+optSubjects(BankF.sub)+'</select></div>'
  + '<div class="field"><label>Khối</label><select id="fGrade" onchange="Bank.onChapChange()">'+optGrades(BankF.grade)+'</select></div>'
  + '<div class="field"><label>Chương</label><select id="fChap" onchange="Bank.onChapChange()"><option value="">Tất cả</option>'+optList(chaps, BankF.chapter)+'</select></div>'
  + '<div class="field"><label>Bài</label><select id="fBai" onchange="Bank.setF()"><option value="">Tất cả</option>'+optList(bais, BankF.bai)+'</select></div>'
  + '<div class="field"><label>Dạng</label><select id="fDang" onchange="Bank.setF()"><option value="">Tất cả</option>'+optList(dangOf(BankF.sub), BankF.dang)+'</select></div>'
  + '<div class="field"><label>Dạng thức</label><select id="fType" onchange="Bank.setF()">'
  + '<option value="">Tất cả</option><option value="TN" '+(BankF.type==="TN"?"selected":"")+'>Trắc nghiệm</option>'
  + '<option value="DS" '+(BankF.type==="DS"?"selected":"")+'>Đúng/Sai</option><option value="TLN" '+(BankF.type==="TLN"?"selected":"")+'>Trả lời ngắn</option></select></div>'
  + '<div class="field"><label>Trạng thái</label><select id="fDraft" onchange="Bank.setF()"><option value="">Tất cả</option><option value="1" '+(BankF.draft==="1"?"selected":"")+'>Chỉ bản nháp</option></select></div>'
  + '</div></div>'
  + '<div class="card"><h3>Nhập đề của giáo viên</h3>'
  + '<div class="row" style="margin-bottom:10px">'
  + '<button class="btn ghost" onclick="Tpl.word()">Tải mẫu nhập câu hỏi (Word)</button>'
  + '<button class="btn ghost" onclick="Tpl.txt()">Tải mẫu dạng văn bản (.txt)</button>'
  + '<button class="btn ghost" onclick="Tpl.classCsv()">Tải mẫu danh sách lớp (.csv)</button>'
  + '<button class="btn ghost" onclick="Tpl.mathtype()">Cách gõ công thức MathType</button></div>'
  + '<div class="field"><textarea id="impText" placeholder="Dán nội dung theo mẫu vào đây, hoặc chọn tệp .txt ở nút bên dưới"></textarea></div>'
  + '<div class="row"><button class="btn" onclick="Bank.importText()">Nhập vào ngân hàng</button>'
  + '<button class="btn ghost" onclick="document.getElementById(\'impFileQ\').click()">Chọn tệp .txt</button>'
  + '<button class="btn ghost" onclick="Bank.fillSample()">Dán ví dụ mẫu</button>'
  + '<button class="btn ghost" onclick="Bank.addManual()">Soạn thủ công một câu</button></div>'
  + '<input type="file" id="impFileQ" accept=".txt,.tex,text/plain" class="hidden" onchange="Tpl.readFile(this)">'
  + '<p class="muted" style="margin-top:8px">Câu hỏi nhập vào sẽ gắn đúng môn – khối – chương – bài – dạng đang chọn ở bộ lọc phía trên.</p></div>'
  + '<div class="card"><h3>'+qs.length+' câu hỏi phù hợp bộ lọc</h3>'
  + (qs.length? qs.slice(0,60).map(Bank.render).join("") : '<p class="muted">Chưa có câu hỏi phù hợp. Quản trị vào mục Sinh ngân hàng để tạo, hoặc nhập đề theo mẫu.</p>')
  + (qs.length>60? '<p class="muted">Hiển thị 60 câu đầu tiên.</p>':'') + '</div>';
};

Bank.importText = function(){
  var txt = $("impText").value;
  if(!txt.trim()){ toast("Chưa có nội dung để nhập."); return; }
  var chap = BankF.chapter || ((CURRICULUM[BankF.sub]||{})[BankF.grade]||["Chưa phân chương"])[0];
  var qs = Bank.parse(txt, { sub:BankF.sub, grade:BankF.grade, chapter:chap });
  if(!qs.length){ toast("Không đọc được câu hỏi nào — kiểm tra lại mẫu."); return; }
  qs.forEach(function(q){ q.lesson = BankF.bai || baiOf(BankF.sub,BankF.grade,chap)[0]; q.dang = BankF.dang || dangOf(BankF.sub)[0]; q.owner = ME.email; });
  S.questions = S.questions.concat(qs); Store.save("questions");
  toast("Đã nhập "+qs.length+" câu hỏi"); Router.go("bank");
};

/* --- Mẫu tải về --- */
var Tpl = {
  dl: function(name, content, mime){
    var blob = new Blob(["\ufeff"+content], {type:mime});
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  },
  txtBody: function(){
    return "MAU NHAP CAU HOI — HE THONG PHUC VU DAY HOC (Luong Khanh Tuong)\r\n"
     + "Huong dan: moi cau cach nhau MOT DONG TRONG. Cong thuc viet trong hai dau $ ... $\r\n"
     + "Neu soan bang MathType: vao MathType > Preferences > Cut and Copy Preferences > chon LaTeX,\r\n"
     + "sau do copy cong thuc tu Word va dan vao day, cong thuc se tu hien thi dung.\r\n"
     + "==================================================\r\n\r\n"
     + "[TN] Cho hàm số $y=x^{2}+3x$. Giá trị của $y'(1)$ bằng\r\nA. 3\r\nB. 5\r\nC. 4\r\nD. 2\r\nDA: B\r\nGT: $y'=2x+3$ nên $y'(1)=5$.\r\nMUC: NB\r\n\r\n"
     + "[DS] Cho hàm số $y=x^{3}-3x$. Xét tính đúng sai của các khẳng định sau:\r\na) Hàm số có hai điểm cực trị | D\r\nb) $y'=3x^{2}-3$ | D\r\nc) Hàm số đồng biến trên $\\mathbb{R}$ | S\r\nd) Đồ thị đi qua gốc toạ độ | D\r\nGT: Xét dấu $y'$.\r\n\r\n"
     + "[TLN] Tính $\\int_{0}^{3}2x\\,dx$.\r\nDA: 9\r\nGT: Nguyên hàm là $x^{2}$.\r\nMUC: TH\r\n";
  },
  txt: function(){ Tpl.dl("MAU-NHAP-CAU-HOI.txt", Tpl.txtBody(), "text/plain;charset=utf-8"); },
  word: function(){
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body style="font-family:Times New Roman;font-size:13pt">'
      + '<h2>MẪU NHẬP CÂU HỎI — HỆ THỐNG PHỤC VỤ DẠY HỌC</h2>'
      + '<p><i>Tác giả: Lương Khánh Tường — ĐT/Zalo: 0916780807</i></p>'
      + '<p><b>Quy tắc:</b> mỗi câu cách nhau một dòng trống. Mở đầu bằng <b>[TN]</b>, <b>[DS]</b> hoặc <b>[TLN]</b>. '
      + 'Dòng <b>DA:</b> ghi đáp án, <b>GT:</b> lời giải, <b>MUC:</b> mức độ (NB/TH/VD).</p>'
      + '<p><b>Công thức toán:</b> gõ bằng MathType như bình thường. Trước khi chép sang hệ thống, vào MathType → Preferences → '
      + 'Cut and Copy Preferences → chọn <b>MathType translator: LaTeX</b>. Khi đó copy công thức từ Word sẽ ra dạng <b>$...$</b> và hệ thống hiển thị đúng công thức.</p>'
      + '<p>Sau khi soạn xong, bôi đen toàn bộ nội dung mẫu bên dưới (đã thay bằng câu hỏi của thầy cô), copy và dán vào khung nhập đề trong phần mềm.</p><hr>'
      + '<pre style="font-family:Consolas,monospace;font-size:11pt">' + esc(Tpl.txtBody().replace(/\r\n/g,"\n")) + '</pre>'
      + '</body></html>';
    Tpl.dl("MAU-NHAP-CAU-HOI.doc", html, "application/msword");
  },
  classCsv: function(){
    var csv = "Ma hoc sinh;Ho va ten;Ngay sinh;Email\r\nHS001;Nguyễn Văn An;12/03/2008;an.nv@gmail.com\r\nHS002;Trần Thị Bình;05/09/2008;binh.tt@gmail.com\r\nHS003;Lê Minh Châu;21/11/2008;\r\n";
    Tpl.dl("MAU-DANH-SACH-LOP.csv", csv, "text/csv;charset=utf-8");
  },
  readFile: function(input){
    var f = input.files[0]; if(!f) return;
    var r = new FileReader();
    r.onload = function(){ $("impText").value = r.result; toast("Đã nạp nội dung tệp, kiểm tra rồi bấm Nhập."); };
    r.readAsText(f, "UTF-8");
  },
  mathtype: function(){
    modal('<h2>Gõ công thức bằng MathType</h2>'
     + '<ol class="help"><li>Soạn câu hỏi trong Word, công thức gõ bằng MathType như thường lệ.</li>'
     + '<li>Trong Word, mở <code>MathType → Preferences → Cut and Copy Preferences</code>.</li>'
     + '<li>Chọn <code>MathType translator</code>, chọn bản dịch <code>LaTeX 2.09 and later</code>, bỏ chọn mục thêm dấu ngoặc riêng nếu có.</li>'
     + '<li>Bôi đen nội dung trong Word, nhấn Ctrl+C, rồi dán vào khung nhập đề. Công thức sẽ thành dạng <code>$x^{2}+1$</code>.</li>'
     + '<li>Hệ thống hiển thị lại đúng công thức trên màn hình học sinh và trong bài kiểm tra.</li></ol>'
     + '<p class="muted">Lý do: trang web không đọc được đối tượng MathType nhúng trong file Word, nên cần chuyển công thức về dạng LaTeX trước khi chép sang.</p>'
     + '<p>Ví dụ hiển thị: $\\int_{0}^{3}2x\\,dx = 9$</p>'
     + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
  }
};

/* --- Bài học sinh theo bài học trong cây --- */
Les.autoBuild = function(){
  var sub = BankF.sub, gr = BankF.grade, chaps = (CURRICULUM[sub]||{})[gr] || [], made = 0, gen = 0;
  chaps.forEach(function(ch){
    baiOf(sub,gr,ch).forEach(function(b){
      if(S.lessons.some(function(l){ return l.subject===sub && l.grade==gr && l.title===b; })) return;
      var pool = S.questions.filter(function(q){ return q.subject===sub && q.grade==gr && q.chapter===ch && (!q.lesson || q.lesson===b); });
      var items = [];
      ["TN","DS","TLN"].forEach(function(t){
        var have = shuffle(pool.filter(function(q){ return q.type===t; })).slice(0,3);
        if(have.length < 2){
          var extra = Gen.makeInTree(sub, gr, ch, b, dangOf(sub)[0], t, 2-have.length);
          S.questions = S.questions.concat(extra); gen += extra.length; have = have.concat(extra);
        }
        items = items.concat(have.map(function(q){ return q.id; }));
      });
      S.lessons.push({ id:uid("ls"), subject:sub, grade:gr, chapter:ch, title:b, theory:Les.theory(sub, ch), items:items, createdAt:Date.now() });
      made++;
    });
  });
  Store.save("questions"); Store.save("lessons");
  toast("Đã tạo "+made+" bài học, sinh thêm "+gen+" câu hỏi"); Router.go("lessons");
};

/* ============================================================
   D. ĐĂNG KÝ TÀI KHOẢN GIÁO VIÊN & DUYỆT
   ============================================================ */
var Reg = {
  open: function(){
    modal('<h2>Đăng ký tài khoản giáo viên</h2>'
     + '<p class="muted">Tài khoản cần quản trị duyệt trước khi sử dụng. Sau khi duyệt, thầy cô dùng chung ngân hàng câu hỏi của hệ thống.</p>'
     + '<div class="field"><label>Họ và tên</label><input id="rgName"></div>'
     + '<div class="field"><label>Gmail dùng để đăng nhập</label><input id="rgMail" placeholder="ten@gmail.com"></div>'
     + '<div class="field"><label>Môn giảng dạy</label><select id="rgSub">'+optSubjects("Toán")+'</select></div>'
     + '<div class="field"><label>Trường</label><input id="rgSchool" value="'+esc(S.settings.school||"")+'"></div>'
     + '<button class="btn" onclick="Reg.send(this)">Gửi đăng ký</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
  },
  send: function(el){
    var name = document.getElementById("rgName").value.trim(), mail = document.getElementById("rgMail").value.trim();
    if(!name || !mail){ toast("Nhập họ tên và Gmail."); return; }
    if(S.users.some(function(u){ return norm(u.email)===norm(mail); })){ toast("Email này đã có tài khoản."); return; }
    S.users.push({ id:"tc_"+norm(mail), email:mail, name:name, role:"teacher", status:"pending",
      subject:document.getElementById("rgSub").value, school:document.getElementById("rgSchool").value.trim(), createdAt:Date.now() });
    Store.save("users"); closeModal(el);
    modal('<h2>Đã gửi đăng ký</h2><p>Hồ sơ của <b>'+esc(name)+'</b> đã được gửi tới quản trị. Khi được duyệt, thầy cô đăng nhập bằng chính Gmail này.</p>'
      + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
  }
};
(function(){
  var pane = document.getElementById("paneGV");
  if(pane) pane.insertAdjacentHTML("beforeend",
    '<div class="sep"></div><div class="center"><a href="javascript:void(0)" onclick="Reg.open()">Chưa có tài khoản? Đăng ký giáo viên</a></div>');
})();

/* Chặn tài khoản chưa duyệt */
(function(){
  var enter = Auth.enter;
  Auth.enter = function(user){
    var rec = S.users.filter(function(u){ return norm(u.email)===norm(user.email) && user.email; })[0];
    if(rec && rec.status==="pending" && roleOfEmail(user.email)!=="admin"){
      modal('<h2>Tài khoản đang chờ duyệt</h2><p>Quản trị chưa duyệt tài khoản <b>'+esc(user.email)+'</b>. Vui lòng liên hệ quản trị hệ thống.</p>'
        + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
      return;
    }
    if(rec && rec.status==="pending") rec.status = "active";
    enter(user);
  };
})();

/* Quản trị: duyệt tài khoản + cấu hình */
var Views_admin_old = Views.admin;
Views.admin = function(){
  var pend = S.users.filter(function(u){ return u.status==="pending"; });
  var base = Views_admin_old();
  var head = base.indexOf('</div></div>')+12;
  return base.slice(0, head) + '<div class="card"><h3>Tài khoản chờ duyệt ('+pend.length+')</h3>'
   + (pend.length ? '<div class="tablewrap"><table><tr><th>Họ tên</th><th>Gmail</th><th>Môn</th><th>Trường</th><th></th></tr>'
      + pend.map(function(u){ return '<tr><td>'+esc(u.name)+'</td><td>'+esc(u.email)+'</td><td>'+esc(u.subject||"")+'</td><td>'+esc(u.school||"")+'</td>'
        + '<td style="white-space:nowrap"><button class="btn sm" onclick="Adm.approve(\''+u.id+'\')">Duyệt</button> '
        + '<button class="btn sm danger" onclick="Adm.delUser(\''+u.id+'\')">Từ chối</button></td></tr>'; }).join("")
      + '</table></div>' : '<p class="muted">Không có đăng ký nào đang chờ.</p>')
   + '<div class="sep"></div><button class="btn ghost" onclick="Adm.addTeacher()">Tạo nhanh tài khoản giáo viên</button></div>'
   + base.slice(head);
};
Adm.approve = function(id){ var u = S.users.filter(function(x){ return x.id===id; })[0];
  if(u){ u.status = "active"; Store.save("users"); toast("Đã duyệt "+u.name); Router.go("admin"); } };
Adm.addTeacher = function(){
  modal('<h2>Tạo tài khoản giáo viên</h2>'
   + '<div class="field"><label>Họ và tên</label><input id="atName"></div>'
   + '<div class="field"><label>Gmail</label><input id="atMail"></div>'
   + '<div class="field"><label>Môn</label><select id="atSub">'+optSubjects("Toán")+'</select></div>'
   + '<button class="btn" onclick="Adm.saveTeacher(this)">Tạo và duyệt ngay</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
};
Adm.saveTeacher = function(el){
  var n = document.getElementById("atName").value.trim(), m = document.getElementById("atMail").value.trim();
  if(!n||!m){ toast("Nhập đủ họ tên và Gmail."); return; }
  S.users.push({ id:"tc_"+norm(m), email:m, name:n, role:"teacher", status:"active", subject:document.getElementById("atSub").value, createdAt:Date.now() });
  Store.save("users"); closeModal(el); toast("Đã tạo tài khoản"); Router.go("admin");
};


/* ============================================================
   PHẦN MỞ RỘNG 2
   - Mỗi bài học 6 dạng, mỗi dạng mặc định 10 câu khác nhau
   - Có dạng toán/vận dụng thực tiễn cho mọi môn, bám sách giáo khoa
     dùng thống nhất từ năm học 2026–2027
   - Nhập đề kèm công thức (LaTeX/MathType), hình ảnh, bảng số liệu
   ============================================================ */
var SGK_NOTE = "sách giáo khoa dùng thống nhất năm học 2026–2027";

/* --- 6 dạng cho mỗi môn, dạng cuối luôn là vận dụng thực tiễn --- */
DANG_LIB = {
 "Toán":["Nhận dạng khái niệm, định nghĩa","Tính toán trực tiếp theo công thức","Xét tính đúng sai của khẳng định","Đọc đồ thị, bảng biểu, hình vẽ","Bài tập tổng hợp nhiều bước","Toán thực tiễn và vận dụng"],
 "Ngữ văn":["Nhận biết thể loại, phương thức biểu đạt","Xác định chi tiết, hình ảnh tiêu biểu","Phân tích tác dụng của biện pháp tu từ","Nêu chủ đề và thông điệp","Đọc hiểu ngữ liệu ngoài sách giáo khoa","Vận dụng vào đời sống và viết ngắn"],
 "Tiếng Anh":["Phát âm và trọng âm","Từ vựng theo ngữ cảnh","Ngữ pháp trong câu","Viết lại câu, biến đổi câu","Đọc hiểu đoạn văn","Giao tiếp trong tình huống thực tế"],
 "Vật lí":["Nhận biết đại lượng và đơn vị","Áp dụng công thức cơ bản","Đọc đồ thị và bảng số liệu","Bài tập định lượng nhiều bước","Thí nghiệm và xử lí sai số","Ứng dụng kĩ thuật, đời sống"],
 "Hoá học":["Nhận biết chất và danh pháp","Viết, cân bằng phương trình hoá học","Tính theo phương trình hoá học","Bài tập hỗn hợp","Thí nghiệm và hiện tượng","Ứng dụng thực tiễn, môi trường"],
 "Sinh học":["Nhận biết khái niệm, cấu trúc","Cơ chế và quá trình sinh học","Bài tập di truyền có tính toán","Đọc sơ đồ, bảng, đồ thị","Thí nghiệm và giải thích kết quả","Liên hệ thực tiễn, sức khoẻ"],
 "Lịch sử":["Nhận biết sự kiện và mốc thời gian","Nhân vật lịch sử và vai trò","Nguyên nhân, diễn biến, kết quả","Ý nghĩa và bài học lịch sử","Khai thác tư liệu, lược đồ","Liên hệ hiện tại và thực tiễn"],
 "Địa lí":["Nhận biết đặc điểm tự nhiên, kinh tế","Sử dụng Atlat Địa lí Việt Nam","Nhận xét bảng số liệu","Chọn dạng biểu đồ thích hợp","Giải thích nguyên nhân","Liên hệ thực tiễn địa phương"],
 "Giáo dục KT&PL":["Nhận biết khái niệm kinh tế, pháp luật","Xác định hành vi đúng hoặc sai","Xử lí tình huống pháp luật","Tính toán kinh tế đơn giản","Phân tích thông tin, số liệu","Vận dụng vào đời sống, gia đình"],
 "Tin học":["Nhận biết khái niệm, thiết bị","Đọc hiểu đoạn chương trình","Viết lệnh, mô tả thuật toán","Tìm lỗi và sửa lỗi","Xác định kết quả đầu ra","Ứng dụng thực tế và an toàn số"],
 "Công nghệ":["Nhận biết khái niệm, dụng cụ","Đọc bản vẽ, sơ đồ kĩ thuật","Quy trình kĩ thuật","Tính toán kĩ thuật","Chẩn đoán hư hỏng và xử lí","Ứng dụng sản xuất, đời sống"]
};
function isPractical(dang){ return /thực tiễn|thực tế|đời sống|vận dụng|ứng dụng|liên hệ/i.test(dang||""); }

/* ============================================================
   A. BỘ SINH CÂU HỎI THỰC TIỄN (Toán: số liệu tính được, đáp án đúng)
   ============================================================ */
Gen.pr = {
  TN: [
    function(){ var A=rnd(20,90), r=rnd(4,9), n=rnd(2,4);
      var v = Math.round(A*Math.pow(1+r/100,n)*100)/100;
      return { c:"Bác An gửi tiết kiệm "+A+" triệu đồng với lãi suất "+r+"% một năm, lãi nhập gốc. Sau "+n+" năm bác nhận được số tiền gần nhất với",
        o:[v+" triệu đồng", (v+A/10).toFixed(2)+" triệu đồng", (A+A*r*n/100).toFixed(2)+" triệu đồng", (A*n).toFixed(2)+" triệu đồng"], ans:0,
        e:"Số tiền $T=A(1+r)^{n}="+A+"\\cdot(1+0{,}0"+r+")^{"+n+"}\\approx "+v+"$ triệu đồng." }; },
    function(){ var s=rnd(60,240), v=rnd(30,60);
      var t = Math.round(s/v*100)/100;
      return { c:"Một xe khách đi quãng đường "+s+" km với tốc độ trung bình "+v+" km/h. Thời gian đi hết quãng đường đó là",
        o:[t+" giờ", (t+1).toFixed(2)+" giờ", (s*v/100).toFixed(2)+" giờ", (t/2).toFixed(2)+" giờ"], ans:0,
        e:"$t=\\dfrac{s}{v}=\\dfrac{"+s+"}{"+v+"}\\approx "+t+"$ giờ." }; },
    function(){ var g=rnd(200,900)*1000, d=rnd(5,30);
      var v = Math.round(g*(1-d/100));
      return { c:"Một chiếc áo giá "+g.toLocaleString("vi-VN")+" đồng được giảm "+d+"%. Giá phải trả sau khi giảm là",
        o:[v.toLocaleString("vi-VN")+" đồng", (g-d*1000).toLocaleString("vi-VN")+" đồng", Math.round(g*d/100).toLocaleString("vi-VN")+" đồng", (g+v).toLocaleString("vi-VN")+" đồng"], ans:0,
        e:"Giá phải trả $="+g+"\\cdot(1-0{,}"+(d<10?"0"+d:d)+")="+v+"$ đồng." }; },
    function(){ var a=rnd(3,9), b=rnd(3,9), h=rnd(2,6);
      var V = a*b*h;
      return { c:"Một bể nước dạng hình hộp chữ nhật có đáy "+a+" m × "+b+" m và chiều cao "+h+" m. Thể tích của bể là",
        o:[V+" m³", (a*b)+" m³", (2*(a+b)*h)+" m³", (a+b+h)+" m³"], ans:0,
        e:"$V=a\\cdot b\\cdot h="+a+"\\cdot"+b+"\\cdot"+h+"="+V+"$ (m³)." }; },
    function(){ var n=rnd(5,9), base=rnd(4,8), arr=[];
      for(var i=0;i<n;i++) arr.push(base+rnd(0,4));
      var m = Math.round(arr.reduce(function(a,b){return a+b;},0)/n*100)/100;
      return { c:"Điểm kiểm tra của một nhóm học sinh lần lượt là "+arr.join("; ")+". Điểm trung bình của nhóm là",
        o:[String(m).replace(".",","), String(m+1).replace(".",","), String(Math.max.apply(null,arr)), String(Math.min.apply(null,arr))], ans:0,
        e:"Trung bình cộng $=\\dfrac{"+arr.join("+")+"}{"+n+"}\\approx "+m+"$." }; }
  ],
  TLN: [
    function(){ var A=rnd(10,60), r=rnd(5,9), n=rnd(2,3);
      var v = Math.round(A*Math.pow(1+r/100,n)*100)/100;
      return { c:"Gửi "+A+" triệu đồng, lãi kép "+r+"% một năm. Sau "+n+" năm nhận được bao nhiêu triệu đồng (làm tròn hai chữ số thập phân)?",
        ans:String(v).replace(".",","), e:"$T=A(1+r)^{n}$." }; },
    function(){ var d=rnd(2,9), t=rnd(2,8);
      return { c:"Một vòi chảy được "+d+" m³ nước mỗi giờ. Sau "+t+" giờ vòi chảy được bao nhiêu mét khối nước?", ans:String(d*t), e:"Lấy lưu lượng nhân thời gian." }; },
    function(){ var n=rnd(20,45), p=rnd(20,60);
      var v = Math.round(n*p/100);
      return { c:"Lớp có "+n+" học sinh, trong đó "+p+"% tham gia câu lạc bộ thể thao. Số học sinh tham gia là bao nhiêu?", ans:String(v), e:"$"+n+"\\cdot"+p+"\\%="+v+"$." }; },
    function(){ var s=rnd(90,300), t=rnd(2,5);
      return { c:"Một ô tô đi "+s+" km trong "+t+" giờ. Tốc độ trung bình của xe là bao nhiêu km/h (làm tròn hai chữ số)?",
        ans:String(Math.round(s/t*100)/100).replace(".",","), e:"$v=\\dfrac{s}{t}$." }; }
  ],
  DS: [
    function(){ var g=rnd(100,400)*1000, d=rnd(10,40); var v=Math.round(g*(1-d/100));
      return { c:"Một mặt hàng giá "+g.toLocaleString("vi-VN")+" đồng được giảm "+d+"%. Xét tính đúng sai của các khẳng định sau:",
        st:[["Số tiền được giảm là "+Math.round(g*d/100).toLocaleString("vi-VN")+" đồng", true],
            ["Giá sau khi giảm là "+v.toLocaleString("vi-VN")+" đồng", true],
            ["Giá sau khi giảm bằng "+(100-d)+"% giá ban đầu", true],
            ["Nếu giảm tiếp "+d+"% nữa thì tổng mức giảm là "+(2*d)+"% giá ban đầu", false]],
        e:"Hai lần giảm liên tiếp không cộng trực tiếp phần trăm." }; },
    function(){ var A=rnd(20,80), r=rnd(5,8);
      return { c:"Gửi tiết kiệm "+A+" triệu đồng, lãi kép "+r+"% một năm. Xét tính đúng sai:",
        st:[["Sau 1 năm nhận được "+(Math.round(A*(1+r/100)*100)/100)+" triệu đồng", true],
            ["Công thức tính là $T=A(1+r)^{n}$", true],
            ["Sau 2 năm tiền lãi gấp đôi tiền lãi năm đầu", false],
            ["Lãi suất càng cao thì số tiền nhận được càng lớn", true]],
        e:"Lãi kép năm sau tính trên cả gốc lẫn lãi nên không gấp đôi đúng bằng hai lần." }; }
  ]
};
/* Khung câu hỏi thực tiễn cho các môn ngoài Toán */
Gen.shellsPr = {
  TN: ['Trong một tình huống thực tế liên quan đến {B}, cách xử lí nào sau đây là phù hợp?',
       'Vận dụng kiến thức {B} vào đời sống, nhận định nào sau đây đúng?',
       'Một tình huống ở địa phương liên quan tới {B}: phương án nào sau đây hợp lí nhất?'],
  DS: ['Đọc tình huống thực tiễn gắn với {B} và cho biết các nhận định sau đúng hay sai:'],
  TLN:['Nêu ngắn gọn kết quả hoặc từ khoá em rút ra khi vận dụng {B} vào một tình huống thực tế.']
};

/* --- Sinh một lô câu hỏi cho một dạng, bảo đảm khác nhau --- */
Gen.one = function(sub, grade, chapter, bai, dang, type){
  var q;
  if(sub==="Toán" && isPractical(dang)){
    var fns = Gen.pr[type] || Gen.pr.TN, d = pick(fns)();
    q = { id:uid("q"), subject:sub, grade:grade, chapter:chapter, lesson:bai, dang:dang, type:type,
      level:"VD", source:"auto", practical:true, options:[], statements:[], short:"", explain:d.e||"",
      content:d.c, imgs:[], createdAt:Date.now() };
    if(type==="TN"){ var opts=d.o.map(String), right=opts[d.ans], mix=shuffle(opts);
      q.options = mix; q.answer = "ABCD"[mix.indexOf(right)]; }
    if(type==="TLN") q.short = d.ans;
    if(type==="DS") q.statements = (d.st||[]).map(function(s){ return { t:s[0], ok:s[1] }; });
    return q;
  }
  q = Gen.makeInTree(sub, grade, chapter, bai, dang, type, 1)[0];
  q.imgs = q.imgs || [];
  if(sub!=="Toán" && isPractical(dang)){
    q.practical = true;
    q.content = pick(Gen.shellsPr[type]).replace(/\{B\}/g, bai) + " (theo " + SGK_NOTE + ")";
  }
  return q;
};
Gen.batch = function(sub, grade, chapter, bai, dang, counts){
  var out = [], seen = {};
  Object.keys(counts).forEach(function(type){
    var need = counts[type], tries = 0;
    while(out.filter(function(q){ return q.type===type; }).length < need && tries < need*12){
      tries++;
      var q = Gen.one(sub, grade, chapter, bai, dang, type);
      var sig = type + "|" + q.content + "|" + (q.answer||q.short||"");
      if(seen[sig]) continue;
      seen[sig] = 1; out.push(q);
    }
    /* nếu khung câu hỏi trùng nhau, đánh số biến thể để đủ số lượng */
    var k = 1;
    while(out.filter(function(q){ return q.type===type; }).length < need){
      var q2 = Gen.one(sub, grade, chapter, bai, dang, type);
      q2.content = q2.content + " (biến thể " + (++k) + ")";
      out.push(q2);
    }
  });
  return out;
};
Gen.split = function(total, types){
  var w = { TN:0.6, DS:0.2, TLN:0.2 }, sum = 0, res = {};
  types.forEach(function(t){ sum += w[t]; });
  var left = total;
  types.forEach(function(t,i){
    var n = (i===types.length-1) ? left : Math.max(1, Math.round(total*w[t]/sum));
    if(n > left) n = left;
    res[t] = n; left -= n;
  });
  return res;
};

/* ============================================================
   B. MÀN HÌNH SINH NGÂN HÀNG (mặc định 10 câu mỗi dạng)
   ============================================================ */
Views.gen = function(){
  return '<div class="page-head"><div><h1>Sinh ngân hàng theo chương – bài – dạng</h1>'
   + '<p>Mỗi bài có 6 dạng, mỗi dạng mặc định 10 câu khác nhau, trong đó có dạng vận dụng thực tiễn. Nội dung bám '+SGK_NOTE+'. Giáo viên đã được duyệt dùng chung ngân hàng này.</p></div></div>'
   + '<div class="card"><div class="row">'
   + '<div class="field"><label>Môn</label><select id="gSub"><option value="">Tất cả các môn</option>'+optSubjects(BankF.sub)+'</select></div>'
   + '<div class="field"><label>Khối</label><select id="gGrade"><option value="">Cả ba khối</option>'+optGrades(BankF.grade)+'</select></div>'
   + '<div class="field"><label>Số câu mỗi dạng</label><input id="gN" type="number" value="10" min="1" max="30"></div>'
   + '<div class="field"><label>Dạng thức đưa vào (giữ Ctrl chọn nhiều)</label><select id="gTypes" multiple size="3">'
   + '<option value="TN" selected>Trắc nghiệm nhiều lựa chọn</option><option value="DS" selected>Đúng/Sai</option><option value="TLN" selected>Trả lời ngắn</option></select></div>'
   + '</div>'
   + '<div class="row"><button class="btn amber" onclick="GenTree.run()">SINH CÂU HỎI</button>'
   + '<button class="btn ghost" onclick="GenTree.estimate()">Ước tính số câu</button>'
   + '<button class="btn ghost" onclick="GenUI.clearAuto()">Xoá câu do máy sinh</button></div>'
   + '<p class="muted" style="margin-top:8px">Tỉ lệ trong 10 câu: 6 trắc nghiệm, 2 đúng/sai, 2 trả lời ngắn. Môn Toán sinh câu tính được, có cả bài toán thực tiễn (lãi suất, quãng đường, phần trăm, thể tích, thống kê). Các môn khác sinh khung theo đúng chương – bài – dạng, gắn nhãn <span class="pill amber">Bản nháp</span> để giáo viên hoàn thiện.</p></div>'
   + '<div class="card"><h3>Nhật ký sinh câu hỏi</h3><div class="log" id="genLog">Chọn phạm vi rồi bấm SINH CÂU HỎI.</div>'
   + '<div class="bar" style="margin-top:10px"><i id="genBar" style="width:0%"></i></div></div>';
};
GenTree.estimate = function(){
  var n = +$("gN").value||10, jobs = GenTree.jobs();
  var est = jobs.length*n;
  $("genLog").textContent = "Phạm vi: " + jobs.length + " lượt (chương × bài × dạng)\n"
    + "Sẽ sinh khoảng " + est.toLocaleString("vi-VN") + " câu hỏi.\n"
    + "Ước tính dung lượng lưu: khoảng " + Math.round(est*0.35) + " KB.\n"
    + (est > 6000 ? "Số lượng lớn — nên sinh lần lượt từng môn để trình duyệt nhẹ và không vượt bộ nhớ." : "Mức này chạy tốt.");
};
GenTree.run = function(){
  var n = +$("gN").value||10, types = GenTree.types(), jobs = GenTree.jobs();
  var est = jobs.length*n;
  if(est > 6000 && !confirm("Sẽ sinh khoảng "+est+" câu hỏi. Nên làm từng môn. Vẫn tiếp tục?")) return;
  var counts = Gen.split(n, types);
  var box = $("genLog"), bar = $("genBar"), i = 0, total = 0;
  box.textContent = "Bắt đầu " + new Date().toLocaleTimeString("vi-VN") + "\n"
    + "Mỗi dạng " + n + " câu (" + types.map(function(t){ return counts[t]+" "+t; }).join(", ") + ")\n";
  var step = function(){
    var t0 = Date.now();
    while(i < jobs.length && Date.now()-t0 < 120){
      var j = jobs[i++];
      var made = Gen.batch(j[0], j[1], j[2], j[3], j[4], counts);
      S.questions = S.questions.concat(made); total += made.length;
      if(i % 10 === 0 || i === jobs.length) box.textContent += j[0]+" "+j[1]+" · "+j[3]+" · "+j[4]+"\n";
    }
    bar.style.width = Math.round(i/jobs.length*100) + "%"; box.scrollTop = box.scrollHeight;
    if(i < jobs.length) setTimeout(step, 0);
    else { Store.save("questions");
      box.textContent += "\nHoàn tất: đã sinh " + total + " câu. Ngân hàng hiện có " + S.questions.length + " câu.\n";
      toast("Đã sinh " + total + " câu hỏi"); }
  };
  setTimeout(step, 0);
};

/* ============================================================
   C. HIỂN THỊ: công thức, hình ảnh, bảng số liệu
   ============================================================ */
function QC(q){
  var t = q && q.content ? String(q.content) : "";
  var lines = t.split(/\n/), html = "", tbl = [];
  var flush = function(){
    if(!tbl.length) return;
    html += '<div class="tablewrap"><table>' + tbl.map(function(r,ri){
      var cells = r.split("|").map(function(c){ return c.trim(); }).filter(function(c,idx,a){ return !(c==="" && (idx===0||idx===a.length-1)); });
      return '<tr>' + cells.map(function(c){ return (ri===0? '<th>':'<td>') + esc(c) + (ri===0? '</th>':'</td>'); }).join("") + '</tr>';
    }).join("") + '</table></div>';
    tbl = [];
  };
  lines.forEach(function(l){
    if(/^\s*\|.*\|\s*$/.test(l)) tbl.push(l.trim());
    else { flush(); html += esc(l) + "<br>"; }
  });
  flush();
  html = html.replace(/(<br>)+$/,"");
  (q.imgs||[]).forEach(function(src){
    html += '<div style="margin-top:8px"><img src="'+esc(src)+'" alt="hình minh hoạ" style="max-width:100%;border:1px solid var(--line);border-radius:10px"></div>';
  });
  return html;
}

/* ============================================================
   D. NHẬP ĐỀ: công thức, hình ảnh, bảng, số liệu
   ============================================================ */
Bank.parse = function(text, meta){
  var blocks = text.split(/\n\s*\n/), out = [];
  blocks.forEach(function(b){
    var lines = b.split(/\n/).map(function(l){ return l.replace(/\s+$/,""); }).filter(function(l){ return l.trim(); });
    if(!lines.length) return;
    var m = lines[0].trim().match(/^\[(TN|DS|TLN)\]\s*(.*)$/i);
    if(!m) return;
    var q = { id:uid("q"), subject:meta.sub, grade:meta.grade, chapter:meta.chapter, type:m[1].toUpperCase(),
      content:m[2], level:"NB", options:[], statements:[], short:"", explain:"", imgs:[], source:"manual", createdAt:Date.now() };
    lines.slice(1).forEach(function(raw){
      var l = raw.trim();
      var img = l.match(/^\[IMG\]\s*(.+)$/i);
      var o = l.match(/^([A-D])[.)]\s*(.+)$/);
      var s = l.match(/^([a-d])[.)]\s*(.+?)\s*\|\s*([DSĐdsđ])\s*$/);
      var da = l.match(/^DA\s*[:=]\s*(.+)$/i);
      var gt = l.match(/^GT\s*[:=]\s*(.+)$/i);
      var mu = l.match(/^MUC\s*[:=]\s*(.+)$/i);
      var dg = l.match(/^DANG\s*[:=]\s*(.+)$/i);
      var isTable = /^\|.*\|$/.test(l);
      if(img){ q.imgs.push(img[1].trim()); }
      else if(isTable){ q.content += "\n" + l; }
      else if(s){ q.statements.push({ t:s[2], ok:/[DĐdđ]/.test(s[3]) }); }
      else if(o){ q.options.push(o[2]); }
      else if(da){ if(q.type==="TN") q.answer = da[1].trim().toUpperCase().charAt(0); else q.short = da[1].trim(); }
      else if(gt){ q.explain = gt[1]; }
      else if(dg){ q.dang = dg[1].trim(); }
      else if(mu){ var v = mu[1].trim().toUpperCase().slice(0,2); q.level = v==="TH"?"TH": v==="VD"?"VD":"NB"; }
      else { q.content += (q.content? " ":"") + l; }
    });
    if(q.type==="TN" && q.options.length<2) return;
    if(q.type==="DS" && q.statements.length<2) return;
    if(q.type==="TLN" && !q.short) return;
    out.push(q);
  });
  return out;
};

/* Chèn ảnh: chọn tệp hoặc dán trực tiếp từ clipboard, ảnh được thu nhỏ về tối đa 900px */
var Img = {
  shrink: function(file, cb){
    var r = new FileReader();
    r.onload = function(){
      var im = new Image();
      im.onload = function(){
        var max = 900, w = im.width, h = im.height;
        if(w > max){ h = Math.round(h*max/w); w = max; }
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(im, 0, 0, w, h);
        cb(cv.toDataURL("image/jpeg", 0.82));
      };
      im.onerror = function(){ cb(r.result); };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  },
  insert: function(dataUrl){
    var ta = $("impText"); if(!ta) return;
    var kb = Math.round(dataUrl.length/1400);
    ta.value += (ta.value.endsWith("\n")||!ta.value? "" : "\n") + "[IMG] " + dataUrl + "\n";
    toast("Đã chèn ảnh (khoảng " + kb + " KB)");
  },
  pickFile: function(input){
    var f = input.files[0]; if(!f) return;
    Img.shrink(f, Img.insert); input.value = "";
  }
};
Views.after_bank = function(){
  var ta = $("impText"); if(!ta) return;
  ta.addEventListener("paste", function(ev){
    var items = (ev.clipboardData||{}).items || [];
    for(var i=0;i<items.length;i++){
      if(items[i].type && items[i].type.indexOf("image")===0){
        var f = items[i].getAsFile(); if(f){ ev.preventDefault(); Img.shrink(f, Img.insert); }
      }
    }
  });
};

/* Nút chèn ảnh trong khung nhập đề */
(function(){
  var oldBank = Views.bank;
  Views.bank = function(){
    return oldBank().replace('<button class="btn ghost" onclick="Bank.fillSample()">Dán ví dụ mẫu</button>',
      '<button class="btn ghost" onclick="document.getElementById(\'impImg\').click()">Chèn ảnh</button>'
      + '<input type="file" id="impImg" accept="image/*" class="hidden" onchange="Img.pickFile(this)">'
      + '<button class="btn ghost" onclick="Bank.fillSample()">Dán ví dụ mẫu</button>');
  };
})();

Bank.fillSample = function(){
  $("impText").value =
   "[TN] Cho hàm số $y=x^{2}+3x$. Giá trị của $y'(1)$ bằng\nA. 3\nB. 5\nC. 4\nD. 2\nDA: B\nGT: $y'=2x+3$ nên $y'(1)=5$.\nMUC: NB\nDANG: Tính toán trực tiếp theo công thức\n\n"
 + "[TN] Bảng dưới đây cho biết số học sinh đăng kí câu lạc bộ:\n| Câu lạc bộ | Số học sinh |\n| Bóng đá | 18 |\n| Cờ vua | 12 |\n| Tin học | 20 |\nSố học sinh đăng kí nhiều nhất thuộc câu lạc bộ nào?\nA. Bóng đá\nB. Cờ vua\nC. Tin học\nD. Không xác định\nDA: C\nMUC: TH\n\n"
 + "[DS] Một mặt hàng giá 250 000 đồng được giảm 20%. Xét tính đúng sai:\na) Số tiền được giảm là 50 000 đồng | D\nb) Giá sau khi giảm là 200 000 đồng | D\nc) Giá sau khi giảm bằng 70% giá ban đầu | S\nd) Giảm tiếp 20% nữa thì tổng mức giảm là 40% giá ban đầu | S\nGT: Hai lần giảm liên tiếp không cộng trực tiếp phần trăm.\n\n"
 + "[TLN] Tính $\\int_{0}^{3}2x\\,dx$.\nDA: 9\nGT: Nguyên hàm là $x^{2}$.\nMUC: TH";
};

/* Mẫu tải về: bổ sung hình ảnh, bảng số liệu, MathType */
Tpl.txtBody = function(){
  return "MAU NHAP CAU HOI — HE THONG PHUC VU DAY HOC (Luong Khanh Tuong — 0916780807)\r\n"
   + "Bam sat " + SGK_NOTE + ".\r\n"
   + "QUY TAC: moi cau cach nhau MOT DONG TRONG, mo dau bang [TN], [DS] hoac [TLN].\r\n"
   + "  DA:  dap an        GT: loi giai        MUC: NB/TH/VD        DANG: ten dang bai\r\n"
   + "CONG THUC: viet trong hai dau $ ... $ , vi du $x^{2}+3x$.\r\n"
   + "  Neu soan bang MathType: MathType > Preferences > Cut and Copy Preferences > chon LaTeX,\r\n"
   + "  sau do copy tu Word va dan vao khung nhap de — cong thuc se hien thi dung.\r\n"
   + "HINH ANH: them dong  [IMG] dia_chi_anh  (link https... hoac anh dan truc tiep tu clipboard).\r\n"
   + "BANG SO LIEU: moi dong bat dau va ket thuc bang dau |, dong dau tien la tieu de.\r\n"
   + "==========================================================\r\n\r\n"
   + "[TN] Cho hàm số $y=x^{2}+3x$. Giá trị của $y'(1)$ bằng\r\nA. 3\r\nB. 5\r\nC. 4\r\nD. 2\r\nDA: B\r\nGT: $y'=2x+3$.\r\nMUC: NB\r\nDANG: Tính toán trực tiếp theo công thức\r\n\r\n"
   + "[TN] Quan sát hình vẽ và bảng số liệu sau:\r\n[IMG] https://ten-mien-cua-ban/hinh1.png\r\n| Loại | Số lượng |\r\n| Bóng đá | 18 |\r\n| Cờ vua | 12 |\r\nCâu lạc bộ nào đông hơn?\r\nA. Bóng đá\r\nB. Cờ vua\r\nC. Bằng nhau\r\nD. Không xác định\r\nDA: A\r\nMUC: TH\r\n\r\n"
   + "[DS] Bác An gửi 50 triệu đồng, lãi kép 6% một năm. Xét tính đúng sai:\r\na) Sau 1 năm nhận 53 triệu đồng | D\r\nb) Công thức tính là $T=A(1+r)^{n}$ | D\r\nc) Sau 2 năm tiền lãi gấp đôi năm đầu | S\r\nd) Lãi suất càng cao tiền nhận càng lớn | D\r\nGT: Lãi kép tính trên cả gốc lẫn lãi.\r\nDANG: Toán thực tiễn và vận dụng\r\n\r\n"
   + "[TLN] Một ô tô đi 180 km trong 3 giờ. Tốc độ trung bình là bao nhiêu km/h?\r\nDA: 60\r\nGT: $v=\\dfrac{s}{t}$.\r\nMUC: TH\r\n";
};
Tpl.mathtype = function(){
  modal('<h2>Công thức, hình ảnh và bảng số liệu khi nhập đề</h2>'
   + '<h3>Công thức MathType</h3>'
   + '<ol class="help"><li>Soạn công thức trong Word bằng MathType như thường lệ.</li>'
   + '<li>Mở <code>MathType → Preferences → Cut and Copy Preferences</code>.</li>'
   + '<li>Chọn <code>MathType translator</code> và bản dịch <code>LaTeX 2.09 and later</code>.</li>'
   + '<li>Bôi đen nội dung trong Word, Ctrl+C rồi dán vào khung nhập đề: công thức thành <code>$x^{2}+1$</code>.</li></ol>'
   + '<p>Ví dụ hiển thị: $\\int_{0}^{3}2x\\,dx=9$ và $T=A(1+r)^{n}$.</p>'
   + '<h3>Hình ảnh</h3><ul class="help"><li>Bấm <b>Chèn ảnh</b> để chọn tệp, hoặc copy ảnh rồi Ctrl+V ngay trong khung nhập đề.</li>'
   + '<li>Ảnh được thu nhỏ còn tối đa 900px và chèn thành dòng <code>[IMG] ...</code> trong câu hỏi.</li>'
   + '<li>Nếu ảnh đã có trên mạng, chỉ cần ghi <code>[IMG] https://...</code>.</li></ul>'
   + '<h3>Bảng số liệu</h3><p>Mỗi dòng đặt giữa hai dấu <code>|</code>, dòng đầu là tiêu đề:</p>'
   + '<pre class="log">| Năm | Sản lượng |\n| 2024 | 12,5 |\n| 2025 | 14,1 |</pre>'
   + '<p class="muted">Số liệu, đơn vị, dấu phẩy thập phân giữ nguyên như khi gõ.</p>'
   + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
};


/* ============================================================
   PHẦN MỞ RỘNG 3 — CHẾ ĐỘ QUY MÔ LỚN (khoảng 2000 học sinh)
   Nguyên tắc tiết kiệm hạn mức miễn phí của Firebase:
   - Học liệu (câu hỏi, bài học) tải từ tệp tĩnh data.json trên hosting
     → không tốn lượt đọc Firestore.
   - Dữ liệu nhỏ (lớp, đề, giao việc, cấu hình) đọc một lần khi mở app.
   - Bài nộp và tiến độ ghi theo từng bản ghi riêng, không ghi cả mảng.
   ============================================================ */
var DATA_URL = "data.json";          /* tệp học liệu tĩnh đặt cạnh index.html */
function bigMode(){ return S.settings.big !== false; }

var Cloud = {
  small: ["settings","users","classes","exams","assignments"],
  shardId: function(sub,gr){ return "q_" + norm(sub).replace(/[^a-z0-9]+/g,"-") + "_" + gr; },
  loaded: {},
  _sent: {},
  getDoc: function(id){ return fdb.collection("htpvdh").doc(id).get(); },
  bootLoad: function(cb){
    var pending = Cloud.small.length;
    var done = function(){ if(--pending<=0) cb(); };
    Cloud.small.forEach(function(col){
      Cloud.getDoc(col).then(function(d){
        if(d.exists && d.data() && d.data().data!==undefined){ S[col] = d.data().data; }
        done();
      }).catch(done);
    });
    setTimeout(function(){ if(pending>0){ pending=0; cb(); } }, 6000);
  },
  /* Nạp học liệu tĩnh: 0 lượt đọc Firestore */
  loadBundle: function(cb){
    fetch(DATA_URL + "?v=" + Date.now(), {cache:"no-store"}).then(function(r){
      if(!r.ok) throw 0; return r.json();
    }).then(function(j){
      if(j.questions && j.questions.length) S.questions = j.questions;
      if(j.lessons && j.lessons.length) S.lessons = j.lessons;
      if(j.builtAt) S.settings.bundleAt = j.builtAt;
      cb(true);
    }).catch(function(){ cb(false); });
  },
  /* Nạp một mảnh ngân hàng theo môn – khối (dùng khi không có data.json) */
  ensureShard: function(sub, gr){
    return new Promise(function(res){
      if(!CLOUD || !fdb) return res(false);
      var id = Cloud.shardId(sub,gr);
      if(Cloud.loaded[id]) return res(true);
      Cloud.getDoc(id).then(function(d){
        Cloud.loaded[id] = true;
        if(d.exists && d.data() && d.data().data){
          var have = {}; S.questions.forEach(function(q){ have[q.id]=1; });
          d.data().data.forEach(function(q){ if(!have[q.id]) S.questions.push(q); });
        }
        res(true);
      }).catch(function(){ res(false); });
    });
  },
  saveShards: function(){
    if(!CLOUD || !fdb) return;
    var groups = {};
    S.questions.forEach(function(q){
      var id = Cloud.shardId(q.subject, q.grade);
      (groups[id] = groups[id] || []).push(q);
    });
    Object.keys(groups).forEach(function(id){
      var json = JSON.stringify(groups[id]);
      if(Cloud._sent["sh_"+id] === json) return;
      if(json.length > 950000){ toast("Mảnh "+id+" quá lớn, hãy dùng gói học liệu data.json."); return; }
      Cloud._sent["sh_"+id] = json;
      fdb.collection("htpvdh").doc(id).set({ data: groups[id] }).catch(function(e){ toast("Lỗi lưu ngân hàng: "+e.message); });
    });
  },
  /* Ghi từng bản ghi bài nộp / tiến độ */
  putRecords: function(col){
    if(!CLOUD || !fdb) return;
    var name = col==="submissions" ? "subs" : "prog";
    S[col].forEach(function(rec){
      var json = JSON.stringify(rec);
      if(Cloud._sent[rec.id] === json) return;
      Cloud._sent[rec.id] = json;
      fdb.collection(name).doc(rec.id).set(rec).catch(function(){});
    });
  },
  loadMine: function(){
    if(!CLOUD || !fdb || !ME) return;
    ["subs","prog"].forEach(function(name){
      fdb.collection(name).where("studentId","==",ME.id).get().then(function(sn){
        var col = name==="subs" ? "submissions" : "progress";
        sn.forEach(function(d){
          var r = d.data();
          if(!S[col].some(function(x){ return x.id===r.id; })) S[col].push(r);
          Cloud._sent[r.id] = JSON.stringify(r);
        });
        Store.saveLocal();
      }).catch(function(){});
    });
  },
  loadClass: function(classId, cb){
    if(!CLOUD || !fdb){ cb(); return; }
    var left = 2, done = function(){ if(--left<=0) cb(); };
    [["subs","submissions"],["prog","progress"]].forEach(function(p){
      fdb.collection(p[0]).where("classId","==",classId).get().then(function(sn){
        sn.forEach(function(d){ var r = d.data();
          var i = S[p[1]].findIndex(function(x){ return x.id===r.id; });
          if(i<0) S[p[1]].push(r); else S[p[1]][i] = r;
          Cloud._sent[r.id] = JSON.stringify(r);
        });
        done();
      }).catch(done);
    });
  }
};

/* --- Kết nối: đọc một lần, không dùng onSnapshot để tiết kiệm lượt đọc --- */
Store.connectCloud = function(cb){
  var afterBundle = function(){
    if(!FIREBASE_CONFIG.apiKey){ cb(false); return; }
    var load = function(src){ return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); };
    var base = "https://www.gstatic.com/firebasejs/10.12.2/";
    load(base+"firebase-app-compat.js")
      .then(function(){ return load(base+"firebase-auth-compat.js"); })
      .then(function(){ return load(base+"firebase-firestore-compat.js"); })
      .then(function(){
        fb = window.firebase; fb.initializeApp(FIREBASE_CONFIG);
        fauth = fb.auth(); fdb = fb.firestore(); CLOUD = true;
        Cloud.bootLoad(function(){ Store.saveLocal(); cb(true); });
      }).catch(function(){ cb(false); });
  };
  Cloud.loadBundle(function(){ afterBundle(); });
};

/* --- Lưu: mảnh ngân hàng + bản ghi riêng --- */
Store.saveLocal = function(){
  try{
    var d = {};
    COLS.forEach(function(c){ d[c] = S[c]; });
    if(bigMode() && S.settings.bundleAt){ d.questions = []; d.lessons = []; }   /* học liệu lấy từ data.json */
    localStorage.setItem(LS, JSON.stringify(d));
  }catch(e){
    try{ localStorage.setItem(LS, JSON.stringify({ settings:S.settings, classes:S.classes, exams:S.exams, assignments:S.assignments, users:S.users })); }
    catch(e2){ /* bỏ qua */ }
  }
};
Store.save = function(col){
  Store.saveLocal();
  if(!CLOUD || !fdb) return;
  if(col==="questions"){ Cloud.saveShards(); return; }
  if(col==="submissions" || col==="progress"){ Cloud.putRecords(col); return; }
  if(col==="lessons" && bigMode() && S.settings.bundleAt) return;               /* bài học nằm trong gói tĩnh */
  var payload = (col==="settings") ? {data:S.settings} : {data:S[col]};
  fdb.collection("htpvdh").doc(col).set(payload).catch(function(e){ toast("Không lưu được: "+e.message); });
};

/* --- Học sinh: không ghi tài khoản lên máy chủ, chỉ nạp bài của mình --- */
(function(){
  var enter = Auth.enter;
  Auth.enter = function(user){
    if(bigMode() && user.role==="student"){
      ME = user;
      sessionStorage.setItem("HTPVDH_me", JSON.stringify(ME));
      document.getElementById("gate").style.display = "none";
      document.getElementById("app").style.display = "block";
      $("who").innerHTML = esc(ME.name) + '<br><span class="pill teal">Học sinh</span>';
      Router.buildNav(); Cloud.loadMine(); Router.go("hsHome");
      setTimeout(function(){ if(Router.cur==="hsHome") Router.go("hsHome"); }, 1500);
      return;
    }
    enter(user);
  };
})();

/* --- Chỉ nạp mảnh ngân hàng cần dùng trước khi làm bài --- */
(function(){
  var start = Do.start;
  Do.start = function(examId){
    var e = examById(examId); if(!e) return;
    var need = S.questions.filter(function(q){ return q.subject===e.subject && q.grade==e.grade; }).length;
    if(need >= (e.cfg.tn.n+e.cfg.ds.n+e.cfg.tln.n) || !CLOUD){ start(examId); return; }
    toast("Đang tải câu hỏi…");
    Cloud.ensureShard(e.subject, e.grade).then(function(){ start(examId); });
  };
})();

/* --- Tiến độ: gộp ghi sau 4 giây để không đốt hạn mức --- */
(function(){
  var save = Do.saveProg, t = null, queue = [];
  Do.saveProg = function(lessonId, pr){
    var l = lessonById(lessonId);
    var total = (l.theory||[]).length + (l.items||[]).length;
    var n = Object.keys(pr.done).filter(function(k){ return pr.done[k]; }).length;
    pr.percent = total? Math.round(n/total*100) : 0; pr.updatedAt = Date.now();
    pr.classId = ME.classId; pr.studentId = ME.id;
    var idx = S.progress.findIndex(function(x){ return x.id===pr.id; });
    if(idx<0) S.progress.push(pr); else S.progress[idx] = pr;
    if($("lbar")){ $("lbar").style.width = pr.percent+"%"; $("lpct").textContent = pr.percent+"% hoàn thành"; }
    Store.saveLocal();
    clearTimeout(t);
    t = setTimeout(function(){ Store.save("progress"); }, 4000);
  };
  window.addEventListener("beforeunload", function(){ try{ Store.save("progress"); }catch(e){} });
})();

/* --- Giáo viên: nạp kết quả theo lớp khi mở báo cáo --- */
(function(){
  var draw = Rep.draw;
  Rep.draw = function(){
    var sel = $("rClass"); if(!sel) return;
    var id = sel.value;
    if(CLOUD && bigMode() && !Cloud.loaded["cls_"+id]){
      $("repBox").innerHTML = '<div class="card"><p class="muted">Đang tải kết quả của lớp…</p></div>';
      Cloud.loaded["cls_"+id] = true;
      Cloud.loadClass(id, function(){ draw(); });
      return;
    }
    draw();
  };
})();

/* --- Nút làm mới dữ liệu trên thanh trên cùng --- */
(function(){
  var top = document.querySelector(".top");
  if(top) top.insertAdjacentHTML("beforeend",
    '<button class="btn sm ghost" style="margin-left:8px" onclick="Refresh.now()">Làm mới</button>');
})();
var Refresh = { now: function(){
  if(!CLOUD){ toast("Đang chạy ngoại tuyến."); return; }
  Cloud.bootLoad(function(){
    Cloud.loaded = {}; Cloud.loadMine();
    Store.saveLocal(); toast("Đã cập nhật dữ liệu"); Router.go(Router.cur==="exam_do"?"hsHome":Router.cur);
  });
} };

/* ============================================================
   MÀN HÌNH TRIỂN KHAI & QUY MÔ (quản trị)
   ============================================================ */
MENU.admin[1][1].splice(2, 0, ["scale","Triển khai & quy mô"]);

Views.scale = function(){
  var qKB = Math.round(JSON.stringify(S.questions).length/1024);
  var lKB = Math.round(JSON.stringify(S.lessons).length/1024);
  var nStudents = S.classes.reduce(function(a,c){ return a+(c.students||[]).length; }, 0);
  return '<div class="page-head"><div><h1>Triển khai và quy mô</h1>'
   + '<p>Cấu hình để hệ thống chạy được cho hàng nghìn học sinh trên gói miễn phí.</p></div></div>'
   + '<div class="grid g3">'
   + '<div class="kpi"><b>'+S.questions.length+'</b><span>câu hỏi · '+qKB+' KB</span></div>'
   + '<div class="kpi"><b>'+S.lessons.length+'</b><span>bài học · '+lKB+' KB</span></div>'
   + '<div class="kpi"><b>'+nStudents+'</b><span>học sinh trong danh sách</span></div></div>'
   + '<div class="card" style="margin-top:14px"><h3>Bước 1 — Xuất gói học liệu tĩnh</h3>'
   + '<p>Toàn bộ câu hỏi và bài học được đóng thành tệp <code>data.json</code> đặt cạnh <code>index.html</code>. Học sinh tải tệp này qua CDN của hosting nên <b>không tốn lượt đọc cơ sở dữ liệu</b>. Mỗi lần sửa ngân hàng, xuất lại và tải đè tệp mới.</p>'
   + '<button class="btn" onclick="Scale.exportBundle()">Xuất data.json ('+(qKB+lKB)+' KB)</button> '
   + '<span class="muted">'+(S.settings.bundleAt? "Gói đang dùng: "+fmtDT(S.settings.bundleAt) : "Chưa nạp gói tĩnh nào")+'</span></div>'
   + '<div class="card"><h3>Bước 2 — Chế độ quy mô lớn</h3>'
   + '<div class="field"><label>Chế độ hoạt động</label><select id="scMode" onchange="Scale.setMode()">'
   + '<option value="1" '+(bigMode()?"selected":"")+'>Quy mô lớn — đọc một lần, ghi từng bản ghi (khuyên dùng từ 200 học sinh)</option>'
   + '<option value="0" '+(!bigMode()?"selected":"")+'>Quy mô nhỏ — đồng bộ tức thời cho vài chục người</option></select></div>'
   + '<p class="muted">Ở chế độ quy mô lớn, dữ liệu không tự cập nhật theo thời gian thực; bấm nút <b>Làm mới</b> ở thanh trên khi cần xem số liệu mới nhất.</p></div>'
   + '<div class="card"><h3>Bước 3 — Ước tính hạn mức miễn phí</h3>'
   + '<div class="row"><div class="field"><label>Số học sinh dùng mỗi ngày</label><input id="scN" type="number" value="'+(nStudents||2000)+'" oninput="Scale.calc()"></div>'
   + '<div class="field"><label>Số bài kiểm tra mỗi học sinh/ngày</label><input id="scE" type="number" value="1" oninput="Scale.calc()"></div>'
   + '<div class="field"><label>Số bài học mỗi học sinh/ngày</label><input id="scL" type="number" value="2" oninput="Scale.calc()"></div></div>'
   + '<div id="scOut" class="log">—</div></div>'
   + '<div class="card"><h3>Bước 4 — Quy tắc bảo mật Firestore cho quy mô lớn</h3>'
   + '<pre class="log">rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{db}/documents {\n    match /htpvdh/{doc} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n    match /subs/{id} {\n      allow read, create: if true;\n      allow update, delete: if request.auth != null;\n    }\n    match /prog/{id} {\n      allow read, create, update: if true;\n      allow delete: if request.auth != null;\n    }\n  }\n}</pre>'
   + '<p class="muted">Học sinh không đăng nhập Gmail vẫn nộp bài được nên hai bộ sưu tập <code>subs</code> và <code>prog</code> cho phép ghi công khai. Nếu bắt buộc học sinh đăng nhập Gmail, hãy đổi thành <code>if request.auth != null</code> cho cả hai.</p></div>';
};
var Scale = {
  exportBundle: function(){
    var bundle = { builtAt: Date.now(), school: S.settings.school||"", questions: S.questions, lessons: S.lessons };
    var blob = new Blob([JSON.stringify(bundle)], {type:"application/json"});
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "data.json"; a.click();
    toast("Đã xuất data.json — tải tệp này lên cùng thư mục với index.html");
  },
  setMode: function(){ S.settings.big = $("scMode").value==="1"; Store.save("settings"); toast("Đã đổi chế độ"); },
  calc: function(){
    var n = +$("scN").value||0, e = +$("scE").value||0, l = +$("scL").value||0;
    var readsBoot = n*5;                       /* 5 tài liệu nhỏ mỗi phiên */
    var readsMine = n*2;                       /* bài nộp + tiến độ của chính mình */
    var reads = readsBoot + readsMine;
    var writes = n*e + n*Math.min(l,3);        /* bài nộp + tiến độ đã gộp */
    var egressMB = Math.round(n*(JSON.stringify(S.questions).length/1048576)*0.35);
    $("scOut").textContent =
      "Ước tính mỗi ngày với " + n + " học sinh:\n"
      + "· Lượt đọc Firestore: khoảng " + reads.toLocaleString("vi-VN") + " / 50.000 miễn phí " + (reads>50000?"→ VƯỢT, cần giảm hoặc bật Blaze":"→ trong hạn mức") + "\n"
      + "· Lượt ghi Firestore: khoảng " + writes.toLocaleString("vi-VN") + " / 20.000 miễn phí " + (writes>20000?"→ VƯỢT, nên giảm số lần giao bài học mỗi ngày":"→ trong hạn mức") + "\n"
      + "· Băng thông hosting cho data.json: khoảng " + egressMB + " MB/ngày (bộ nhớ đệm trình duyệt sẽ giảm đáng kể)\n"
      + "· Dung lượng lưu: câu hỏi nằm ở tệp tĩnh, Firestore chỉ giữ bài nộp và tiến độ, khoảng "
      + Math.round(n*e*30*1.2/1024) + " MB sau một tháng / 1 GB miễn phí";
  }
};
Views.after_scale = function(){ if($("scOut")) Scale.calc(); };

/* --- Bổ sung hướng dẫn triển khai quy mô lớn --- */
(function(){
  var g = Views.guide;
  Views.guide = function(){
    return g() + '<div class="card"><h3>Triển khai cho khoảng 2000 học sinh</h3>'
     + '<div class="guide-step"><b>1.</b> Sinh xong ngân hàng, vào <b>Triển khai & quy mô</b> bấm <b>Xuất data.json</b>.</div>'
     + '<div class="guide-step"><b>2.</b> Tải hai tệp <code>index.html</code> và <code>data.json</code> lên cùng một thư mục trên hosting (Netlify, Cloudflare Pages, GitHub Pages hoặc Firebase Hosting).</div>'
     + '<div class="guide-step"><b>0.</b> Vào <b>Người dùng &amp; hệ thống</b> đổi <b>mật khẩu quản trị</b> trước khi đưa file lên mạng.</div><div class="guide-step"><b>3.</b> Bật <b>chế độ quy mô lớn</b>, dán bộ quy tắc Firestore ở mục Triển khai & quy mô.</div>'
     + '<div class="guide-step"><b>4.</b> Chia học sinh theo lớp, mỗi lớp một mã lớp; tránh cho cả trường vào thi cùng một khung giờ nếu dùng gói miễn phí.</div>'
     + '<div class="guide-step"><b>5.</b> Hằng tuần bấm <b>Xuất file sao lưu</b> trong mục Người dùng & hệ thống để giữ bản dự phòng.</div></div>';
  };
})();


/* ============================================================
   PHẦN MỞ RỘNG 4 — GÓI HỌC LIỆU TÁCH THEO MÔN
   data.json chỉ là mục lục nhỏ; mỗi môn – khối là một tệp riêng
   (data-toan-12.json …) nên mỗi học sinh chỉ tải phần mình học.
   ============================================================ */
function shardKey(sub, gr){ return sub + "|" + gr; }
function shardFile(sub, gr){
  var slug = String(sub).toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g,"a").replace(/[èéẹẻẽêềếệểễ]/g,"e")
    .replace(/[ìíịỉĩ]/g,"i").replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,"o")
    .replace(/[ùúụủũưừứựửữ]/g,"u").replace(/[ỳýỵỷỹ]/g,"y").replace(/đ/g,"d")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return "data-" + slug + "-" + gr + ".json";
}

Cloud.bundleIndex = null;
Cloud.bundleLoaded = {};
Cloud.loadBundle = function(cb){
  if(typeof fetch !== "function"){ cb(false); return; }
  fetch(DATA_URL, {cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
  .then(function(j){
    S.settings.bundleAt = j.builtAt || Date.now();
    if(j.shards){ Cloud.bundleIndex = j; cb(true); return; }      /* mục lục nhiều tệp */
    if(j.questions && j.questions.length) S.questions = j.questions;
    if(j.lessons && j.lessons.length) S.lessons = j.lessons;
    cb(true);
  }).catch(function(){ cb(false); });
};
Cloud.ensureBundle = function(sub, gr){
  return new Promise(function(res){
    if(typeof fetch !== "function") return res(false);
    var key = shardKey(sub, gr);
    if(!Cloud.bundleIndex || !Cloud.bundleIndex.shards || !Cloud.bundleIndex.shards[key]) return res(false);
    if(Cloud.bundleLoaded[key]) return res(true);
    var file = Cloud.bundleIndex.shards[key] + "?v=" + (Cloud.bundleIndex.builtAt||1);
    fetch(file).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){
      Cloud.bundleLoaded[key] = true;
      var haveQ = {}; S.questions.forEach(function(q){ haveQ[q.id]=1; });
      (j.questions||[]).forEach(function(q){ if(!haveQ[q.id]) S.questions.push(q); });
      var haveL = {}; S.lessons.forEach(function(l){ haveL[l.id]=1; });
      (j.lessons||[]).forEach(function(l){ if(!haveL[l.id]) S.lessons.push(l); });
      res(true);
    }).catch(function(){ res(false); });
  });
};
/* Nạp đúng phần cần dùng: ưu tiên tệp tĩnh, sau đó mới tới Firestore */
Cloud.need = function(sub, gr){
  return Cloud.ensureBundle(sub, gr).then(function(ok){ return ok ? true : Cloud.ensureShard(sub, gr); });
};

/* Học sinh: nạp học liệu của lớp mình ngay khi vào */
(function(){
  var enter = Auth.enter;
  Auth.enter = function(user){
    enter(user);
    if(ME && ME.role==="student" && ME.classId){
      var c = classById(ME.classId);
      if(c) Cloud.need(c.subject, c.grade).then(function(ok){ if(ok) Router.go(Router.cur||"hsHome"); });
    }
  };
})();
/* Trước khi làm bài kiểm tra, bảo đảm đã có câu hỏi của môn đó */
(function(){
  var start = Do.start;
  Do.start = function(examId){
    var e = examById(examId); if(!e) return;
    var have = S.questions.filter(function(q){ return q.subject===e.subject && q.grade==e.grade; }).length;
    if(have >= (e.cfg.tn.n+e.cfg.ds.n+e.cfg.tln.n)){ start(examId); return; }
    toast("Đang tải câu hỏi…");
    Cloud.need(e.subject, e.grade).then(function(){ start(examId); });
  };
})();
/* Trước khi học bài, bảo đảm đã có bài học và bài tập */
(function(){
  var learn = Do.learn;
  Do.learn = function(lessonId){
    if(lessonById(lessonId)){ learn(lessonId); return; }
    var c = classById(ME.classId);
    if(!c){ learn(lessonId); return; }
    toast("Đang tải bài học…");
    Cloud.need(c.subject, c.grade).then(function(){ learn(lessonId); });
  };
})();
/* Giáo viên xem ngân hàng: nạp mảnh theo bộ lọc đang chọn */
(function(){
  var after = Views.after_bank;
  Views.after_bank = function(){
    if(after) after();
    if(!Bank.filtered().length) Cloud.need(BankF.sub, BankF.grade).then(function(ok){ if(ok) Router.go("bank"); });
  };
})();

/* ============================================================
   XUẤT GÓI: một mục lục + mỗi môn/khối một tệp
   ============================================================ */
Scale.shards = function(){
  var g = {};
  S.questions.forEach(function(q){ var k = shardKey(q.subject, q.grade); (g[k] = g[k] || {questions:[],lessons:[]}).questions.push(q); });
  S.lessons.forEach(function(l){ var k = shardKey(l.subject, l.grade); (g[k] = g[k] || {questions:[],lessons:[]}).lessons.push(l); });
  return g;
};
Scale.exportBundle = function(){
  var g = Scale.shards(), idx = { builtAt: Date.now(), school: S.settings.school||"", shards:{} };
  Object.keys(g).forEach(function(k){ var p = k.split("|"); idx.shards[k] = shardFile(p[0], p[1]); });
  Tpl.dl("data.json", JSON.stringify(idx), "application/json");
  S.settings.bundleAt = idx.builtAt; Store.save("settings");
  toast("Đã xuất mục lục data.json — tiếp tục tải từng tệp môn bên dưới");
  Router.go("scale");
};
Scale.exportShard = function(key){
  var g = Scale.shards()[key]; if(!g) return;
  var p = key.split("|");
  Tpl.dl(shardFile(p[0], p[1]), JSON.stringify({ builtAt:Date.now(), subject:p[0], grade:+p[1], questions:g.questions, lessons:g.lessons }), "application/json");
};
Scale.exportAll = function(){
  var keys = Object.keys(Scale.shards()), i = 0;
  Scale.exportBundle();
  var next = function(){ if(i>=keys.length){ toast("Đã xuất xong "+keys.length+" tệp môn"); return; }
    Scale.exportShard(keys[i++]); setTimeout(next, 700); };
  setTimeout(next, 700);
};

var Views_scale_old = Views.scale;
Views.scale = function(){
  var g = Scale.shards(), keys = Object.keys(g).sort();
  var totalKB = Math.round(JSON.stringify(S.questions).length/1024);
  var maxKB = keys.length ? Math.max.apply(null, keys.map(function(k){ return Math.round(JSON.stringify(g[k]).length/1024); })) : 0;
  var tbl = '<div class="card"><h3>Các tệp học liệu theo môn ('+keys.length+' tệp)</h3>'
   + '<p class="muted">Mỗi học sinh chỉ tải mục lục nhỏ và tệp của môn mình học, khoảng '+maxKB+' KB, thay vì toàn bộ '+totalKB+' KB.</p>'
   + '<div class="row" style="margin-bottom:10px"><button class="btn" onclick="Scale.exportAll()">Tải tất cả tệp</button>'
   + '<button class="btn ghost" onclick="Scale.exportBundle()">Chỉ tải mục lục data.json</button></div>'
   + (keys.length? '<div class="tablewrap"><table><tr><th>Môn – khối</th><th>Tên tệp</th><th>Câu hỏi</th><th>Bài học</th><th>Dung lượng</th><th></th></tr>'
      + keys.map(function(k){ var p=k.split("|"), kb=Math.round(JSON.stringify(g[k]).length/1024);
        return '<tr><td>'+esc(p[0])+' · Khối '+p[1]+'</td><td><code>'+shardFile(p[0],p[1])+'</code></td><td>'+g[k].questions.length+'</td><td>'+g[k].lessons.length+'</td><td>'+kb+' KB</td>'
         + '<td><button class="btn sm ghost" onclick="Scale.exportShard(\''+k+'\')">Tải</button></td></tr>'; }).join("")
      + '</table></div>' : '<p class="muted">Chưa có học liệu để xuất.</p>')
   + '<p class="muted">Tải tất cả các tệp lên cùng thư mục với <code>index.html</code>. Trình duyệt có thể hỏi “cho phép tải nhiều tệp” — chọn Cho phép.</p></div>';
  return Views_scale_old().replace('<div class="card"><h3>Bước 2', tbl + '<div class="card"><h3>Bước 2');
};
Scale.calc = function(){
  var n = +$("scN").value||0, e = +$("scE").value||0, l = +$("scL").value||0;
  var g = Scale.shards(), keys = Object.keys(g);
  var avgKB = keys.length ? Math.round(keys.reduce(function(a,k){ return a + JSON.stringify(g[k]).length/1024; },0)/keys.length) : 0;
  var reads = n*5 + n*2, writes = n*e + n*Math.min(l,3);
  var egress = Math.round(n*avgKB/1024);
  $("scOut").textContent =
    "Ước tính mỗi ngày với " + n + " học sinh:\n"
    + "· Đọc Firestore: khoảng " + reads.toLocaleString("vi-VN") + " / 50.000 miễn phí " + (reads>50000?"→ VƯỢT":"→ trong hạn mức") + "\n"
    + "· Ghi Firestore: khoảng " + writes.toLocaleString("vi-VN") + " / 20.000 miễn phí " + (writes>20000?"→ VƯỢT, nên giãn lịch giao bài":"→ trong hạn mức") + "\n"
    + "· Băng thông học liệu: khoảng " + egress + " MB/ngày cho lần tải đầu (mỗi tệp môn ~" + avgKB + " KB, sau đó trình duyệt dùng bản đã lưu)\n"
    + "· Lưu trữ Firestore sau một tháng: khoảng " + Math.round(n*e*30*1.2/1024) + " MB / 1 GB miễn phí\n"
    + "· Gợi ý: Cloudflare Pages hoặc Netlify cho băng thông tĩnh, Firestore chỉ giữ bài nộp và tiến độ.";
};


/* ============================================================
   PHẦN MỞ RỘNG 5 — MẬT KHẨU QUẢN TRỊ
   Chỉ người biết mật khẩu mới vào được vai trò quản trị khi đăng
   nhập ngoại tuyến. Mật khẩu lưu dưới dạng mã băm, không lưu chữ gốc.
   ============================================================ */
var ADMIN_PASS_DEFAULT = "LKT@2026";   /* mật khẩu lần đầu — hãy đổi ngay sau khi vào */

function hashPass(pw){
  return new Promise(function(res){
    var salt = "HTPVDH|LKT|";
    if(window.crypto && crypto.subtle && crypto.subtle.digest){
      var data = new TextEncoder().encode(salt + pw);
      crypto.subtle.digest("SHA-256", data).then(function(buf){
        res(Array.prototype.map.call(new Uint8Array(buf), function(b){ return b.toString(16).padStart(2,"0"); }).join(""));
      }).catch(function(){ res(fnv(salt+pw)); });
    } else res(fnv(salt+pw));
  });
  function fnv(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return "f"+(h>>>0).toString(16); }
}
function usingDefaultPass(){ return !S.settings.adminHash; }

/* --- Ô nhập mật khẩu ở màn hình đăng nhập --- */
(function(){
  var pane = document.getElementById("paneGV");
  if(!pane) return;
  var row = pane.querySelector(".row");
  if(row) row.insertAdjacentHTML("beforebegin",
    '<div class="field"><label>Mật khẩu quản trị (chỉ cần khi vào vai trò quản trị)</label>'
    + '<input id="gvPass" type="password" placeholder="••••••••" autocomplete="current-password"></div>');
})();

/* --- Kiểm tra mật khẩu trước khi vào vai trò quản trị --- */
Auth.local = function(role){
  var email = ($("gvMail").value||"").trim();
  if(!email){ toast("Nhập email để ghi nhận người dùng."); return; }
  var wanted = roleOfEmail(email) || role;
  var go = function(r){
    if(r==="admin" && S.settings.adminEmails.indexOf(email)<0){ S.settings.adminEmails.push(email); Store.save("settings"); }
    Auth.enter({ id:"local_"+norm(email), email:email, name:email.split("@")[0], role:r });
  };
  if(wanted !== "admin"){ go(wanted); return; }
  var pw = ($("gvPass") ? $("gvPass").value : "") || "";
  if(!pw){ toast("Nhập mật khẩu quản trị."); return; }
  hashPass(pw).then(function(h){
    if(S.settings.adminHash){
      if(h !== S.settings.adminHash){ toast("Mật khẩu quản trị không đúng."); return; }
      go("admin");
    } else if(pw === ADMIN_PASS_DEFAULT){
      go("admin");
      setTimeout(function(){
        modal('<h2>Hãy đổi mật khẩu quản trị</h2>'
         + '<p>Hệ thống đang dùng mật khẩu mặc định. Đặt mật khẩu riêng ngay để không ai khác vào được quyền quản trị.</p>'
         + '<div class="field"><label>Mật khẩu mới</label><input id="npw1" type="password"></div>'
         + '<div class="field"><label>Nhập lại</label><input id="npw2" type="password"></div>'
         + '<button class="btn" onclick="Pass.save(this)">Đặt mật khẩu</button> '
         + '<button class="btn ghost" onclick="closeModal(this)">Để sau</button>');
      }, 600);
    } else toast("Mật khẩu quản trị không đúng.");
  });
};

/* --- Đổi mật khẩu --- */
var Pass = {
  save: function(el){
    var a = document.getElementById("npw1").value, b = document.getElementById("npw2").value;
    if(a.length < 6){ toast("Mật khẩu cần ít nhất 6 kí tự."); return; }
    if(a !== b){ toast("Hai ô mật khẩu chưa khớp."); return; }
    hashPass(a).then(function(h){
      S.settings.adminHash = h; S.settings.passAt = Date.now(); Store.save("settings");
      toast("Đã đặt mật khẩu quản trị mới"); if(el) closeModal(el);
      if(Router.cur==="admin") Router.go("admin");
    });
  },
  change: function(){
    modal('<h2>Đổi mật khẩu quản trị</h2>'
     + (S.settings.adminHash? '<div class="field"><label>Mật khẩu hiện tại</label><input id="opw" type="password"></div>' : '<p class="muted">Đang dùng mật khẩu mặc định.</p>')
     + '<div class="field"><label>Mật khẩu mới</label><input id="npw1" type="password"></div>'
     + '<div class="field"><label>Nhập lại mật khẩu mới</label><input id="npw2" type="password"></div>'
     + '<button class="btn" onclick="Pass.confirm(this)">Lưu mật khẩu</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
  },
  confirm: function(el){
    if(!S.settings.adminHash){ Pass.save(el); return; }
    var o = document.getElementById("opw").value;
    hashPass(o).then(function(h){
      if(h !== S.settings.adminHash){ toast("Mật khẩu hiện tại không đúng."); return; }
      Pass.save(el);
    });
  }
};

/* --- Thẻ quản lí mật khẩu trong mục Người dùng & hệ thống --- */
(function(){
  var old = Views.admin;
  Views.admin = function(){
    var card = '<div class="card"><h3>Mật khẩu quản trị</h3>'
      + (usingDefaultPass()
         ? '<p><span class="pill rose">Chưa đặt mật khẩu riêng</span> Hệ thống đang chấp nhận mật khẩu mặc định <code>'+esc(ADMIN_PASS_DEFAULT)+'</code>. Hãy đổi trước khi đưa lên hosting.</p>'
         : '<p><span class="pill ok">Đã đặt mật khẩu riêng</span> Cập nhật lần cuối: '+fmtDT(S.settings.passAt)+'.</p>')
      + '<button class="btn" onclick="Pass.change()">Đổi mật khẩu quản trị</button>'
      + '<p class="muted" style="margin-top:8px">Mật khẩu chỉ lưu dưới dạng mã băm SHA-256. Nếu quên, mở file <code>index.html</code> bằng Notepad, xoá dòng <code>adminHash</code> trong bản sao lưu hoặc xoá dữ liệu trình duyệt để quay về mật khẩu mặc định. Khi giáo viên đăng nhập bằng Gmail thì Google đã xác thực danh tính nên không cần mật khẩu này.</p></div>';
    var base = old();
    var i = base.indexOf('<div class="card"><h3>Tài khoản chờ duyệt');
    if(i < 0) return card + base;
    return base.slice(0, i) + card + base.slice(i);
  };
})();

/* --- Nhắc đổi mật khẩu ngay sau khi vào bằng Gmail quản trị --- */
(function(){
  var enter = Auth.enter;
  Auth.enter = function(u){
    enter(u);
    if(ME && ME.role==="admin" && usingDefaultPass()){
      setTimeout(function(){ toast("Chưa đặt mật khẩu quản trị riêng — vào Người dùng & hệ thống để đổi."); }, 1200);
    }
  };
})();


/* ============================================================
   PHẦN MỞ RỘNG 6
   1. Nạp cấu hình Firebase từ tệp firebase-config.json (không cần sửa HTML)
   2. Màn hình đăng nhập tách riêng: giáo viên · học sinh · quản trị (ẩn)
   3. Giáo viên đăng ký bằng Gmail, chỉ làm việc trên môn đã đăng ký
   4. Kho thư mục lưu đề của giáo viên (kiểu Azota, youngtest)
   5. Lưu ngân hàng câu hỏi bằng IndexedDB nên không bị mất khi nhiều dữ liệu
   ============================================================ */

/* ---------- 1. LƯU TRỮ LỚN BẰNG INDEXEDDB ---------- */
var IDB = {
  db:null, ready:false,
  open:function(cb){
    try{
      var r = indexedDB.open("HTPVDH", 1);
      r.onupgradeneeded = function(e){ e.target.result.createObjectStore("kv"); };
      r.onsuccess = function(){ IDB.db = r.result; IDB.ready = true; cb && cb(true); };
      r.onerror = function(){ cb && cb(false); };
    }catch(e){ cb && cb(false); }
  },
  put:function(k,v){ if(!IDB.db) return; try{ IDB.db.transaction("kv","readwrite").objectStore("kv").put(v,k); }catch(e){} },
  get:function(k,cb){ if(!IDB.db) return cb(null);
    try{ var q = IDB.db.transaction("kv","readonly").objectStore("kv").get(k);
      q.onsuccess = function(){ cb(q.result); }; q.onerror = function(){ cb(null); };
    }catch(e){ cb(null); } }
};
if(COLS.indexOf("folders")<0) COLS.push("folders");
if(!S.folders) S.folders = [];
if(Cloud.small.indexOf("folders")<0) Cloud.small.push("folders");

(function(){
  var t = null;
  Store.saveLocal = function(){
    try{
      var d = {};
      COLS.forEach(function(c){ if(c!=="questions" && c!=="lessons") d[c] = S[c]; });
      if(!IDB.ready){ d.questions = S.questions; d.lessons = S.lessons; }   /* dự phòng khi không có IndexedDB */
      localStorage.setItem(LS, JSON.stringify(d));
    }catch(e){}
    clearTimeout(t);
    t = setTimeout(function(){
      IDB.put("questions", S.questions);
      IDB.put("lessons", S.lessons);
    }, 600);
  };
})();
IDB.open(function(ok){
  if(!ok){ toast("Trình duyệt không hỗ trợ lưu dữ liệu lớn — hãy dùng Chrome hoặc Edge."); return; }
  IDB.get("questions", function(v){
    if(v && v.length && S.questions.length < v.length){ S.questions = v; if(ME) Router.go(Router.cur); }
  });
  IDB.get("lessons", function(v){
    if(v && v.length && S.lessons.length < v.length){ S.lessons = v; if(ME) Router.go(Router.cur); }
  });
});

/* ---------- 2. CẤU HÌNH FIREBASE TỪ TỆP RIÊNG ---------- */
(function(){
  var connect = Store.connectCloud;
  Store.connectCloud = function(cb){
    var go = function(){ connect(cb); };
    if(FIREBASE_CONFIG.apiKey){ go(); return; }
    if(typeof fetch !== "function"){ go(); return; }
    var local = null;
    try{ local = JSON.parse(localStorage.getItem("HTPVDH_fb")||"null"); }catch(e){}
    fetch("firebase-config.json", {cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(j){ Object.keys(j).forEach(function(k){ FIREBASE_CONFIG[k] = j[k]; }); go(); })
      .catch(function(){
        if(local && local.apiKey) Object.keys(local).forEach(function(k){ FIREBASE_CONFIG[k] = local[k]; });
        go();
      });
  };
})();

var FBSetup = {
  open: function(){
    modal('<h2>Kết nối Firebase để giáo viên đăng nhập bằng Gmail</h2>'
     + '<p class="muted">Dán khối <code>firebaseConfig</code> lấy từ Firebase Console (Project settings → Your apps → Web). Không cần sửa file HTML.</p>'
     + '<div class="field"><textarea id="fbTxt" style="min-height:150px" placeholder=\'{ "apiKey": "AIza...", "authDomain": "ten.firebaseapp.com", "projectId": "ten", "storageBucket": "ten.appspot.com", "messagingSenderId": "123", "appId": "1:123:web:abc" }\'></textarea></div>'
     + '<button class="btn" onclick="FBSetup.save(this)">Lưu và tải firebase-config.json</button> '
     + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>'
     + '<p class="muted" style="margin-top:10px">Sau khi tải, đặt tệp <code>firebase-config.json</code> cạnh <code>index.html</code> trên hosting rồi tải lại trang. Nhớ bật Authentication → Google và thêm tên miền hosting vào Authorized domains.</p>');
  },
  save: function(el){
    var raw = document.getElementById("fbTxt").value.trim();
    var m = raw.match(/\{[\s\S]*\}/); if(!m){ toast("Không đọc được cấu hình."); return; }
    var txt = m[0].replace(/([{,]\s*)([A-Za-z_]+)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,(\s*})/g, "$1");
    var cfg; try{ cfg = JSON.parse(txt); }catch(e){ toast("Cấu hình không hợp lệ — dán đúng khối firebaseConfig."); return; }
    if(!cfg.apiKey || !cfg.projectId){ toast("Thiếu apiKey hoặc projectId."); return; }
    localStorage.setItem("HTPVDH_fb", JSON.stringify(cfg));
    Tpl.dl("firebase-config.json", JSON.stringify(cfg, null, 1), "application/json");
    closeModal(el);
    modal('<h2>Đã lưu cấu hình</h2><p>Tệp <b>firebase-config.json</b> vừa tải về. Hãy tải nó lên hosting cùng thư mục với index.html, rồi tải lại trang để bật đăng nhập Gmail.</p>'
      + '<button class="btn" onclick="location.reload()">Tải lại trang ngay</button> <button class="btn ghost" onclick="closeModal(this)">Để sau</button>');
  }
};

/* ---------- 3. MÀN HÌNH ĐĂNG NHẬP MỚI ---------- */
(function(){
  var gv = document.getElementById("paneGV"), hs = document.getElementById("paneHS");
  if(!gv) return;
  document.getElementById("tabT").textContent = "Giáo viên";
  gv.innerHTML =
     '<button class="btn block" onclick="Auth.google()">Đăng nhập bằng Gmail</button>'
   + '<div class="center" style="margin-top:10px"><a href="javascript:void(0)" onclick="Reg.open()">Chưa có tài khoản? Đăng ký giáo viên bằng Gmail</a></div>'
   + '<div class="sep"></div>'
   + '<div id="gvOffline" class="hidden">'
   + '<p class="muted" style="font-size:.85rem">Hệ thống chưa kết nối máy chủ nên chưa dùng được Gmail. Có thể vào tạm chế độ ngoại tuyến, dữ liệu chỉ nằm trên máy này.</p>'
   + '<div class="field"><input id="gvMail" placeholder="email của thầy cô"></div>'
   + '<button class="btn ghost block" onclick="Auth.local(\'teacher\')">Vào chế độ ngoại tuyến</button></div>';
  var box = gv.closest(".gate-box");
  box.insertAdjacentHTML("beforeend",
     '<div id="paneAD" class="hidden" style="margin-top:14px;border-top:1px solid var(--line);padding-top:14px">'
   + '<div class="field"><label>Email quản trị</label><input id="adMail" placeholder="quantri@gmail.com"></div>'
   + '<div class="field"><label>Mật khẩu quản trị</label><input id="adPass" type="password"></div>'
   + '<button class="btn teal block" onclick="Auth.admin()">Vào trang quản trị</button></div>'
   + '<div class="center" style="margin-top:12px"><a href="javascript:void(0)" style="font-size:.8rem;color:var(--muted)" onclick="Gate.adminPane()">Quản trị hệ thống</a></div>');
  setTimeout(function(){
    if(!CLOUD){ var o = document.getElementById("gvOffline"); if(o) o.classList.remove("hidden"); }
  }, 2500);
  if(location.hash === "#admin") setTimeout(function(){ Gate.adminPane(); }, 300);
})();
Gate.adminPane = function(){
  var p = document.getElementById("paneAD"); if(!p) return;
  p.classList.toggle("hidden");
  if(!p.classList.contains("hidden")) document.getElementById("adMail").focus();
};
Auth.admin = function(){
  var mail = (document.getElementById("adMail").value||"").trim();
  var pw = document.getElementById("adPass").value||"";
  if(!mail || !pw){ toast("Nhập email và mật khẩu quản trị."); return; }
  hashPass(pw).then(function(h){
    var ok = S.settings.adminHash ? (h === S.settings.adminHash) : (pw === ADMIN_PASS_DEFAULT);
    if(!ok){ toast("Mật khẩu quản trị không đúng."); return; }
    if(S.settings.adminEmails.indexOf(mail) < 0){ S.settings.adminEmails.push(mail); Store.save("settings"); }
    Auth.enter({ id:"admin_"+norm(mail), email:mail, name:"Quản trị hệ thống", role:"admin" });
  });
};

/* Đăng ký giáo viên bằng Gmail: xác thực Google rồi gửi hồ sơ chờ duyệt */
Reg.open = function(){
  modal('<h2>Đăng ký tài khoản giáo viên</h2>'
   + '<p class="muted">Chọn môn giảng dạy rồi xác thực bằng Gmail. Quản trị duyệt xong là thầy cô dùng được ngân hàng câu hỏi của môn mình.</p>'
   + '<div class="field"><label>Họ và tên</label><input id="rgName"></div>'
   + '<div class="field"><label>Môn giảng dạy</label><select id="rgSub">'+SUBJECTS.map(function(s){ return '<option>'+esc(s)+'</option>'; }).join("")+'</select></div>'
   + '<div class="field"><label>Khối phụ trách</label><select id="rgGrade"><option value="0">Cả ba khối</option>'+GRADES.map(function(g){ return '<option>'+g+'</option>'; }).join("")+'</select></div>'
   + '<div class="field"><label>Trường</label><input id="rgSchool" value="'+esc(S.settings.school||"")+'"></div>'
   + '<button class="btn block" onclick="Reg.google()">Xác thực bằng Gmail và gửi đăng ký</button>'
   + '<div class="sep"></div><div class="field"><label>Nếu chưa kết nối máy chủ: nhập Gmail thủ công</label><input id="rgMail" placeholder="ten@gmail.com"></div>'
   + '<button class="btn ghost" onclick="Reg.send(this)">Gửi đăng ký</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
};
Reg.collect = function(){
  return { name:(document.getElementById("rgName").value||"").trim(),
    subject:document.getElementById("rgSub").value,
    grade:+document.getElementById("rgGrade").value||0,
    school:(document.getElementById("rgSchool").value||"").trim() };
};
Reg.store = function(info, mail, el){
  if(!info.name || !mail){ toast("Nhập họ tên và Gmail."); return; }
  var old = S.users.filter(function(u){ return norm(u.email)===norm(mail); })[0];
  if(old){ old.name = info.name; old.subject = info.subject; old.grade = info.grade; old.school = info.school; }
  else S.users.push({ id:"tc_"+norm(mail), email:mail, name:info.name, role:"teacher", status:"pending",
        subject:info.subject, grade:info.grade, school:info.school, createdAt:Date.now() });
  Store.save("users");
  if(el) closeModal(el);
  modal('<h2>Đã gửi đăng ký</h2><p>Hồ sơ của <b>'+esc(info.name)+'</b> — môn '+esc(info.subject)+' đã gửi tới quản trị. Khi được duyệt, thầy cô đăng nhập bằng chính Gmail <b>'+esc(mail)+'</b>.</p>'
   + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
};
Reg.google = function(){
  var info = Reg.collect();
  if(!info.name){ toast("Nhập họ và tên."); return; }
  if(!CLOUD || !fauth){ toast("Chưa kết nối máy chủ — nhập Gmail thủ công ở ô bên dưới."); return; }
  var pr = new fb.auth.GoogleAuthProvider();
  fauth.signInWithPopup(pr).then(function(r){
    fauth.signOut();
    Reg.store(info, r.user.email, document.querySelector(".modal .btn"));
  }).catch(function(e){ toast("Không xác thực được: "+e.message); });
};
Reg.send = function(el){ Reg.store(Reg.collect(), (document.getElementById("rgMail").value||"").trim(), el); };

/* Đăng nhập Gmail của giáo viên: phải có hồ sơ đã duyệt */
Auth.google = function(){
  if(!CLOUD || !fauth){
    modal('<h2>Chưa kết nối máy chủ</h2><p>Muốn đăng nhập bằng Gmail, hệ thống cần một dự án Firebase miễn phí. Quản trị vào mục <b>Kết nối Firebase</b> để dán cấu hình, hoặc đặt tệp <code>firebase-config.json</code> cạnh <code>index.html</code>.</p>'
     + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>'); return;
  }
  var pr = new fb.auth.GoogleAuthProvider();
  fauth.signInWithPopup(pr).then(function(r){
    var email = r.user.email, name = r.user.displayName || email;
    if(roleOfEmail(email)==="admin"){ Auth.enter({ id:r.user.uid, email:email, name:name, role:"admin" }); return; }
    var rec = S.users.filter(function(u){ return norm(u.email)===norm(email); })[0];
    var cls = S.classes.filter(function(c){ return (c.students||[]).some(function(s){ return norm(s.email)===norm(email); }); })[0];
    if(cls){
      var st = cls.students.filter(function(s){ return norm(s.email)===norm(email); })[0];
      Auth.enter({ id:"hs_"+cls.id+"_"+(st.code||norm(st.name)), email:email, name:st.name, role:"student", classId:cls.id });
      return;
    }
    if(!rec){
      fauth.signOut();
      modal('<h2>Chưa có tài khoản</h2><p>Gmail <b>'+esc(email)+'</b> chưa đăng ký. Hãy bấm “Đăng ký giáo viên bằng Gmail” ở màn hình đăng nhập.</p>'
       + '<button class="btn" onclick="closeModal(this);Reg.open()">Đăng ký ngay</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>'); return;
    }
    if(rec.status==="pending"){
      fauth.signOut();
      modal('<h2>Đang chờ duyệt</h2><p>Quản trị chưa duyệt tài khoản <b>'+esc(email)+'</b>.</p><button class="btn ghost" onclick="closeModal(this)">Đóng</button>'); return;
    }
    Auth.enter({ id:rec.id, email:email, name:rec.name||name, role:"teacher", subject:rec.subject, grade:rec.grade });
  }).catch(function(e){ toast("Đăng nhập thất bại: "+e.message); });
};

/* ---------- 4. GIÁO VIÊN CHỈ LÀM VIỆC TRÊN MÔN ĐÃ ĐĂNG KÝ ---------- */
function myRec(){ return ME ? (S.users.filter(function(u){ return u.id===ME.id || (ME.email && norm(u.email)===norm(ME.email)); })[0] || {}) : {}; }
function mySubject(){ var r = myRec(); return ME && ME.role==="teacher" ? (ME.subject || r.subject || "") : ""; }
function allowedSubjects(){ var s = mySubject(); return s ? [s] : SUBJECTS; }
optSubjects = function(sel){
  var list = allowedSubjects();
  if(list.length===1) sel = list[0];
  return list.map(function(s){ return '<option '+(s===sel?"selected":"")+'>'+esc(s)+'</option>'; }).join("");
};
(function(){
  var enter = Auth.enter;
  Auth.enter = function(u){
    enter(u);
    if(ME && ME.role==="teacher"){
      var s = mySubject();
      if(s){ BankF.sub = s; if(ME.grade) BankF.grade = ME.grade; }
      var extra = (ME.grade? " · Khối "+ME.grade : "");
      var who = document.getElementById("who");
      if(who && s) who.innerHTML = esc(ME.name)+'<br><span class="pill">'+esc(s)+extra+'</span>';
    }
  };
})();

/* ---------- 5. KHO THƯ MỤC LƯU ĐỀ CỦA GIÁO VIÊN ---------- */
MENU.teacher[0][1].splice(5, 0, ["folders","Kho đề của tôi"]);
MENU.admin[0][1].splice(5, 0, ["folders","Kho đề của tôi"]);

function myFolders(){ return S.folders.filter(function(f){ return ME.role==="admin" || f.owner===ME.email; }); }
function folderById(id){ return S.folders.filter(function(f){ return f.id===id; })[0]; }

Views.folders = function(){
  var fs = myFolders();
  return '<div class="page-head"><div><h1>Kho đề của tôi</h1>'
   + '<p>Tạo thư mục theo lớp, theo chủ đề hay theo đợt kiểm tra; đề và câu hỏi tự nhập sẽ nằm gọn trong thư mục để dùng lại về sau.</p></div></div>'
   + '<div class="card"><h3>Tạo thư mục</h3><div class="row">'
   + '<div class="field"><label>Tên thư mục</label><input id="fdName" placeholder="Kiểm tra giữa kì I – 12A1"></div>'
   + '<div class="field"><label>Môn</label><select id="fdSub">'+optSubjects(BankF.sub)+'</select></div>'
   + '<div class="field"><label>Khối</label><select id="fdGrade">'+optGrades(BankF.grade)+'</select></div>'
   + '<div class="field"><label>Ghi chú</label><input id="fdNote" placeholder="Đợt kiểm tra tháng 10"></div>'
   + '</div><button class="btn" onclick="Fold.create()">Tạo thư mục</button></div>'
   + (fs.length ? '<div class="grid g2">' + fs.map(function(f){
        var ex = S.exams.filter(function(e){ return e.folderId===f.id; }).length;
        var qs = S.questions.filter(function(q){ return q.folderId===f.id; }).length;
        return '<div class="card"><h3>'+esc(f.name)+'</h3>'
          + '<p class="muted">'+esc(f.subject)+' · Khối '+f.grade+(f.note? ' · '+esc(f.note):'')+'</p>'
          + '<p><span class="pill">'+ex+' đề</span> <span class="pill teal">'+qs+' câu hỏi</span></p>'
          + '<button class="btn sm" onclick="Fold.open(\''+f.id+'\')">Mở</button> '
          + '<button class="btn sm ghost" onclick="Fold.toBank(\''+f.id+'\')">Nhập câu hỏi vào đây</button> '
          + '<button class="btn sm ghost" onclick="Fold.toExam(\''+f.id+'\')">Tạo đề trong thư mục</button> '
          + '<button class="btn sm danger" onclick="Fold.del(\''+f.id+'\')">Xoá</button></div>'; }).join("") + '</div>'
     : '<div class="card"><p class="muted">Chưa có thư mục nào.</p></div>');
};
var Fold = {
  create: function(){
    var n = $("fdName").value.trim(); if(!n){ toast("Nhập tên thư mục."); return; }
    S.folders.push({ id:uid("fd"), name:n, subject:$("fdSub").value, grade:+$("fdGrade").value,
      note:$("fdNote").value.trim(), owner:ME.email, createdAt:Date.now() });
    Store.save("folders"); toast("Đã tạo thư mục"); Router.go("folders");
  },
  del: function(id){ if(!confirm("Xoá thư mục? Đề và câu hỏi bên trong vẫn giữ nguyên trong hệ thống.")) return;
    S.folders = S.folders.filter(function(f){ return f.id!==id; }); Store.save("folders"); Router.go("folders"); },
  open: function(id){
    var f = folderById(id);
    var ex = S.exams.filter(function(e){ return e.folderId===id; });
    var qs = S.questions.filter(function(q){ return q.folderId===id; });
    modal('<h2>'+esc(f.name)+'</h2><p class="muted">'+esc(f.subject)+' · Khối '+f.grade+'</p>'
     + '<h3>Đề trong thư mục ('+ex.length+')</h3>'
     + (ex.length? '<div class="tablewrap"><table><tr><th>Tên đề</th><th>Cấu trúc</th><th>Thời gian</th><th></th></tr>'
        + ex.map(function(e){ return '<tr><td>'+esc(e.title)+'</td><td>'+e.cfg.tn.n+' TN · '+e.cfg.ds.n+' Đ/S · '+e.cfg.tln.n+' TLN</td><td>'+e.duration+' phút</td>'
          + '<td><button class="btn sm ghost" onclick="closeModal(this);Exam.preview(\''+e.id+'\')">Xem</button></td></tr>'; }).join("")
        + '</table></div>' : '<p class="muted">Chưa có đề nào.</p>')
     + '<h3>Câu hỏi riêng của thư mục ('+qs.length+')</h3>'
     + (qs.length? qs.slice(0,20).map(Bank.render).join("") : '<p class="muted">Chưa có câu hỏi riêng. Bấm “Nhập câu hỏi vào đây” ở ngoài để thêm.</p>')
     + '<div class="sep"></div><button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
  },
  toBank: function(id){ var f = folderById(id); BankF.folder = id; BankF.sub = f.subject; BankF.grade = f.grade; Router.go("bank"); },
  toExam: function(id){ var f = folderById(id); S.settings.curFolder = id; BankF.sub = f.subject; BankF.grade = f.grade; Router.go("exams"); }
};

/* Ngân hàng: bộ lọc nguồn và gắn câu hỏi vào thư mục khi nhập */
(function(){
  var oldBank = Views.bank, oldImport = Bank.importText, oldFiltered = Bank.filtered;
  Views.bank = function(){
    var fs = myFolders();
    var sel = '<div class="card"><div class="row"><div class="field"><label>Nguồn câu hỏi</label>'
      + '<select id="fFolder" onchange="Bank.setFolder()"><option value="">Ngân hàng chung của hệ thống</option>'
      + fs.map(function(f){ return '<option value="'+f.id+'" '+(BankF.folder===f.id?"selected":"")+'>Thư mục: '+esc(f.name)+'</option>'; }).join("")
      + '</select></div><div class="field" style="display:flex;align-items:flex-end">'
      + '<button class="btn ghost block" onclick="Router.go(\'folders\')">Quản lí thư mục</button></div></div>'
      + '<p class="muted">Chọn một thư mục thì câu hỏi nhập vào sẽ được lưu riêng cho thư mục đó.</p></div>';
    return oldBank().replace('<div class="card"><h3>Nhập đề của giáo viên</h3>', sel + '<div class="card"><h3>Nhập đề của giáo viên</h3>');
  };
  Bank.setFolder = function(){ BankF.folder = $("fFolder").value; Router.go("bank"); };
  Bank.filtered = function(){
    return oldFiltered().filter(function(q){ return BankF.folder ? q.folderId===BankF.folder : !q.folderId || ME.role==="admin"; });
  };
  Bank.importText = function(){
    var before = S.questions.length;
    oldImport();
    if(BankF.folder) for(var i=before;i<S.questions.length;i++) S.questions[i].folderId = BankF.folder;
    if(S.questions.length!==before) Store.save("questions");
  };
})();

/* Đề kiểm tra: chọn thư mục lưu và lấy câu hỏi trong thư mục nếu có */
(function(){
  var oldView = Views.exams, oldCreate = Exam.create, oldPool = Exam.pool;
  Views.exams = function(){
    var fs = myFolders();
    var field = '<div class="field"><label>Lưu đề vào thư mục</label><select id="eFolder">'
      + '<option value="">Không dùng thư mục</option>'
      + fs.map(function(f){ return '<option value="'+f.id+'" '+(S.settings.curFolder===f.id?"selected":"")+'>'+esc(f.name)+'</option>'; }).join("")
      + '</select></div>'
      + '<div class="field"><label>Nguồn câu hỏi</label><select id="eSource">'
      + '<option value="all">Ngân hàng chung + thư mục</option><option value="folder">Chỉ câu hỏi trong thư mục</option>'
      + '<option value="bank">Chỉ ngân hàng chung</option></select></div>';
    return oldView().replace('<button class="btn" onclick="Exam.create()">Tạo đề</button>',
      '<div class="row">'+field+'</div><button class="btn" onclick="Exam.create()">Tạo đề</button>');
  };
  Exam.create = function(){
    var before = S.exams.length;
    oldCreate();
    if(S.exams.length>before){
      var e = S.exams[S.exams.length-1];
      e.folderId = $("eFolder") ? $("eFolder").value : "";
      e.source = $("eSource") ? $("eSource").value : "all";
      Store.save("exams");
    }
  };
  Exam.pool = function(e){
    var base = oldPool(e);
    if(e.source==="folder") return base.filter(function(q){ return q.folderId===e.folderId; });
    if(e.source==="bank") return base.filter(function(q){ return !q.folderId; });
    return base.filter(function(q){ return !q.folderId || q.folderId===e.folderId; });
  };
})();

/* Quản trị: nút kết nối Firebase trong mục Người dùng & hệ thống */
(function(){
  var old = Views.admin;
  Views.admin = function(){
    var card = '<div class="card"><h3>Kết nối máy chủ (Firebase)</h3>'
      + (CLOUD ? '<p><span class="pill ok">Đã kết nối</span> Giáo viên đăng nhập bằng Gmail được, dữ liệu dùng chung mọi máy.</p>'
               : '<p><span class="pill rose">Chưa kết nối</span> Khi chưa kết nối, đăng nhập Gmail không hoạt động và mỗi máy giữ dữ liệu riêng.</p>')
      + '<button class="btn" onclick="FBSetup.open()">Dán cấu hình Firebase</button></div>';
    return card + old();
  };
})();


/* ============================================================
   PHẦN MỞ RỘNG 7
   1. Mỗi chương 6 bài, mỗi bài 6 dạng, số câu mỗi dạng do quản trị chọn
   2. Câu hỏi có hình vẽ (đồ thị, biểu đồ, hình khối) và nội dung phong phú hơn
   3. Giáo viên tích chọn câu hỏi để ghép đề
   4. Rút đề theo ma trận do người dùng nhập, xuất ma trận + bản đặc tả
   5. Xuất đề Word chuẩn, có đáp án
   ============================================================ */

/* ---------- 1. SÁU BÀI MỖI CHƯƠNG ---------- */
var BAI_MAU = [
  "Bài 1. Khái niệm mở đầu",
  "Bài 2. Tính chất và công thức",
  "Bài 3. Kĩ năng tính toán cơ bản",
  "Bài 4. Bài tập vận dụng",
  "Bài 5. Đọc hình vẽ, đồ thị và bảng biểu",
  "Bài 6. Ôn tập và vận dụng thực tiễn"
];
baiOf = function(sub, gr, ch){
  var t = (S.settings.tree||{})[treeKey(sub,gr,ch)];
  if(t && t.length) return t;
  var n = S.settings.baiCount || 6;
  return BAI_MAU.slice(0, n).map(function(b){ return b + " — " + ch; });
};

/* ---------- 2. HÌNH VẼ SVG CHO CÂU HỎI ---------- */
function svgURI(inner, w, h){
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'
    + '<rect width="'+w+'" height="'+h+'" fill="#ffffff"/>' + inner + '</svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function polyTxt(a,b,c){
  var t = (a===1?"x^{2}":(a===-1?"-x^{2}":a+"x^{2}"));
  if(b) t += (b>0?"+":"-") + (Math.abs(b)===1?"x":Math.abs(b)+"x");
  if(c) t += (c>0?"+":"-") + Math.abs(c);
  return t;
}
var Fig = {
  parabola: function(a,b,c){
    var W=320,H=220,ox=160,oy=150,ux=26,uy=16, pts=[];
    for(var x=-4;x<=4;x+=0.2){ var y=a*x*x+b*x+c; var X=ox+x*ux, Y=oy-y*uy; if(Y>-40&&Y<H+40) pts.push(X.toFixed(1)+","+Y.toFixed(1)); }
    return svgURI(
      '<line x1="10" y1="'+oy+'" x2="'+(W-10)+'" y2="'+oy+'" stroke="#334155" stroke-width="1.2"/>'
     +'<line x1="'+ox+'" y1="10" x2="'+ox+'" y2="'+(H-10)+'" stroke="#334155" stroke-width="1.2"/>'
     +'<polyline points="'+pts.join(" ")+'" fill="none" stroke="#2b4dbe" stroke-width="2.4"/>'
     +'<text x="'+(W-24)+'" y="'+(oy-8)+'" font-size="12" fill="#334155">x</text>'
     +'<text x="'+(ox+8)+'" y="20" font-size="12" fill="#334155">y</text>'
     +'<text x="'+(ox+6)+'" y="'+(oy+14)+'" font-size="11" fill="#64748b">O</text>', W, H);
  },
  bars: function(labels, values){
    var W=340,H=210, base=170, bw=Math.floor((W-60)/labels.length)-14, mx=Math.max.apply(null,values);
    var g='<line x1="34" y1="'+base+'" x2="'+(W-10)+'" y2="'+base+'" stroke="#334155"/>'
        + '<line x1="34" y1="18" x2="34" y2="'+base+'" stroke="#334155"/>';
    labels.forEach(function(l,i){
      var h = Math.round(values[i]/mx*120), x = 48+i*(bw+14), y = base-h;
      g += '<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" fill="#0f766e" rx="3"/>'
        + '<text x="'+(x+bw/2)+'" y="'+(base+15)+'" font-size="11" fill="#334155" text-anchor="middle">'+l+'</text>'
        + '<text x="'+(x+bw/2)+'" y="'+(y-4)+'" font-size="11" fill="#0f766e" text-anchor="middle">'+values[i]+'</text>';
    });
    return svgURI(g, W, H);
  },
  box: function(a,b,c){
    var W=300,H=210, x=60,y=60,w=150,h=90,d=45;
    var g='<polygon points="'+x+','+y+' '+(x+w)+','+y+' '+(x+w)+','+(y+h)+' '+x+','+(y+h)+'" fill="none" stroke="#1b2a4e" stroke-width="2"/>'
      + '<polygon points="'+x+','+y+' '+(x+d)+','+(y-d)+' '+(x+w+d)+','+(y-d)+' '+(x+w)+','+y+'" fill="none" stroke="#1b2a4e" stroke-width="2"/>'
      + '<polyline points="'+(x+w)+','+y+' '+(x+w+d)+','+(y-d)+' '+(x+w+d)+','+(y+h-d)+' '+(x+w)+','+(y+h)+'" fill="none" stroke="#1b2a4e" stroke-width="2"/>'
      + '<text x="'+(x+w/2)+'" y="'+(y+h+18)+'" font-size="12" fill="#334155" text-anchor="middle">'+a+' m</text>'
      + '<text x="'+(x+w+d+8)+'" y="'+(y+h/2)+'" font-size="12" fill="#334155">'+c+' m</text>'
      + '<text x="'+(x+w+d/2+4)+'" y="'+(y-d/2)+'" font-size="12" fill="#334155">'+b+' m</text>';
    return svgURI(g, W, H);
  },
  triangle: function(a,b){
    var W=300,H=200, x=60,y=160, sc=Math.min(150/Math.max(a,b),22);
    var X=x+a*sc, Y=y-b*sc;
    return svgURI('<polygon points="'+x+','+y+' '+X+','+y+' '+x+','+Y+'" fill="#e8edfb" stroke="#2b4dbe" stroke-width="2"/>'
      + '<rect x="'+x+'" y="'+(y-12)+'" width="12" height="12" fill="none" stroke="#2b4dbe"/>'
      + '<text x="'+(x+(X-x)/2)+'" y="'+(y+18)+'" font-size="12" fill="#334155" text-anchor="middle">'+a+' cm</text>'
      + '<text x="'+(x-40)+'" y="'+(y-(y-Y)/2)+'" font-size="12" fill="#334155">'+b+' cm</text>'
      + '<text x="'+(x-14)+'" y="'+(y+14)+'" font-size="12" fill="#1b2a4e">A</text>'
      + '<text x="'+(X+4)+'" y="'+(y+14)+'" font-size="12" fill="#1b2a4e">B</text>'
      + '<text x="'+(x-14)+'" y="'+(Y-2)+'" font-size="12" fill="#1b2a4e">C</text>', W, H);
  }
};

/* Câu hỏi kèm hình — dùng cho dạng đọc hình vẽ, đồ thị, bảng biểu */
Gen.figQ = function(type){
  var kind = pick(["parabola","bars","box","triangle"]);
  if(kind==="parabola"){
    var a=pick([1,1,2]), b=rnd(-4,4), c=rnd(-3,4);
    var xd = -b/(2*a), yd = a*xd*xd + b*xd;
    var img = Fig.parabola(a,b,c);
    if(type==="TLN") return { c:"Hình bên là đồ thị hàm số $y="+polyTxt(a,b,c)+"$. Hoành độ đỉnh của parabol bằng bao nhiêu (làm tròn hai chữ số thập phân)?",
      ans:String(Math.round(xd*100)/100).replace(".",","), e:"$x_{d}=-\\dfrac{b}{2a}$.", img:img };
    if(type==="DS") return { c:"Cho parabol $y="+polyTxt(a,b,c)+"$ có đồ thị như hình bên. Xét tính đúng sai:",
      st:[["Parabol quay bề lõm lên trên", a>0],["Đồ thị cắt trục tung tại điểm có tung độ "+c, true],
          ["Hoành độ đỉnh bằng $-\\dfrac{b}{2a}$", true],["Hàm số đồng biến trên toàn bộ tập số thực", false]],
      e:"Hệ số $a="+a+">0$ nên bề lõm hướng lên; hàm số nghịch biến rồi mới đồng biến.", img:img };
    return { c:"Hình bên là đồ thị hàm số $y="+polyTxt(a,b,c)+"$. Toạ độ đỉnh của parabol là",
      o:["("+(Math.round(xd*100)/100)+"; "+(Math.round(yd*100)/100)+")", "("+c+"; 0)", "(0; "+c+")", "("+(-b)+"; "+c+")"], ans:0,
      e:"$x_{d}=-\\dfrac{b}{2a}$ rồi thay vào tìm $y_{d}$.", img:img };
  }
  if(kind==="bars"){
    var labs = ["Toán","Văn","Anh","Lí","Hoá"].slice(0, rnd(4,5));
    var vals = labs.map(function(){ return rnd(8,32); });
    var mx = Math.max.apply(null, vals), sum = vals.reduce(function(a,b){ return a+b; },0);
    var img2 = Fig.bars(labs, vals);
    if(type==="TLN") return { c:"Biểu đồ bên cho biết số học sinh đăng kí các câu lạc bộ. Tổng số học sinh đã đăng kí là bao nhiêu?",
      ans:String(sum), e:"Cộng các cột: "+vals.join(" + ")+" = "+sum+".", img:img2 };
    if(type==="DS") return { c:"Quan sát biểu đồ số học sinh đăng kí các câu lạc bộ ở hình bên. Xét tính đúng sai:",
      st:[["Câu lạc bộ đông nhất có "+mx+" học sinh", true],["Tổng số học sinh là "+sum, true],
          ["Có đúng "+labs.length+" câu lạc bộ được thống kê", true],["Mọi câu lạc bộ đều có trên 40 học sinh", false]],
      e:"Đọc trực tiếp số liệu trên các cột.", img:img2 };
    return { c:"Biểu đồ bên cho biết số học sinh đăng kí các câu lạc bộ. Câu lạc bộ có đông học sinh nhất gồm bao nhiêu em?",
      o:[String(mx), String(Math.min.apply(null,vals)), String(sum), String(labs.length)], ans:0,
      e:"Cột cao nhất ứng với "+mx+" học sinh.", img:img2 };
  }
  if(kind==="box"){
    var a1=rnd(3,8), b1=rnd(2,6), c1=rnd(2,5), V=a1*b1*c1, img3=Fig.box(a1,b1,c1);
    if(type==="TLN") return { c:"Hình bên là bể nước dạng hình hộp chữ nhật. Thể tích của bể bằng bao nhiêu mét khối?",
      ans:String(V), e:"$V=abc="+a1+"\\cdot"+b1+"\\cdot"+c1+"="+V+"$ (m³).", img:img3 };
    if(type==="DS") return { c:"Cho hình hộp chữ nhật như hình bên với các kích thước "+a1+" m, "+b1+" m, "+c1+" m. Xét tính đúng sai:",
      st:[["Thể tích khối hộp bằng "+V+" m³", true],["Diện tích mặt đáy bằng "+(a1*b1)+" m²", true],
          ["Khối hộp có 12 cạnh", true],["Đường chéo của khối hộp bằng "+(a1+b1+c1)+" m", false]],
      e:"Đường chéo $=\\sqrt{a^{2}+b^{2}+c^{2}}$ chứ không phải tổng ba cạnh.", img:img3 };
    return { c:"Hình bên là bể nước dạng hình hộp chữ nhật. Thể tích của bể là",
      o:[V+" m³", (a1*b1)+" m³", (2*(a1*b1+b1*c1+a1*c1))+" m³", (a1+b1+c1)+" m³"], ans:0,
      e:"$V=abc="+V+"$ m³.", img:img3 };
  }
  var p=rnd(3,9), q=rnd(3,9), hyp=Math.round(Math.sqrt(p*p+q*q)*100)/100, img4=Fig.triangle(p,q);
  if(type==="TLN") return { c:"Tam giác ABC vuông tại A như hình bên, AB = "+p+" cm, AC = "+q+" cm. Diện tích tam giác bằng bao nhiêu cm²?",
    ans:String(Math.round(p*q/2*100)/100).replace(".",","), e:"$S=\\dfrac{1}{2}AB\\cdot AC$.", img:img4 };
  if(type==="DS") return { c:"Cho tam giác ABC vuông tại A như hình bên với AB = "+p+" cm, AC = "+q+" cm. Xét tính đúng sai:",
    st:[["$BC=\\sqrt{AB^{2}+AC^{2}}$", true],["BC ≈ "+hyp+" cm", true],
        ["Diện tích tam giác bằng "+(Math.round(p*q/2*100)/100)+" cm²", true],["Tam giác ABC là tam giác đều", false]],
    e:"Áp dụng định lí Pythagore.", img:img4 };
  return { c:"Tam giác ABC vuông tại A như hình bên có AB = "+p+" cm, AC = "+q+" cm. Độ dài BC gần nhất với",
    o:[hyp+" cm", (p+q)+" cm", (p*q)+" cm", Math.abs(p-q)+" cm"], ans:0,
    e:"$BC=\\sqrt{"+p+"^{2}+"+q+"^{2}}\\approx"+hyp+"$ cm.", img:img4 };
};

/* ---------- 3. THÊM BỘ SINH TOÁN CHO NHIỀU CHƯƠNG ---------- */
Gen.math.push(
 { key:/lượng giác/i,
   tn:function(){ var k=pick([[30,"1/2"],[45,"√2/2"],[60,"√3/2"]]);
     return { c:"Giá trị của $\\sin "+k[0]+"^{\\circ}$ bằng", o:[k[1],"1","0","√3"], ans:0, e:"Giá trị lượng giác của góc đặc biệt." }; },
   tln:function(){ var n=rnd(1,4); return { c:"Chu kì tuần hoàn của hàm số $y=\\sin("+n+"x)$ bằng $\\dfrac{2\\pi}{k}$. Giá trị của $k$ là bao nhiêu?", ans:String(n), e:"Chu kì $T=\\dfrac{2\\pi}{|a|}$ với $a="+n+"$." }; },
   ds:function(){ return { c:"Xét các khẳng định về hàm số lượng giác:",
     st:[["Hàm số $y=\\sin x$ tuần hoàn với chu kì $2\\pi$",true],["Hàm số $y=\\cos x$ là hàm số chẵn",true],
         ["Hàm số $y=\\tan x$ xác định với mọi số thực",false],["$\\sin^{2}x+\\cos^{2}x=1$ với mọi $x$",true]],
     e:"$\\tan x$ không xác định tại $x=\\dfrac{\\pi}{2}+k\\pi$." }; } },
 { key:/mũ|lôgarit|logarit/i,
   tn:function(){ var a=pick([2,3,5]), n=rnd(2,4);
     return { c:"Giá trị của $\\log_{"+a+"}"+Math.pow(a,n)+"$ bằng", o:[String(n), String(a), String(n*a), String(Math.pow(a,n))], ans:0,
       e:"$\\log_{"+a+"}"+a+"^{"+n+"}="+n+"$." }; },
   tln:function(){ var a=pick([2,3]), n=rnd(3,6);
     return { c:"Nghiệm của phương trình $"+a+"^{x}="+Math.pow(a,n)+"$ là bao nhiêu?", ans:String(n), e:"Đưa về cùng cơ số." }; },
   ds:function(){ var a=pick([2,3,10]);
     return { c:"Xét các khẳng định về hàm số $y=\\log_{"+a+"}x$:",
       st:[["Tập xác định là $(0;+\\infty)$",true],["Hàm số đồng biến trên tập xác định",true],
           ["Đồ thị đi qua điểm $(1;0)$",true],["Hàm số nhận giá trị âm với mọi $x>1$",false]],
       e:"Với $x>1$ thì $\\log_{"+a+"}x>0$." }; } },
 { key:/giới hạn|liên tục/i,
   tn:function(){ var a=rnd(2,7), b=rnd(1,6);
     return { c:"Giới hạn $\\lim\\limits_{x\\to "+b+"}("+a+"x+1)$ bằng", o:[String(a*b+1), String(a+b), String(a*b), String(b)], ans:0,
       e:"Thay trực tiếp $x="+b+"$." }; },
   tln:function(){ var a=rnd(2,9);
     return { c:"Tính $\\lim\\limits_{x\\to +\\infty}\\dfrac{"+a+"x+3}{x}$.", ans:String(a), e:"Chia tử và mẫu cho $x$." }; },
   ds:function(){ return { c:"Xét các khẳng định về hàm số liên tục:",
     st:[["Hàm đa thức liên tục trên $\\mathbb{R}$",true],["Hàm phân thức liên tục trên từng khoảng xác định",true],
         ["Mọi hàm số đều liên tục tại mọi điểm",false],["Hàm liên tục trên đoạn thì có giá trị lớn nhất trên đoạn đó",true]],
     e:"Hàm số có điểm gián đoạn thì không liên tục tại đó." }; } },
 { key:/thống kê|phân tán|số liệu/i,
   tn:function(){ var v=[rnd(4,9),rnd(4,9),rnd(4,9),rnd(4,9),rnd(4,9)];
     var m=Math.round(v.reduce(function(a,b){return a+b;},0)/v.length*100)/100;
     return { c:"Mẫu số liệu: "+v.join("; ")+". Số trung bình của mẫu bằng", o:[String(m).replace(".",","), String(Math.max.apply(null,v)), String(Math.min.apply(null,v)), String(v.length)], ans:0,
       e:"Trung bình cộng của "+v.length+" giá trị." }; },
   tln:function(){ var v=[rnd(2,9),rnd(2,9),rnd(2,9),rnd(2,9),rnd(2,9)].sort(function(a,b){return a-b;});
     return { c:"Mẫu số liệu đã sắp xếp: "+v.join("; ")+". Trung vị của mẫu bằng bao nhiêu?", ans:String(v[2]), e:"Mẫu có 5 giá trị nên trung vị là giá trị thứ ba." }; },
   ds:function(){ var v=[rnd(3,8),rnd(3,8),rnd(3,8),rnd(3,8)];
     var s=v.reduce(function(a,b){return a+b;},0);
     return { c:"Cho mẫu số liệu "+v.join("; ")+". Xét tính đúng sai:",
       st:[["Tổng các giá trị bằng "+s,true],["Số trung bình bằng "+(Math.round(s/4*100)/100),true],
           ["Khoảng biến thiên bằng "+(Math.max.apply(null,v)-Math.min.apply(null,v)),true],["Phương sai luôn âm",false]],
       e:"Phương sai luôn không âm." }; } }
);

/* Gắn hình cho dạng đọc hình vẽ, và thêm hình cho một phần câu hỏi Toán khác */
(function(){
  var one = Gen.one;
  Gen.one = function(sub, grade, chapter, bai, dang, type){
    if(sub==="Toán" && /đọc đồ thị|hình vẽ|bảng biểu/i.test(dang)){
      var d = Gen.figQ(type);
      var q = { id:uid("q"), subject:sub, grade:grade, chapter:chapter, lesson:bai, dang:dang, type:type,
        level:pick(["NB","TH","TH","VD"]), source:"auto", options:[], statements:[], short:"", explain:d.e||"",
        content:d.c, imgs:d.img? [d.img]:[], createdAt:Date.now() };
      if(type==="TN"){ var opts=d.o.map(String), right=opts[d.ans], mix=shuffle(opts);
        q.options = mix; q.answer = "ABCD"[mix.indexOf(right)]; }
      if(type==="TLN") q.short = d.ans;
      if(type==="DS") q.statements = (d.st||[]).map(function(s){ return { t:s[0], ok:s[1] }; });
      return q;
    }
    return one(sub, grade, chapter, bai, dang, type);
  };
})();

/* ---------- 4. GIÁO VIÊN TÍCH CHỌN CÂU HỎI ĐỂ GHÉP ĐỀ ---------- */
var Pick = { ids:{}, count:function(){ return Object.keys(Pick.ids).length; } };
(function(){
  var render = Bank.render;
  Bank.render = function(q){
    var html = render(q);
    if(!ME || ME.role==="student") return html;
    var box = '<label class="opt" style="margin:0 0 8px;background:#f8fafc"><input type="checkbox" '
      + (Pick.ids[q.id]?"checked":"") + ' onchange="Pick.toggle(\''+q.id+'\',this.checked)"><span>Chọn câu này để ghép đề</span></label>';
    return html.replace('<div>', box + '<div>');
  };
})();
Pick.toggle = function(id, on){ if(on) Pick.ids[id]=1; else delete Pick.ids[id]; Pick.bar(); };
Pick.selectAll = function(){ Bank.filtered().forEach(function(q){ Pick.ids[q.id]=1; }); Router.go("bank"); };
Pick.clear = function(){ Pick.ids = {}; Router.go("bank"); };
Pick.bar = function(){
  var el = document.getElementById("pickBar");
  if(!el){
    document.body.insertAdjacentHTML("beforeend",
      '<div id="pickBar" style="position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:120;'
      + 'background:var(--indigo);color:#fff;padding:10px 14px;border-radius:14px;box-shadow:var(--shadow);display:none;gap:8px;align-items:center">'
      + '<span id="pickN"></span>'
      + '<button class="btn sm" onclick="Pick.build()">Ghép đề</button>'
      + '<button class="btn sm ghost" onclick="Pick.selectAll()">Chọn hết</button>'
      + '<button class="btn sm ghost" onclick="Pick.clear()">Bỏ chọn</button></div>');
    el = document.getElementById("pickBar");
  }
  var n = Pick.count();
  el.style.display = n ? "flex" : "none";
  var t = document.getElementById("pickN"); if(t) t.textContent = "Đã chọn " + n + " câu";
};
(function(){ var g = Router.go; Router.go = function(k){ g(k); setTimeout(Pick.bar, 0); }; })();

Pick.build = function(){
  var qs = Object.keys(Pick.ids).map(qById).filter(Boolean);
  if(!qs.length){ toast("Chưa chọn câu nào."); return; }
  var n = { TN:qs.filter(function(q){return q.type==="TN";}).length,
            DS:qs.filter(function(q){return q.type==="DS";}).length,
            TLN:qs.filter(function(q){return q.type==="TLN";}).length };
  var fs = myFolders();
  modal('<h2>Ghép đề từ '+qs.length+' câu đã chọn</h2>'
   + '<p class="muted">Phần I: '+n.TN+' câu · Phần II: '+n.DS+' câu · Phần III: '+n.TLN+' câu</p>'
   + '<div class="field"><label>Tên đề</label><input id="pkTitle" value="Đề kiểm tra '+esc(qs[0].subject)+' '+qs[0].grade+'"></div>'
   + '<div class="row"><div class="field"><label>Thời gian (phút)</label><input id="pkDur" type="number" value="90"></div>'
   + '<div class="field"><label>Điểm mỗi câu phần I</label><input id="pkTn" type="number" step="0.05" value="0.25"></div>'
   + '<div class="field"><label>Điểm mỗi câu phần II</label><input id="pkDs" type="number" step="0.05" value="1"></div>'
   + '<div class="field"><label>Điểm mỗi câu phần III</label><input id="pkTln" type="number" step="0.05" value="'+(qs[0].subject==="Toán"?0.5:0.25)+'"></div></div>'
   + '<div class="row"><div class="field"><label>Giờ kết thúc</label><input id="pkEnd" type="datetime-local" value="'+toLocalInput(new Date(Date.now()+7*864e5))+'"></div>'
   + '<div class="field"><label>Lưu vào thư mục</label><select id="pkFolder"><option value="">Không dùng thư mục</option>'
   + fs.map(function(f){ return '<option value="'+f.id+'">'+esc(f.name)+'</option>'; }).join("")+'</select></div></div>'
   + '<button class="btn" onclick="Pick.save(this)">Tạo đề</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
};
Pick.save = function(el){
  var qs = Object.keys(Pick.ids).map(qById).filter(Boolean);
  var e = { id:uid("ex"), title:document.getElementById("pkTitle").value.trim()||"Đề kiểm tra",
    subject:qs[0].subject, grade:qs[0].grade, chapters:[], mode:"fixed",
    qids:{ tn:qs.filter(function(q){return q.type==="TN";}).map(function(q){return q.id;}),
           ds:qs.filter(function(q){return q.type==="DS";}).map(function(q){return q.id;}),
           tln:qs.filter(function(q){return q.type==="TLN";}).map(function(q){return q.id;}) },
    cfg:{ tn:{n:qs.filter(function(q){return q.type==="TN";}).length, p:+document.getElementById("pkTn").value},
          ds:{n:qs.filter(function(q){return q.type==="DS";}).length, p:+document.getElementById("pkDs").value, rule:[0.1,0.25,0.5,1]},
          tln:{n:qs.filter(function(q){return q.type==="TLN";}).length, p:+document.getElementById("pkTln").value} },
    duration:+document.getElementById("pkDur").value||90, startAt:toLocalInput(new Date()),
    endAt:document.getElementById("pkEnd").value, shuffle:true, showResult:true,
    folderId:document.getElementById("pkFolder").value, owner:ME.email, createdAt:Date.now() };
  S.exams.push(e); Store.save("exams"); Pick.ids = {}; Pick.bar(); closeModal(el);
  toast("Đã tạo đề từ các câu đã chọn"); Router.go("exams");
};

/* Đề dạng cố định: lấy đúng các câu đã chọn */
(function(){
  var paper = Exam.paper;
  Exam.paper = function(e, sid){
    if(e.mode!=="fixed") return paper(e, sid);
    var rng = seeded(e.id+"|"+sid), get = function(ids){ return (ids||[]).map(qById).filter(Boolean); };
    var tn = get(e.qids.tn);
    if(e.shuffle) tn = tn.map(function(q){
      var idx = shuffleSeed([0,1,2,3].slice(0,(q.options||[]).length), rng);
      var oldA = "ABCD".indexOf(q.answer);
      return Object.assign({}, q, { options: idx.map(function(i){ return q.options[i]; }), answer:"ABCD"[idx.indexOf(oldA)]||q.answer });
    });
    return { code:"M"+String(Math.floor(rng()*900)+100), tn:tn, ds:get(e.qids.ds), tln:get(e.qids.tln) };
  };
})();

/* ---------- 5. RÚT ĐỀ THEO MA TRẬN + XUẤT MA TRẬN, BẢN ĐẶC TẢ ---------- */
MENU.teacher[0][1].splice(5, 0, ["matrix","Ma trận & rút đề"]);
MENU.admin[0][1].splice(5, 0, ["matrix","Ma trận & rút đề"]);
var LV = ["NB","TH","VD"], FORM = [["TN","Trắc nghiệm"],["DS","Đúng/Sai"],["TLN","Trả lời ngắn"]];

Views.matrix = function(){
  var sub = BankF.sub, gr = BankF.grade, chaps = (CURRICULUM[sub]||{})[gr] || [];
  var m = (S.settings.matrix||{})[sub+"|"+gr] || {};
  return '<div class="page-head"><div><h1>Ma trận và rút đề</h1>'
   + '<p>Nhập số câu theo chương – hình thức – mức độ. Hệ thống rút câu hỏi ở các dạng khác nhau cho đủ ma trận, rồi xuất ma trận và bản đặc tả.</p></div></div>'
   + '<div class="card"><div class="row">'
   + '<div class="field"><label>Môn</label><select id="mSub" onchange="Mx.setF()">'+optSubjects(sub)+'</select></div>'
   + '<div class="field"><label>Khối</label><select id="mGrade" onchange="Mx.setF()">'+optGrades(gr)+'</select></div>'
   + '<div class="field"><label>Trường</label><input id="mSchool" value="'+esc(S.settings.school||"Trường THPT Bình Thạnh Đông")+'"></div>'
   + '<div class="field"><label>Tổ chuyên môn</label><input id="mTo" value="'+esc(S.settings.to||("Tổ "+sub))+'"></div>'
   + '</div></div>'
   + '<div class="card"><div class="tablewrap"><table><tr><th rowspan="2">Chương / chủ đề</th>'
   + FORM.map(function(f){ return '<th colspan="3">'+f[1]+'</th>'; }).join("") + '<th rowspan="2">Tổng</th></tr><tr>'
   + FORM.map(function(){ return LV.map(function(l){ return '<th>'+l+'</th>'; }).join(""); }).join("") + '</tr>'
   + chaps.map(function(ch,ci){
      return '<tr><td>'+esc(ch)+'</td>'
        + FORM.map(function(f){ return LV.map(function(l){
            var k = ci+"|"+f[0]+"|"+l;
            return '<td><input type="number" min="0" style="width:56px;padding:5px" id="mx_'+k+'" value="'+(m[k]||0)+'" oninput="Mx.sum()"></td>'; }).join(""); }).join("")
        + '<td id="mrow_'+ci+'" class="muted">0</td></tr>'; }).join("")
   + '</table></div>'
   + '<div class="row" style="margin-top:10px"><div class="log" id="mxSum" style="flex:1 1 100%">—</div></div>'
   + '<div class="row"><button class="btn" onclick="Mx.draw()">Rút đề theo ma trận</button>'
   + '<button class="btn ghost" onclick="Mx.save()">Lưu ma trận</button>'
   + '<button class="btn teal" onclick="Mx.word()">Xuất ma trận + bản đặc tả (Word)</button></div></div>';
};
Views.after_matrix = function(){ if($("mxSum")) Mx.sum(); };

var Mx = {
  setF: function(){ BankF.sub = $("mSub").value; BankF.grade = +$("mGrade").value; Router.go("matrix"); },
  read: function(){
    var sub = $("mSub").value, gr = +$("mGrade").value, chaps = (CURRICULUM[sub]||{})[gr]||[], m = {};
    chaps.forEach(function(ch,ci){ FORM.forEach(function(f){ LV.forEach(function(l){
      var k = ci+"|"+f[0]+"|"+l, el = $("mx_"+k); if(el && +el.value>0) m[k] = +el.value; }); }); });
    return { sub:sub, grade:gr, chaps:chaps, m:m };
  },
  points: function(sub, form, n){
    if(form==="TN") return n*0.25;
    if(form==="DS") return n*1;
    return n*(sub==="Toán"?0.5:0.25);
  },
  sum: function(){
    var r = Mx.read(), tot = 0, pts = 0, byLv = {NB:0,TH:0,VD:0};
    r.chaps.forEach(function(ch,ci){
      var rowN = 0;
      FORM.forEach(function(f){ LV.forEach(function(l){
        var n = r.m[ci+"|"+f[0]+"|"+l] || 0; rowN += n; tot += n; byLv[l] += n; pts += Mx.points(r.sub, f[0], n); }); });
      var el = $("mrow_"+ci); if(el) el.textContent = rowN;
    });
    var pc = function(x){ return tot? Math.round(x/tot*100) : 0; };
    $("mxSum").textContent = "Tổng số câu: " + tot + "   ·   Tổng điểm: " + (Math.round(pts*100)/100) + "/10\n"
      + "Nhận biết " + byLv.NB + " câu (" + pc(byLv.NB) + "%) · Thông hiểu " + byLv.TH + " câu (" + pc(byLv.TH) + "%) · Vận dụng " + byLv.VD + " câu (" + pc(byLv.VD) + "%)\n"
      + (tot===0 ? "Hãy nhập số câu vào bảng." :
         (Math.abs(pts-10)>0.01 ? "Tổng điểm chưa bằng 10 — điều chỉnh lại số câu.\n" : "Tổng điểm đã đủ 10.\n")
         + (Math.abs(pc(byLv.NB)-40)<=5 && Math.abs(pc(byLv.TH)-30)<=5 && Math.abs(pc(byLv.VD)-30)<=5
            ? "Tỉ lệ mức độ bám chuẩn 40 – 30 – 30." : "Chuẩn thường dùng là 40% nhận biết – 30% thông hiểu – 30% vận dụng."));
  },
  save: function(){
    var r = Mx.read();
    S.settings.matrix = S.settings.matrix || {};
    S.settings.matrix[r.sub+"|"+r.grade] = r.m;
    S.settings.school = $("mSchool").value.trim(); S.settings.to = $("mTo").value.trim();
    Store.save("settings"); toast("Đã lưu ma trận");
  },
  /* Rút câu: mỗi ô ma trận lấy câu ở các dạng khác nhau */
  extract: function(){
    var r = Mx.read(), picked = { tn:[], ds:[], tln:[] }, missing = [];
    r.chaps.forEach(function(ch,ci){
      FORM.forEach(function(f){
        LV.forEach(function(l){
          var need = r.m[ci+"|"+f[0]+"|"+l] || 0; if(!need) return;
          var pool = S.questions.filter(function(q){
            return q.subject===r.sub && q.grade==r.grade && q.chapter===ch && q.type===f[0] && (q.level||"NB")===l;
          });
          if(pool.length < need){
            pool = pool.concat(S.questions.filter(function(q){
              return q.subject===r.sub && q.grade==r.grade && q.chapter===ch && q.type===f[0] && pool.indexOf(q)<0; }));
          }
          /* nhóm theo dạng rồi lấy luân phiên để các câu không cùng một dạng */
          var byDang = {};
          shuffle(pool).forEach(function(q){ var d = q.dang||"khác"; (byDang[d] = byDang[d]||[]).push(q); });
          var keys = shuffle(Object.keys(byDang)), out = [], i = 0;
          while(out.length < need && keys.length){
            var k = keys[i % keys.length];
            if(byDang[k].length) out.push(byDang[k].shift()); else { keys.splice(i % keys.length, 1); continue; }
            i++;
          }
          if(out.length < need) missing.push(ch + " · " + f[1] + " · " + l + " (thiếu " + (need-out.length) + " câu)");
          var slot = f[0]==="TN" ? "tn" : f[0]==="DS" ? "ds" : "tln";
          picked[slot] = picked[slot].concat(out);
        });
      });
    });
    return { picked:picked, missing:missing, info:r };
  },
  draw: function(){
    var res = Mx.extract(), p = res.picked;
    var total = p.tn.length + p.ds.length + p.tln.length;
    if(!total){ toast("Ma trận chưa có số câu nào."); return; }
    var fs = myFolders();
    modal('<h2>Rút đề theo ma trận</h2>'
     + '<p class="muted">Đã rút '+total+' câu: '+p.tn.length+' trắc nghiệm, '+p.ds.length+' đúng/sai, '+p.tln.length+' trả lời ngắn.</p>'
     + (res.missing.length? '<p><span class="pill amber">Còn thiếu</span> '+esc(res.missing.join("; "))+'. Hãy sinh thêm câu hỏi cho các ô này.</p>' : '')
     + '<div class="field"><label>Tên đề</label><input id="mxTitle" value="Đề kiểm tra '+esc(res.info.sub)+' '+res.info.grade+'"></div>'
     + '<div class="row"><div class="field"><label>Thời gian (phút)</label><input id="mxDur" type="number" value="90"></div>'
     + '<div class="field"><label>Giờ kết thúc</label><input id="mxEnd" type="datetime-local" value="'+toLocalInput(new Date(Date.now()+7*864e5))+'"></div>'
     + '<div class="field"><label>Lưu vào thư mục</label><select id="mxFolder"><option value="">Không dùng</option>'
     + fs.map(function(f){ return '<option value="'+f.id+'">'+esc(f.name)+'</option>'; }).join("")+'</select></div></div>'
     + '<button class="btn" onclick="Mx.saveExam(this)">Tạo đề</button> <button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
    Mx._last = res;
  },
  saveExam: function(el){
    var res = Mx._last, p = res.picked, sub = res.info.sub;
    var e = { id:uid("ex"), title:document.getElementById("mxTitle").value.trim()||"Đề kiểm tra",
      subject:sub, grade:res.info.grade, chapters:[], mode:"fixed",
      qids:{ tn:p.tn.map(function(q){return q.id;}), ds:p.ds.map(function(q){return q.id;}), tln:p.tln.map(function(q){return q.id;}) },
      cfg:{ tn:{n:p.tn.length, p:0.25}, ds:{n:p.ds.length, p:1, rule:[0.1,0.25,0.5,1]},
            tln:{n:p.tln.length, p: sub==="Toán"?0.5:0.25} },
      duration:+document.getElementById("mxDur").value||90, startAt:toLocalInput(new Date()),
      endAt:document.getElementById("mxEnd").value, shuffle:true, showResult:true,
      folderId:document.getElementById("mxFolder").value, matrix:res.info.m, owner:ME.email, createdAt:Date.now() };
    S.exams.push(e); Store.save("exams"); closeModal(el); toast("Đã tạo đề theo ma trận"); Router.go("exams");
  },
  word: function(){
    var r = Mx.read(), school = $("mSchool").value.trim(), to = $("mTo").value.trim();
    var head = '<table class="b"><tr><td style="border:0;width:50%">'+esc(school).toUpperCase()+'<br><b>'+esc(to)+'</b></td>'
      + '<td style="border:0;text-align:center"><b>MA TRẬN ĐỀ KIỂM TRA</b><br>Môn: '+esc(r.sub)+' — Khối '+r.grade+'<br>Thời gian làm bài: 90 phút</td></tr></table>';
    var mt = '<table class="b"><tr><th rowspan="2">TT</th><th rowspan="2">Chương / chủ đề</th>'
      + FORM.map(function(f){ return '<th colspan="3">'+f[1]+'</th>'; }).join("")
      + '<th rowspan="2">Tổng câu</th><th rowspan="2">Điểm</th></tr><tr>'
      + FORM.map(function(){ return LV.map(function(l){ return '<th>'+l+'</th>'; }).join(""); }).join("") + '</tr>';
    var tot=0, pts=0, byLv={NB:0,TH:0,VD:0};
    r.chaps.forEach(function(ch,ci){
      var rowN=0, rowP=0;
      var cells = FORM.map(function(f){ return LV.map(function(l){
        var n = r.m[ci+"|"+f[0]+"|"+l]||0; rowN+=n; byLv[l]+=n; rowP += Mx.points(r.sub,f[0],n);
        return '<td style="text-align:center">'+(n||"")+'</td>'; }).join(""); }).join("");
      if(rowN===0) return;
      tot+=rowN; pts+=rowP;
      mt += '<tr><td style="text-align:center">'+(ci+1)+'</td><td>'+esc(ch)+'</td>'+cells
         + '<td style="text-align:center">'+rowN+'</td><td style="text-align:center">'+(Math.round(rowP*100)/100)+'</td></tr>';
    });
    mt += '<tr><td colspan="2"><b>Tổng</b></td>'
       + FORM.map(function(f){ return LV.map(function(l){
           var n=0; r.chaps.forEach(function(ch,ci){ n += r.m[ci+"|"+f[0]+"|"+l]||0; });
           return '<td style="text-align:center"><b>'+(n||"")+'</b></td>'; }).join(""); }).join("")
       + '<td style="text-align:center"><b>'+tot+'</b></td><td style="text-align:center"><b>'+(Math.round(pts*100)/100)+'</b></td></tr></table>'
       + '<p><i>Tỉ lệ mức độ: Nhận biết '+Math.round(byLv.NB/(tot||1)*100)+'% — Thông hiểu '+Math.round(byLv.TH/(tot||1)*100)+'% — Vận dụng '+Math.round(byLv.VD/(tot||1)*100)+'%.</i></p>';

    var yc = { NB:"Nhận biết: nêu, nhận ra, trình bày được kiến thức cơ bản của chủ đề.",
               TH:"Thông hiểu: giải thích, phân tích, thực hiện được các bước cơ bản.",
               VD:"Vận dụng: giải quyết được tình huống, bài toán gắn với thực tiễn." };
    var dt = '<h3 style="text-align:center">BẢN ĐẶC TẢ ĐỀ KIỂM TRA</h3><table class="b"><tr><th>TT</th><th>Chương / chủ đề</th><th>Bài / nội dung</th><th>Mức độ</th><th>Yêu cầu cần đạt</th><th>Số câu</th></tr>';
    var stt = 0;
    r.chaps.forEach(function(ch,ci){
      LV.forEach(function(l){
        var n = FORM.reduce(function(a,f){ return a + (r.m[ci+"|"+f[0]+"|"+l]||0); }, 0);
        if(!n) return;
        stt++;
        dt += '<tr><td style="text-align:center">'+stt+'</td><td>'+esc(ch)+'</td><td>'+esc(baiOf(r.sub, r.grade, ch).slice(0,3).join("; "))+'</td>'
           + '<td style="text-align:center">'+l+'</td><td>'+yc[l]+'</td><td style="text-align:center">'+n+'</td></tr>';
      });
    });
    dt += '</table>'
      + '<table style="width:100%;margin-top:24px;border:0"><tr><td style="border:0;text-align:center;width:50%">TỔ TRƯỞNG CHUYÊN MÔN<br><i>(Kí và ghi rõ họ tên)</i></td>'
      + '<td style="border:0;text-align:center">GIÁO VIÊN RA ĐỀ<br><i>(Kí và ghi rõ họ tên)</i><br><br><br><b>Lương Khánh Tường</b></td></tr></table>';

    Word.save("ma-tran-ban-dac-ta-"+slugVN(r.sub)+"-"+r.grade+".doc",
      head + mt + '<br style="page-break-before:always">' + dt, true);
  }
};

/* ---------- 6. XUẤT WORD ---------- */
function slugVN(t){
  return String(t).toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g,"a").replace(/[èéẹẻẽêềếệểễ]/g,"e")
    .replace(/[ìíịỉĩ]/g,"i").replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,"o")
    .replace(/[ùúụủũưừứựửữ]/g,"u").replace(/[ỳýỵỷỹ]/g,"y").replace(/đ/g,"d")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
}
var Word = {
  css: 'body{font-family:"Times New Roman",serif;font-size:12pt} h2,h3{font-family:"Times New Roman",serif}'
    + 'table.b{border-collapse:collapse;width:100%} table.b th,table.b td{border:1px solid #999;padding:4px 6px;font-size:11pt}'
    + '.qnum{color:#7030A0;font-weight:bold} .opt{margin:2px 0} img{max-width:320px}',
  save: function(name, body, landscape){
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">'
      + '<head><meta charset="utf-8"><title>'+esc(name)+'</title>'
      + '<style>@page{size:'+(landscape?"A4 landscape":"A4 portrait")+';margin:1.5cm} '+Word.css+'</style></head><body>'
      + body + '</body></html>';
    Tpl.dl(name, html, "application/msword");
  },
  exam: function(examId, withKey){
    var e = examById(examId), p = Exam.paper(e, "BAN-GOC");
    var img = function(q){ return (q.imgs||[]).map(function(s){ return '<div><img src="'+s+'"></div>'; }).join(""); };
    var txt = function(q){ return esc(q.content).replace(/\n/g,"<br>"); };
    var b = '<table style="width:100%;border:0"><tr><td style="border:0;width:52%;text-align:center">'
      + esc((S.settings.school||"TRƯỜNG THPT").toUpperCase())+'<br><b>'+esc(S.settings.to||("TỔ "+e.subject.toUpperCase()))+'</b>'
      + '<br><i>(Đề có '+(p.tn.length+p.ds.length+p.tln.length)+' câu)</i></td>'
      + '<td style="border:0;text-align:center"><b>'+esc(e.title.toUpperCase())+'</b><br>Môn: '+esc(e.subject)+' — Khối '+e.grade
      + '<br>Thời gian làm bài: '+e.duration+' phút<br><b>Mã đề '+p.code+'</b></td></tr></table>'
      + '<p>Họ và tên học sinh: ................................................................ Lớp: ....................</p><hr>';
    if(p.tn.length){
      b += '<p><b>PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.</b> <i>Mỗi câu '+e.cfg.tn.p+' điểm.</i></p>';
      p.tn.forEach(function(q,i){
        b += '<p><span class="qnum">Câu '+(i+1)+'.</span> '+txt(q)+'</p>'+img(q)
          + '<p class="opt">' + (q.options||[]).map(function(o,j){ return '<span class="qnum">'+"ABCD"[j]+'.</span> '+esc(o); }).join('&nbsp;&nbsp;&nbsp;&nbsp;') + '</p>';
      });
    }
    if(p.ds.length){
      b += '<p><b>PHẦN II. Câu trắc nghiệm đúng sai.</b> <i>Mỗi câu tối đa '+e.cfg.ds.p+' điểm.</i></p>';
      p.ds.forEach(function(q,i){
        b += '<p><span class="qnum">Câu '+(i+1)+'.</span> '+txt(q)+'</p>'+img(q)
          + q.statements.map(function(s,j){ return '<p class="opt"><span class="qnum">'+"abcd"[j]+')</span> '+esc(s.t)+'</p>'; }).join("");
      });
    }
    if(p.tln.length){
      b += '<p><b>PHẦN III. Câu trả lời ngắn.</b> <i>Mỗi câu '+e.cfg.tln.p+' điểm.</i></p>';
      p.tln.forEach(function(q,i){ b += '<p><span class="qnum">Câu '+(i+1)+'.</span> '+txt(q)+'</p>'+img(q); });
    }
    b += '<p style="text-align:center"><i>--- HẾT ---</i></p>';
    if(withKey){
      b += '<br style="page-break-before:always"><h3 style="text-align:center">ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM — Mã đề '+p.code+'</h3>';
      if(p.tn.length) b += '<p><b>Phần I.</b> ' + p.tn.map(function(q,i){ return (i+1)+q.answer; }).join(" · ") + '</p>';
      if(p.ds.length) b += '<p><b>Phần II.</b> ' + p.ds.map(function(q,i){ return (i+1)+": "+q.statements.map(function(s){ return s.ok?"Đ":"S"; }).join(""); }).join(" · ") + '</p>';
      if(p.tln.length) b += '<p><b>Phần III.</b> ' + p.tln.map(function(q,i){ return (i+1)+": "+esc(q.short); }).join(" · ") + '</p>';
      b += '<h3>Lời giải tóm tắt</h3>'
        + [].concat(p.tn,p.ds,p.tln).map(function(q,i){ return q.explain? '<p>'+(i+1)+'. '+esc(q.explain)+'</p>' : ""; }).join("");
      b += '<p><i>Công thức trong đề ghi theo LaTeX giữa hai dấu $. Trong Word, chọn đoạn công thức rồi dùng MathType (Preferences → Cut and Copy Preferences → LaTeX) để chuyển thành công thức chuẩn.</i></p>';
    }
    Word.save("de-" + slugVN(e.title) + ".doc", b);
  }
};

/* Nút xuất Word trong danh sách đề */
(function(){
  var old = Views.exams;
  Views.exams = function(){
    return old().replace(/<button class="btn sm teal" onclick="Router.go\('assign'\)">Giao<\/button>/g,
      '<button class="btn sm teal" onclick="Router.go(\'assign\')">Giao</button> ')
      .replace(/<button class="btn sm ghost" onclick="Exam.preview\('([^']+)'\)">Xem thử<\/button>/g,
        '<button class="btn sm ghost" onclick="Exam.preview(\'$1\')">Xem thử</button> '
        + '<button class="btn sm ghost" onclick="Word.exam(\'$1\',true)">Xuất Word</button>');
  };
})();


/* ---------- 12. KHỞI ĐỘNG ---------- */
(function boot(){
  Store.loadLocal();
  if(!S.settings.adminEmails || !S.settings.adminEmails.length) S.settings.adminEmails = ADMIN_EMAILS.slice();
  var restore = function(){
    var raw = sessionStorage.getItem("HTPVDH_me");
    if(raw){ try{ Auth.enter(JSON.parse(raw)); }catch(e){} }
  };
  Store.connectCloud(function(ok){
    if(ok && fauth){
      fauth.onAuthStateChanged(function(u){
        if(u && !ME){
          var role = roleOfEmail(u.email) || "teacher";
          Auth.enter({ id:u.uid, email:u.email, name:u.displayName||u.email, role:role });
        }
      });
    }
    restore();
  });
  setTimeout(restore, 200);
})();