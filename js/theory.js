/* ============================================================
   MODULE LÝ THUYẾT — HỆ THỐNG PHỤC VỤ DẠY HỌC
   Tự sinh phần lý thuyết đầy đủ cho từng bài, kèm hình vẽ,
   giáo viên không phải tự gõ. Công thức viết theo LaTeX $...$.
   ============================================================ */

/* ---------- Hình minh hoạ cho lý thuyết ---------- */
var TFig = {
  wrap: function(inner,w,h){
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'
      + '<rect width="'+w+'" height="'+h+'" fill="#ffffff" rx="10"/>' + inner + '</svg>');
  },
  axes: function(w,h,ox,oy,lx,ly){
    return '<line x1="12" y1="'+oy+'" x2="'+(w-12)+'" y2="'+oy+'" stroke="#334155" stroke-width="1.2" marker-end="url(#a)"/>'
     + '<line x1="'+ox+'" y1="'+(h-12)+'" x2="'+ox+'" y2="12" stroke="#334155" stroke-width="1.2"/>'
     + '<text x="'+(w-20)+'" y="'+(oy-8)+'" font-size="12" fill="#334155">'+(lx||"x")+'</text>'
     + '<text x="'+(ox+8)+'" y="20" font-size="12" fill="#334155">'+(ly||"y")+'</text>'
     + '<text x="'+(ox-14)+'" y="'+(oy+16)+'" font-size="11" fill="#64748b">O</text>';
  },
  curve: function(f, ox, oy, ux, uy, x0, x1, color){
    var pts=[];
    for(var x=x0;x<=x1;x+=0.08){ var y=f(x); if(!isFinite(y)) continue;
      var X=ox+x*ux, Y=oy-y*uy; if(Y>-60 && Y<400) pts.push(X.toFixed(1)+","+Y.toFixed(1)); }
    return '<polyline points="'+pts.join(" ")+'" fill="none" stroke="'+(color||"#3b4ff2")+'" stroke-width="2.4"/>';
  },
  cubic: function(){
    var f = function(x){ return x*x*x - 3*x; };
    var g = TFig.axes(360,240,180,130) + TFig.curve(f,180,130,34,17,-2.6,2.6)
      + '<circle cx="'+(180-34)+'" cy="'+(130-2*17)+'" r="4" fill="#0e9384"/>'
      + '<circle cx="'+(180+34)+'" cy="'+(130+2*17)+'" r="4" fill="#b54708"/>'
      + '<text x="'+(180-84)+'" y="'+(130-2*17-8)+'" font-size="11" fill="#0e9384">Cực đại (-1; 2)</text>'
      + '<text x="'+(180+44)+'" y="'+(130+2*17+16)+'" font-size="11" fill="#b54708">Cực tiểu (1; -2)</text>';
    return TFig.wrap(g,360,240);
  },
  area: function(){
    var f = function(x){ return 0.4*x*x + 1; }, ox=70, oy=200, ux=48, uy=26, poly=[];
    for(var x=0.5;x<=3.0;x+=0.05) poly.push((ox+x*ux).toFixed(1)+","+(oy-f(x)*uy).toFixed(1));
    var g = TFig.axes(360,240,ox,oy) + TFig.curve(f,ox,oy,ux,uy,-0.2,3.4)
      + '<polygon points="'+(ox+0.5*ux)+','+oy+' '+poly.join(" ")+' '+(ox+3*ux)+','+oy+'" fill="#3b4ff2" opacity="0.16"/>'
      + '<line x1="'+(ox+0.5*ux)+'" y1="'+oy+'" x2="'+(ox+0.5*ux)+'" y2="'+(oy-f(0.5)*uy)+'" stroke="#3b4ff2" stroke-dasharray="4 3"/>'
      + '<line x1="'+(ox+3*ux)+'" y1="'+oy+'" x2="'+(ox+3*ux)+'" y2="'+(oy-f(3)*uy)+'" stroke="#3b4ff2" stroke-dasharray="4 3"/>'
      + '<text x="'+(ox+0.5*ux-6)+'" y="'+(oy+16)+'" font-size="11" fill="#334155">a</text>'
      + '<text x="'+(ox+3*ux-4)+'" y="'+(oy+16)+'" font-size="11" fill="#334155">b</text>'
      + '<text x="'+(ox+1.4*ux)+'" y="'+(oy-30)+'" font-size="12" fill="#1b2a4e">S = ∫ f(x)dx</text>';
    return TFig.wrap(g,360,240);
  },
  oxyz: function(){
    var g = '<line x1="60" y1="180" x2="320" y2="180" stroke="#334155" stroke-width="1.4"/>'
      + '<line x1="60" y1="180" x2="60" y2="24" stroke="#334155" stroke-width="1.4"/>'
      + '<line x1="60" y1="180" x2="150" y2="230" stroke="#334155" stroke-width="1.4"/>'
      + '<text x="322" y="176" font-size="12">x</text><text x="48" y="24" font-size="12">z</text><text x="150" y="242" font-size="12">y</text>'
      + '<line x1="60" y1="180" x2="230" y2="70" stroke="#3b4ff2" stroke-width="2.4" />'
      + '<circle cx="230" cy="70" r="4" fill="#3b4ff2"/><text x="236" y="66" font-size="12" fill="#3b4ff2">M(x; y; z)</text>'
      + '<line x1="230" y1="70" x2="230" y2="180" stroke="#94a3b8" stroke-dasharray="4 3"/>'
      + '<text x="46" y="196" font-size="11" fill="#64748b">O</text>';
    return TFig.wrap(g,360,250);
  },
  tree: function(){
    var g = '<circle cx="40" cy="120" r="6" fill="#101a35"/><text x="16" y="146" font-size="11">Phép thử</text>'
      + '<line x1="46" y1="120" x2="150" y2="60" stroke="#3b4ff2" stroke-width="2"/><line x1="46" y1="120" x2="150" y2="180" stroke="#0e9384" stroke-width="2"/>'
      + '<text x="70" y="80" font-size="11" fill="#3b4ff2">P(A)</text><text x="70" y="168" font-size="11" fill="#0e9384">P(Ā)</text>'
      + '<circle cx="156" cy="60" r="6" fill="#3b4ff2"/><circle cx="156" cy="180" r="6" fill="#0e9384"/>'
      + '<line x1="162" y1="60" x2="266" y2="30" stroke="#64748b" stroke-width="1.6"/><line x1="162" y1="60" x2="266" y2="96" stroke="#64748b" stroke-width="1.6"/>'
      + '<line x1="162" y1="180" x2="266" y2="150" stroke="#64748b" stroke-width="1.6"/><line x1="162" y1="180" x2="266" y2="212" stroke="#64748b" stroke-width="1.6"/>'
      + '<text x="272" y="34" font-size="11">B | A</text><text x="272" y="100" font-size="11">B̄ | A</text>'
      + '<text x="272" y="154" font-size="11">B | Ā</text><text x="272" y="216" font-size="11">B̄ | Ā</text>';
    return TFig.wrap(g,360,240);
  },
  histogram: function(){
    var v=[4,9,14,11,6], g='<line x1="40" y1="190" x2="330" y2="190" stroke="#334155"/><line x1="40" y1="20" x2="40" y2="190" stroke="#334155"/>';
    v.forEach(function(n,i){ var h=n*10, x=52+i*54;
      g += '<rect x="'+x+'" y="'+(190-h)+'" width="50" height="'+h+'" fill="#3b4ff2" opacity="'+(0.35+i*0.12)+'"/>'
        + '<text x="'+(x+25)+'" y="204" font-size="10" text-anchor="middle" fill="#334155">['+(i*5)+';'+((i+1)*5)+')</text>'
        + '<text x="'+(x+25)+'" y="'+(184-h)+'" font-size="11" text-anchor="middle" fill="#101a35">'+n+'</text>'; });
    g += '<text x="150" y="16" font-size="11" fill="#64748b">Tần số của mẫu ghép nhóm</text>';
    return TFig.wrap(g,360,215);
  },
  unitCircle: function(){
    var g = '<circle cx="170" cy="120" r="90" fill="none" stroke="#3b4ff2" stroke-width="2"/>'
      + '<line x1="60" y1="120" x2="290" y2="120" stroke="#334155"/><line x1="170" y1="16" x2="170" y2="228" stroke="#334155"/>'
      + '<line x1="170" y1="120" x2="234" y2="56" stroke="#0e9384" stroke-width="2.4"/>'
      + '<circle cx="234" cy="56" r="4" fill="#0e9384"/>'
      + '<text x="240" y="52" font-size="11" fill="#0e9384">M(cos α; sin α)</text>'
      + '<path d="M 200 120 A 30 30 0 0 0 192 100" fill="none" stroke="#b54708"/><text x="196" y="112" font-size="11" fill="#b54708">α</text>'
      + '<text x="292" y="116" font-size="11">cos</text><text x="176" y="20" font-size="11">sin</text>';
    return TFig.wrap(g,360,240);
  },
  expLog: function(){
    var g = TFig.axes(360,230,140,150)
      + TFig.curve(function(x){ return Math.pow(2,x); },140,150,32,20,-3,2.6,"#3b4ff2")
      + TFig.curve(function(x){ return x>0.05? Math.log(x)/Math.log(2) : NaN; },140,150,32,20,0.06,6,"#0e9384")
      + '<line x1="20" y1="30" x2="330" y2="'+(150+140-30)+'" stroke="#cbd5e1" stroke-dasharray="5 4"/>'
      + '<text x="212" y="44" font-size="11" fill="#3b4ff2">y = 2^x</text>'
      + '<text x="250" y="120" font-size="11" fill="#0e9384">y = log₂x</text>';
    return TFig.wrap(g,360,230);
  },
  mind: function(title, branches){
    var w=380, h=250, cx=w/2, cy=h/2, g='';
    g += '<ellipse cx="'+cx+'" cy="'+cy+'" rx="86" ry="30" fill="#101a35"/>'
      + '<text x="'+cx+'" y="'+(cy+4)+'" font-size="12" fill="#fff" text-anchor="middle">'
      + (title.length>22? title.slice(0,21)+"…" : title) + '</text>';
    var pos = [[40,40],[w-40,40],[40,h-30],[w-40,h-30],[cx,26],[cx,h-16]];
    branches.slice(0,6).forEach(function(b,i){
      var p = pos[i], anchor = p[0]<cx? "start" : p[0]>cx? "end" : "middle";
      g += '<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="#94a3b8" stroke-width="1.6"/>'
        + '<text x="'+p[0]+'" y="'+p[1]+'" font-size="11" fill="#1b2a4e" text-anchor="'+anchor+'">'
        + (b.length>26? b.slice(0,25)+"…" : b) + '</text>';
    });
    return TFig.wrap(g,w,h);
  }
};

