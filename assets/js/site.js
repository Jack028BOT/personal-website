/* ============================================================
   站点通用脚本 —— 像素画生成 / 像素鸟 / 主题切换 / 实时时钟
   （首页与作品详情页共用）
   ============================================================ */

/* =====================================================================
   像素画生成器：data-art 的 svg 都按字符画渲染成 <rect>
   想改图案直接改下面的字符串地图（. = 透明）
   ===================================================================== */
(function () {
  "use strict";
  const PALETTES = {
    // 像素鸟（对齐原站）：棕身 / 米肚 / 白脸颊蓝眼 / 橙嘴，三帧扇翅
    // d 深棕描边  B 翅膀  b 身体  c 米色肚皮  w 白脸颊  e 蓝眼睛  k 橙嘴  t 尾尖
    bird:  { d: "#4a3a2a", t: "#382c1f", B: "#6f5843", b: "#93784f", c: "#e9d9b6", w: "#f1ece1", e: "#3f6df0", k: "#f0a03c" },
  };
  const ART = {
    // 太阳/月亮：主题切换按钮里是原站的手绘 SVG（见各页 HTML），不走像素渲染器
    // 云朵：原站 PNG 贴图（deco.css 背景），带滚动视差，也不走像素渲染器
    // 小鸟三帧：翅膀上扬（滑翔，同参考图）→ 收平（落脚）→ 下压（下扇）
    bird: [
      [ // 帧1 翅膀上扬
        "...........BB..........",
        "..........BBB..........",
        "..........BBB..........",
        ".........BBBB..........",
        ".........BBBB..bbbb...",
        "........BBBBB..bwebbk.",
        ".dd...BBBBBBBbbwwwbbkk",
        "tddbbbbbbbbbbbbwwbbb..",
        ".tbbbbbbbbbbbbbbbbbb..",
        "..bbbbbbcccccccccbb...",
        "...bbbbcccccccccc.....",
        "....bbccccccccc.......",
      ],
      [ // 帧2 翅膀收平
        "......................",
        "......................",
        "......................",
        "......................",
        "......BBBBBBB..bbbb...",
        ".....BBBBBBBB..bwebbk.",
        ".dd...BBBBBBBbbwwwbbkk",
        "tddbbbbbbbbbbbbwwbbb..",
        ".tbbbbbbbbbbbbbbbbbb..",
        "..bbbbbbcccccccccbb...",
        "...bbbbcccccccccc.....",
        "....bbccccccccc.......",
      ],
      [ // 帧3 翅膀下压
        "......................",
        "......................",
        "......................",
        "......................",
        "...............bbbb...",
        "..............bwebbk..",
        ".dd..........bwwwwbbkk",
        "tddbbbbbbbbbbbbwwbbb..",
        ".tbbbbbbbbbbbbbbbbbb..",
        "..bbbbbbcccccccccbb...",
        "...bbbBBBBBcccccccc...",
        "....bbBBBBBBBccccc....",
      ],
    ],
    // 鸟窝：原站的像素 rect 矩阵（见 index.html 的 .bn-nest-back），不走像素渲染器
  };
  function render(svg, artName, palName) {
    const art = ART[artName];
    if (!art) return;
    // data-pal 只是尺寸变体标记（big/small），没有对应调色板时回退到图案同名调色板
    const pal = PALETTES[palName] || PALETTES[artName] || {};
    // 多帧动画：字符画数组里再套一层帧数组，每帧渲染成 <g>
    const frames = Array.isArray(art[0]) ? art : [art];
    let w = 0, h = 0, html = "";
    frames.forEach(function (rows, i) {
      const fh = rows.length, fw = Math.max(...rows.map(r => r.length));
      w = Math.max(w, fw); h = Math.max(h, fh);
      let g = '<g data-f="' + i + '">';
      rows.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          const ch = row[x];
          if (ch === "." || ch === " ") continue;
          const fill = pal[ch];
          if (!fill) continue;
          g += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + fill + '"/>';
        }
      });
      html += g + "</g>";
    });
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.innerHTML = html;
    if (frames.length > 1) {
      const gs = svg.querySelectorAll("g");
      if (gs[1]) gs[1].classList.add("is-on"); // 默认停在收翅帧
    }
  }
  document.querySelectorAll("svg[data-art]").forEach(function (svg) {
    render(svg, svg.getAttribute("data-art"), svg.getAttribute("data-pal"));
  });
})();

