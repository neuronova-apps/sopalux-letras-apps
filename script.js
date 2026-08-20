const menuButton=document.querySelector('.menu-button');const mainNav=document.querySelector('.main-nav');const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();if(menuButton&&mainNav){const close=()=>{mainNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menú de navegación')};menuButton.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Cerrar menú de navegación':'Abrir menú de navegación')});mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});}

const SIZE=10;const WORDS=['LENGUA','MENTE','RETO','SABER','FOCO','JUEGO'];const gridEl=document.querySelector('#wordGrid');const listEl=document.querySelector('#wordList');const progressText=document.querySelector('#progressText');const progressBar=document.querySelector('#progressBar');const message=document.querySelector('#gameMessage');const resetButton=document.querySelector('#resetGame');let board=[];let found=new Set();let selecting=false;let startCell=null;let currentPath=[];

const placements=[
 {word:'LENGUA',r:0,c:0,dr:0,dc:1},
 {word:'MENTE',r:1,c:9,dr:1,dc:0},
 {word:'RETO',r:9,c:0,dr:0,dc:1},
 {word:'SABER',r:5,c:0,dr:0,dc:1},
 {word:'FOCO',r:2,c:1,dr:1,dc:1},
 {word:'JUEGO',r:8,c:9,dr:-1,dc:-1}
];

function seededLetters(){const letters='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';let seed=73;return()=>{seed=(seed*9301+49297)%233280;return letters[Math.floor((seed/233280)*letters.length)]}}
function buildBoard(){const next=seededLetters();board=Array.from({length:SIZE},()=>Array.from({length:SIZE},()=>next()));placements.forEach(({word,r,c,dr,dc})=>[...word].forEach((ch,i)=>{board[r+dr*i][c+dc*i]=ch}));}
function render(){gridEl.innerHTML='';listEl.innerHTML='';for(let r=0;r<SIZE;r++){for(let c=0;c<SIZE;c++){const cell=document.createElement('button');cell.type='button';cell.className='letter-cell';cell.textContent=board[r][c];cell.dataset.r=r;cell.dataset.c=c;cell.setAttribute('role','gridcell');cell.setAttribute('aria-label',`Fila ${r+1}, columna ${c+1}, letra ${board[r][c]}`);cell.addEventListener('pointerdown',startSelection);cell.addEventListener('pointerenter',extendSelection);cell.addEventListener('pointerup',finishSelection);gridEl.appendChild(cell)}}WORDS.forEach(word=>{const li=document.createElement('li');li.textContent=word;li.dataset.word=word;listEl.appendChild(li)});updateProgress();}
function coordsBetween(a,b){const dr=b.r-a.r,dc=b.c-a.c;const adr=Math.abs(dr),adc=Math.abs(dc);if(!(dr===0||dc===0||adr===adc))return[];const steps=Math.max(adr,adc);const sr=steps===0?0:dr/steps,sc=steps===0?0:dc/steps;return Array.from({length:steps+1},(_,i)=>({r:a.r+sr*i,c:a.c+sc*i}));}
function cells(){return[...gridEl.querySelectorAll('.letter-cell')]}
function clearSelecting(){cells().forEach(c=>c.classList.remove('selecting'));currentPath=[]}
function markPath(path,cls){path.forEach(({r,c})=>{const el=gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);if(el)el.classList.add(cls)})}
function pathWord(path){return path.map(({r,c})=>board[r][c]).join('')}
function startSelection(e){selecting=true;startCell={r:+e.currentTarget.dataset.r,c:+e.currentTarget.dataset.c};clearSelecting();currentPath=[startCell];markPath(currentPath,'selecting');e.currentTarget.setPointerCapture?.(e.pointerId)}
function extendSelection(e){if(!selecting||!startCell)return;const end={r:+e.currentTarget.dataset.r,c:+e.currentTarget.dataset.c};const path=coordsBetween(startCell,end);if(!path.length)return;clearSelecting();currentPath=path;markPath(currentPath,'selecting')}
function finishSelection(e){if(!selecting)return;selecting=false;const end={r:+e.currentTarget.dataset.r,c:+e.currentTarget.dataset.c};const path=coordsBetween(startCell,end);clearSelecting();if(!path.length){message.textContent='La selección debe seguir una línea recta.';return}const text=pathWord(path);const reversed=[...text].reverse().join('');const match=WORDS.find(w=>w===text||w===reversed);if(match){const placement=placements.find(p=>p.word===match);const canonical=[...match].map((_,i)=>({r:placement.r+placement.dr*i,c:placement.c+placement.dc*i}));markPath(canonical,'found');found.add(match);message.textContent=found.size===WORDS.length?'¡Reto completado! Encontraste todas las palabras.':`Encontraste ${match}. Sigue buscando.`;updateProgress()}else{message.textContent='Esa selección no corresponde a una palabra de la lista.'}startCell=null}
function updateProgress(){progressText.textContent=`${found.size} de ${WORDS.length} palabras`;progressBar.style.width=`${(found.size/WORDS.length)*100}%`;listEl.querySelectorAll('li').forEach(li=>li.classList.toggle('found',found.has(li.dataset.word)))}
function reset(){found.clear();buildBoard();render();message.textContent='Selecciona una palabra para comenzar.'}
resetButton?.addEventListener('click',reset);document.addEventListener('pointerup',()=>{selecting=false});buildBoard();render();