/* ---------- Ngân hàng lý thuyết theo chủ đề ---------- */
var TOPICS = [
 { key:/đạo hàm|khảo sát|cực trị/i, build:function(ch){ return [
   { h:"1. Định nghĩa và ý nghĩa của đạo hàm",
     body:"Đạo hàm của hàm số $y=f(x)$ tại điểm $x_{0}$ là $f'(x_{0})=\\lim\\limits_{x\\to x_{0}}\\dfrac{f(x)-f(x_{0})}{x-x_{0}}$ nếu giới hạn này tồn tại hữu hạn.\nÝ nghĩa hình học: $f'(x_{0})$ là hệ số góc của tiếp tuyến với đồ thị tại điểm $M(x_{0};f(x_{0}))$; tiếp tuyến có phương trình $y=f'(x_{0})(x-x_{0})+f(x_{0})$.\nÝ nghĩa thực tiễn: đạo hàm là tốc độ biến thiên tức thời — vận tốc $v(t)=s'(t)$, gia tốc $a(t)=v'(t)$." },
   { h:"2. Bảng đạo hàm và quy tắc tính",
     body:"$(x^{n})'=nx^{n-1}$; $(\\sqrt{x})'=\\dfrac{1}{2\\sqrt{x}}$; $(\\sin x)'=\\cos x$; $(\\cos x)'=-\\sin x$; $(e^{x})'=e^{x}$; $(\\ln x)'=\\dfrac{1}{x}$.\nQuy tắc: $(u\\pm v)'=u'\\pm v'$; $(uv)'=u'v+uv'$; $\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^{2}}$; đạo hàm hàm hợp $\\big(f(u)\\big)'=f'(u)\\cdot u'$." },
   { h:"3. Tính đơn điệu và cực trị",
     body:"Trên khoảng $K$: nếu $f'(x)>0$ thì hàm số đồng biến, nếu $f'(x)<0$ thì nghịch biến.\nĐiểm cực trị là điểm mà $f'(x)$ đổi dấu: đổi từ dương sang âm cho cực đại, từ âm sang dương cho cực tiểu. Hình bên minh hoạ hàm số $y=x^{3}-3x$ có cực đại tại $x=-1$ và cực tiểu tại $x=1$.",
     img: TFig.cubic() },
   { h:"4. Tiệm cận và các bước khảo sát",
     body:"Tiệm cận đứng: $\\lim\\limits_{x\\to x_{0}^{\\pm}}f(x)=\\pm\\infty$. Tiệm cận ngang: $\\lim\\limits_{x\\to\\pm\\infty}f(x)=y_{0}$.\nCác bước khảo sát: tìm tập xác định → tính $f'$, lập bảng biến thiên → tìm cực trị, giới hạn, tiệm cận → lập bảng giá trị → vẽ đồ thị." },
   { h:"5. Giá trị lớn nhất, nhỏ nhất và bài toán tối ưu",
     body:"Trên đoạn $[a;b]$: tính $f$ tại các điểm tới hạn trong khoảng và tại hai đầu mút, rồi so sánh.\nBài toán thực tiễn thường quy về: lập hàm số mô tả đại lượng cần tối ưu, tìm điều kiện của biến, khảo sát trên miền đó (ví dụ: hộp có thể tích lớn nhất, chi phí sản xuất nhỏ nhất)." },
   { h:"6. Lỗi thường gặp",
     body:"Quên tập xác định trước khi xét dấu $f'$; kết luận cực trị chỉ dựa vào $f'(x_{0})=0$ mà không xét đổi dấu; nhầm tiệm cận ngang với giá trị lớn nhất; khi tìm giá trị lớn nhất trên đoạn lại bỏ sót hai đầu mút." } ]; } },

 { key:/nguyên hàm|tích phân/i, build:function(ch){ return [
   { h:"1. Nguyên hàm",
     body:"Hàm $F$ gọi là nguyên hàm của $f$ trên $K$ nếu $F'(x)=f(x)$ với mọi $x\\in K$. Khi đó mọi nguyên hàm của $f$ có dạng $F(x)+C$.\nBảng cơ bản: $\\int x^{n}dx=\\dfrac{x^{n+1}}{n+1}+C\\ (n\\neq -1)$; $\\int \\dfrac{1}{x}dx=\\ln|x|+C$; $\\int e^{x}dx=e^{x}+C$; $\\int \\cos x\\,dx=\\sin x+C$; $\\int \\sin x\\,dx=-\\cos x+C$." },
   { h:"2. Hai kĩ thuật tính thường dùng",
     body:"Đổi biến: đặt $t=u(x)$ thì $dt=u'(x)dx$, đưa tích phân về biến $t$ (nhớ đổi cận khi tính tích phân xác định).\nTừng phần: $\\int u\\,dv=uv-\\int v\\,du$, ưu tiên đặt $u$ là hàm lôgarit hoặc đa thức, $dv$ là phần dễ lấy nguyên hàm." },
   { h:"3. Tích phân xác định",
     body:"$\\int_{a}^{b}f(x)dx=F(b)-F(a)$ với $F$ là một nguyên hàm của $f$.\nTính chất: $\\int_{a}^{b}=-\\int_{b}^{a}$; $\\int_{a}^{b}=\\int_{a}^{c}+\\int_{c}^{b}$; tuyến tính theo hàm dưới dấu tích phân." },
   { h:"4. Ứng dụng hình học",
     body:"Diện tích hình phẳng giới hạn bởi $y=f(x)$, trục hoành và hai đường $x=a$, $x=b$ là $S=\\int_{a}^{b}|f(x)|dx$ (hình bên).\nThể tích khối tròn xoay quanh trục hoành: $V=\\pi\\int_{a}^{b}f^{2}(x)dx$.",
     img: TFig.area() },
   { h:"5. Ứng dụng thực tiễn",
     body:"Quãng đường đi được từ $t_{1}$ đến $t_{2}$: $s=\\int_{t_{1}}^{t_{2}}v(t)dt$. Lượng nước chảy vào bể, lượng điện tiêu thụ, tổng chi phí… đều là tích phân của tốc độ biến thiên theo thời gian." },
   { h:"6. Lỗi thường gặp",
     body:"Quên hằng số $C$ khi tìm nguyên hàm; đổi biến mà không đổi cận; bỏ dấu giá trị tuyệt đối khi tính diện tích lúc đồ thị cắt trục hoành; nhầm $\\int\\dfrac{1}{x}dx$ thành $\\ln x$ mà thiếu dấu giá trị tuyệt đối." } ]; } },

 { key:/toạ độ trong không gian|vectơ và hệ trục|phương pháp toạ độ trong không gian/i, build:function(ch){ return [
   { h:"1. Hệ trục toạ độ Oxyz",
     body:"Ba trục đôi một vuông góc với các vectơ đơn vị $\\vec{i},\\vec{j},\\vec{k}$. Điểm $M(x;y;z)$ ứng với $\\overrightarrow{OM}=x\\vec{i}+y\\vec{j}+z\\vec{k}$ (hình bên).",
     img: TFig.oxyz() },
   { h:"2. Phép toán vectơ",
     body:"Với $\\vec{u}=(a_{1};a_{2};a_{3})$, $\\vec{v}=(b_{1};b_{2};b_{3})$: $\\vec{u}\\pm\\vec{v}=(a_{1}\\pm b_{1};a_{2}\\pm b_{2};a_{3}\\pm b_{3})$, $k\\vec{u}=(ka_{1};ka_{2};ka_{3})$.\nTích vô hướng $\\vec{u}\\cdot\\vec{v}=a_{1}b_{1}+a_{2}b_{2}+a_{3}b_{3}$; độ dài $|\\vec{u}|=\\sqrt{a_{1}^{2}+a_{2}^{2}+a_{3}^{2}}$; hai vectơ vuông góc khi tích vô hướng bằng 0." },
   { h:"3. Mặt phẳng",
     body:"Mặt phẳng qua $M_{0}(x_{0};y_{0};z_{0})$ có vectơ pháp tuyến $\\vec{n}=(A;B;C)$: $A(x-x_{0})+B(y-y_{0})+C(z-z_{0})=0$, viết gọn $Ax+By+Cz+D=0$.\nKhoảng cách từ điểm $M$ đến mặt phẳng: $d=\\dfrac{|Ax_{M}+By_{M}+Cz_{M}+D|}{\\sqrt{A^{2}+B^{2}+C^{2}}}$." },
   { h:"4. Đường thẳng và mặt cầu",
     body:"Đường thẳng qua $M_{0}$ với vectơ chỉ phương $\\vec{u}=(a;b;c)$ có phương trình tham số $x=x_{0}+at$, $y=y_{0}+bt$, $z=z_{0}+ct$.\nMặt cầu tâm $I(a;b;c)$ bán kính $R$: $(x-a)^{2}+(y-b)^{2}+(z-c)^{2}=R^{2}$." },
   { h:"5. Ứng dụng thực tiễn",
     body:"Định vị máy bay, camera, thiết bị bay không người lái; tính khoảng cách an toàn giữa hai vật thể chuyển động; mô hình hoá vị trí trong không gian ba chiều." },
   { h:"6. Lỗi thường gặp",
     body:"Nhầm vectơ pháp tuyến với vectơ chỉ phương; quên chuẩn hoá dấu khi tính khoảng cách; viết phương trình mặt cầu mà không kiểm tra $R>0$." } ]; } },

 { key:/xác suất/i, build:function(ch){ return [
   { h:"1. Biến cố và xác suất cổ điển",
     body:"Không gian mẫu $\\Omega$ gồm tất cả kết quả có thể; xác suất của biến cố $A$ là $P(A)=\\dfrac{n(A)}{n(\\Omega)}$ khi các kết quả đồng khả năng. Luôn có $0\\le P(A)\\le 1$ và $P(\\bar{A})=1-P(A)$." },
   { h:"2. Quy tắc cộng và nhân",
     body:"$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$; nếu $A$, $B$ xung khắc thì $P(A\\cup B)=P(A)+P(B)$.\nHai biến cố độc lập: $P(A\\cap B)=P(A)\\cdot P(B)$." },
   { h:"3. Xác suất có điều kiện",
     body:"$P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}$ với $P(A)>0$; suy ra công thức nhân $P(A\\cap B)=P(A)\\cdot P(B|A)$. Sơ đồ cây bên cạnh giúp hình dung các nhánh và nhân xác suất dọc theo mỗi nhánh.",
     img: TFig.tree() },
   { h:"4. Công thức xác suất toàn phần và Bayes",
     body:"$P(B)=P(A)P(B|A)+P(\\bar{A})P(B|\\bar{A})$; $P(A|B)=\\dfrac{P(A)P(B|A)}{P(B)}$.\nĐây là công cụ đọc kết quả xét nghiệm y tế, đánh giá độ tin cậy của cảnh báo kĩ thuật." },
   { h:"5. Vận dụng thực tiễn",
     body:"Ước lượng rủi ro bảo hiểm, dự báo thời tiết, kiểm tra chất lượng sản phẩm theo lô, phân tích kết quả xét nghiệm dương tính giả." },
   { h:"6. Lỗi thường gặp",
     body:"Nhầm xung khắc với độc lập; cộng xác suất mà quên trừ phần giao; đảo ngược $P(A|B)$ và $P(B|A)$." } ]; } },

 { key:/thống kê|phân tán|số liệu|mẫu số liệu/i, build:function(ch){ return [
   { h:"1. Mẫu số liệu và bảng tần số",
     body:"Mẫu số liệu là dãy giá trị thu được khi khảo sát. Với mẫu ghép nhóm, mỗi nhóm là nửa khoảng $[a_{i};a_{i+1})$ có tần số $n_{i}$ (hình bên).",
     img: TFig.histogram() },
   { h:"2. Số đo xu thế trung tâm",
     body:"Số trung bình $\\bar{x}=\\dfrac{1}{n}\\sum n_{i}c_{i}$ với $c_{i}$ là giá trị đại diện của nhóm.\nTrung vị chia mẫu thành hai nửa; mốt là giá trị có tần số lớn nhất." },
   { h:"3. Số đo mức độ phân tán",
     body:"Khoảng biến thiên $R=x_{\\max}-x_{\\min}$; khoảng tứ phân vị $\\Delta_{Q}=Q_{3}-Q_{1}$.\nPhương sai $s^{2}=\\dfrac{1}{n}\\sum n_{i}(c_{i}-\\bar{x})^{2}$, độ lệch chuẩn $s=\\sqrt{s^{2}}$. Giá trị càng lớn thì số liệu càng phân tán." },
   { h:"4. Phát hiện giá trị bất thường",
     body:"Giá trị nằm ngoài khoảng $[Q_{1}-1{,}5\\Delta_{Q};\\,Q_{3}+1{,}5\\Delta_{Q}]$ được xem là bất thường và cần kiểm tra lại nguồn số liệu." },
   { h:"5. Vận dụng thực tiễn",
     body:"So sánh độ ổn định điểm kiểm tra của hai lớp, đánh giá độ đồng đều của dây chuyền sản xuất, phân tích thời gian chờ ở một dịch vụ công." },
   { h:"6. Lỗi thường gặp",
     body:"Dùng giá trị đầu mút thay cho giá trị đại diện của nhóm; nhầm phương sai với độ lệch chuẩn; kết luận chỉ dựa vào số trung bình mà bỏ qua độ phân tán." } ]; } },

 { key:/lượng giác/i, build:function(ch){ return [
   { h:"1. Đường tròn lượng giác",
     body:"Mỗi góc lượng giác $\\alpha$ ứng với một điểm $M$ trên đường tròn đơn vị, khi đó $\\cos\\alpha$ là hoành độ và $\\sin\\alpha$ là tung độ của $M$ (hình bên).",
     img: TFig.unitCircle() },
   { h:"2. Công thức cơ bản",
     body:"$\\sin^{2}\\alpha+\\cos^{2}\\alpha=1$; $\\tan\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha}$; $1+\\tan^{2}\\alpha=\\dfrac{1}{\\cos^{2}\\alpha}$.\nCông thức cộng: $\\sin(a\\pm b)=\\sin a\\cos b\\pm\\cos a\\sin b$; $\\cos(a\\pm b)=\\cos a\\cos b\\mp\\sin a\\sin b$." },
   { h:"3. Hàm số lượng giác",
     body:"$y=\\sin x$, $y=\\cos x$ tuần hoàn chu kì $2\\pi$, tập giá trị $[-1;1]$; $y=\\tan x$ tuần hoàn chu kì $\\pi$, không xác định tại $x=\\dfrac{\\pi}{2}+k\\pi$." },
   { h:"4. Phương trình lượng giác cơ bản",
     body:"$\\sin x=\\sin\\alpha\\Leftrightarrow x=\\alpha+k2\\pi$ hoặc $x=\\pi-\\alpha+k2\\pi$.\n$\\cos x=\\cos\\alpha\\Leftrightarrow x=\\pm\\alpha+k2\\pi$; $\\tan x=\\tan\\alpha\\Leftrightarrow x=\\alpha+k\\pi$." },
   { h:"5. Vận dụng thực tiễn",
     body:"Mô tả dao động, sóng âm, mực nước thuỷ triều, cường độ dòng điện xoay chiều — các đại lượng biến thiên tuần hoàn theo thời gian." },
   { h:"6. Lỗi thường gặp",
     body:"Quên điều kiện xác định của $\\tan$, $\\cot$; thiếu họ nghiệm thứ hai của phương trình $\\sin$; nhầm chu kì khi hàm số có dạng $\\sin(ax+b)$." } ]; } },

 { key:/mũ|lôgarit|logarit/i, build:function(ch){ return [
   { h:"1. Luỹ thừa và hàm số mũ",
     body:"$a^{m}\\cdot a^{n}=a^{m+n}$; $\\dfrac{a^{m}}{a^{n}}=a^{m-n}$; $(a^{m})^{n}=a^{mn}$; $a^{0}=1$ với $a>0$.\nHàm số $y=a^{x}$ ($a>0,a\\neq1$) có tập xác định $\\mathbb{R}$, tập giá trị $(0;+\\infty)$, đồng biến khi $a>1$." },
   { h:"2. Lôgarit",
     body:"$\\log_{a}b=c\\Leftrightarrow a^{c}=b$ với $a>0,a\\neq1,b>0$.\n$\\log_{a}(xy)=\\log_{a}x+\\log_{a}y$; $\\log_{a}\\dfrac{x}{y}=\\log_{a}x-\\log_{a}y$; $\\log_{a}x^{n}=n\\log_{a}x$; đổi cơ số $\\log_{a}x=\\dfrac{\\log_{b}x}{\\log_{b}a}$." },
   { h:"3. Đồ thị hai hàm số",
     body:"Đồ thị $y=a^{x}$ và $y=\\log_{a}x$ đối xứng nhau qua đường thẳng $y=x$ (hình bên); đồ thị hàm mũ luôn đi qua $(0;1)$, đồ thị hàm lôgarit luôn đi qua $(1;0)$.",
     img: TFig.expLog() },
   { h:"4. Phương trình, bất phương trình",
     body:"Đưa về cùng cơ số hoặc lôgarit hoá hai vế; luôn đặt điều kiện cho biểu thức dưới dấu lôgarit.\nVới $a>1$ thì bất phương trình giữ chiều, với $0<a<1$ thì đổi chiều." },
   { h:"5. Vận dụng thực tiễn",
     body:"Lãi kép $T=A(1+r)^{n}$, tăng trưởng dân số, phân rã phóng xạ $m=m_{0}e^{-\\lambda t}$, thang đo pH và độ Richter." },
   { h:"6. Lỗi thường gặp",
     body:"Quên điều kiện $x>0$; đổi chiều bất phương trình sai khi cơ số nhỏ hơn 1; rút gọn $\\log$ của tổng thành tổng các $\\log$." } ]; } },

 { key:/giới hạn|liên tục/i, build:function(ch){ return [
   { h:"1. Giới hạn của dãy số và hàm số",
     body:"$\\lim u_{n}=L$ nghĩa là $u_{n}$ tiến gần $L$ tuỳ ý khi $n$ đủ lớn. Với hàm số, $\\lim\\limits_{x\\to x_{0}}f(x)=L$ mô tả giá trị hàm số khi $x$ tiến tới $x_{0}$." },
   { h:"2. Quy tắc tính",
     body:"Giới hạn của tổng, hiệu, tích, thương bằng tổng, hiệu, tích, thương các giới hạn (mẫu khác 0). Với dạng vô định $\\dfrac{0}{0}$ hay $\\dfrac{\\infty}{\\infty}$ cần phân tích thành nhân tử, nhân liên hợp hoặc chia cho luỹ thừa bậc cao nhất." },
   { h:"3. Hàm số liên tục",
     body:"Hàm $f$ liên tục tại $x_{0}$ khi $\\lim\\limits_{x\\to x_{0}}f(x)=f(x_{0})$. Hàm đa thức liên tục trên $\\mathbb{R}$; hàm phân thức liên tục trên từng khoảng xác định." },
   { h:"4. Ứng dụng",
     body:"Nếu $f$ liên tục trên $[a;b]$ và $f(a)\\cdot f(b)<0$ thì phương trình $f(x)=0$ có ít nhất một nghiệm trong khoảng $(a;b)$ — cơ sở của phương pháp chia đôi tìm nghiệm gần đúng." },
   { h:"5. Vận dụng thực tiễn",
     body:"Mô hình tăng trưởng dài hạn, tốc độ tức thời, phân tích ổn định của hệ thống kĩ thuật khi thời gian tiến ra vô cùng." },
   { h:"6. Lỗi thường gặp",
     body:"Thay trực tiếp vào dạng vô định; kết luận liên tục mà quên kiểm tra giá trị hàm tại điểm; nhầm giới hạn một bên với giới hạn hai bên." } ]; } },

 { key:/dãy số|cấp số/i, build:function(ch){ return [
   { h:"1. Dãy số",
     body:"Dãy số là hàm số xác định trên tập số nguyên dương, kí hiệu $(u_{n})$. Dãy tăng khi $u_{n+1}>u_{n}$ với mọi $n$, bị chặn trên khi tồn tại $M$ sao cho $u_{n}\\le M$." },
   { h:"2. Cấp số cộng",
     body:"$u_{n+1}=u_{n}+d$; số hạng tổng quát $u_{n}=u_{1}+(n-1)d$; tổng $S_{n}=\\dfrac{n(u_{1}+u_{n})}{2}$." },
   { h:"3. Cấp số nhân",
     body:"$u_{n+1}=u_{n}\\cdot q$; $u_{n}=u_{1}q^{\\,n-1}$; tổng $S_{n}=u_{1}\\dfrac{1-q^{n}}{1-q}$ với $q\\neq1$." },
   { h:"4. Nhận dạng nhanh",
     body:"Hiệu hai số hạng liên tiếp không đổi thì đó là cấp số cộng; thương hai số hạng liên tiếp không đổi thì đó là cấp số nhân." },
   { h:"5. Vận dụng thực tiễn",
     body:"Trả góp đều hằng tháng, tiết kiệm gửi thêm định kì, tăng trưởng theo tỉ lệ phần trăm cố định, xếp ghế theo hàng tăng dần." },
   { h:"6. Lỗi thường gặp",
     body:"Nhầm $n$ với $n-1$ trong công thức tổng quát; áp dụng công thức tổng cấp số nhân khi $q=1$; quên kiểm tra điều kiện của công bội." } ]; } },

 { key:/hệ thức lượng|vectơ/i, build:function(ch){ return [
   { h:"1. Vectơ và các phép toán",
     body:"Vectơ có hướng và độ dài. Quy tắc ba điểm $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$; quy tắc hình bình hành; tích vô hướng $\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos(\\vec{a},\\vec{b})$." },
   { h:"2. Định lí côsin và sin",
     body:"$a^{2}=b^{2}+c^{2}-2bc\\cos A$; $\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}=2R$." },
   { h:"3. Công thức diện tích",
     body:"$S=\\dfrac{1}{2}ab\\sin C=\\dfrac{abc}{4R}=pr=\\sqrt{p(p-a)(p-b)(p-c)}$ với $p$ là nửa chu vi." },
   { h:"4. Giải tam giác",
     body:"Biết ba cạnh dùng định lí côsin tìm góc; biết hai cạnh và góc xen giữa dùng côsin tìm cạnh còn lại; biết một cạnh và hai góc dùng định lí sin." },
   { h:"5. Vận dụng thực tiễn",
     body:"Đo khoảng cách giữa hai điểm không tới được, tính chiều cao cột, xác định hướng đi trong hàng hải và trắc địa." },
   { h:"6. Lỗi thường gặp",
     body:"Dùng định lí sin khi bài toán cho hai cạnh và góc không xen giữa dẫn tới thiếu nghiệm; nhầm dấu khi góc tù; quên đơn vị đo." } ]; } }
];

