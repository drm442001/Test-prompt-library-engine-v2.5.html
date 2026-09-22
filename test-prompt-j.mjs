import { readFileSync } from 'node:fs';
const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name, info||'');
  return cond;
}
let pass=true;

// Check media queries for required widths
pass = chk('media query 1366px exists', html.includes('@media (max-width:1366px)'), '') && pass;
pass = chk('media query 1024px exists', html.includes('@media (max-width:1024px)'), '') && pass;
pass = chk('media query 768px exists', html.includes('@media (max-width:768px)'), '') && pass;
pass = chk('media query 480px exists', html.includes('@media (max-width:480px)'), '') && pass;
pass = chk('media query 360px exists', html.includes('@media (max-width:360px)'), '') && pass;
pass = chk('media query 560px exists', html.includes('@media (max-width:560px)'), '') && pass;

// Check overflow-x hidden for mobile
pass = chk('html,body overflow-x hidden', html.includes('html,body{overflow-x:hidden'), '') && pass;
pass = chk('mgsplx overflow-x hidden', html.includes('.mgsplx{width:100%') && html.includes('overflow-x:hidden'), '') && pass;
pass = chk('mgsplx max-width 100% and box-sizing', html.includes('max-width:100%') && html.includes('box-sizing:border-box'), '') && pass;

// Check no horizontal scrolling fix: max-width 100% for cards etc
pass = chk('card max-width 100%', html.includes('.mgsplx .card,.mgsplx .lane,.mgsplx .sec'), '') && pass;

// Check clipping fixes: overflow-wrap anywhere
pass = chk('val overflow-wrap anywhere', html.includes('.mgsplx .val{') && html.includes('overflow-wrap:anywhere'), '') && pass;
pass = chk('val word-break break-word at 480', html.includes('@media (max-width:480px)') && html.includes('word-break:break-word'), '') && pass;

// Check hidden buttons fix: cbtn flex and white-space normal at mobile
pass = chk('cbtn white-space normal at mobile', html.includes('.mgsplx .cbtn{white-space:normal') || html.includes('white-space:normal;word-break:break-word'), '') && pass;
pass = chk('cbtn flex 1 1 100% at 480', html.includes('@media (max-width:480px)') && html.includes('.mgsplx .cbtn{') && html.includes('flex:1 1 100%'), '') && pass;

// Check dropdown visibility: select max-width 100%
pass = chk('select max-width 100%', html.includes('.mgsplx select{max-width:100%'), '') && pass;
pass = chk('select font-size 16px prevents iOS zoom', html.includes('font-size:16px'), '') && pass;

// Check menu-list max-width calc(100vw - 16px) to prevent overflow
pass = chk('menu-list max-width calc(100vw', html.includes('.mgsplx .menu-list{max-width:calc(100vw'), '') && pass;
pass = chk('menu-list min-width reduced at mobile', html.includes('min-width:160px') || html.includes('min-width:180px'), '') && pass;

// Check layout single column at 768
pass = chk('layout single column at 768', html.includes('@media (max-width:768px)') && html.includes('.mgsplx .layout{grid-template-columns:1fr}'), '') && pass;

// Check vflow vertical
pass = chk('vflow flex column', html.includes('.vflow{display:flex;flex-direction:column'), '') && pass;

// Check no fixed width > viewport
// Look for width: 100vw without max-width – should have max-width 100vw with overflow hidden
pass = chk('no 100vw without hidden', !html.match(/width:\s*100vw(?![^}]*overflow)/) || html.includes('max-width:100vw'), '') && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');
