/* ============================================================
   首页专属脚本 —— View all 折叠
   ============================================================ */

/* =====================================================================
   View all 折叠按钮
   ===================================================================== */
(function () {
  "use strict";
  document.querySelectorAll("[data-more]").forEach(function (btn) {
    const list = btn.parentElement.querySelector(".project-list");
    if (!list) return;
    // 一次性记住「额外的条目」。不能每次点击重新查询 .is-extra-hidden ——
    // 展开时该 class 已被移除，再查会匹配不到，收起就会失效。
    const extraItems = Array.prototype.slice.call(list.querySelectorAll(".is-extra-hidden"));
    if (!extraItems.length) { btn.remove(); return; }
    let open = false;
    btn.addEventListener("click", function () {
      open = !open;
      extraItems.forEach(function (li) {
        li.style.display = open ? "" : "none";
        li.classList.toggle("is-extra-hidden", !open);
      });
      btn.querySelector(".show-more-label").textContent = open ? "收起" : "查看全部";
    });
  });
})();