/* =====================================================================
   云朵滚动视差（复刻原站）：向下滚动时云朵缓缓下沉并右移一点，
   第二朵的系数更大，滚动中两朵会微微拉开，做出层次感。
   rAF 节流（一帧一次），reduced-motion 直接关闭。
   ===================================================================== */
(function () {
  "use strict";
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const clouds = document.querySelectorAll(".deco");
  if (!clouds.length) return;
  let ticking = false;
  function update() {
    const y = window.scrollY || window.pageYOffset || 0;
    for (let i = 0; i < clouds.length; i++) {
      // 系数与原站一致：位移 = 滚动距离 × (0.09/0.14 起，每朵递增)
      clouds[i].style.transform =
        "translate3d(" + (y * (0.09 + i * 0.05)).toFixed(1) + "px," +
        (y * (0.14 + i * 0.07)).toFixed(1) + "px,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
})();

/* =====================================================================
   吉祥物动画性能开关（复刻原站）：小狗/鸟窝滚出视口时加 .anim-paused
   暂停其 SVG 内部动画，回到视口再恢复。
   ===================================================================== */
(function () {
  "use strict";
  if (!("IntersectionObserver" in window)) return;
  const targets = document.querySelectorAll(".section-mascot, .birds-nest");
  if (!targets.length) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      en.target.classList.toggle("anim-paused", !en.isIntersecting);
    });
  }, { rootMargin: "80px 0px" });
  targets.forEach(function (el) { io.observe(el); });
})();

/* =====================================================================
   戳云彩（复刻原站 play.js）：大云是乌云——每戳一下压扁、劈闪电、
   掉阵雨、雷声跟随闪光；小云飘毛毛雨，1.6 秒内戳三下也打雷；
   夜晚（暗色主题）雨换成雪花。纯视觉部分 reduced-motion 下跳过。
   ===================================================================== */
