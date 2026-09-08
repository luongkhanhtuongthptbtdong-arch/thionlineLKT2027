/* ============================================================
   MODULE NHẬP ĐỀ GỐC
   Nhập nguyên một đề từ: tệp PDF, tệp Word, gói LaTeX ex_test,
   hoặc văn bản dán trực tiếp. Công thức giữ ở dạng LaTeX $...$
   để hiển thị bằng MathJax và chuyển sang MathType khi xuất Word.
   ============================================================ */
MENU.teacher[0][1].splice(3, 0, ["importde","Nhập đề gốc"]);
MENU.admin[0][1].splice(3, 0, ["importde","Nhập đề gốc"]);

var Imp = { raw:"", parsed:[] };

/* ---------- Đọc tệp ---------- */
Imp.pdf = function(input){
  var f = input.files[0]; if(!f) return;
  if(typeof pdfjsLib === "undefined"){ toast("Chưa tải được thư viện PDF — kiểm tra kết nối mạng."); return; }
  toast("Đang đọc tệp PDF…");
  var fr = new FileReader();
  fr.onload = function(){
    pdfjsLib.getDocument({ data: new Uint8Array(fr.result) }).promise.then(function(doc){
      var pages = [], n = doc.numPages, done = 0;
      var read = function(i){
        doc.getPage(i).then(function(pg){ return pg.getTextContent(); }).then(function(tc){
          var last = null, txt = "";
          tc.items.forEach(function(it){
            if(last !== null && Math.abs(last - it.transform[5]) > 3) txt += "\n";
            txt += it.str + " "; last = it.transform[5];
          });
          pages[i-1] = txt; done++;
          if(done === n){ Imp.raw = pages.join("\n"); $("impRaw").value = Imp.raw;
            toast("Đã đọc "+n+" trang. Kiểm tra rồi bấm Phân tích đề."); }
          else read(i+1);
        }).catch(function(){ done++; if(done===n){ Imp.raw = pages.join("\n"); $("impRaw").value = Imp.raw; } });
      };
      read(1);
    }).catch(function(e){ toast("Không đọc được PDF: "+e.message); });
  };
  fr.readAsArrayBuffer(f);
};
Imp.docx = function(input){
  var f = input.files[0]; if(!f) return;
  if(typeof mammoth === "undefined"){ toast("Chưa tải được thư viện đọc Word."); return; }
  var fr = new FileReader();
  fr.onload = function(){
    mammoth.extractRawText({ arrayBuffer: fr.result }).then(function(r){
      Imp.raw = r.value; $("impRaw").value = Imp.raw;
      toast("Đã đọc tệp Word. Công thức MathType nhúng dạng đối tượng sẽ không đọc được — xem hướng dẫn LaTeX.");
    }).catch(function(e){ toast("Không đọc được tệp Word: "+e.message); });
  };
  fr.readAsArrayBuffer(f);
};
Imp.tex = function(input){
  var f = input.files[0]; if(!f) return;
  var fr = new FileReader();
  fr.onload = function(){ Imp.raw = fr.result; $("impRaw").value = Imp.raw; $("impMode").value = "tex";
    toast("Đã nạp tệp LaTeX. Bấm Phân tích đề."); };
  fr.readAsText(f, "UTF-8");
};