/* ---------- Sinh lý thuyết ---------- */
var TheoryGen = {
  build: function(sub, gr, ch, bai){
    var t = null;
    if(sub==="Toán"){ var m = TOPICS.filter(function(x){ return x.key.test(ch); })[0]; if(m) t = m.build(ch); }
    if(!t) t = TheoryGen.generic(sub, gr, ch);
    var head = { h:"Mở đầu",
      body: "Bài học thuộc chủ đề “"+ch+"” của môn "+sub+", khối "+gr+", biên soạn theo "+SGK_NOTE
        + ". Phần lý thuyết dưới đây tóm tắt kiến thức trọng tâm cần nắm trước khi làm bài tập." };
    return [head].concat(t);
  },
  generic: function(sub, gr, ch){
    var dangs = dangOf(sub);
    return [
      { h:"1. Sơ đồ kiến thức của chủ đề",
        body:"Chủ đề “"+ch+"” được khai thác theo "+dangs.length+" hướng chính, tương ứng các dạng câu hỏi thường gặp trong đề kiểm tra: "+dangs.join("; ")+".",
        img: TFig.mind(ch, dangs) },
      { h:"2. Khái niệm và thuật ngữ cần nhớ",
        body:"Học sinh cần phát biểu chính xác các khái niệm cốt lõi của “"+ch+"”, phân biệt được thuật ngữ gần nghĩa và nêu ví dụ minh hoạ cho từng khái niệm. Ghi lại vào vở theo mẫu: khái niệm — dấu hiệu nhận biết — ví dụ." },
      { h:"3. Nội dung trọng tâm",
        body:"Bám sát yêu cầu cần đạt của chương trình: trình bày được đặc điểm chính, giải thích được nguyên nhân và mối liên hệ, so sánh được các trường hợp, rút ra được kết luận có căn cứ từ dữ liệu hoặc tư liệu đã học." },
      { h:"4. Phương pháp làm bài",
        body:"Với câu trắc nghiệm: đọc kĩ từ khoá phủ định, loại trừ dần phương án sai.\nVới câu đúng/sai: xét từng ý độc lập, tìm phản ví dụ.\nVới câu trả lời ngắn: viết đúng đơn vị, đúng chính tả thuật ngữ, không diễn giải dài." },
      { h:"5. Liên hệ thực tiễn",
        body:"Tìm một tình huống ở địa phương hoặc trong đời sống hằng ngày liên quan tới “"+ch+"”, mô tả ngắn gọn và chỉ ra kiến thức đã học được vận dụng ở đó." },
      { h:"6. Lỗi thường gặp",
        body:"Học thuộc máy móc mà không hiểu bản chất; nhầm lẫn giữa các khái niệm gần nghĩa; bỏ qua dữ kiện trong bảng số liệu, hình ảnh hoặc tư liệu kèm theo câu hỏi." }
    ];
  }
};
Les.theory = function(sub, ch){ return TheoryGen.build(sub, 12, ch, ""); };

