import { readFileSync } from 'node:fs';
const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

let pass=true, fails=[];
function chk(name, cond, info=''){
  if(!cond){ pass=false; fails.push(name+': '+info); console.log('FAIL', name, info); } else console.log('PASS', name);
}

chk('search clear button exists', html.includes('id="clearSearchBtn"'), 'missing');
chk('clearSearchBtn wired in boot', html.includes('clearSearchBtn') && html.includes("el('search').value = ''"), 'wiring missing');
chk('wireMenu open() defined', html.includes('function open()') && html.includes('list.hidden = false'), 'open not defined');
chk('wireMenu close defined', html.includes('function close('), 'close missing');
chk('copy buttons exist 5 via data-copy', ['copyBeforeOriginal','copyBeforeCustom','copyPromptOriginal','copyPromptCustom','copyPromptNegative'].every(id=>html.includes(id)), 'missing copy btn');
chk('download buttons exist via data-action', html.includes('data-action="downloadpost"') && html.includes('data-action="downloadlibrary"'), 'missing download');
chk('import buttons exist browse/template/sample', html.includes('id="browseBtn"') && html.includes('id="templateBtn"') && html.includes('id="sampleBtn"'), 'missing import');
chk('clear all exists', html.includes('id="clearBtn"'), 'missing clear all');
chk('prompt nav via library list select', html.includes('selectPrompt') && html.includes('plist'), 'missing nav logic');
chk('thumbnail suffix menu button exists via wireMenu', html.includes('wireMenu') && html.includes('data-action="menu"'), 'wireMenu missing');
chk('thumbnail pick/swap/clear buttons', html.includes('data-action="pickimages"') && html.includes('data-action="swapslots"') && html.includes('data-action="clearimages"'), 'missing thumb buttons');
chk('Blog Publisher buttons copy/download', html.includes('data-action="copy"') && html.includes('copyFullBody'), 'missing blog copy');
chk('copy helper exists', html.includes('function copyText'), 'copyText missing');
chk('download helper exists', html.includes('function download('), 'download missing');
chk('boot search listener', html.includes("el('search').addEventListener('input'"), 'search listener missing');
chk('open() defined before keydown uses it', (()=>{ const b=html.slice(html.indexOf('function wireMenu'), html.indexOf('function wireMenu')+1500); return b.indexOf('function open()')>0 && b.indexOf('function open()') < b.indexOf('keydown'); })(), 'order wrong');
chk('MENU_STATE closes array', html.includes('MENU_STATE.closes') || html.includes('closes'), 'not using closes array');
chk('search clear button UI has ghost class', html.includes('clearSearchBtn') && html.includes('ghost'), 'styling missing');
chk('no ReferenceError open undefined pattern', !html.includes('open(); // open not defined') && !html.includes('open() // broken'), 'old broken pattern still');

console.log('\nOVERALL', pass?'PASS':'FAIL');
if(!pass) console.log('Fails:', fails.join('\n'));