(function () {
  "use strict";

  /* 文字画 → SVG data-URI 背景（同 site.js 像素渲染器的输出格式） */
  function sprite(rows, pal) {
    var w = rows[0].length, h = rows.length, out = "";
    for (var y = 0; y < h; y++)
      for (var x = 0; x < w; x++) {
        var c = pal[rows[y][x]];
        if (c) out += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>';
      }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h +
      '" shape-rendering="crispEdges">' + out + "</svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  var DROP = sprite(["R", "R", "r"], { R: "#b4d8f1", r: "#6fb3df" });
  var FLAKE = sprite([".W.", "WWW", ".W."], { W: "#f4f8fd" });
  var BOLT = sprite(
    ["...YY.", "..YYW.", "..YW..", ".YYWYY", "...YY.", "..YW..", "..Y...", ".YW...", ".Y....", "Y....."],
    { Y: "#ffd84a", W: "#fff6c8" }
  );

  /* 场景精灵：document 坐标下绝对定位的 span，动画结束自删 */
  var MAX_LIVE = 90, live = 0;
  function spawn(kind, x, y, w, h, vars, img) {
    if (live >= MAX_LIVE) return null;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    live++;
    var el = document.createElement("span");
    el.className = "fall fall-" + kind;
    el.style.cssText = "left:" + x.toFixed(1) + "px;top:" + y.toFixed(1) +
      "px;width:" + w.toFixed(1) + "px;height:" + h.toFixed(1) + "px;background-image:" + img;
    document.body.appendChild(el);
    for (var k in vars) el.style.setProperty("--" + k, vars[k]);
    el.addEventListener("animationend", function () { el.remove(); live--; });
    setTimeout(function () { if (el.isConnected) { el.remove(); live--; } }, 4000);
    return el;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* 音效：WebAudio 现场合成——雨=短促白噪高频嘶声，雪=更轻的低频沙沙，
     雷=低通噪声轰鸣带平方衰减；点击时才创建 AudioContext（自动播放策略） */
  var actx = null;
  function sound(kind) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      var t = actx.currentTime;
      if (kind === "thunder") {
        var dur = 1.4, n = Math.floor(actx.sampleRate * dur);
        var buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
        var src = actx.createBufferSource(); src.buffer = buf;
        var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 220;
        var g = actx.createGain(); g.gain.value = 0.5;
        src.connect(lp); lp.connect(g); g.connect(actx.destination);
        src.start(t);
      } else if (kind === "rustle") {
        /* 树叶沙沙：带通白噪，短促轻柔 */
        var dur3 = 0.3, n3 = Math.floor(actx.sampleRate * dur3);
        var buf3 = actx.createBuffer(1, n3, actx.sampleRate), d3 = buf3.getChannelData(0);
        for (var k = 0; k < n3; k++) d3[k] = Math.random() * 2 - 1;
        var src3 = actx.createBufferSource(); src3.buffer = buf3;
        var bp = actx.createBiquadFilter(); bp.type = "bandpass";
        bp.frequency.value = 4200; bp.Q.value = 0.8;
        var g3 = actx.createGain();
        g3.gain.setValueAtTime(0.08, t);
        g3.gain.exponentialRampToValueAtTime(0.001, t + dur3);
        src3.connect(bp); bp.connect(g3); g3.connect(actx.destination);
        src3.start(t);
      } else {
        var dur2 = 0.5, n2 = Math.floor(actx.sampleRate * dur2);
        var buf2 = actx.createBuffer(1, n2, actx.sampleRate), d2 = buf2.getChannelData(0);
        for (var j = 0; j < n2; j++) d2[j] = Math.random() * 2 - 1;
        var src2 = actx.createBufferSource(); src2.buffer = buf2;
        var f = actx.createBiquadFilter();
        f.type = kind === "snow" ? "lowpass" : "highpass";
        f.frequency.value = kind === "snow" ? 900 : 2500;
        var g2 = actx.createGain();
        g2.gain.setValueAtTime(kind === "snow" ? 0.05 : 0.1, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + dur2);
        src2.connect(f); f.connect(g2); g2.connect(actx.destination);
        src2.start(t);
      }
    } catch (e) {}
  }

  var smallPokes = [], lastThunder = 0;
  function poke(c) {
    var cloud = c.cloud, hit = c.hit, big = c.big;
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    var now = Date.now(), storm = big;
    if (!big) {
      smallPokes = smallPokes.filter(function (t) { return now - t < 1600; });
      smallPokes.push(now);
      if (smallPokes.length >= 3) { storm = true; smallPokes = []; }
    }

    sound(dark ? "snow" : "rain");
    /* 闪电在前，雷声晚半拍；350ms 内的连点共享一声雷，不叠轰鸣 */
    if (storm && now - lastThunder > 350) {
      lastThunder = now;
      sound("thunder");
    }

    /* 压扁：重放 is-poked（先摘类再强制回流，动画能重触发） */
    cloud.classList.remove("is-poked");
    void cloud.offsetWidth;
    cloud.classList.add("is-poked");
    hit.classList.add("is-raining");
    clearTimeout(c.rainT);
    c.rainT = setTimeout(function () { hit.classList.remove("is-raining"); }, 1700);

    /* 雨从云现在的位置落下（把视差偏移算进去） */
    var r = cloud.getBoundingClientRect();
    var s = r.width / 54; /* 屏幕像素 / 精灵像素 */
    var left = r.left + window.scrollX;
    var base = r.top + window.scrollY + r.height * 0.88;
    var i;
    if (!dark) {
      for (i = 0; i < (big ? 22 : 16); i++)
        setTimeout(function () {
          spawn("rain", left + r.width * rnd(0.16, 0.84), base - 2 * s, 3 * s, 3 * s, {
            fall: rnd(60, 115).toFixed(0) + "px",
            dur: rnd(0.45, 0.72).toFixed(2) + "s",
          }, DROP);
        }, rnd(0, 900));
    } else {
      /* 夜晚：雪花带左右摇摆（WAAPI 采样成单条 transform 轨道） */
      for (i = 0; i < 10; i++)
        setTimeout(function () {
          var dur = rnd(1.8, 2.7), flakeX = left + r.width * rnd(0.16, 0.84);
          var fl = spawn("snow", flakeX, base - 2 * s, 2.2 * s, 2.2 * s, {}, FLAKE);
          if (!fl) return;
          var dx = rnd(-12, 12), fall = rnd(70, 125);
          fl.animate([
            { transform: "translate(0,0) rotate(0deg)" },
            { transform: "translate(" + dx.toFixed(1) + "px," + (fall * 0.5).toFixed(1) + "px) rotate(" + rnd(12, 24).toFixed(0) + "deg)" },
            { transform: "translate(" + (dx * 0.4).toFixed(1) + "px," + fall.toFixed(1) + "px) rotate(0deg)" },
          ], { duration: dur * 1000, easing: "ease-in-out", fill: "both" });
        }, rnd(0, 1100));
    }

    if (storm) {
      var bw = 6 * s * 1.9, bh = 10 * s * 1.9;
      spawn("bolt", left + r.width * rnd(0.35, 0.6) - bw / 2, base - 3 * s, bw, bh, {}, BOLT);
      /* 云身随闪电白闪两下 */
      [0, 140].forEach(function (d) {
        setTimeout(function () { hit.classList.add("is-flash"); }, d);
        setTimeout(function () { hit.classList.remove("is-flash"); }, d + 70);
      });
    }
  }

  document.querySelectorAll(".deco").forEach(function (cloud) {
    var c = { cloud: cloud, hit: document.createElement("span"), big: cloud.classList.contains("cloud-1"), rainT: 0 };
    c.hit.className = "cloud-hit";
    c.hit.setAttribute("role", "button");
    c.hit.setAttribute("tabindex", "0");
    c.hit.setAttribute("aria-label", c.big ? "戳戳乌云" : "戳戳小云");
    cloud.appendChild(c.hit);
    var doPoke = function () { poke(c); };
    c.hit.addEventListener("click", function (e) {
      /* 云的层级（11）高于日月按钮（10）——这是刻意保留的「探头」构图，
         但云的热区会盖住按钮被云压住的那部分。点落在按钮矩形内时，
         把点击原样转交给主题按钮，两个交互互不耽误。 */
      var t = document.getElementById("theme-toggle");
      if (t && typeof e.clientX === "number") {
        var r = t.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right &&
            e.clientY >= r.top && e.clientY <= r.bottom) {
          t.click();
          return;
        }
      }
      doPoke();
    });
    c.hit.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doPoke(); }
    });
  });
  window.folioSound = { play: sound };   /* 供摇树复用 */
})();