/* Tạo bài học: mỗi bài có lý thuyết riêng theo chương và bài */
(function(){
  var old = Les.autoBuild;
  Les.autoBuild = function(){
    var sub = BankF.sub, gr = BankF.grade, chaps = (CURRICULUM[sub]||{})[gr] || [], made = 0, gen = 0;
    chaps.forEach(function(ch){
      baiOf(sub,gr,ch).forEach(function(b){
        if(S.lessons.some(function(l){ return l.subject===sub && l.grade==gr && l.title===b; })) return;
        var pool = S.questions.filter(function(q){ return q.subject===sub && q.grade==gr && q.chapter===ch && (!q.lesson || q.lesson===b); });
        var items = [];
        ["TN","DS","TLN"].forEach(function(t){
          var have = shuffle(pool.filter(function(q){ return q.type===t; })).slice(0,4);
          if(have.length < 2){
            var extra = Gen.batch(sub, gr, ch, b, dangOf(sub)[0], (function(o){ o[t]=2-have.length; return o; })({}));
            S.questions = S.questions.concat(extra); gen += extra.length; have = have.concat(extra);
          }
          items = items.concat(have.map(function(q){ return q.id; }));
        });
        S.lessons.push({ id:uid("ls"), subject:sub, grade:gr, chapter:ch, title:b,
          theory: TheoryGen.build(sub, gr, ch, b), items:items, createdAt:Date.now() });
        made++;
      });
    });
    Store.save("questions"); Store.save("lessons");
    toast("Đã tạo "+made+" bài học kèm lý thuyết"+(gen? ", sinh thêm "+gen+" câu hỏi":"")); Router.go("lessons");
  };
})();

