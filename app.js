// Musacid site app (no backend). Cart stored in LocalStorage.
// Payment handled securely by Gumroad via checkout links.

const WA_NUMBER = "966548137612"; // international format without leading zeros

const quotes = [
  "خطوتك اليوم… تصنع إنجازك غدًا بإذن الله.",
  "القليل مع الثبات خير من الكثير مع الانقطاع.",
  "اجعل القرآن موعدًا يوميًا… وسترى بركته في كل شيء.",
  "إذا تعبت اليوم، سترتاح غدًا… اصبر وواصل.",
  "المداومة سرّ الوصول — ولو بصفحات قليلة.",
  "ابدأ الآن… وأكرم نفسك بنجاحٍ تحبه.",
];

let products = [];
let carouselIndex = 0;
let carouselTimer = null;

const $ = (sel) => document.querySelector(sel);

function formatArabicDate(d){
  const days = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return `${days[d.getDay()]} • ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function tickClock(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const ss = String(d.getSeconds()).padStart(2,"0");
  $("#clock").textContent = `${hh}:${mm}:${ss}`;
  $("#today").textContent = formatArabicDate(d);
}

function startQuotes(){
  let idx = 0;
  $("#quote").textContent = quotes[0];
  setInterval(()=>{
    idx = (idx+1) % quotes.length;
    $("#quote").textContent = quotes[idx];
  }, 5000);
}

function buildMarquee(){
  const track = $("#marqueeTrack");
  track.innerHTML = "";
  // duplicate twice for smoothness
  const items = [...products, ...products];
  for(const p of items){
    const el = document.createElement("div");
    el.className = "marquee-item";
    el.innerHTML = `<b>${p.title}</b><span class="spark">✦</span><span>${p.subtitle}</span>`;
    track.appendChild(el);
  }
}

function renderCarousel(){
  const inner = $("#carouselInner");
  inner.innerHTML = "";
  const p = products[carouselIndex];
  const slide = document.createElement("div");
  slide.className = "slide";
  slide.innerHTML = `
    <img src="${p.image}" alt="${p.title}" loading="lazy" />
    <div class="slide-body">
      <div class="slide-title">${p.title}</div>
      <div class="slide-sub">${p.subtitle}</div>
    </div>
  `;
  inner.appendChild(slide);
}

function nextSlide(){
  carouselIndex = (carouselIndex+1) % products.length;
  renderCarousel();
}
function prevSlide(){
  carouselIndex = (carouselIndex-1 + products.length) % products.length;
  renderCarousel();
}
function startCarousel(){
  if(carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(nextSlide, 4500);
}

function money(n){ return `$${Number(n).toFixed(0)}`; }

function getCart(){
  try { return JSON.parse(localStorage.getItem("musacid_cart") || "[]"); }
  catch { return []; }
}
function setCart(cart){
  localStorage.setItem("musacid_cart", JSON.stringify(cart));
  updateCartUI();
}
function cartCount(cart){ return cart.reduce((a,i)=>a+(i.qty||1),0); }
function cartTotal(cart){
  let t = 0;
  for(const item of cart){
    const p = products.find(x=>x.id===item.id);
    if(p) t += (p.price * (item.qty||1));
  }
  return t;
}

function addToCart(id){
  const cart = getCart();
  const found = cart.find(x=>x.id===id);
  if(found) found.qty = (found.qty||1) + 1;
  else cart.push({id, qty: 1});
  setCart(cart);
}

function changeQty(id, delta){
  const cart = getCart();
  const found = cart.find(x=>x.id===id);
  if(!found) return;
  found.qty = Math.max(1, (found.qty||1) + delta);
  setCart(cart);
}

function removeItem(id){
  const cart = getCart().filter(x=>x.id!==id);
  setCart(cart);
}

function updateCartUI(){
  const cart = getCart();
  $("#cartCount").textContent = String(cartCount(cart));
  $("#cartTotal").textContent = money(cartTotal(cart));

  const wrap = $("#cartItems");
  wrap.innerHTML = "";
  if(cart.length === 0){
    wrap.innerHTML = `<div class="micro">سلتك فارغة الآن. أضف منتجًا من قسم المنتجات.</div>`;
    return;
  }

  for(const item of cart){
    const p = products.find(x=>x.id===item.id);
    if(!p) continue;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <div style="flex:1">
        <div class="cart-name">${p.title}</div>
        <div class="cart-meta">${p.subtitle}</div>

        <div class="qty">
          <button type="button" data-action="dec" aria-label="تقليل">−</button>
          <span>${item.qty||1}</span>
          <button type="button" data-action="inc" aria-label="زيادة">+</button>
          <button type="button" data-action="rm" style="margin-inline-start:auto" aria-label="حذف">حذف</button>
        </div>
      </div>
      <div style="font-weight:900; color: var(--gold2)">${money(p.price * (item.qty||1))}</div>
    `;
    row.addEventListener("click", (e)=>{
      const btn = e.target.closest("button");
      if(!btn) return;
      const act = btn.getAttribute("data-action");
      if(act==="inc") changeQty(item.id, +1);
      if(act==="dec") changeQty(item.id, -1);
      if(act==="rm") removeItem(item.id);
    });
    wrap.appendChild(row);
  }
}