/* =====================================================================
   像素鸟行为（复刻原站）：加载即起飞，从左向右缓慢滑翔（CSS 动画，
   JS 只起停）；滚动时原地落下（出现小星星、收翅），停止滚动 280ms
   后用负 animation-delay 从当前位置无缝续飞。
   ===================================================================== */
(function () {
  "use strict";
  const bird = document.getElementById("bird");
  if (!bird) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const frames = [...bird.querySelectorAll("svg g")];
  if (!frames.length) return;

  let cur = 1;
  function show(i) {
    if (i === cur) return;
    frames[cur].classList.remove("is-on");
    frames[i].classList.add("is-on");
    cur = i;
  }
  let flapTimer = null;
  function startFlap() {
    if (flapTimer) return;
    let f = 0;
    flapTimer = setInterval(function () { f = (f + 1) % frames.length; show(f); }, 95);
  }
  function stopFlap() {
    clearInterval(flapTimer); flapTimer = null;
    show(1); // 收翅
  }

  const SPEED = 0.08; // px/ms，原站的缓慢滑翔速度
  let flying = false;
  let scrollTimer = 0;

  function span() { return window.innerWidth + 150; } // -70px 起点到 100vw+80px 终点
  function currentX() {
    const m = getComputedStyle(bird).transform;
    if (!m || m === "none") return -70;
    return parseFloat(m.split(",")[4]) || -70;
  }

  function startFly() {
    if (flying) return;
    flying = true;
    bird.classList.remove("is-sitting");
    bird.classList.add("is-flying");
    startFlap();
    const dur = span() / SPEED;
    const x = currentX();
    bird.style.setProperty("--glide-dur", dur + "ms");
    // 负延迟让循环从鸟落下的位置继续，不会跳回起点
    bird.style.animationDelay = (-((x + 70) / span()) * dur).toFixed(0) + "ms";
    bird.style.transform = "";
    bird.classList.add("is-gliding");
  }

  function sit() {
    if (!flying) return;
    flying = false;
    // 先把动画当前位置钉成 inline transform 再移除动画，鸟不会瞬移
    bird.style.transform = "translate3d(" + currentX() + "px,0,0)";
    bird.classList.remove("is-gliding");
    bird.classList.remove("is-flying");
    stopFlap();
    bird.classList.add("is-sitting");
  }

  window.addEventListener("scroll", function () {
    sit();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(startFly, 280);
  }, { passive: true });

  startFly();
})();