/* ---------- Phân tích đề dạng văn bản Việt Nam ---------- */
Imp.clean = function(t){
  return String(t||"")
    .replace(/\r/g,"")
    .replace(/[ \t]+/g," ")
    .replace(/\u00a0/g," ")
    .replace(/\n{3,}/g,"\n\n");
};
Imp.parseExam = function(text){
  var t = Imp.clean(text), out = [];
  /* tách phần đáp án nếu có */
  var keyIdx = t.search(/(ĐÁP ÁN|BẢNG ĐÁP ÁN|HƯỚNG DẪN CHẤM)/i);
  var keyText = keyIdx > 0 ? t.slice(keyIdx) : "";
  if(keyIdx > 0) t = t.slice(0, keyIdx);
  /* xác định phần */
  var partOf = function(pos){
    var head = t.slice(0, pos).toUpperCase();
    var i1 = head.lastIndexOf("PHẦN I"), i2 = head.lastIndexOf("PHẦN II"), i3 = head.lastIndexOf("PHẦN III");
    if(i3 >= 0 && i3 >= i2 && i3 >= i1) return "TLN";
    if(i2 >= 0 && i2 >= i1) return "DS";
    return null;
  };
  var re = /(?:^|\n)\s*C[âa]u\s*(\d+)\s*[.:)]\s*/gi, m, marks = [];
  while((m = re.exec(t)) !== null) marks.push({ no:+m[1], start:m.index + m[0].length, head:m.index });
  marks.forEach(function(mk, i){
    var body = t.slice(mk.start, i+1 < marks.length ? marks[i+1].head : t.length).trim();
    var hint = partOf(mk.head);
    var q = { id:uid("q"), content:"", options:[], statements:[], short:"", explain:"",
      level:"NB", source:"import", imgs:[], draft:true, no:mk.no, createdAt:Date.now() };
    var optRe = /(?:^|\s)([A-D])[.)]\s+/g, opts = [], om;
    while((om = optRe.exec(body)) !== null) opts.push({ L:om[1], at:om.index, end:om.index + om[0].length });
    var stRe = /(?:^|\s|\n)([a-d])\)\s+/g, sts = [], sm;
    while((sm = stRe.exec(body)) !== null) sts.push({ L:sm[1], at:sm.index, end:sm.index + sm[0].length });
    var seqOK = function(arr, letters){
      if(arr.length < 3) return false;
      return arr.slice(0,4).every(function(x,k){ return x.L === letters[k]; });
    };
    if(hint !== "DS" && hint !== "TLN" && seqOK(opts, ["A","B","C","D"])){
      q.type = "TN";
      q.content = body.slice(0, opts[0].at).trim();
      opts.slice(0,4).forEach(function(o,k){
        var end = (k+1 < Math.min(opts.length,4)) ? opts[k+1].at : body.length;
        q.options.push(body.slice(o.end, end).trim());
      });
    } else if(hint === "DS" || seqOK(sts, ["a","b","c","d"])){
      q.type = "DS";
      q.content = sts.length ? body.slice(0, sts[0].at).trim() : body;
      sts.slice(0,4).forEach(function(o,k){
        var end = (k+1 < Math.min(sts.length,4)) ? sts[k+1].at : body.length;
        q.statements.push({ t: body.slice(o.end, end).trim(), ok:true });
      });
    } else {
      q.type = "TLN"; q.content = body;
    }
    out.push(q);
  });
  /* đọc bảng đáp án nếu có */
  if(keyText){
    var kv = {}, km, kre = /(\d+)\s*[.:\-]?\s*([A-D]|[ĐDS]{4}|[-+]?\d+[.,]?\d*)/g;
    while((km = kre.exec(keyText)) !== null) kv[+km[1]] = km[2];
    out.forEach(function(q){
      var a = kv[q.no]; if(!a) return;
      if(q.type==="TN" && /^[A-D]$/.test(a)){ q.answer = a; q.draft = false; }
      else if(q.type==="DS" && /^[ĐDS]{4}$/i.test(a)){
        q.statements.forEach(function(s,i){ s.ok = /[ĐD]/i.test(a[i]); }); q.draft = false;
      } else if(q.type==="TLN"){ q.short = a; q.draft = false; }
    });
  }
  return out.filter(function(q){ return q.content; });
};