function openCart(){
  $("#cartDrawer").classList.add("show");
  $("#cartDrawer").setAttribute("aria-hidden","false");
}
function closeCart(){
  $("#cartDrawer").classList.remove("show");
  $("#cartDrawer").setAttribute("aria-hidden","true");
}

function renderProducts(){
  const grid = $("#productsGrid");
  grid.innerHTML = "";

  for(const p of products){
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <div class="imgwrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <div class="badge-pill">${p.badge || "مميز"}</div>
      </div>
      <div class="product-body">
        <div class="product-title">${p.title}</div>
        <div class="product-sub">${p.subtitle}</div>
        <div class="tags">
          ${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}
        </div>
        <div class="price">
          <div>
            <span class="now">${money(p.price)}</span>
            <span class="old">${money(p.price_old)}</span>
          </div>
          <div class="small">PDF رقمي</div>
        </div>

        <div class="product-actions">
          <a class="btn gold gumroad-button" href="${p.checkout_url}">شراء الآن</a>
          <button class="btn outline" type="button" data-add="${p.id}">إضافة للسلة</button>
        </div>
        <div class="small">الدفع وتسليم الملف يتمان بأمان عبر Gumroad.</div>
      </div>
    `;
    card.querySelector("[data-add]").addEventListener("click", ()=> addToCart(p.id));
    grid.appendChild(card);
  }
}

function renderPopular(){
  const pop = $("#popularList");
  pop.innerHTML = "";
  const popular = [products[0], products[2]].filter(Boolean);
  for(const p of popular){
    const item = document.createElement("div");
    item.className = "pop-item";
    item.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <div style="flex:1">
        <div class="pop-title">${p.title}</div>
        <div class="pop-sub">${p.subtitle}</div>
      </div>
      <a class="chip gumroad-button" href="${p.checkout_url}">شراء</a>
    `;
    pop.appendChild(item);
  }
}

function setupServiceForm(){
  const typeSel = $("#requestType");
  const existingWrap = $("#existingPlanWrap");
  const newWrap = $("#newPlanWrap");
  const existingPlan = $("#existingPlan");

  // fill existing plans list from products
  existingPlan.innerHTML = `<option value="" selected disabled>اختر…</option>` + products.map(p=>`<option value="${p.title}">${p.title}</option>`).join("");

  typeSel.addEventListener("change", ()=>{
    const v = typeSel.value;
    existingWrap.style.display = (v==="تعديل خطة موجودة") ? "block" : "none";
    newWrap.style.display = (v==="طلب تصميم خطة جديدة") ? "block" : "none";
  });

  // WhatsApp helper
  $("#sendWhatsApp").addEventListener("click", ()=>{
    const name = document.querySelector('input[name="name"]').value || "";
    const contact = document.querySelector('input[name="contact"]').value || "";
    const reqType = typeSel.value || "";
    const ex = existingPlan.value || "";
    const np = $("#newPlanType").value || "";
    const details = document.querySelector('textarea[name="details"]').value || "";

    const msg = [
      "طلب خدمة من musacid.me",
      `الاسم: ${name}`,
      `وسيلة التواصل: ${contact}`,
      `نوع الطلب: ${reqType}`,
      ex ? `الخطة المراد تعديلها: ${ex}` : "",
      np ? `نوع الخطة المطلوبة: ${np}` : "",
      `التفاصيل: ${details}`
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noreferrer");
  });

  // Friendly status on submit (email will be sent via FormSubmit)
  $("#serviceForm").addEventListener("submit", ()=>{
    $("#formStatus").textContent = "تم إرسال الطلب… سيتم تحويلك بعد لحظات.";
  });
}

function setupSubscribe(){
  $("#subscribeForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = $("#subscribeEmail").value.trim();
    if(!email) return;
    // store locally (no backend). You can later replace with a real email marketing tool.
    const list = new Set(JSON.parse(localStorage.getItem("musacid_subs") || "[]"));
    list.add(email);
    localStorage.setItem("musacid_subs", JSON.stringify([...list]));
    $("#subscribeStatus").textContent = "تم الاشتراك ✅";
    $("#subscribeEmail").value = "";
  });
}

function setupUI(){
  $("#cartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#drawerBackdrop").addEventListener("click", closeCart);
  $("#clearCart").addEventListener("click", ()=> setCart([]));

  for(const id of ["serviceBtn","serviceBtn2","serviceBtn3","serviceBtn4"]){
    const el = document.getElementById(id);
    if(el) el.addEventListener("click", ()=> document.getElementById("service").scrollIntoView({behavior:"smooth"}));
  }

  $("#toTop").addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));
  $("#nextSlide").addEventListener("click", ()=>{ nextSlide(); startCarousel(); });
  $("#prevSlide").addEventListener("click", ()=>{ prevSlide(); startCarousel(); });

  document.addEventListener("keydown",(e)=>{
    if(e.key==="Escape") closeCart();
  });
}

async function init(){
  tickClock();
  setInterval(tickClock, 1000);
  startQuotes();

  const res = await fetch("products.json");
  products = await res.json();

  renderProducts();
  renderPopular();
  buildMarquee();

  renderCarousel();
  startCarousel();

  setupUI();
  setupServiceForm();
  setupSubscribe();
  updateCartUI();
}

init().catch(console.error);