/* =====================================================================
   主题切换（亮 / 暗）+ 圆形排水（drain）过渡
   顺序刻意反过来：先铺一层「旧主题底色」的圆盘盖住全屏（看起来没变），
   再立刻换主题（重渲染藏在遮盖下），最后圆盘 700ms 收回日月位置。
   覆盖色硬编码而非探测 CSS 变量 —— 浅色的 --body-bg 定义在 :root，
   切换前探测会拿到当前主题的值而出错。
   ===================================================================== */
(function () {
  "use strict";
  const KEY = "portfolio-theme";
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const BG = { light: "#ffffff", dark: "#0e0e12" }; /* 与 tokens.css 的 --body-bg 一致 */
  const DUR = 700;
  const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
  let activeDisc = null, discAnim = null, busy = false;

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }
  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  /* 清掉可能残留的圆盘（watchdog / pagehide / 连点兜底） */
  function dropDisc() {
    if (discAnim) { try { discAnim.cancel(); } catch (e) {} discAnim = null; }
    const ds = document.querySelectorAll(".theme-reveal");
    for (let i = 0; i < ds.length; i++) ds[i].remove();
    activeDisc = null; busy = false;
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved) apply(saved);
  else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) apply("dark");

  if (btn) {
    btn.addEventListener("click", function () {
      const cur = current();
      const next = cur === "dark" ? "light" : "dark";
      const reduce = window.matchMedia &&
                     window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (busy) return; /* 动画期间忽略重复点击，避免多层圆盘与主题翻转竞态 */
      dropDisc();
      if (reduce || !root.animate) { apply(next); return; } /* 无障碍/旧浏览器降级 */

      /* fixed 定位 → rect 即视口坐标，直接可用 */
      const b = btn.getBoundingClientRect();
      const x = b.left + b.width / 2, y = b.top + b.height / 2;
      const W = window.innerWidth, H = window.innerHeight;
      const R = Math.max(Math.hypot(x, y), Math.hypot(W - x, y),
                         Math.hypot(x, H - y), Math.hypot(W - x, H - y)) + 4;

      const disc = document.createElement("div");
      disc.className = "theme-reveal";
      disc.style.left = (x - R) + "px";
      disc.style.top = (y - R) + "px";
      disc.style.width = disc.style.height = (2 * R) + "px";
      disc.style.background = BG[cur];       /* 旧主题底色 */
      disc.style.transform = "scale(1)";
      document.body.appendChild(disc);
      activeDisc = disc; busy = true;

      apply(next);                           /* 主题立刻应用，在遮盖下重渲染 */
      void root.offsetHeight;                /* 强制一帧，确保遮盖先生效 */

      discAnim = disc.animate(
        { transform: ["scale(1)", "scale(0)"] },
        { duration: DUR, easing: EASE, fill: "forwards" }
      );
      const finish = function () {
        if (disc.parentNode) disc.remove();
        if (activeDisc === disc) { activeDisc = null; discAnim = null; }
        busy = false;
      };
      discAnim.onfinish = finish;
      setTimeout(finish, DUR + 400);         /* watchdog：onfinish 失误也不残留 */
    });
  }
  window.addEventListener("pagehide", dropDisc);
})();


