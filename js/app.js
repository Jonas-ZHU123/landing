'use strict';

const CATEGORIES = [
  { id: 'kitchen', name: 'Kitchen & Cooking', icon: 'pot', image: 'pot' },
  { id: 'diy', name: 'DIY & Repair', icon: 'tool', image: 'drill' },
  { id: 'home', name: 'Home & Cleaning', icon: 'broom', image: 'vacuum' },
  { id: 'outdoors', name: 'Sports & Outdoors', icon: 'basketball', image: 'camping' },
  { id: 'tech', name: 'Tech & Accessories', icon: 'camera', image: 'camera' }
];
const SEED_ITEMS = [
  { id:'pot',title:'A pot for your next recipe',category:'kitchen',image:'pot',price:2,owner:'Maya',initials:'MA',condition:'Good condition',description:'A compact stainless-steel pot with a lid. Just the right size for soup, pasta, or trying a new recipe. Easy to carry and ready for another kitchen.' },
  { id:'drill',title:'Cordless drill & bit set',category:'diy',image:'drill',price:4,owner:'Sam',initials:'SA',condition:'Good condition',description:'Putting up a shelf or assembling a flat-pack? This compact cordless drill comes with a set of bits and a charged battery. A useful companion for a small home project.' },
  { id:'camera',title:'A camera for the weekend',category:'tech',image:'camera',price:12,owner:'Jules',initials:'JU',condition:'Good condition',description:'An easy-to-carry mirrorless camera with a lens, strap, and memory card. Borrow it for a weekend away, a creative project, or a day worth remembering.' },
  { id:'bowls',title:'Everyday ceramic bowls',category:'kitchen',image:'bowls',price:0,owner:'Nora',initials:'NO',condition:'Good condition',description:'Two simple ceramic bowls for a shared meal, a little baking, or extra guests. Clean, sturdy, and easy to bring along.' },
  { id:'mug',title:'A favourite terracotta mug',category:'kitchen',image:'mug',price:0,owner:'Maya',initials:'MA',condition:'Good condition',description:'A warm terracotta mug for an extra guest or a cosy afternoon. Small enough to carry in your bag. Please wash and return it after use.' },
  { id:'vacuum',title:'Compact handheld vacuum',category:'home',image:'vacuum',price:3,owner:'Ben',initials:'BE',condition:'Good condition',description:'A small cordless vacuum for a quick clean of your sofa, car, or shelves. Includes a narrow nozzle and charger. Please empty it before returning.' },
  { id:'camping',title:'A little camping kit',category:'outdoors',image:'camping',price:5,owner:'Alex',initials:'AL',condition:'Good condition',description:'A packed tent and a compact folding chair for a short outdoor escape. Carry them to your next camping trip and return them clean and dry.' },
  { id:'adapter',title:'USB-C multiport adapter',category:'tech',image:'adapter',price:0,owner:'Jules',initials:'JU',condition:'Good condition',description:'Connect a few more things to your laptop without buying an adapter for a single occasion. A compact hub with USB and display connections.' },
  { id:'powerbank',title:'Pocket-sized power bank',category:'tech',image:'powerbank',price:0,owner:'Nora',initials:'NO',condition:'Good condition',description:'A portable power bank and short charging cable for a day on the move. Pick it up charged and bring it back ready for the next person.' }
];
const SEED_REQUESTS = [
  {id:'r1',title:'A drill for one small shelf',category:'diy',name:'Robin',initials:'RO',description:'I only need it for a short DIY job. Does anyone have a compact drill I could borrow?',dates:'Example dates · a few hours',location:'Example pickup point'},
  {id:'r2',title:'Extra bowls for dinner',category:'kitchen',name:'Charlie',initials:'CH',description:'Having a few friends over and could use a couple of extra bowls. Happy to collect and return them.',dates:'Example dates · one evening',location:'Example pickup point'},
  {id:'r3',title:'A camera for a day out',category:'tech',name:'Taylor',initials:'TA',description:'I would love to try a camera for a day before deciding whether to buy one.',dates:'Example dates · one day',location:'Example pickup point'}
];
const STORAGE_KEY = 'all-for-one-preview-v1';
const DEFAULT_STATE = { saved:[],items:[],requests:[],offers:[],messages:{},user:null };
let state = loadState();
let toastTimer;
let currentAuthTab = 'signin';
const views = {};