/* Học sinh học bài: hiển thị lý thuyết có hình và công thức */
Do.learn = function(lessonId){
  var l = lessonById(lessonId);
  if(!l){ toast("Không tìm thấy bài học."); return; }
  var a = myAssignments().filter(function(x){ return x.refId===lessonId; })[0];
  var pr = myProg(lessonId) || { id:uid("pg"), studentId:ME.id, classId:ME.classId, lessonId:lessonId, done:{}, percent:0 };
  Router.cur = "learn_do";
  var qs = (l.items||[]).map(qById).filter(Boolean);
  var h = '<div class="page-head"><div><h1>'+esc(l.title)+'</h1><p>'+esc(l.subject)+' · Khối '+l.grade
        + (a && a.dueAt ? ' · hạn '+fmtDT(a.dueAt) : '') + '</p></div>'
        + '<div style="min-width:150px"><div class="bar"><i id="lbar" style="width:'+pr.percent+'%"></i></div>'
        + '<small id="lpct">'+pr.percent+'% hoàn thành</small></div></div>';
  h += '<div class="card"><h2>Lý thuyết</h2>' + (l.theory||[]).map(function(t,i){
      return '<h3>'+esc(t.h)+'</h3><div>'+esc(t.body).replace(/\n/g,"<br>")+'</div>'
        + (t.img? '<div style="margin:8px 0"><img src="'+t.img+'" alt="hình minh hoạ" style="max-width:100%;border:1px solid var(--line);border-radius:10px"></div>' : '')
        + '<label class="opt"><input type="checkbox" '+(pr.done["th"+i]?"checked":"")+' onchange="Do.mark(\''+lessonId+'\',\'th'+i+'\',this.checked)"><span>Đã đọc xong mục này</span></label>'; }).join('<div class="sep"></div>') + '</div>';
  h += '<div class="card"><h2>Bài tập</h2>' + qs.map(function(q,i){ return Do.exItem(lessonId, q, i, pr); }).join("") + '</div>';
  h += '<div class="card center"><button class="btn ghost" onclick="Router.go(\'hsLearn\')">Quay lại danh sách bài học</button></div>';
  $("view").innerHTML = h;
  setTimeout(mj, 0);
};