/* =====================================================================
   摇树（复刻原站 play.js）：点击/回车 → 重放 is-shaking（skew 衰减摆）
   + 一声树叶沙沙；快速连点会重头开始摆。reduced-motion 只出声。
   ===================================================================== */
(function () {
  "use strict";
  document.querySelectorAll(".tree").forEach(function (tree) {
    function shake() {
      if (window.folioSound) window.folioSound.play("rustle");
      var reduce = window.matchMedia &&
                   matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      tree.classList.remove("is-shaking");
      void tree.offsetWidth;   /* 强制回流，动画可重触发 */
      tree.classList.add("is-shaking");
    }
    tree.addEventListener("click", shake);
    tree.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); shake(); }
    });
  });
})();


/* =====================================================================
   图片轮播卡组（多图展示）：鼠标悬停在卡组上滚动滚轮（或聚焦后按
   方向键）切换图片——前面的卡滑向一侧，下一张从后面滑到前面。
   卡片位置由 JS 按轮播状态设置（transform 过渡）。
   ===================================================================== */
(function () {
  "use strict";
  document.querySelectorAll("[data-deck]").forEach(function (deck) {
    const cards = [...deck.querySelectorAll(".stack-card")];
    if (cards.length < 2) return;
    let active = 0, acc = 0, lock = false;

    function layout() {
      /* 探出偏移自适应：窄屏下卡片几乎占满一行，两侧放不下固定的步进
         （5 张卡会探出 40+px → 横向滚动），按剩余空间收缩，下限 2px。
         再预留 ~14px 给 1.8° 旋转让卡角外扩的宽度。 */
      const rect = deck.getBoundingClientRect();
      const slackL = rect.left - 8;                       // 左缘安全边
      const stepL = Math.max(2, Math.min(10,
        (slackL - 14) / Math.max(1, cards.length - 1)));
      const slackR = window.innerWidth - 8 - rect.right;  // 右缘安全边
      const stepR = Math.max(2, Math.min(11,
        (slackR - 14) / Math.max(1, cards.length - 1)));
      cards.forEach(function (c, i) {
        const rel = i - active;   // <0 已看过 → 左后；0 当前；>0 待看 → 右后
        let z, rot, tx, ty, op;
        if (rel < 0) {
          z = 10 + rel;           // 刚看过在最上，越早越靠底
          rot = rel * 2;
          tx = rel * stepL;
          ty = rel * 3;
          op = 0.9;
        } else {
          z = 10 - rel;
          rot = rel * 1.8;
          tx = rel * stepR;
          ty = rel * 4;
          op = rel > 0 ? 0.85 : 1;
        }
        c.style.zIndex = z;
        c.style.transform = "rotate(" + rot + "deg) translate(" + tx + "px," + ty + "px)";
        c.style.opacity = op;
      });
    }
    function step(dir) {
      if (lock) return;
      lock = true;
      active = (active + dir + cards.length) % cards.length;
      layout();
      setTimeout(function () { lock = false; }, 300);
    }

    layout();
    deck.addEventListener("wheel", function (e) {
      const down = e.deltaY > 0;
      /* 方向闸门：该方向还有没看过的图才接管滚轮；到头了放行页面滚动，
         避免卡组区域把页面滚动卡死 */
      const canStep = down ? (active < cards.length - 1) : (active > 0);
      if (!canStep) return;
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) > 40) { step(down ? 1 : -1); acc = 0; }
    }, { passive: false });
    deck.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
    /* 视口变化（旋转屏幕 / 拖窗口）后按新宽度重排探出偏移 */
    let rzT = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rzT);
      rzT = setTimeout(layout, 120);
    });
  });
})();