function loadState() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); return {...DEFAULT_STATE,...saved}; } catch { return {...DEFAULT_STATE}; }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch { showToast('This browser could not save your changes. Try a smaller photo.'); }
  updateHeader();
}
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function icon(name) {
  const paths = {
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    heart:'<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/>',
    pin:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    pot:'<path d="M5 10h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3ZM5 12H2v4h3M19 12h3v4h-3M4 8h16M7 8a5 4 0 0 1 10 0M10 4V2h4v2"/>',
    tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9L6 21a2.1 2.1 0 0 1-3-3l7.6-7.6a6 6 0 0 1 7.9-7.9Z"/>',
    broom:'<path d="M12 2v10M9 12h6v3l4 6H5l4-6ZM9 17l-1 4M12 17v4M15 17l1 4"/>',
    basketball:'<circle cx="12" cy="12" r="9" fill="#d5a064"/><path d="M3 12h18M12 3v18M5.6 5.6c8.5 1.8 11 4.3 12.8 12.8M18.4 5.6C9.9 7.4 7.4 9.9 5.6 18.4"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    home:'<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
    tent:'<path d="m2 20 10-17 10 17ZM8 20l4-7 4 7M12 3v10"/>',
    camera:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 1-3h6l1 3"/><circle cx="12" cy="13" r="4"/>',
    leaf:'<path d="M20 3c-9 0-15 3-15 9a6 6 0 0 0 6 6c6 0 9-6 9-15ZM4 21l11-11"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    message:'<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 0 1-1-5 9 9 0 0 1 18 0Z"/><path d="M7 10h10M7 14h6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    back:'<path d="m14 6-6 6 6 6"/>',
    send:'<path d="m22 2-7 20-4-9-9-4ZM22 2 11 13"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
}
function category(id) { return CATEGORIES.find(c=>c.id===id) || CATEGORIES[0]; }
function items() { return [...state.items,...SEED_ITEMS]; }
function getItem(id) { return items().find(item=>item.id===id); }
function imageUrl(item) { return item.photo || `images/${item.image}.jpg`; }
function price(item) { return item.price ? `€${Number(item.price).toFixed(Number.isInteger(Number(item.price))?0:2)}` : 'Free'; }
function avatar(name,initials) { return `<span class="avatar" aria-hidden="true">${esc(initials || name.slice(0,2).toUpperCase())}</span>`; }
function card(item) {
  const saved = state.saved.includes(item.id);
  return `<article class="card"><a class="card-image-link" href="#/item/${encodeURIComponent(item.id)}" tabindex="-1" aria-hidden="true"><img class="card-image" src="${imageUrl(item)}" alt="${esc(item.title)}" loading="lazy" width="600" height="450"><span class="item-badge ${item.price?'':'free'}">${item.price?'For rent':'Free to borrow'}</span></a><button class="icon-button favorite-button" data-action="save" data-id="${esc(item.id)}" aria-pressed="${saved}" aria-label="${saved?'Unsave':'Save'} ${esc(item.title)}">${icon('heart')}</button><div class="card-body"><div class="card-category">${esc(category(item.category).name)}</div><h3 class="card-title"><a href="#/item/${encodeURIComponent(item.id)}">${esc(item.title)}</a></h3><div class="card-price-row"><span class="card-price">${price(item)}</span><small>${item.price?'/ day':'to borrow'}</small></div><div class="card-location">${icon('pin')}<span>${esc(item.location || 'Example pickup point')}</span></div></div></article>`;
}
function requestCard(request) {
  const offered = state.offers.some(o=>o.requestId===request.id);
  return `<article class="request-card"><div class="request-card-header"><div class="owner-row">${avatar(request.name,request.initials)}<strong>${esc(request.name)}</strong></div><span class="request-tag">LOOKING FOR</span></div><h3>${esc(request.title)}</h3><p>${esc(request.description)}</p><div class="request-meta">${icon('calendar')}<span>${esc(request.dates)}</span></div><div class="request-meta">${icon('pin')}<span>${esc(request.location || 'Example pickup point')}</span></div><button class="button button-secondary" data-action="offer" data-id="${esc(request.id)}">${offered?'View your offer':'I can help'}</button></article>`;
}
function showToast(message) {
  const element=document.getElementById('toast'); element.textContent=message;element.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.hidden=true,3500);
}
function updateHeader() {
  const count=document.getElementById('saved-count');count.textContent=state.saved.length;count.hidden=!state.saved.length;
  document.getElementById('auth-button').textContent=state.user?state.user.name:'Sign in';
}
function navigate(path) { if(location.hash===`#/${path}`) render(); else location.hash=`#/${path}`; }
function route() {
  const raw=location.hash.replace(/^#\/?/,''); const [path,search='']=raw.split('?'); const parts=path.split('/').filter(Boolean); return {name:parts[0]||'home',id:parts[1],params:new URLSearchParams(search)};
}
function render() {
  const current=route();
  document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===current.name);if(a.dataset.nav===current.name)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.getElementById('mobile-nav').hidden=true;document.getElementById('mobile-nav').classList.remove('is-open');document.getElementById('menu-button').setAttribute('aria-expanded','false');
  document.getElementById('main').innerHTML=(views[current.name] || views.home)(current);
  mountQuestionnaire();
  document.title=`${({home:'Borrow & share',browse:'Find an item',saved:'Saved items',share:'Share an item',requests:'Community requests',messages:'Messages',feedback:'Questionnaire',item:getItem(current.id)?.title,'how-it-works':'How it works'})[current.name] || 'Borrow & share'} — All for one, one for all`;
  updateHeader();
}
views.home = () => `
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">All for one, one for all</p>
        <h1><span>Borrow. Share.</span><em>Help each other.</em></h1>
        <p class="hero-description">Borrow or rent what you need, share your own items, or ask the community. Everyday sharing, made simple.</p>
      </div>
      <div class="hero-visual"><img class="hero-photo" src="images/hero.jpg" alt="Neighbours sharing a cooking pot in a welcoming home" width="1500" height="1000" fetchpriority="high"></div>
    </div>
  </section>
  <section class="home-functions" aria-label="Three ways to use the platform">
    <div class="container">
      <p class="function-heading">What would you like to do?</p>
      <div class="function-grid">
        <article class="function-card">
          <span class="function-number">01</span><h2>Find an item</h2>
          <p>Borrow for free or rent for a small fee. Find something useful for a few hours or a few days.</p>
          <a class="button button-primary" href="#/browse">Find an item</a>
        </article>
        <article class="function-card">
          <span class="function-number">02</span><h2>Share an item</h2>
          <p>Have something to offer? List your own items for free sharing or set a daily rental price.</p>
          <a class="button button-primary" href="#/share">Share an item</a>
        </article>
        <article class="function-card">
          <span class="function-number">03</span><h2>Community requests</h2>
          <p>Can’t find what you need? Post a request. Have what someone needs? Offer to help.</p>
          <a class="button button-primary" href="#/requests">View or post requests</a>
        </article>
      </div>
    </div>
  </section>
  ${questionnaireSection()}`;

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action;
  if(action==='save') {
    const id=button.dataset.id;const saved=state.saved.includes(id);
    state.saved=saved?state.saved.filter(x=>x!==id):[...state.saved,id];saveState();
    document.querySelectorAll(`[data-action="save"][data-id="${CSS.escape(id)}"]`).forEach(b=>{b.setAttribute('aria-pressed',String(!saved));b.setAttribute('aria-label',`${saved?'Save':'Unsave'} ${getItem(id)?.title||'item'}`);});
    if(route().name==='saved')render();showToast(saved?'Removed from your saved items.':'Saved for another day.');
  }
  if(action==='close-modal') button.closest('dialog')?.close();
});
document.getElementById('menu-button').addEventListener('click',()=>{const nav=document.getElementById('mobile-nav');nav.hidden=!nav.hidden;nav.classList.toggle('is-open',!nav.hidden);document.getElementById('menu-button').setAttribute('aria-expanded',String(!nav.hidden));});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);document.getElementById('main').focus({preventScroll:true});});
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('year').textContent=new Date().getFullYear();render();});