/* Xem và xuất bài học phía giáo viên */
Les.view = function(id){
  var l = lessonById(id), qs = (l.items||[]).map(qById).filter(Boolean);
  modal('<h2>'+esc(l.title)+'</h2><p class="muted">'+esc(l.subject)+' · Khối '+l.grade+' · '+esc(l.chapter)+'</p>'
   + (l.theory||[]).map(function(t){
      return '<h3>'+esc(t.h)+'</h3><div>'+esc(t.body).replace(/\n/g,"<br>")+'</div>'
        + (t.img? '<div style="margin:8px 0"><img src="'+t.img+'" style="max-width:100%;border:1px solid var(--line);border-radius:10px"></div>':''); }).join("")
   + '<h3>Bài tập ('+qs.length+' câu)</h3>' + qs.map(Bank.render).join("")
   + '<div class="sep"></div><button class="btn" onclick="Les.word(\''+id+'\')">Xuất bài học ra Word</button> '
   + '<button class="btn ghost" onclick="closeModal(this)">Đóng</button>');
};
Les.word = function(id){
  var l = lessonById(id), qs = (l.items||[]).map(qById).filter(Boolean);
  var b = '<h2 style="text-align:center">'+esc(l.title)+'</h2>'
    + '<p style="text-align:center"><i>'+esc(l.subject)+' — Khối '+l.grade+' · '+esc(l.chapter)+'</i></p>'
    + (l.theory||[]).map(function(t){
        return '<h3>'+esc(t.h)+'</h3><p>'+esc(t.body).replace(/\n/g,"<br>")+'</p>'
          + (t.img? '<p><img src="'+t.img+'" width="360"></p>' : ''); }).join("")
    + '<h3>Bài tập</h3>' + qs.map(function(q,i){
        var o = q.type==="TN" ? '<p>'+(q.options||[]).map(function(x,j){ return '<span class="qnum">'+"ABCD"[j]+'.</span> '+esc(x); }).join("&nbsp;&nbsp;&nbsp;")+'</p>'
              : q.type==="DS" ? q.statements.map(function(s,j){ return '<p><span class="qnum">'+"abcd"[j]+')</span> '+esc(s.t)+'</p>'; }).join("") : "";
        return '<p><span class="qnum">Câu '+(i+1)+'.</span> '+esc(q.content).replace(/\n/g,"<br>")+'</p>'
          + (q.imgs||[]).map(function(s){ return '<p><img src="'+s+'" width="320"></p>'; }).join("") + o; }).join("")
    + '<h3>Đáp án</h3><p>' + qs.map(function(q,i){
        return (i+1)+". " + (q.type==="TN"? q.answer : q.type==="DS"? q.statements.map(function(s){ return s.ok?"Đ":"S"; }).join("") : esc(q.short)); }).join(" · ") + '</p>';
  Word.save("bai-hoc-"+slugVN(l.title)+".doc", b);
};
(function(){
  var old = Views.lessons;
  Views.lessons = function(){
    return old().replace(/onclick="Les.open\('([^']+)'\)">Mở<\/button>/g,
      'onclick="Les.view(\'$1\')">Xem</button> <button class="btn sm ghost" onclick="Les.open(\'$1\')">Sửa</button> '
      + '<button class="btn sm ghost" onclick="Les.word(\'$1\')">Word</button>');
  };
})();