/* ---------- Phân tích gói LaTeX ex_test ---------- */
Imp.parseLatex = function(text){
  var t = String(text||"").replace(/\r/g,""), out = [];
  var braces = function(str, from){          /* lấy nội dung trong cặp { } cân bằng */
    var i = str.indexOf("{", from); if(i < 0) return null;
    var d = 0, j = i;
    for(; j < str.length; j++){ if(str[j]==="{") d++; else if(str[j]==="}"){ d--; if(!d) break; } }
    return { text: str.slice(i+1, j), end: j+1 };
  };
  var blocks = t.match(/\\begin\{(ex|bt|vd)\}[\s\S]*?\\end\{\1\}/g) || [];
  blocks.forEach(function(b){
    var body = b.replace(/\\begin\{(ex|bt|vd)\}(\s*%\[[^\]]*\])*/,"").replace(/\\end\{(ex|bt|vd)\}/,"");
    var q = { id:uid("q"), content:"", options:[], statements:[], short:"", explain:"",
      level:"NB", source:"import", imgs:[], draft:false, createdAt:Date.now() };
    /* lời giải */
    var lg = body.indexOf("\\loigiai");
    if(lg >= 0){ var g = braces(body, lg); if(g){ q.explain = Imp.tex2txt(g.text); body = body.slice(0, lg) + body.slice(g.end); } }
    /* trả lời ngắn */
    var sa = body.search(/\\shortans/);
    if(sa >= 0){
      var s = braces(body, sa);
      q.type = "TLN"; q.short = Imp.tex2txt((s? s.text : "")).replace(/\$/g,"").replace(/^\s*\\?\s*/,"").trim();
      q.content = Imp.tex2txt(body.slice(0, sa));
      out.push(q); return;
    }
    /* đúng sai */
    var tf = body.search(/\\choiceTF|\\choiceTFt/);
    if(tf >= 0){
      q.type = "DS"; q.content = Imp.tex2txt(body.slice(0, tf));
      var rest = body.slice(tf), pos = rest.indexOf("{");
      for(var k=0; k<4; k++){
        var it = braces(rest, pos); if(!it) break;
        var raw = it.text;
        q.statements.push({ t: Imp.tex2txt(raw.replace(/\\True/g,"")).trim(), ok: /\\True/.test(raw) });
        pos = it.end;
      }
      out.push(q); return;
    }
    /* trắc nghiệm */
    var ch = body.search(/\\choice/);
    if(ch >= 0){
      q.type = "TN"; q.content = Imp.tex2txt(body.slice(0, ch));
      var r2 = body.slice(ch), p2 = r2.indexOf("{"), right = -1;
      for(var i2=0; i2<4; i2++){
        var o = braces(r2, p2); if(!o) break;
        if(/\\True/.test(o.text)) right = i2;
        q.options.push(Imp.tex2txt(o.text.replace(/\\True/g,"")).trim());
        p2 = o.end;
      }
      q.answer = right >= 0 ? "ABCD"[right] : "A";
      if(right < 0) q.draft = true;
      out.push(q); return;
    }
    q.type = "TLN"; q.content = Imp.tex2txt(body); q.draft = true;
    if(q.content.trim()) out.push(q);
  });
  return out;
};
/* Giữ nguyên công thức toán, bỏ lệnh định dạng của LaTeX */
Imp.tex2txt = function(t){
  return String(t||"")
    .replace(/%\[[^\]]*\]/g,"")
    .replace(/\\begin\{(center|enumerate|itemize)\}|\\end\{(center|enumerate|itemize)\}/g,"")
    .replace(/\\immini\s*(\[[^\]]*\])?/g,"")
    .replace(/\\(textbf|textit|emph|text)\{([^{}]*)\}/g,"$2")
    .replace(/\\item\s*/g,"\n")
    .replace(/\\hfill|\\noindent|\\medskip|\\smallskip|\\bigskip|\\vspace\*?\{[^}]*\}/g,"")
    .replace(/\\\\/g,"\n")
    .replace(/[ \t]{2,}/g," ")
    .trim();
};