/* =====================================================================
   数字滚动（count-up）：页面里的数据从 0 滚到目标值。
   JS 先把数字文本拆成 <span class="cu">，进视口时用 rAF + easeOutCubic
   计数。拆分时按终值预留宽度（tabular-nums + min-width），滚动过程中
   段落不会被顶来顶去。reduced-motion 直接给终值。
   ===================================================================== */
(function () {
  "use strict";

  /* 要滚的容器：指标大字、作品卡描述、首页自述段、作品页正文段 */
  /* 简介段落（.article > p）的数字不滚动，直接显示终值（用户要求） */
  var BOXES = ".stat-num, .project-year > span:first-child, .project-description, .work-body p";
  var DUR = 1900;   /* 单个数字滚完所需毫秒（放慢，用户要求） */
  var STEP = 70;    /* 同一段里相邻数字的启动间隔 */
  var RE = /(\+?\d[\d,]*(?:\.\d+)?)/g;

  function fmt(v, dec, sep) {
    var s = v.toFixed(dec);
    if (!sep) return s;
    var p = s.split(".");
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return p.join(".");
  }

  /* 把容器里的数字文本拆成 .cu 片段，其余文字原样保留 */
  function wrap(box) {
    var walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (/\d/.test(n.nodeValue)) nodes.push(n);
    }
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();
      var last = 0, m;
      RE.lastIndex = 0;
      while ((m = RE.exec(text))) {
        var raw = m[1];
        var sign = raw.charAt(0) === "+" ? "+" : "";
        var body = sign ? raw.slice(1) : raw;
        var value = parseFloat(body.replace(/,/g, ""));
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        if (!isFinite(value)) {
          frag.appendChild(document.createTextNode(raw));
        } else {
          var dot = body.indexOf(".");
          var dec = dot < 0 ? 0 : body.length - dot - 1;
          var span = document.createElement("span");
          span.className = "cu";
          span.textContent = sign + fmt(value, dec, body.indexOf(",") >= 0);
          span.cu = { v: value, dec: dec, sep: body.indexOf(",") >= 0, sign: sign };
          frag.appendChild(span);
        }
        last = m.index + raw.length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function roll(span, delay) {
    var d = span.cu, t0 = null;
    setTimeout(function () {
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR);
        var e = 1 - Math.pow(1 - p, 3);
        span.textContent = d.sign + fmt(d.v * e, d.dec, d.sep);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }, delay);
  }

  /* 容器可能有嵌套（外层已处理就不再进内层），避免同一数字被拆两次 */
  var boxes = [];
  document.querySelectorAll(BOXES).forEach(function (el) {
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].contains(el)) return;
    }
    boxes.push(el);
  });
  boxes.forEach(wrap);

  var spans = [];
  document.querySelectorAll(".cu").forEach(function (s) { spans.push(s); });
  if (!spans.length) return;

  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* 先量终值宽度再归零：宽度锁住，滚动时文字不跳 */
  spans.forEach(function (s) {
    var w = s.offsetWidth;
    if (w > 0) s.style.minWidth = w + "px";
    s.textContent = s.cu.sign + fmt(0, s.cu.dec, s.cu.sep);
  });

  if (!("IntersectionObserver" in window)) {
    spans.forEach(function (s, i) { roll(s, i * STEP); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.querySelectorAll(".cu").forEach(function (s, i) { roll(s, i * STEP); });
      io.unobserve(en.target);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px 12% 0px" });

  boxes.forEach(function (box) {
    if (box.querySelector(".cu")) io.observe(box);
  });
})();