/* ---------- Giao diện ---------- */
Views.importde = function(){
  var chaps = (CURRICULUM[BankF.sub]||{})[BankF.grade] || [];
  var bais = chaps.length ? baiOf(BankF.sub, BankF.grade, BankF.chapter || chaps[0]) : [];
  var fs = (typeof myFolders === "function") ? myFolders() : [];
  return '<div class="page-head"><div><h1>Nhập đề gốc</h1>'
   + '<p>Nạp nguyên một đề từ tệp PDF, tệp Word, gói LaTeX ex_test hoặc dán văn bản. Hệ thống tách từng câu, nhận diện phương án và đáp án, đưa thẳng vào ngân hàng dùng chung.</p></div></div>'
   + '<div class="card"><h3>1. Chọn nguồn</h3><div class="row">'
   + '<div class="field"><label>Tệp PDF</label><input type="file" accept="application/pdf" onchange="Imp.pdf(this)"></div>'
   + '<div class="field"><label>Tệp Word (.docx)</label><input type="file" accept=".docx" onchange="Imp.docx(this)"></div>'
   + '<div class="field"><label>Tệp LaTeX (.tex) — gói ex_test</label><input type="file" accept=".tex,.txt" onchange="Imp.tex(this)"></div>'
   + '</div>'
   + '<div class="field"><label>Nội dung đề (có thể dán trực tiếp và sửa trước khi phân tích)</label>'
   + '<textarea id="impRaw" style="min-height:200px" placeholder="Dán nguyên đề vào đây: Câu 1. … A. … B. … C. … D. …"></textarea></div>'
   + '<div class="row"><div class="field"><label>Kiểu nội dung</label><select id="impMode">'
   + '<option value="auto">Đề Việt Nam (Câu 1., A. B. C. D., PHẦN I/II/III)</option>'
   + '<option value="tex">Gói LaTeX ex_test (\\begin{ex} … \\choice … \\loigiai)</option></select></div>'
   + '<div class="field" style="display:flex;align-items:flex-end"><button class="btn block" onclick="Imp.run()">Phân tích đề</button></div>'
   + '<div class="field" style="display:flex;align-items:flex-end"><button class="btn ghost block" onclick="Imp.help()">Cách chuẩn hoá công thức MathType</button></div></div></div>'
   + '<div class="card"><h3>2. Gắn vào chương trình</h3><div class="row">'
   + '<div class="field"><label>Môn</label><select id="ipSub" onchange="Imp.setF()">'+optSubjects(BankF.sub)+'</select></div>'
   + '<div class="field"><label>Khối</label><select id="ipGrade" onchange="Imp.setF()">'+optGrades(BankF.grade)+'</select></div>'
   + '<div class="field"><label>Chương</label><select id="ipChap" onchange="Imp.setF()">'+chaps.map(function(c){ return '<option '+(c===BankF.chapter?"selected":"")+'>'+esc(c)+'</option>'; }).join("")+'</select></div>'
   + '<div class="field"><label>Bài</label><select id="ipBai">'+bais.map(function(b){ return '<option>'+esc(b)+'</option>'; }).join("")+'</select></div>'
   + '<div class="field"><label>Dạng</label><select id="ipDang">'+dangOf(BankF.sub).map(function(d){ return '<option>'+esc(d)+'</option>'; }).join("")+'</select></div>'
   + '<div class="field"><label>Thư mục</label><select id="ipFolder"><option value="">Ngân hàng chung</option>'
   + fs.map(function(f){ return '<option value="'+f.id+'">'+esc(f.name)+'</option>'; }).join("")+'</select></div>'
   + '</div></div>'
   + '<div class="card"><h3>3. Xem trước và lưu</h3><div id="impOut"><p class="muted">Chưa có câu nào được phân tích.</p></div></div>';
};
Imp.setF = function(){
  BankF.sub = $("ipSub").value; BankF.grade = +$("ipGrade").value; BankF.chapter = $("ipChap").value;
  var raw = $("impRaw").value, mode = $("impMode").value;
  Router.go("importde");
  setTimeout(function(){ if($("impRaw")){ $("impRaw").value = raw; $("impMode").value = mode; } }, 0);
};
Imp.run = function(){
  var text = $("impRaw").value;
  if(!text.trim()){ toast("Chưa có nội dung đề."); return; }
  Imp.parsed = $("impMode").value === "tex" ? Imp.parseLatex(text) : Imp.parseExam(text);
  if(!Imp.parsed.length){ toast("Không tách được câu nào — kiểm tra lại định dạng."); return; }
  var nd = Imp.parsed.filter(function(q){ return q.draft; }).length;
  $("impOut").innerHTML = '<p><span class="pill ok">'+Imp.parsed.length+' câu</span> '
    + (nd? '<span class="pill amber">'+nd+' câu chưa có đáp án — cần kiểm tra</span>' : '<span class="pill ok">Đã có đáp án đầy đủ</span>')
    + ' <button class="btn" onclick="Imp.save()">Lưu vào ngân hàng</button></p>'
    + Imp.parsed.slice(0,30).map(function(q,i){
        var body = q.type==="TN" ? (q.options||[]).map(function(o,j){ return '<div class="opt '+(q.answer==="ABCD"[j]?"right":"")+'"><b>'+"ABCD"[j]+'.</b> '+esc(o)+'</div>'; }).join("")
          : q.type==="DS" ? (q.statements||[]).map(function(s,j){ return '<div class="dsrow"><span class="st"><b>'+"abcd"[j]+')</b> '+esc(s.t)+'</span><span class="pill '+(s.ok?"ok":"rose")+'">'+(s.ok?"Đúng":"Sai")+'</span></div>'; }).join("")
          : '<div class="pill '+(q.short?"ok":"gray")+'">Đáp án: '+esc(q.short||"chưa có")+'</div>';
        return '<div class="qitem"><div style="margin-bottom:6px"><span class="pill">'+typeName(q.type)+'</span> '
          + (q.draft? '<span class="pill amber">Cần bổ sung đáp án</span>':'') + '</div>'
          + '<b>Câu '+(i+1)+'.</b> ' + esc(q.content).replace(/\n/g,"<br>") + body
          + (q.explain? '<div class="muted" style="margin-top:6px"><b>Lời giải:</b> '+esc(q.explain)+'</div>':'') + '</div>';
      }).join("")
    + (Imp.parsed.length>30? '<p class="muted">Hiển thị 30 câu đầu.</p>':'');
  setTimeout(mj, 0);
};
Imp.save = function(){
  var sub = $("ipSub").value, gr = +$("ipGrade").value, ch = $("ipChap").value,
      bai = $("ipBai").value, dang = $("ipDang").value, fol = $("ipFolder").value;
  Imp.parsed.forEach(function(q){
    q.subject = sub; q.grade = gr; q.chapter = ch; q.lesson = bai; q.dang = dang;
    if(fol) q.folderId = fol;
    q.owner = ME.email;
    delete q.no;
  });
  S.questions = S.questions.concat(Imp.parsed);
  Store.save("questions");
  toast("Đã lưu "+Imp.parsed.length+" câu vào ngân hàng");
  Imp.parsed = []; Router.go("bank");
};
Imp.help = function(){
  modal('<h2>Công thức toán khi nhập đề</h2>'
   + '<h3>Từ Word có MathType</h3>'
   + '<ol class="help"><li>Mở tệp Word, vào <code>MathType → Preferences → Cut and Copy Preferences</code>, chọn bản dịch <code>LaTeX 2.09 and later</code>.</li>'
   + '<li>Bôi đen toàn bộ đề, Ctrl+C, dán vào ô nội dung ở bước 1. Công thức thành dạng <code>$x^{2}+1$</code> và hiển thị đúng trong hệ thống.</li>'
   + '<li>Nếu tải thẳng tệp .docx, phần chữ đọc được nhưng công thức nhúng dạng đối tượng MathType sẽ mất — nên dùng cách chép qua LaTeX ở trên.</li></ol>'
   + '<h3>Từ PDF</h3><p>Hệ thống đọc lớp văn bản của PDF. Với PDF bản scan (ảnh chụp) thì không có lớp chữ, cần dùng phần mềm nhận dạng chữ trước khi nhập.</p>'
   + '<h3>Từ gói LaTeX ex_test</h3>'
   + '<p>Nhận các khối <code>\\begin{ex} … \\end{ex}</code> (và <code>bt</code>, <code>vd</code>) với:</p>'
   + '<pre class="log">\\begin{ex}%[Nguồn]%[1D1B1]\nCho hàm số $y=x^{2}+3x$. Tính $y\'(1)$.\n\\choice\n{$3$}\n{\\True $5$}\n{$4$}\n{$2$}\n\\loigiai{$y\'=2x+3$ nên $y\'(1)=5$.}\n\\end{ex}\n\n\\begin{ex}\nXét tính đúng sai:\n\\choiceTF\n{\\True Hàm số có hai cực trị}\n{$y\'=3x^{2}-3$ \\True}\n{Hàm số đồng biến trên $\\mathbb{R}$}\n{\\True Đồ thị qua gốc toạ độ}\n\\end{ex}\n\n\\begin{ex}\nTính $\\int_{0}^{3}2x\\,dx$.\n\\shortans{$9$}\n\\end{ex}</pre>'
   + '<p class="muted">Câu đánh dấu <code>\\True</code> là phương án đúng; <code>\\shortans</code> cho câu trả lời ngắn; <code>\\loigiai</code> lấy làm lời giải. Câu nào thiếu đánh dấu sẽ được ghi nhãn “Cần bổ sung đáp án”.</p>'
   + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
};
