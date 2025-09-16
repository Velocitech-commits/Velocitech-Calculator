// Script for Velocitech Calculator

/* ===== ESPECIES ===== */
const ESPECIES = [
	{id:"trex", label:"T-Rex", hue:350},
	{id:"estegosaurio", label:"Estegosaurio", hue:280},
	{id:"triceratops", label:"Triceratops", hue:35},
	{id:"parasaurio", label:"Parasaurio", hue:210},
	{id:"braquiosaurio", label:"Braquiosaurio", hue:120},
	{id:"espinosaurio", label:"Espinosaurio", hue:175}
];
const VALID = new Set(ESPECIES.map(s=>s.id));
// Maximum dinosaurs allowed in the river
const MAX_RIO = 48;

const $ = s=>document.querySelector(s);
const $$ = s=>Array.from(document.querySelectorAll(s));

/* ===== I18N and UI helpers (moved from inline script) ===== */
const PEN_LABELS = {
	"bosque-semejanza": {"es":"Bosque de la Semejanza","en":"Similarity Forest"},
	"prado-diferencia": {"es":"Prado de la Diferencia","en":"Meadow of Differences"},
	"pradera-amor": {"es":"Pradera del Amor","en":"Love Meadow"},
	"trio-frondoso": {"es":"Trío Frondoso","en":"Woody Trio"},
	"rey-selva": {"es":"Rey de la Selva","en":"King of the Jungle"},
	"isla-solitaria": {"es":"Isla Solitaria","en":"Solitary Island"},
	"rio": {"es":"Río","en":"River"},
	"bosque-ordenado": {"es":"Bosque Ordenado","en":"A Well-Ordered Wood"},
	"puesto-observacion": {"es":"Puesto de Observación","en":"The Lookout"},
	"puente-enamorados": {"es":"Puente de los Enamorados","en":"Lovers' Bridge"},
	"piramide": {"es":"Pirámide","en":"The Pyramid"},
	"cuarentena": {"es":"Zona de Cuarentena","en":"Quarantine Zone"}
};

const I18N = {
	es: {
		ui: {
			header: "Velocitech",
			theme_light: "Claro",
			theme_dark: "Oscuro",
			mode_summer: "Verano",
			mode_winter: "Invierno",
			lang_es: "ES",
			lang_en: "EN",
			name_label: "Nombre:",
			export: "Exportar .velocitech",
			import: "Importar",
			debug: "Debug hotspots",
			reset: "Reiniciar",
			score_title: "Puntuación en vivo",
			score_total_label: "Puntuación total",
			rival_title: "Ajustes con rivales",
				rey_label: "Rey de la Selva – máximo que tiene el rival en la especie: {species}",
				rey_self_label: "¿Soy el jugador que tiene la misma o mayor cantidad de la especie {species} en la partida?",
				puesto_label: "¿Cuántos {species} tiene el vecino de la derecha?"
		},
		score: {
			bosque_semejanza: "Bosque de la Semejanza",
			prado_diferencia: "Prado de la Diferencia",
			pradera_amor: "Pradera del Amor",
			trio_frondoso: "Trío Frondoso",
			rey_selva: "Rey de la Selva",
			isla_solitaria: "Isla Solitaria",
			rio: "Río",
			bonus_trex: "Bonus T-Rex",
			bosque_ordenado: "Bosque Ordenado",
			puente_enamorados: "Puente de los Enamorados",
			piramide: "Pirámide",
			puesto_observacion: "Puesto de Observación",
			cuarentena: "Zona de Cuarentena"
		},
		errors: {
			same_species_only: "Solo puedes poner dinosaurios de la misma especie en el Bosque de la Semejanza.",
			all_different_only: "En el Prado de la Diferencia, todas las especies deben ser distintas.",
			only_one: "Este recinto solo admite 1 dinosaurio.",
			species_limit: "No puedes colocar más de 10 dinosaurios de esta especie.",
			no_space: "No queda espacio disponible en este recinto.",
			generic_invalid: "No puedes colocar este dinosaurio aquí."
		}
	},
	en: {
		ui: {
			header: "Velocitech",
			theme_light: "Light",
			theme_dark: "Dark",
			mode_summer: "Summer",
			mode_winter: "Winter",
			lang_es: "ES",
			lang_en: "EN",
			name_label: "Name:",
			export: "Export .velocitech",
			import: "Import",
			debug: "Debug hotspots",
			reset: "Reset",
			score_title: "Live scoring",
			score_total_label: "Total score",
			rival_title: "Opponent adjustments",
				rey_label: "King of the Jungle – highest any rival has of the species: {species}",
				rey_self_label: "Am I the player who has the same or a greater number of the species {species} in the game?",
				puesto_label: "How many {species} does your right-hand neighbor have?"
		},
		score: {
			bosque_semejanza: "Similarity Forest",
			prado_diferencia: "Meadow of Differences",
			pradera_amor: "Love Meadow",
			trio_frondoso: "Woody Trio",
			rey_selva: "King of the Jungle",
			isla_solitaria: "Solitary Island",
			rio: "River",
			bonus_trex: "T-Rex bonus",
			bosque_ordenado: "A Well-Ordered Wood",
			puente_enamorados: "Lovers' Bridge",
			piramide: "The Pyramid",
			puesto_observacion: "The Lookout",
			cuarentena: "Quarantine Zone"
		},
		errors: {
			same_species_only: "You can only place dinosaurs of the same species in the Similarity Forest.",
			all_different_only: "In the Meadow of Differences, all species must be different.",
			only_one: "This pen accepts only 1 dinosaur.",
			species_limit: "You can’t place more than 10 dinosaurs of this species.",
			no_space: "There is no space left in this pen.",
			generic_invalid: "You can’t place this dinosaur there."
		}
	}
};

// Localized mode rules (HTML snippets) for sidebar; accessed via t('rules.summer') / t('rules.winter')
I18N.es.rules = {
	title_summer: 'Reglas – Verano',
	summer: `
		<strong>El Bosque de la Semejanza:</strong> Solo puede albergar dinosaurios de la misma especie. Debe ocuparse de izquierda a derecha sin dejar espacios. Puntos según número total de dinosaurios colocados.<br>
		<strong>El Prado de la Diferencia:</strong> Solo puede albergar especies distintas, de izquierda a derecha sin huecos. Puntos según número de dinosaurios colocados.<br>
		<strong>La Pradera del Amor:</strong> 5 VP por cada pareja de la misma especie en el recinto; pueden existir múltiples parejas de la misma especie.<br>
		<strong>El Trío Frondoso:</strong> Hasta 3 dinosaurios. Si hay exactamente 3, obtienes 7 VP; en caso contrario, 0 VP.<br>
		<strong>El Rey de la Selva:</strong> Solo 1 dinosaurio. Si tienes la misma o mayor cantidad que cualquier otro jugador de esa especie recibes 7 VP (controlado por la casilla inferior en Verano).<br>
		<strong>La Isla Solitaria:</strong> Solo 1 dinosaurio. Otorga 7 VP si es el único de su especie en tu parque, 0 si no.<br>
	`,
	title_winter: 'PARQUE ALTERNATIVO – TABLERO DE INVIERNO',
	winter: `
		<strong>Bosque Ordenado:</strong> Solo admite dos especies alternadas en el orden especie1 / especie2 / especie1 / especie2 / especie1 / especie2. No se permiten dos dinosaurios de la misma especie separados por un hueco vacío.<br>
		<strong>Puente de los Enamorados:</strong> Dos zonas independientes (orillas). 6 VP por cada pareja formada por miembros de la misma especie con uno en cada orilla. Cada T-Rex en una orilla suma +1 VP adicional.<br>
		<strong>Pirámide:</strong> 3 abajo, 2 medio, 1 arriba. No pueden colocarse dinosaurios adyacentes de la misma especie (ni vertical ni horizontalmente). Cada nivel otorga diferentes VP.<br>
		<strong>Puesto de Observación:</strong> Solo 1 dinosaurio; obtendrás 2 VP por cada dinosaurio de la misma especie que tenga tu vecino derecho.<br>
		<strong>Zona de Cuarentena:</strong> Solo 1 dinosaurio. Antes del recuento final puedes moverlo al Río o a otro recinto válido.
	`
};

I18N.en.rules = {
	title_summer: 'Rules – Summer',
	summer: `
		<strong>Similarity Forest:</strong> Only dinosaurs of the same species may be placed. Fill left-to-right without gaps. Points depend on the total number placed.<br>
		<strong>Meadow of Differences:</strong> All species must be different, placed left-to-right without gaps. Points depend on the number placed.<br>
		<strong>Love Meadow:</strong> 5 VP for each pair of the same species in the enclosure; multiple pairs of the same species are possible.<br>
		<strong>Woody Trio:</strong> Up to 3 dinosaurs. If there are exactly 3 you score 7 VP; otherwise 0 VP.<br>
		<strong>King of the Jungle:</strong> Only 1 dinosaur. If you have the same or a greater number than any other player of that species you score 7 VP (controlled by the bottom checkbox in Summer).<br>
		<strong>Solitary Island:</strong> Only 1 dinosaur. Awards 7 VP if it is the only one of its species in your park, otherwise 0.<br>
	`,
	title_winter: 'ALTERNATIVE PARK – WINTER BOARD',
	winter: `
		<strong>A Well-Ordered Wood:</strong> Accepts two species in alternating order (species1 / species2 / ...). You may not have two dinosaurs of the same species separated by an empty slot.<br>
		<strong>Lovers' Bridge:</strong> Two independent banks. 6 VP for each pair formed by members of the same species with one on each bank. Each T-Rex on a bank adds +1 VP.<br>
		<strong>The Pyramid:</strong> 3 bottom, 2 middle, 1 top. No adjacent dinosaurs of the same species (neither vertical nor horizontal). Each level grants different VP.<br>
		<strong>The Lookout:</strong> Only 1 dinosaur; you score 2 VP for each dinosaur of the same species your right-hand neighbor has.<br>
		<strong>Quarantine Zone:</strong> Only 1 dinosaur. Before final scoring you may move it to the River or another valid enclosure.
	`
};

function t(path){
	const lang = getLang();
	const seg = path.split(".");
	let cur = I18N[lang];
	for(const k of seg){ cur = cur?.[k]; }
	return cur ?? path;
}
// Species localized names: must match rulebook PDF naming for pens/species
I18N.es.species = {
	trex: 'T-Rex',
	estegosaurio: 'Estegosaurio',
	triceratops: 'Triceratops',
	parasaurio: 'Parasaurio',
	braquiosaurio: 'Braquiosaurio',
	espinosaurio: 'Espinosaurio'
};
I18N.en.species = {
	trex: 'T-Rex',
	estegosaurio: 'Stegosaurus',
	triceratops: 'Triceratops',
	parasaurio: 'Parasaurolophus',
	braquiosaurio: 'Brachiosaurus',
	espinosaurio: 'Spinosaurus'
};

function getLang(){ return (localStorage.getItem("lang")||"es"); }
function setLang(l){
	const lang = (l==="en") ? "en" : "es";
	document.body.setAttribute("data-lang", lang);
	localStorage.setItem("lang", lang);
	$$("#stage .pen").forEach(p=>setPenHint(p));
	// Refresh UI texts and ensure any dynamic sidebar controls exist (rey checkbox, puesto label)
	// Use a short defer to avoid potential race conditions between input change and DOM updates
	setTimeout(()=>{
		hydrateUI();
		try{ ensureReyCheckbox(); }catch(_){ }
		try{ recalcScore(); }catch(_){ }
	},0);
}

function setPenHint(el){
	const key = el.dataset.pen;
	// For the Lovers' Bridge we keep a single visual label keyed to the base name
	const baseKey = key && key.startsWith('puente-enamorados') ? 'puente-enamorados' : key;
	const v = PEN_LABELS[key];
	const l = getLang();
	const v2 = PEN_LABELS[baseKey] || v;
	const txt = v2 ? (v2[l]||v2["es"]) : (l==="en"?"Drop here":"Soltar aquí");
	el.setAttribute("data-hint", txt);
	// ensure the overlay has a .pen-label positioned under the pen
	const overlay = el.parentElement;
	if(overlay){
		let lbl = overlay.querySelector('.pen-label[data-for-pen="'+baseKey+'"]');
		if(!lbl){
			lbl = document.createElement('div');
			lbl.className = 'pen-label';
			lbl.setAttribute('data-for-pen', baseKey);
			overlay.appendChild(lbl);
		}
		lbl.textContent = txt;
		// position it at the pen bottom-right (outside pen box)
		try{
			const overlayRect = overlay.getBoundingClientRect();
			const penRect = el.getBoundingClientRect();
			const left = penRect.left - overlayRect.left + penRect.width/2; // center below pen
			const top = penRect.top - overlayRect.top + penRect.height + 6; // 6px gap
			lbl.style.left = left + 'px';
			lbl.style.top = top + 'px';
			lbl.style.position = 'absolute';
			lbl.style.transform = 'translateX(0)';
		}catch(_){ }
		// position-only: CSS controls visibility (body.dragging + overlay:not([hidden]))
		// ensure we still reposition on overlay attribute/style changes
		if(!overlay.__pen_label_observer){
			overlay.__pen_label_observer = new MutationObserver(()=>{ positionOverlayLabels(); });
			overlay.__pen_label_observer.observe(overlay, { attributes: true, attributeFilter: ['hidden', 'style'] });
		}
	}
}

function positionOverlayLabels(){
	// Reposition any per-pen absolute labels under their pen (used on resize)
	const stage = document.getElementById('stage'); if(!stage) return;
	Array.from(stage.querySelectorAll('.overlay')).forEach(overlay=>{
		const overlayRect = overlay.getBoundingClientRect();
		Array.from(overlay.querySelectorAll('.pen-label')).forEach(lbl=>{
			const penKey = lbl.getAttribute('data-for-pen');
			if(!penKey) return;
			const penEl = overlay.querySelector('[data-pen="'+penKey+'"]');
			if(!penEl) return;
			const penRect = penEl.getBoundingClientRect();
			const left = penRect.left - overlayRect.left + penRect.width/2;
			const top = penRect.top - overlayRect.top + penRect.height + 6;
			lbl.style.left = left + 'px';
			lbl.style.top = top + 'px';
		});
	});
}

// compute whether a pen's slots need wrapping: if total minimal width > container width
function computeWrapForPen(penEl){
	const slots = penEl.querySelector('.slots');
	if(!slots) return;
	// only target the two pens we want
	if(!['pradera-amor','trio-frondoso'].includes(penEl.dataset.pen)) return;
	const slotEls = Array.from(slots.querySelectorAll('.slot'));
	if(slotEls.length===0) return;
	// compute required width: sum of min-widths + gaps
	const gap = parseFloat(getComputedStyle(slots).getPropertyValue('--slot-gap')) || 1;
	const minWidths = slotEls.map(s=>{
		const mw = parseFloat(getComputedStyle(s).minWidth) || 18;
		return mw;
	});
	const totalMin = minWidths.reduce((a,b)=>a+b,0) + gap*(slotEls.length-1);
	const avail = slots.getBoundingClientRect().width;
	if(totalMin > avail){
		slots.classList.add('allow-wrap');
	}else{
		slots.classList.remove('allow-wrap');
	}
}

function hydrateUI(){
	const h = document.querySelector("header h1"); if(h) h.textContent = t("ui.header") + " (Calculator)";
	const lblLight = document.querySelector('label[for="light"]'); const lblDark = document.querySelector('label[for="dark"]'); if(lblLight) lblLight.textContent = t("ui.theme_light"); if(lblDark) lblDark.textContent = t("ui.theme_dark");
	const lblSummer = document.querySelector('label[for="summer"]'); const lblWinter = document.querySelector('label[for="winter"]'); if(lblSummer) lblSummer.textContent = t("ui.mode_summer"); if(lblWinter) lblWinter.textContent = t("ui.mode_winter");
	const lblEs = document.querySelector('label[for="lang-es"]'); const lblEn = document.querySelector('label[for="lang-en"]'); if(lblEs) lblEs.textContent = t("ui.lang_es"); if(lblEn) lblEn.textContent = t("ui.lang_en");
	const nameLbl = document.querySelector('label[for="player-name"]'); if(nameLbl) nameLbl.textContent = t("ui.name_label");
	const bExp = document.getElementById("btn-export"); const bImp = document.getElementById("btn-import"); if(bExp) bExp.textContent = t("ui.export"); if(bImp) bImp.textContent = t("ui.import");
	const debugLbl = document.querySelector('#debugCtl label[for="debug"]'); if(debugLbl) debugLbl.textContent = t("ui.debug");
	const resetBtn = document.getElementById("resetBtn"); if(resetBtn) resetBtn.textContent = t("ui.reset");
	const scoreTitle = document.querySelector('.panel .card h3'); if(scoreTitle) scoreTitle.textContent = t("ui.score_title");
	const rivalCard = document.querySelectorAll('.panel .card h3')[1]; if(rivalCard) rivalCard.textContent = t("ui.rival_title");
	const totalLbl = document.getElementById('score-total-label'); if(totalLbl) totalLbl.textContent = t('ui.score_total_label');
	const reyContainerEl = document.getElementById('rey-container');
	const reyLabelEl = document.getElementById('rey-label');
	const puestoLbl = document.querySelector('#input-derecha')?.parentElement;
	if(reyLabelEl) reyLabelEl.textContent = t("ui.rey_label");

	// If the rey label contains a {species} placeholder, substitute with the current species in rey-selva (if any)
	if(reyLabelEl){
		const raw = t("ui.rey_label");
		const speciesInRey = document.querySelector('[data-pen="rey-selva"] .slot .token')?.dataset.species || null;
		const speciesLabel = getSpeciesLabel(speciesInRey);
		if(raw && raw.indexOf('{species}')!==-1){
			// Build a two-line visual inside the label element only (do not clear the whole container)
			const desc = raw.replace('{species}', '');
			reyLabelEl.innerHTML = '';
			const span = document.createElement('span'); span.className = 'rey-label';
			const top = document.createElement('span'); top.className = 'rey-species'; top.textContent = speciesLabel;
			const bot = document.createElement('span'); bot.className = 'rey-desc'; bot.textContent = desc.trim();
			span.appendChild(top); span.appendChild(bot);
			reyLabelEl.appendChild(span);
		}
	}

	// ensure puesto visibility according to current mode
	const puestoContainer = document.getElementById('puesto-container');
	const reyContainer = document.getElementById('rey-container');
	if(puestoContainer){
		// Default: hide puesto unless conditions met
		if(getMode()==='invierno'){
			// Only show puesto controls if there is a dinosaur in the puesto-observacion pen
			const puestoSpecies = document.querySelector('[data-pen="puesto-observacion"] .slot .token')?.dataset.species || null;
			if(puestoSpecies){
				// reveal the control and update label to include species
				puestoContainer.style.display = '';
				try{
					const inp = document.getElementById('input-derecha');
					const raw = t('ui.puesto_label');
					let spLabel = getSpeciesLabel(puestoSpecies);
					// In Spanish the species name should be uppercased per request
					if(getLang()==='es') spLabel = spLabel.toUpperCase();
					const labelEl = document.getElementById('puesto-label') || puestoContainer.querySelector('label');
					if(labelEl && raw){
						// Ensure the label keeps question marks and formatting from I18N
						labelEl.textContent = raw.replace('{species}', spLabel);
					}
					if(inp) inp.style.display = '';
				}catch(_){ }
			} else {
				puestoContainer.style.display = 'none';
			}
		} else {
			// In Summer, follow existing behavior (hide in summer)
			puestoContainer.style.display = 'none';
		}
	}
	if(reyContainer){
		// Decide UI for Rey controls depending on mode
		const reySpecies = document.querySelector('[data-pen="rey-selva"] .slot .token')?.dataset.species || null;
		const bottomWrapper = document.getElementById('rey-self-bottom');
		const selfChk = document.getElementById('input-rey-self');
		const selfLbl = document.getElementById('input-rey-self-label');
		if(getMode()==='verano'){
			// In Summer, hide the full "Ajustes con rivales" card and show only the compact bottom checkbox card
			const rivalCard = reyContainerEl?.closest('.card');
			if(rivalCard) rivalCard.style.display = 'none';
			if(bottomWrapper && selfChk && selfLbl){
				if(reySpecies){
					bottomWrapper.style.display = '';
					const sp = getSpeciesLabel(reySpecies).toUpperCase();
					// Use I18N label and replace {species} with uppercased species for Spanish (and plain species for English)
					const raw = t('ui.rey_self_label') || '¡Soy el jugador que tiene la misma o mayor cantidad de la especie {species} en la partida?';
					// In Spanish the species should be uppercased per request; for English keep normal casing
					const speciesForLabel = (getLang()==='es') ? sp : getSpeciesLabel(reySpecies);
					selfLbl.textContent = raw.replace('{species}', speciesForLabel);
				} else {
					bottomWrapper.style.display = 'none';
					if(selfChk) selfChk.checked = false;
				}
			}
		} else {
			// Not Summer: restore rival card visibility and hide bottom compact checkbox
			const rivalCard = reyContainerEl?.closest('.card');
			if(rivalCard) rivalCard.style.display = '';
			if(bottomWrapper) bottomWrapper.style.display = 'none';
		}
	}

	// Populate mode-specific rules/help panel
	const rulesBody = document.getElementById('mode-rules-body');
	const rulesTitle = document.getElementById('mode-rules-title');
	if(rulesBody){
		// Get localized strings from I18N.rules for the current language
		const lang = getLang();
		const rulesObj = (I18N[lang] && I18N[lang].rules) ? I18N[lang].rules : I18N['es'].rules;
		if(getMode()==='verano'){
			rulesTitle.textContent = rulesObj.title_summer || rulesObj.title || '';
			rulesBody.innerHTML = rulesObj.summer || '';
		} else {
			rulesTitle.textContent = rulesObj.title_winter || rulesObj.title || '';
			rulesBody.innerHTML = rulesObj.winter || '';
		}
	}

	// Update species labels in the palette and any placed tokens so they reflect current language
	try{
		Array.from(document.querySelectorAll('#palette .token-template')).forEach(el=>{
			const sp = el.dataset.species;
			const lab = el.querySelector('.label');
			if(lab) lab.textContent = getSpeciesLabel(sp);
		});
		Array.from(document.querySelectorAll('.slot .token')).forEach(tok=>{
			const sp = tok.dataset.species;
			const lab = tok.querySelector('.label');
			if(lab) lab.textContent = getSpeciesLabel(sp);
		});
	}catch(_){ }
}

function getSpeciesLabel(speciesId){
	if(!speciesId) return '';
	// Prefer I18N.species localized name if available
	const lang = getLang();
	const localized = (I18N[lang] && I18N[lang].species && I18N[lang].species[speciesId]) ? I18N[lang].species[speciesId] : null;
	if(localized) return localized;
	const sp = ESPECIES.find(s=>s.id===speciesId);
	return sp ? sp.label : speciesId;
}

function setTheme(t){ document.body.setAttribute("data-theme", t); localStorage.setItem("theme",t); }
function setMode(m){
	const img = $("#board");
	// When changing modes, reset all dinosaur placements to avoid mixing summer/winter setups.
	// Clear existing tokens, rebuild slots, and then show the appropriate overlay image.
	clearAll();
	buildAll();
	if(m==="summer"){ $("#overlay-summer").hidden=false; $("#overlay-winter").hidden=true; img.src="assets/VERANO.png"; }
	else { $("#overlay-summer").hidden=true; $("#overlay-winter").hidden=false; img.src="assets/INVIERNO.png"; }
	// update puesto visibility
	const puestoContainer = document.getElementById('puesto-container');
	const reyContainer = document.getElementById('rey-container');
	if(puestoContainer){ puestoContainer.style.display = (m==="winter") ? '' : 'none'; }
	if(reyContainer){ reyContainer.style.display = (m==="summer") ? '' : 'none'; }
	localStorage.setItem("mode",m);
	// refresh pen label visibility for both overlays and recompute sizing
	$$("#overlay-summer .pen").forEach(p=>setPenHint(p));
	$$("#overlay-winter .pen").forEach(p=>setPenHint(p));
	recalcScore();
}
function getMode(){ return $("#overlay-winter").hidden ? "verano" : "invierno"; }

/* Scoring constants (VP tables) */
const VP_BOSQUE_SEMEJANZA = [0,2,4,8,12,18,24];
const VP_PRADO_DIFERENCIA = [0,1,3,6,10,15,21];
const VP_RIO = (n) => n;
const VP_TRIO = (n) => (n===3 ? 7 : 0);
const VP_PRADERA_AMOR = (arr) => { const c={}; (arr||[]).forEach(s=>{ if(!s) return; c[s]=(c[s]||0)+1; }); let p=0; for(const k in c){ p += Math.floor(c[k]/2)*5; } return p; };
const VP_REY_SELVA = (yourCount, rivalMax) => (yourCount >= rivalMax ? 7 : 0);
const VP_ISLA_SOLITARIA = (species, parkCounts) => (parkCounts[species]===1 ? 7 : 0);
const VP_BOSQUE_ORDENADO = VP_BOSQUE_SEMEJANZA;
const VP_PIRAMIDE_INFERIOR = (n)=>n*1;
const VP_PIRAMIDE_MEDIO   = (n)=>n*4;
const VP_PIRAMIDE_SUPERIOR= (n)=>n*7;
const VP_PUESTO_OBS = (derecha)=>derecha*2;
const VP_PUENTE = (izqArr, derArr)=>{ const l={}; (izqArr||[]).forEach(s=>{ if(!s) return; l[s]=(l[s]||0)+1; }); const r={}; (derArr||[]).forEach(s=>{ if(!s) return; r[s]=(r[s]||0)+1; }); let p=0; for(const k in l){ if(r[k]) p+=Math.min(l[k], r[k]); } return p*6; };


function applyTokenBackground(el, id, hue){
	// Ensure there's a .thumb element inside the token/card to hold the image
	let thumb = el.querySelector('.thumb');
	if(!thumb){
		thumb = document.createElement('div');
		thumb.className = 'thumb';
		// insert thumb at the top so label stays below
		el.insertBefore(thumb, el.firstChild);
	}
	// fallback gradient/background color while image loads
	thumb.style.background = `linear-gradient(135deg, hsl(${hue} 60% 70%), hsl(${hue} 60% 60%))`;
	const img = new Image();
	img.onload = ()=>{ thumb.style.background = `url(assets/${id}.png) center/cover no-repeat, #fff`; };
	img.onerror = ()=>{};
	img.src = `assets/${id}.png`;
}

/* Paleta */
function createPalette(){
	const grid = document.getElementById('palette');
	if(!grid) return;
	grid.innerHTML = "";
	ESPECIES.forEach(sp=>{
		const card = document.createElement('div');
		card.className = 'token-template';
		card.draggable = true;
		card.dataset.species = sp.id;
		// image/background and label
		applyTokenBackground(card, sp.id, sp.hue);
		const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = getSpeciesLabel(sp.id);
		card.appendChild(lab);
		// drag handlers
		card.addEventListener('dragstart', onDragStartPalette);
		card.addEventListener('dragstart', addDragVisual);
		card.addEventListener('dragend', removeDragVisual);
		grid.appendChild(card);
	});

	// After palette built, adjust palette gap based on label widths
	try{ updatePaletteGap(); }catch(_){ }
}

// Measure the widest label under tokens and set --palette-gap so gap >= label width
function updatePaletteGap(){
	const grid = document.getElementById('palette'); if(!grid) return;
	const labels = Array.from(grid.querySelectorAll('.token-template .label'));
	if(labels.length===0) return;
	let maxW = 0;
	labels.forEach(l=>{ const r = l.getBoundingClientRect(); if(r.width > maxW) maxW = r.width; });
	// Use a small padding so label isn't cramped; keep a sensible min/max
	const gap = Math.min(28, Math.max(10, Math.round(maxW + 8)));
	document.documentElement.style.setProperty('--palette-gap', gap + 'px');
}

let tokenSeq = 1;
function makeToken(species){
	if(!VALID.has(species)) return document.createElement('div');
	const sp = ESPECIES.find(s=>s.id===species);
	const t = document.createElement('div');
	t.className = 'token';
	t.dataset.species = species;
	t.dataset.id = 't'+(tokenSeq++);
	t.draggable = true;
	// events
	t.addEventListener('dragstart', onDragStartExisting);
	t.addEventListener('dragend', clearHighlights);
	t.addEventListener('dragstart', addDragVisual);
	t.addEventListener('dragend', removeDragVisual);
	// visuals
	applyTokenBackground(t, sp.id, sp.hue);
	const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = getSpeciesLabel(sp.id);
	t.appendChild(lab);
	const del = document.createElement('button'); del.className = 'delete'; del.textContent = '×'; del.title = 'Quitar';
	// When removing a token, shift subsequent tokens left to avoid gaps
	del.onclick = ()=>{
		const s = t.closest('.slot');
		if(s) shiftSlotsAfterRemoval(s);
		recalcScore();
	};
	t.appendChild(del);

	// Also allow clicking the token itself (not the delete button) to remove it
	// This mirrors pressing the '×' delete button but ignores clicks that hit the button.
	t.addEventListener('click', (e)=>{
		if(e.target.closest && e.target.closest('.delete')) return; // let the delete button handler run
		const s = t.closest('.slot');
		if(s) {
			shiftSlotsAfterRemoval(s);
			recalcScore();
		}
	});
	return t;
}

// Expose createPalette so init code can call it from index.html flow
window.createPalette = createPalette;

/* Slots */
function makeSlots(container){
	const cap=parseInt(container.dataset.cap||"0");
	container.innerHTML="";
	// expose slot count as a CSS variable so styling can compute widths
	container.style.setProperty('--slot-count', String(cap));
	for(let i=0;i<cap;i++){
		const s=document.createElement("div");
		s.className="slot"; s.dataset.index=i;
		container.appendChild(s);
	}
}

// Ensure container has at least `cap` slot elements without removing existing tokens
function ensureSlots(container, cap){
	if(!container) return;
	const existing = Array.from(container.querySelectorAll('.slot'));
	const existCount = existing.length;
	container.style.setProperty('--slot-count', String(Math.max(cap, existCount)));
	container.dataset.cap = String(Math.max(cap, existCount));
	for(let i = existCount; i < cap; i++){
		const s = document.createElement('div'); s.className = 'slot'; s.dataset.index = i;
		container.appendChild(s);
	}
	// If there are more existing slots than cap, we keep them (do not remove) to avoid losing tokens.
}
// Shift tokens left after a removal so there are no gaps between occupied slots
function shiftSlotsAfterRemoval(slotEl){
	const slotsContainer = slotEl.closest('.slots');
	const penEl = slotEl.closest('.pen');
	if(!penEl || !slotsContainer) return;
	const pen = penEl.dataset.pen;
	// Special handling for river: operate on a single .slots container when present
	if(pen === 'rio'){
		const rioPen = document.querySelector('[data-pen="rio"]');
		if(!rioPen) return;
		const single = rioPen.querySelector('.slots:not([data-sub])');
		if(single){
			const allSlots = Array.from(single.querySelectorAll('.slot')).sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index));
			const removedIdx = allSlots.indexOf(slotEl);
			if(removedIdx === -1) return;
			// shift by moving the DOM node from next slot into current slot
			for(let i = removedIdx; i < allSlots.length - 1; i++){
				const nextTok = allSlots[i+1].querySelector('.token');
				allSlots[i].replaceChildren();
				if(nextTok) allSlots[i].appendChild(nextTok);
			}
			// clear last
			allSlots[allSlots.length - 1].replaceChildren();
			return;
		}
		// fallback for legacy sub-columns: flatten and shift across them
		const allSlots = Array.from(document.querySelectorAll('[data-pen="rio"] .slots[data-sub] .slot'))
			.sort((a,b)=> parseInt(a.dataset.index) - parseInt(b.dataset.index));
		const removedIdx = allSlots.indexOf(slotEl);
		if(removedIdx === -1) return;
		for(let i = removedIdx; i < allSlots.length - 1; i++){
			const nextTok = allSlots[i+1].querySelector('.token');
			allSlots[i].replaceChildren();
			if(nextTok) allSlots[i].appendChild(nextTok);
		}
		allSlots[allSlots.length - 1].replaceChildren();
		return;
	}

	// default: single .slots container
	const slots = Array.from(slotsContainer.querySelectorAll('.slot')).sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index));
	const idx = slots.indexOf(slotEl);
	if(idx === -1) return;
	// shift left
	for(let i=idx;i<slots.length-1;i++){
		const nextTok = slots[i+1].querySelector('.token');
		slots[i].replaceChildren();
		if(nextTok) slots[i].appendChild(nextTok.cloneNode(true));
	}
	slots[slots.length-1].replaceChildren();
}
function buildAll(){
	$$("#overlay-summer .slots").forEach(makeSlots);
	const pyr=document.querySelector('[data-pen="piramide"]');
	if(pyr){
		const b=pyr.querySelector(".pyr-bottom"), m=pyr.querySelector(".pyr-middle"), t=pyr.querySelector(".pyr-top");
		[b,m,t].forEach(r=>{ r.innerHTML = ""; if(r) { r.classList.add('slots'); } });
		// mark capacities so CSS/JS treat these as slots containers
		if(b) { b.style.setProperty('--slot-count', '3'); b.dataset.cap = '3'; }
		if(m) { m.style.setProperty('--slot-count', '2'); m.dataset.cap = '2'; }
		if(t) { t.style.setProperty('--slot-count', '1'); t.dataset.cap = '1'; }
		// create global-indexed slots: bottom 0..2, middle 3..4, top 5
		for(let i=0;i<3;i++){ const s=document.createElement("div"); s.className="slot"; s.dataset.index=i; b.appendChild(s); }
		for(let i=3;i<5;i++){ const s=document.createElement("div"); s.className="slot"; s.dataset.index=i; m.appendChild(s); }
		for(let i=5;i<6;i++){ const s=document.createElement("div"); s.className="slot"; s.dataset.index=i; t.appendChild(s); }
	}
	$$('#overlay-winter .slots:not(.pyr-bottom):not(.pyr-middle):not(.pyr-top)').forEach(makeSlots);

	// ensure any .slots (including sub columns) have --slot-count set for CSS sizing
	$$('#stage .slots').forEach(s=>{
		const cap = parseInt(s.dataset.cap||s.children.length||0);
		if(cap && !s.style.getPropertyValue('--slot-count')) s.style.setProperty('--slot-count', String(cap));
	});

	// River: keep a single .slots container for the river (no sub-columns)
	// This makes rio a single continuous placement area. We intentionally do not
	// split the rio into multiple sub-columns anymore; any previously created
	// sub-columns (from older versions) will be flattened back into a single
	// .slots if possible.
	(function(){
		const rioPen = document.querySelector('[data-pen="rio"]');
		if(!rioPen) return;
		// if there are multiple .slots[data-sub], attempt to flatten them into
		// the first available single .slots container. Keep token order.
		const subs = Array.from(rioPen.querySelectorAll('.slots[data-sub]'));
		if(subs.length > 0){
			// create or find a single .slots container
			let target = rioPen.querySelector('.slots:not([data-sub])');
			if(!target){
				target = document.createElement('div'); target.className = 'slots';
				// try to copy cap from first sub if present
				const firstCap = parseInt(subs[0].dataset.cap||subs[0].children.length||0);
				if(firstCap) target.dataset.cap = String(firstCap * subs.length);
				// replace first sub with target and remove the rest
				subs[0].replaceWith(target);
				for(let i=1;i<subs.length;i++) subs[i].remove();
			}
			// gather all tokens in order and set them into the single container
			const flat = [];
			subs.forEach(s=>{ Array.from(s.querySelectorAll('.slot')).sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index)).forEach(sl=>{ const tok = sl.querySelector('.token'); flat.push(tok?tok.dataset.species:null); }); });
			// ensure target has slots for the flattened array
			const cap = Math.max(parseInt(target.dataset.cap||"0"), flat.length);
			target.dataset.cap = String(cap);
			makeSlots(target);
			flat.forEach((sp,i)=>{ const sl = target.querySelector(`.slot[data-index="${i}"]`); if(sl){ sl.replaceChildren(); if(sp && VALID.has(sp)) sl.appendChild(makeToken(sp)); } });
		}
	})();

	// After building slots, ensure sizing reflects current contents
	if(typeof updateSlotSizing === 'function') updateSlotSizing();

	// Force pradera-amor to consider wrap behavior so tokens can form 2x2 when many
	const praderaSlots = document.querySelector('.pen[data-pen="pradera-amor"] .slots');
	if(praderaSlots){
		// let computeWrapForPen decide, but ensure the class exists if capacity > 2
		if(parseInt(praderaSlots.dataset.cap||'0') > 2) praderaSlots.classList.add('allow-wrap');
	}

	// Apply per-pen inset overrides from data attributes, e.g. data-inset-vertical="8%"
	$$("#stage .pen").forEach(p=>{
		const slots = p.querySelector('.slots');
		if(!slots) return;
		const v = p.dataset.insetVertical || p.getAttribute('data-inset-vertical');
		const h = p.dataset.insetHorizontal || p.getAttribute('data-inset-horizontal');
		if(v) slots.style.setProperty('--slots-inset-vertical', v);
		if(h) slots.style.setProperty('--slots-inset-horizontal', h);

		// Allow authors to declare pen geometry via data attributes (data-left, data-top, data-width, data-height)
		if(p.dataset.left) p.style.left = p.dataset.left;
		if(p.dataset.top) p.style.top = p.dataset.top;
		if(p.dataset.width) p.style.width = p.dataset.width;
		if(p.dataset.height) p.style.height = p.dataset.height;
	});
}

// Adjust slot sizing based on how many tokens are placed in each .slots container.
function updateSlotSizing(){
	$$('#stage .slots').forEach(slots=>{
		// count placed tokens in this slots container
		const placed = Array.from(slots.querySelectorAll('.slot')).filter(s=>s.querySelector('.token')).length;
		const cap = parseInt(slots.dataset.cap||slots.children.length||0);
		const visibleCount = Math.max(placed, 1); // avoid zero
		// Default slot-count: use the capacity so empty pens show all slots, but for the
		// Pradera del Amor we prefer to shrink the effective slot-count when few tokens
		// are placed so a single dinosaur can occupy the area visibly.
		let slotCountVar = Math.max(cap, visibleCount);
		const penEl = slots.closest('.pen');
		if(penEl && penEl.dataset.pen === 'pradera-amor'){
			// Prefer these behaviors for Pradera del Amor:
			// - no tokens: show full capacity
			// - single token: make it occupy the full pen (slot-count = 1)
			// - 2+ tokens: restore capacity so wrapping into 2 columns produces neat rows (2,2,2)
			if(placed === 0) slotCountVar = cap;
			else if(placed === 1) slotCountVar = 1;
			else slotCountVar = cap;
		}
		// update css variable for slot count so widths recompute
		slots.style.setProperty('--slot-count', String(slotCountVar));
		// adjust slot height based on number of placed tokens: more tokens -> smaller height
		const slotEls = slots.querySelectorAll('.slot');
		slotEls.forEach(sl=>{
			const has = !!sl.querySelector('.token');
			if(has){
				// scale down occupied slot a bit to fit more
				sl.style.height = (Math.max(36, 76 - (placed*6))) + 'px';
			} else {
				sl.style.height = '';
			}
		});
	});

	// Dynamic token sizing for Pradera del Amor: make single token larger but not tiny; shrink progressively and enable wrap
	const pradera = document.querySelector('.pen[data-pen="pradera-amor"]');
	if(pradera){
		const slots = pradera.querySelector('.slots');
		const placed = pradera.querySelectorAll('.slot .token').length;

		// default behavior: keep tokens large for 1, moderate for 2, smaller for 3+, always clamp to avoid overflow
		// We'll compute target width as percentage of slot width. We try to be responsive: when we can measure a slot,
		// compute pixel-based max and clamp percentage so multiple tokens fit.
		let targetPercent = 90; // percent of slot width for a single token
		let cols = 1;
		if(placed <= 1){ targetPercent = 90; cols = 1; }
		else if(placed === 2){ targetPercent = 70; cols = 2; }
		else if(placed === 3){ targetPercent = 55; cols = 2; }
		else { targetPercent = 44; cols = 2; }

		// If we can measure one slot's computed width, adjust percent so N columns won't overflow available slots width
		if(slots){
			const firstSlot = slots.querySelector('.slot');
			if(firstSlot){
				const slotRect = firstSlot.getBoundingClientRect();
				const available = slots.getBoundingClientRect().width;
				// desired total width if tokens were side-by-side = placed * (slotWidth * targetPercent/100)
				const desiredTotal = placed * (slotRect.width * (targetPercent/100)) + (placed - 1) * (parseFloat(getComputedStyle(slots).getPropertyValue('--slot-gap')) || 0);
				// If desired total exceeds available width, reduce targetPercent proportionally (but not below 30%)
				if(desiredTotal > available && available > 0){
					const shrinkFactor = available / desiredTotal;
					targetPercent = Math.max(30, Math.round(targetPercent * shrinkFactor));
				}
			}
			// apply wrapping based on number placed (wrap when >1)
			slots.classList.toggle('allow-wrap', placed > 1);
			// If wrapping is enabled, clear any inline heights so grid/flex can size items properly
			if(placed > 1){
				Array.from(slots.querySelectorAll('.slot')).forEach(s=>{ s.style.height=''; });
			}
			slots.style.setProperty('--wrap-cols', String(cols));
		}

		pradera.style.setProperty('--pradera-token-width', targetPercent + '%');
	// make the lone token smaller (40% smaller) as requested
	const scale = (placed === 1) ? 0.6 : 1;
		pradera.style.setProperty('--pradera-token-scale', String(scale));

		// If exactly one token placed, compute a recommended slot height so the scaled token fits
		if(placed === 1 && slots){
			const slot = slots.querySelector('.slot');
			if(slot){
				// measure the slot width to compute token pixel height, using token aspect ratio ~1
				const slotW = slot.getBoundingClientRect().width || 72;
				// token width in px
				const tokenPx = slotW * (targetPercent/100) * scale;
				// add room for label and padding: assume token thumbnail ~tokenPx and label ~18px + padding
				const desiredH = Math.max(44, Math.round(tokenPx + 20));
				Array.from(slots.querySelectorAll('.slot')).forEach(s=>{ s.style.height = desiredH + 'px'; });
			}
		} else if(slots){
			// clear explicit heights for multi-token or empty cases so grid sizing can apply
			Array.from(slots.querySelectorAll('.slot')).forEach(s=>{ s.style.height = ''; });
		}
	}

	// Rio: shrink token visuals when many dinosaurs are present so the pen can accommodate up to MAX_RIO
	const rioPen = document.querySelector('.pen[data-pen="rio"]');
	if(rioPen){
		const rioSlots = rioPen.querySelector('.slots');
		if(rioSlots){
			const placed = rioSlots.querySelectorAll('.slot .token').length;
			// compute scale: 1.0 for 1-4 tokens, down to 0.5 at MAX_RIO
			let scale = 1.0;
			if(placed <= 4){ scale = 1.0; }
			else {
				const excess = Math.min(placed, MAX_RIO) - 4;
				const span = MAX_RIO - 4;
				scale = Math.max(0.5, 1 - (excess / span) * 0.5);
			}
			rioPen.style.setProperty('--rio-token-scale', String(scale));
			// adjust slot heights to reflect scaled tokens (assume base height ~76px like CSS)
			const baseH = 76;
			Array.from(rioSlots.querySelectorAll('.slot')).forEach(s=>{ s.style.height = Math.max(28, Math.round(baseH * scale)) + 'px'; });
		}
	}

	// Bridge subpens: make tokens large when few, shrink progressively when many
	['puente-enamorados-1','puente-enamorados-2'].forEach(pkey=>{
		const pen = document.querySelector('.pen[data-pen="'+pkey+'"]');
		if(!pen) return;
		const slots = pen.querySelector('.slots');
		if(!slots) return;
		const placed = slots.querySelectorAll('.slot .token').length;
		// target behavior: 0 -> no tokens (default css), 1-2 tokens -> large (80-70%), 3-4 -> medium (60-50%), 5-6 -> small (45-38%)
		let widthPct = 80;
		if(placed <= 1) widthPct = 80;
		else if(placed === 2) widthPct = 70;
		else if(placed === 3) widthPct = 60;
		else if(placed === 4) widthPct = 52;
		else if(placed === 5) widthPct = 45;
		else widthPct = 38;
		// compute a gentle scale factor based on width
		let scale = Math.min(1, Math.max(0.6, widthPct/80));
		// if there are more tokens than visual capacity, tighten gap a bit
		slots.style.setProperty('--slot-gap', (placed >= 5) ? '3px' : '6px');
		// If the pen has an explicit --bridge-token-width set inline (user override in HTML), respect it.
		const explicitWidth = getComputedStyle(pen).getPropertyValue('--bridge-token-width').trim();
		if(!explicitWidth){
			pen.style.setProperty('--bridge-token-width', widthPct + '%');
		}
		// Always allow JS to suggest a scale factor, but avoid shrinking below the inline scale if present
		const explicitScale = getComputedStyle(pen).getPropertyValue('--bridge-token-scale').trim();
		if(!explicitScale){
			pen.style.setProperty('--bridge-token-scale', String(scale));
		} else {
			// If the explicit scale is smaller than our computed scale, prefer the larger visual scale
			try{
				const ex = parseFloat(explicitScale);
				if(!isNaN(ex) && ex < scale) pen.style.setProperty('--bridge-token-scale', String(scale));
			}catch(_){ /* ignore parse errors */ }
		}
		// ensure slots don't let tokens touch pen borders
		slots.style.padding = '6px';
	});

	// Quarantine: if token present, make sure token sizing is large and slot height fits
	const cuarentena = document.querySelector('.pen[data-pen="cuarentena"]');
	if(cuarentena){
		const s = cuarentena.querySelector('.slots');
		const placed = s ? s.querySelectorAll('.slot .token').length : 0;
		if(placed === 1 && s){
			// increase slot height so the larger token fits comfortably
			Array.from(s.querySelectorAll('.slot')).forEach(sl=>{ sl.style.height = '110px'; });
		}
	}

	// Pyramid: avoid forcing explicit per-slot heights here. Token sizing for the pyramid
	// should be controlled via CSS variables set on the .pen (e.g. --piramide-token-max-height)
	// and by the natural slot sizing created in buildAll(). This prevents one slot from
	// being resized differently causing visual discrepancies between the three bottom slots.
}

/* DnD + Animación (remainder) */
let dragData=null;
function setCustomDragImage(ev){
	const c=document.createElement("canvas"); c.width=1; c.height=1;
	ev.dataTransfer.setDragImage(c, 0, 0);
}
function highlightValidPens(species, movingTokenId=null){
	document.getElementById('stage').classList.add('drag-overlay-on');
	$$("#stage .pen").forEach(p=>{
		const pen=p.dataset.pen;
		const idx = firstValidIndex(pen, null, species, movingTokenId);
		const ok = (idx>=0 || pen==="piramide");
		p.classList.toggle("can-drop", ok);
		if(ok) setPenHint(p);
	});
	// ensure labels positioned correctly for visible overlays
	try{ positionOverlayLabels(); }catch(_){ }
}
function clearHighlights(){ $$("#stage .pen").forEach(p=>p.classList.remove("can-drop")); document.body.classList.remove("dragging"); document.getElementById('stage').classList.remove('drag-overlay-on'); }

function onDragStartPalette(e){
	document.body.classList.add("dragging");
	const species=e.currentTarget.dataset.species;
	dragData={species, tokenId:null, fromPen:null};
	e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	e.dataTransfer.effectAllowed="copy";
	setCustomDragImage(e);
	highlightValidPens(species, null);
}
function onDragStartExisting(e){
	document.body.classList.add("dragging");
	const t=e.currentTarget, slot=t.closest(".slot");
	const pen=t.closest(".pen")?.dataset.pen || null;
	const sub=slot.closest(".slots")?.dataset.sub || null;
	dragData={species:t.dataset.species, tokenId:t.dataset.id, fromPen:pen, fromIndex:parseInt(slot.dataset.index||"-1"), fromSub:sub};
	e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	e.dataTransfer.effectAllowed="move";
	setCustomDragImage(e);
	highlightValidPens(dragData.species, dragData.tokenId);
}
function addDragVisual(e){ e.currentTarget.classList.add("dragging-token"); document.getElementById('stage').classList.add('drag-overlay-on'); }
function removeDragVisual(e){ e.currentTarget.classList.remove("dragging-token"); document.body.classList.remove("dragging"); document.getElementById('stage').classList.remove('drag-overlay-on'); }

// Pen-level DnD
function attachPenDnD(){
	$$("#stage .pen").forEach(pen=>{
		pen.addEventListener("dragover", onDragOverPen);
		pen.addEventListener("dragleave", onDragLeavePen);
		pen.addEventListener("drop", onDropPen);
	});
}
function onDragOverPen(e){
	e.preventDefault();
	if(!dragData) return;
	const res = pickPlacementInPen(e.currentTarget, e.clientX, e.clientY, dragData.species, dragData?.tokenId);
	e.currentTarget.classList.toggle("can-drop", !!res);
	if(res){ setPenHint(e.currentTarget); }
}
function onDragLeavePen(e){
	e.currentTarget.classList.remove("can-drop");
}
function onDropPen(e){
	e.preventDefault();
	const penEl = e.currentTarget;
	penEl.classList.remove("can-drop");
	try{ dragData=JSON.parse(e.dataTransfer.getData("text/plain")||"null"); }catch{ dragData=null; }
	if(!dragData) return;
	const res = pickPlacementInPen(penEl, e.clientX, e.clientY, dragData.species, dragData?.tokenId);
	if(!res){
		const pen = penEl.dataset.pen; const sub = penEl.querySelector('.slots')?.dataset.sub || null;
		const key = invalidReason(pen, sub, dragData.species, dragData?.tokenId);
		const msg = (I18N[getLang()].errors[key] || I18N[getLang()].errors.generic_invalid);
		showToast(msg);
		clearHighlights();
		return;
	}
	const { pen, sub, index } = res;
	const container = sub ? document.querySelector(`[data-pen="${pen}"] .slots[data-sub="${sub}"]`) : document.querySelector(`[data-pen="${pen}"] .slots`);
	let finalSlot = null;
	if(pen === "piramide"){
		finalSlot = document.querySelector(`[data-pen="piramide"] .slot[data-index="${index}"]`);
	} else if(pen === "rio"){
		// ensure container exists and has enough slots
		const rioPen = document.querySelector(`[data-pen="rio"]`);
		const rioContainer = rioPen.querySelector('.slots:not([data-sub])') || rioPen.querySelector('.slots');
		if(!rioContainer) return; // nothing we can do
		const currentCap = parseInt(rioContainer.dataset.cap||rioContainer.children.length||0);
		if(index >= currentCap){
			// extend capacity by appending missing slots (do not rebuild to preserve tokens)
			const newCap = Math.min(MAX_RIO, index + 1);
			ensureSlots(rioContainer, newCap);
		}
		finalSlot = rioContainer.querySelector(`.slot[data-index="${index}"]`);
	} else {
		finalSlot = container.querySelector(`.slot[data-index="${index}"]`);
	}
	if(!finalSlot) return;
	// Special-case rio insertion at index 0: shift tokens up and insert the token at the bottom (index 0)
	if(pen === 'rio' && index === 0){
		const rioPen = document.querySelector('[data-pen="rio"]');
		const container = rioPen.querySelector('.slots:not([data-sub])') || rioPen.querySelector('.slots');
		if(!container) return;
		// current placed count and ensure we don't exceed MAX_RIO
		const currentArr = speciesInPen('rio');
		const currentCount = currentArr.filter(Boolean).length;
		if(currentCount >= MAX_RIO) { showToast(t('errors.no_space')); clearHighlights(); return; }
		// ensure at least one slot exists and cap is at most MAX_RIO
		const existingCap = Math.max(parseInt(container.dataset.cap||"0"), container.children.length || 0);
		const newCap = Math.min(MAX_RIO, Math.max(existingCap, currentCount + 1));
		ensureSlots(container, newCap);
		const slotEls = Array.from(container.querySelectorAll('.slot')).sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index));
		// Shift tokens up by moving nodes from higher index to index+1, starting from the last slot
		for(let i = slotEls.length - 1; i >= 1; i--){
			const prev = slotEls[i-1];
			const cur = slotEls[i];
			cur.replaceChildren();
			const tok = prev.querySelector('.token');
			if(tok) cur.appendChild(tok);
		}
		// Now place the new token into slot 0. If moving an existing token, remove it from old place first.
		if(dragData.tokenId){
			const old=document.querySelector(`.token[data-id="${dragData.tokenId}"]`);
			if(old){ old.parentElement?.replaceChildren(); }
			// create the token node to insert (use makeToken so handlers are attached) but preserve id
			const newTok = makeToken(dragData.species);
			// if old existed and had same id, prefer to reuse it to preserve identity
			if(old){ newTok.dataset.id = old.dataset.id; }
			slotEls[0].replaceChildren();
			slotEls[0].appendChild(newTok);
		} else {
			slotEls[0].replaceChildren(makeToken(dragData.species));
		}
		recalcScore();
		clearHighlights();
		return;
	}

	if(dragData.tokenId){
		const old=document.querySelector(`.token[data-id="${dragData.tokenId}"]`);
		if(old){ old.parentElement?.replaceChildren(); }
	}
	finalSlot.replaceChildren(makeToken(dragData.species));
	recalcScore();
	clearHighlights();

	// No automatic browser prompts; the UI exposes a single persistent checkbox at the bottom
	// that the user can tick when they are the player with the most (or equal) dinosaurs of the
	// species in Rey. The checkbox visibility is handled elsewhere in hydrateUI().
}

/* Toast helpers + invalidReason */
function ensureToastRoot(){
	let root = document.getElementById("toast");
	if(!root){
		root = document.createElement("div"); root.id = "toast";
		document.body.appendChild(root);
	}
	return root;
}
function showToast(msg, timeout=2800){
	const root = ensureToastRoot();
	const el = document.createElement("div");
	el.className = "toast-msg";
	el.textContent = msg;
	root.appendChild(el);
	setTimeout(()=>{ el.style.opacity = "0"; el.style.transition = "opacity .18s"; }, timeout-200);
	setTimeout(()=>{ el.remove(); }, timeout);
}

function invalidReason(pen, sub, species, movingTokenId){
	const current = speciesInPen(pen, sub).slice();
	const free = nextFreeIndex(current);
	// enforce species cap
	const parkCounts = getParkSpeciesCounts();
	const speciesCount = parkCounts[species] || 0;
	if(movingTokenId){
		const tok = document.querySelector(`.token[data-id="${movingTokenId}"]`);
		if(!(tok && tok.dataset.species===species) && speciesCount >= 10) return 'species_limit';
	} else {
		if(speciesCount >= 10) return 'species_limit';
	}
	if(free === -1){
		return "no_space";
	}
	if(pen === "bosque-semejanza"){
		const placed = current.filter(Boolean);
		if(placed.length>0 && species !== placed[0]) return "same_species_only";
		return null;
	}
	if(pen === "prado-diferencia"){
		if(current.includes(species)) return "all_different_only";
		return null;
	}
	if(pen === "rey-selva" || pen === "isla-solitaria" || pen === "puesto-observacion" || pen === "cuarentena"){
		if(current[0]) return "only_one";
		return null;
	}
	return "generic_invalid";
}

// Decide placement within a pen given pointer position
function pickPlacementInPen(penEl, clientX, clientY, species, movingTokenId){
	const pen = penEl.dataset.pen;
	// Old puente-enamorados used columns; now each bridge side is its own pen (puente-enamorados-1/2)
	if(pen==="piramide"){
		const slots = Array.from(penEl.querySelectorAll(".slot"));
		let best = null; let bestDist = Infinity;
		slots.forEach(sl=>{
			const i = parseInt(sl.dataset.index||"-1");
			if(i<0) return;
			if(!canPlaceInSlot("piramide", null, i, species, movingTokenId)) return;
			const r = sl.getBoundingClientRect();
			const cx = r.left + r.width/2, cy = r.top + r.height/2;
			const dx = cx - clientX, dy = cy - clientY;
			const d2 = dx*dx + dy*dy;
			if(d2 < bestDist){ bestDist = d2; best = i; }
		});
		return (best!=null) ? { pen, sub:null, index: best } : null;
	}

	if(pen === "rio"){
		// Behavior: prefer inserting at index 0 (bottom). If that's not valid (e.g.
		// species cap or other reason), attempt appending at the end if allowed.
		const tryIndex0 = canPlaceInSlot("rio", null, 0, species, movingTokenId);
		if(tryIndex0) return { pen, sub: null, index: 0 };
		// append fallback
		const cur = speciesInPen('rio');
		const appendIdx = cur.length;
		if(canPlaceInSlot('rio', null, appendIdx, species, movingTokenId)) return { pen, sub: null, index: appendIdx };
		return null;
	}

	const idx = firstValidIndex(pen, null, species, movingTokenId);
	return (idx>=0) ? { pen, sub:null, index: idx } : null;
}

/* Validación y selección de índice */
function speciesInPen(pen, sub=null){
	if(pen==="piramide"){
		const arr=Array.from(document.querySelectorAll('[data-pen="piramide"] .slot'))
			.sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index))
			.map(s=>s.querySelector(".token")?.dataset.species || null);
		return arr;
	}
	// Special handling for rio: prefer a single .slots container
	if(pen === "rio"){
		const penEl = document.querySelector(`[data-pen="rio"]`);
		if(!penEl) return [];
		const single = penEl.querySelector('.slots:not([data-sub])');
		if(single){
			return Array.from(single.querySelectorAll('.slot')).sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index)).map(s=>s.querySelector('.token')?.dataset.species || null);
		}
		// fallback: if older markup still has subs, flatten them
		const cols = penEl.querySelectorAll('.slots[data-sub]');
		const res = [];
		cols.forEach(col=>{
			const arr = Array.from(col.querySelectorAll('.slot')).sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index)).map(s=>s.querySelector('.token')?.dataset.species || null);
			res.push(...arr);
		});
		return res;
	}
	const scope = sub ? document.querySelector(`[data-pen="${pen}"] .slots[data-sub="${sub}"]`) : document.querySelector(`[data-pen="${pen}"] .slots`);
	if(!scope) return [];
	return Array.from(scope.querySelectorAll(".slot")).sort((a,b)=>parseInt(a.dataset.index)-parseInt(b.dataset.index)).map(s=>s.querySelector(".token")?.dataset.species || null);
}
function nextFreeIndex(arr){ for(let i=0;i<arr.length;i++){ if(!arr[i]) return i; } return -1; }

function firstValidIndex(pen, sub, species, movingTokenId=null){
	const current=speciesInPen(pen, sub).slice();
	if(movingTokenId){
		const tok=document.querySelector(`.token[data-id="${movingTokenId}"]`);
		const old=tok?.closest(".slot"); const oldPen=tok?.closest(".pen")?.dataset.pen || null;
		const oldSub=old?.closest(".slots")?.dataset.sub || null;
		const oldIdx=parseInt(old?.dataset.index||"-1");
		if(oldPen===pen && oldSub===sub){ current[oldIdx]=null; }
	}
	const free = nextFreeIndex(current);

	// Enforce a global per-species cap (10) across the park
	const parkCounts = getParkSpeciesCounts();
	const speciesCount = parkCounts[species] || 0;
	if(movingTokenId){
		// if moving an existing token of the same species, we allow because it'll free its old spot
		const tok = document.querySelector(`.token[data-id="${movingTokenId}"]`);
		if(tok && tok.dataset.species === species){ /* moving same species: don't block */ }
		else if(speciesCount >= 10) return -1;
	} else {
		if(speciesCount >= 10) return -1;
	}

	if(pen==="bosque-semejanza"){
		if(free===-1) return -1;
		const placed=current.filter(Boolean);
		if(placed.length===0) return 0;
		const sp0=placed[0];
		return species===sp0 ? free : -1;
	}
	if(pen==="prado-diferencia"){
		if(free===-1) return -1;
		if(current.includes(species)) return -1;
		return free;
	}
	if(pen==="rio"){
		// rio is unlimited: if there's no free slot, allow appending at the end
		if(free === -1) return current.length; // append
		return free;
	}
	if(pen==="trio-frondoso" || pen==="pradera-amor"){
		return free;
	}
	if(pen==="rey-selva" || pen==="isla-solitaria" || pen==="puesto-observacion" || pen==="cuarentena"){
		return (current[0]==null) ? 0 : -1;
	}
	if(pen==="bosque-ordenado"){
		if(free===-1) return -1;
		const used=current.filter(Boolean).length;
		if(used===0) return 0;
		if(used===1) return 1;
		const s1=current[0], s2=current[1];
		if(!s1 || !s2) return free;
		if(species!==s1 && species!==s2) return -1;
		const expected=(free%2===0)?s1:s2;
		return species===expected ? free : -1;
	}
	if(pen && pen.startsWith("puente-enamorados")){
		return free;
	}
	if(pen==="piramide"){
		// For the pyramid, fill slots in order 0..5 (bottom row left->right, middle, top)
		// but only return an index that respects adjacency rules (canPlaceInSlot).
		for(let i=0;i<6;i++){
			if(current[i]) continue;
			if(canPlaceInSlot("piramide", null, i, species, movingTokenId)) return i;
		}
		return -1;
	}
	return -1;
}

function canPlaceInSlot(pen, sub, index, species, movingTokenId=null){
	if(pen !== "piramide"){
		if(pen === "rio"){
			// check specific sub slot availability
			let container = null;
			if(sub){
				container = document.querySelector(`[data-pen="rio"] .slots[data-sub="${sub}"]`);
			}else{
				// prefer single slots if present
				container = document.querySelector(`[data-pen="rio"] .slots`);
				if(container && container.dataset.sub===undefined){ /* single */ }
				else {
					// fallback: try to find the sub that contains this index
					const cols = Array.from(document.querySelectorAll('[data-pen="rio"] .slots[data-sub]'));
					for(const c of cols){ if(c.querySelector(`.slot[data-index="${index}"]`)){ container = c; break; } }
				}
			}
			if(!container) return false;
			const slot = container.querySelector(`.slot[data-index="${index}"]`);
			// For rio, if the specific slot doesn't exist yet we allow placement (append),
			// but respect a hard cap (MAX_RIO).
			const currentArr = speciesInPen('rio');
			const currentCount = currentArr.filter(Boolean).length;
			// enforce global species cap of 10 (unless we're moving the same token)
			const parkCounts = getParkSpeciesCounts();
			const speciesCount = parkCounts[species] || 0;
			if(movingTokenId){
				const tok = document.querySelector(`.token[data-id="${movingTokenId}"]`);
				if(!(tok && tok.dataset.species===species) && speciesCount >= 10) return false;
			} else {
				if(speciesCount >= 10) return false;
			}
			if(index >= MAX_RIO) return false;
			// If the slot doesn't exist yet, allow appending (unless at cap)
			if(!slot){
				if(currentCount >= MAX_RIO) return false;
				return true;
			}
			// For rio, we allow insertion at index 0 even if occupied because we shift
			if(slot.querySelector('.token') && index !== 0) return false;
			return true;
		}
		const idx = firstValidIndex(pen, sub, species, movingTokenId);
		return idx>=0;
	}
	const arr = speciesInPen("piramide").slice();
	if(movingTokenId){
		const tok=document.querySelector(`.token[data-id="${movingTokenId}"]`);
		const old=tok?.closest(".slot"); const oldIdx=parseInt(old?.dataset.index||"-1");
		arr[oldIdx]=null;
	}
	if(arr[index]) return false;
	// Enforce bottom-first filling: do not allow placing on middle/top unless lower floors filled
	// bottom indices: 0,1,2
	// middle indices: 3,4
	// top index: 5
	if(index === 3 || index === 4){
		// require bottom row (0..2) to be fully occupied
		if(!(arr[0] && arr[1] && arr[2])) return false;
	}
	if(index === 5){
		// require bottom row and middle row to be fully occupied
		if(!(arr[0] && arr[1] && arr[2] && arr[3] && arr[4])) return false;
	}
	arr[index]=species;
	const pairs=[[0,1],[1,2],[3,4],[0,3],[1,3],[1,4],[2,4],[3,5],[4,5]];
	for(const [a,b] of pairs){ if(arr[a]&&arr[b]&&arr[a]===arr[b]) return false; }
	return true;
}

/* PUNTUACIÓN */
function countBySpecies(arr){ const c={}; arr.forEach(s=>{ if(!s) return; c[s]=(c[s]||0)+1; }); return c; }
function uniqueNonNull(arr){ return Array.from(new Set(arr.filter(Boolean))); }
function getParkSpeciesCounts(){
	const pens=["bosque-semejanza","prado-diferencia","pradera-amor","trio-frondoso","rey-selva","isla-solitaria","rio","bosque-ordenado","puesto-observacion","cuarentena","puente-enamorados-1","puente-enamorados-2"];
	const all=[];
	pens.forEach(p=>{ const arr=speciesInPen(p); all.push(...arr); });
	// puente sides already included above as separate pens
	all.push(...speciesInPen("piramide"));
	return countBySpecies(all);
}
function scoreSummer(){
	const br={};
	const bosque = speciesInPen("bosque-semejanza"); br["bosque_semejanza"] = VP_BOSQUE_SEMEJANZA[bosque.filter(Boolean).length];
	const prado  = speciesInPen("prado-diferencia"); br["prado_diferencia"] = VP_PRADO_DIFERENCIA[uniqueNonNull(prado).length];
	const amor   = speciesInPen("pradera-amor").filter(Boolean); br["pradera_amor"] = VP_PRADERA_AMOR(amor);
	const trioN  = speciesInPen("trio-frondoso").filter(Boolean).length; br["trio_frondoso"] = VP_TRIO(trioN);
	const reyArr = speciesInPen("rey-selva").filter(Boolean);
	let reyScore=0;
	if(reyArr.length){
		const sp = reyArr[0];
		const parkCounts = getParkSpeciesCounts();
		const yourCount = parkCounts[sp] || 0;
	// rival numeric input was removed; scoring is controlled solely by the bottom checkbox
		// New behavior: if the player ticks the checkbox, they get the Rey de la Selva 7 VP;
		// if they do not tick it, Rey de la Selva awards 0 VP.
		const selfHas = !!document.getElementById('input-rey-self')?.checked;
		if(selfHas){
			reyScore = 7;
		} else {
			reyScore = 0;
		}
	}
	br["rey_selva"]=reyScore;
	const islaArr=speciesInPen("isla-solitaria").filter(Boolean); let islaScore=0; if(islaArr.length){ const sp=islaArr[0]; const parkCounts=getParkSpeciesCounts(); islaScore=VP_ISLA_SOLITARIA(sp, parkCounts); } br["isla_solitaria"]=islaScore;
	br["rio"]=VP_RIO(speciesInPen("rio").filter(Boolean).length);
	let bonus=0; ["bosque-semejanza","prado-diferencia","pradera-amor","trio-frondoso","rey-selva","isla-solitaria","rio"].forEach(p=>{ const a=speciesInPen(p); if(a.some(s=>s==="trex")) bonus+=1; }); br["bonus_trex"]=bonus;
	return br;
}
function scoreWinter(){
	const br={};
	const bosque=speciesInPen("bosque-ordenado"); br["bosque_ordenado"]=VP_BOSQUE_ORDENADO[bosque.filter(Boolean).length];
	const side1 = speciesInPen("puente-enamorados-1").filter(Boolean);
	const side2 = speciesInPen("puente-enamorados-2").filter(Boolean);
	// For scoring, pairs across the two bridge pens are counted same as before
	br["puente_enamorados"] = VP_PUENTE(side1, side2);
	const pir=speciesInPen("piramide");
	const bottomFull = [0,1,2].every(i=>!!pir[i]);
	const middleFull = [3,4].every(i=>!!pir[i]);
	const topFull = !!pir[5];
	// Non-accumulative scoring per rules: top full => 7, else middle full => 4, else bottom full => 2
	if(topFull) br["piramide"] = 7;
	else if(middleFull) br["piramide"] = 4;
	else if(bottomFull) br["piramide"] = 2;
	else br["piramide"] = 0;
	const puestoArr=speciesInPen("puesto-observacion").filter(Boolean); const derecha=parseInt($("#input-derecha").value||"0"); br["puesto_observacion"]=puestoArr.length?VP_PUESTO_OBS(derecha):0;
	// Count bonus T-Rex points: +1 for any pen among these that contains at least one T-Rex,
	// plus +1 for each T-Rex placed in each bridge side (side1 and side2).
	let bonus=0;
	["bosque-ordenado","puesto-observacion","piramide","cuarentena"].forEach(p=>{ const a=speciesInPen(p); if(a.some(s=>s==="trex")) bonus+=1; });
	// Add +1 per T-Rex located on each bridge side
	bonus += side1.filter(s=>s==="trex").length;
	bonus += side2.filter(s=>s==="trex").length;
	br["bonus_trex"]=bonus;
	return br;
}
function renderBreakdown(br){ const box=$("#score-breakdown"); box.innerHTML=""; let total=0; Object.entries(br).forEach(([k,v])=>{ total+=v; const row=document.createElement("div"); row.className="row"; const label = I18N[getLang()].score[k] || k; row.innerHTML=`<span>${label}</span><span>${v}</span>`; box.appendChild(row); }); $("#score-total").textContent=total; }
function recalcScore(){
	const mode = $("#overlay-winter").hidden?"summer":"winter";
	renderBreakdown(mode==="summer"?scoreSummer():scoreWinter());
	// update UI labels and slot sizing
	hydrateUI();
	if(typeof updateSlotSizing === 'function') updateSlotSizing();
}

/* Export / Import */
function clearAll(){ $$(".slot").forEach(s=>s.replaceChildren()); }
function sanitizeFilename(s){ return s.replace(/[^a-z0-9_\\-\\.]+/gi, "_"); }
function getState(){
	const placements = {
		verano: {
			bosque_semejanza: speciesInPen("bosque-semejanza"),
			prado_diferencia: speciesInPen("prado-diferencia"),
			pradera_amor:     speciesInPen("pradera-amor"),
			trio_frondoso:    speciesInPen("trio-frondoso"),
			rey_selva:        speciesInPen("rey-selva"),
			isla_solitaria:   speciesInPen("isla-solitaria"),
			rio:              speciesInPen("rio")
		},
		invierno: {
			bosque_ordenado:     speciesInPen("bosque-ordenado"),
			puesto_observacion:  speciesInPen("puesto-observacion"),
					puente_enamorados: {
						side1: speciesInPen("puente-enamorados-1"),
						side2: speciesInPen("puente-enamorados-2")
					},
			piramide:            speciesInPen("piramide"),
			cuarentena:          speciesInPen("cuarentena")
		}
	};
	return placements;
}
function setArrayIntoPen(pen, arr, sub=null){
	if(!arr) return;
	if(pen==="piramide"){
		arr.forEach((sp, i)=>{
			const sl=document.querySelector(`[data-pen="piramide"] .slot[data-index="${i}"]`);
			if(!sl) return;
			sl.replaceChildren(); if(sp && VALID.has(sp)) sl.appendChild(makeToken(sp));
		});
		return;
	}
	if(pen === "rio"){
		const penEl = document.querySelector(`[data-pen="rio"]`);
		if(!penEl) return;
		const container = penEl.querySelector('.slots:not([data-sub])') || penEl.querySelector('.slots');
		if(!container) return;
		// ensure there are enough slots
		const needed = arr.length;
		const cap = Math.max(parseInt(container.dataset.cap||"0"), needed);
		container.dataset.cap = String(cap);
		makeSlots(container);
		arr.forEach((sp, i)=>{
			const sl = container.querySelector(`.slot[data-index="${i}"]`);
			if(!sl) return;
			sl.replaceChildren(); if(sp && VALID.has(sp)) sl.appendChild(makeToken(sp));
		});
		return;
	}
	const container = sub ? document.querySelector(`[data-pen="${pen}"] .slots[data-sub="${sub}"]`) : document.querySelector(`[data-pen="${pen}"] .slots`);
	if(!container) return;
	arr.forEach((sp, i)=>{
		const sl=container.querySelector(`.slot[data-index="${i}"]`);
		if(!sl) return;
		sl.replaceChildren(); if(sp && VALID.has(sp)) sl.appendChild(makeToken(sp));
	});
}
function loadState(obj){
	clearAll();
	if(obj.modo==="verano") setMode("summer"); else if(obj.modo==="invierno") setMode("winter");
	const p = obj.colocaciones || {};
	const v = p.verano || {}; const w = p.invierno || {};
	setArrayIntoPen("bosque-semejanza", v.bosque_semejanza);
	setArrayIntoPen("prado-diferencia", v.prado_diferencia);
	setArrayIntoPen("pradera-amor",     v.pradera_amor);
	setArrayIntoPen("trio-frondoso",    v.trio_frondoso);
	setArrayIntoPen("rey-selva",        v.rey_selva);
	setArrayIntoPen("isla-solitaria",   v.isla_solitaria);
	setArrayIntoPen("rio",              v.rio);
	setArrayIntoPen("bosque-ordenado",     w.bosque_ordenado);
	setArrayIntoPen("puesto-observacion",  w.puesto_observacion);
	if(w.puente_enamorados){
		setArrayIntoPen("puente-enamorados-1", w.puente_enamorados.side1);
		setArrayIntoPen("puente-enamorados-2", w.puente_enamorados.side2);
	}
	setArrayIntoPen("piramide",            w.piramide);
	setArrayIntoPen("cuarentena",          w.cuarentena);
	recalcScore();
}
function exportVelocitech(){
	const nombre = (document.querySelector("#player-name").value || "").trim();
	const modo = getMode(); // "verano" | "invierno"
	const colocaciones = getState();
	// Build export object with mode first so imports can read it without prompting
	const salida = { modo };
	if(nombre) salida.nombre = nombre;
	salida.colocaciones = colocaciones;
	// optional metadata
	salida.exportado_en = new Date().toISOString();

	const json = JSON.stringify(salida, null, 4); // prettier formatting
	const blob = new Blob([json], { type: "application/json" });
	const enlace = document.createElement("a");
	const safe = sanitizeFilename(nombre || "parque");
	enlace.download = `${modo}_${safe}.velocitech`;
	enlace.href = URL.createObjectURL(blob);
	document.body.appendChild(enlace);
	enlace.click();
	URL.revokeObjectURL(enlace.href);
	enlace.remove();
}
function importVelocitech(file){
	const reader = new FileReader();
	reader.onload = () => {
		try{
			const obj = JSON.parse(reader.result);
			if(!obj || !obj.modo){ alert("Archivo inválido: falta 'modo'."); return; }
			if(obj.nombre) $("#player-name").value = obj.nombre;
			loadState(obj);
		}catch(e){
			alert("No se pudo leer el archivo .velocitech");
			console.error(e);
		}
	};
	reader.readAsText(file);
}

/* Controles */
// Attach change handlers directly to inputs to avoid relying on event.target bubbling
document.querySelectorAll('#themeCtl input').forEach(inp=>{
	inp.addEventListener('change', ()=>{ setTheme(inp.id==="dark"?"dark":"light"); });
});
document.querySelectorAll('#modeCtl input').forEach(inp=>{
	inp.addEventListener('change', ()=>{ setMode(inp.id==="winter"?"winter":"summer"); recalcScore(); hydrateUI(); });
});
document.querySelectorAll('#langCtl input').forEach(inp=>{
	inp.addEventListener('change', ()=>{ setLang(inp.id==="lang-en"?"en":"es"); });
});
// Persist debug checkbox and apply .debug class so hotspots remain visible while editing
document.getElementById("debugCtl").addEventListener("change",(e)=>{
	const checked = !!e.target.checked;
	localStorage.setItem('debug', checked ? '1' : '0');
	$("#stage").classList.toggle("debug", checked);
});
document.getElementById("resetBtn").onclick=()=>{ clearAll(); recalcScore(); };
document.getElementById("btn-export").onclick=exportVelocitech;
document.getElementById("btn-import").onclick=()=>{ document.getElementById("file-import").click(); };
document.getElementById("file-import").addEventListener("change", (e)=>{ const f=e.target.files[0]; if(f) importVelocitech(f); });

// Rey self-checkbox: trigger score recalculation when toggled
const reySelf = document.getElementById('input-rey-self');
if(reySelf){
	reySelf.addEventListener('change', (e)=>{ recalcScore(); });
}

// Puesto de observacion: ensure changes to the numeric input recalc score immediately
const puestoInput = document.getElementById('input-derecha');
if(puestoInput){
	// update on typing and on blur/change
	puestoInput.addEventListener('input', ()=>{ recalcScore(); });
	puestoInput.addEventListener('change', ()=>{ recalcScore(); });
}

// Ensure rey checkbox exists and is attached (called from init in case DOM mutated)
function ensureReyCheckbox(){
	let chk = document.getElementById('input-rey-self');
	const container = document.getElementById('rey-container');
	// If checkbox is missing but the container exists, try to ensure the bottom checkbox exists (we moved it into the sidebar)
	if(!chk && container){
		try{
			const wrapper = document.createElement('div');
			wrapper.style.marginTop = '8px'; wrapper.style.display = 'flex'; wrapper.style.alignItems = 'center'; wrapper.style.gap = '8px';
			const newChk = document.createElement('input'); newChk.type = 'checkbox'; newChk.id = 'input-rey-self';
			const newLbl = document.createElement('label'); newLbl.htmlFor = 'input-rey-self'; newLbl.id = 'input-rey-self-label'; newLbl.style.fontSize = '13px'; newLbl.style.margin = '0';
			// use localized label text (may contain {species} placeholder)
			try{ newLbl.textContent = t('ui.rey_self_label'); }catch(_){ newLbl.textContent = '¿Soy el jugador que tiene la misma o mayor cantidad de la especie {species} en la partida?'; }
			wrapper.appendChild(newChk); wrapper.appendChild(newLbl);
			// insert before the 'input-rey-equal' block if present, else append
			const equalBlock = container.querySelector('#input-rey-equal')?.parentElement;
			if(equalBlock) container.insertBefore(wrapper, equalBlock);
			else container.appendChild(wrapper);
			chk = document.getElementById('input-rey-self');
		}catch(_){ /* ignore DOM creation errors */ }
	}
	if(!chk){
		// try to find and return silently if not present
		return;
	}
	// If checkbox or its wrapper is hidden by CSS, make it visible
	try{
		const wrapper = chk.closest('div');
		if(wrapper){ wrapper.style.display = wrapper.style.display || 'flex'; wrapper.style.alignItems = wrapper.style.alignItems || 'center'; wrapper.style.gap = wrapper.style.gap || '8px'; }
		const lbl = document.getElementById('input-rey-self-label') || (wrapper && wrapper.querySelector('label'));
		if(lbl){ lbl.style.display = lbl.style.display || 'inline-block'; lbl.style.color = lbl.style.color || 'var(--fg)'; }
	}catch(_){ }
	// attach listener only once
	if(!chk.__attached){
		chk.addEventListener('change', ()=>{ recalcScore(); });
		chk.__attached = true;
	}
	// ensure rival input initial disabled state matches checkbox
	// no rival input used anymore
}

// Pyramid editor removed: floor geometry now set via inline styles in HTML

// %% CLICK-TO-DELETE: start
// Delegated handler: when any placed token (inside a .slot) is clicked, remove it (shift subsequent tokens)
document.addEventListener('click', function(e){
	const tok = e.target.closest && e.target.closest('.token');
	if(!tok) return;
	// ignore clicks on the delete button itself (it has its own handler)
	if(e.target.closest('.delete')) return;
	const slot = tok.closest('.slot');
	if(!slot) return;
	// perform the same shift/remove behavior as clicking the ×
	shiftSlotsAfterRemoval(slot);
	recalcScore();
});
// %% CLICK-TO-DELETE: end

// river uses sub-columns by default; no UI toggle required

/* Init */
(function init(){
	setTheme(localStorage.getItem("theme")||"light");
	document.getElementById(localStorage.getItem("theme")==="dark"?"dark":"light").checked=true;

	setMode(localStorage.getItem("mode")||"summer");
	document.getElementById(localStorage.getItem("mode")==="winter"?"winter":"summer").checked=true;

	setLang(localStorage.getItem("lang")||"es");
	document.getElementById((getLang()==='en')?'lang-en':'lang-es').checked=true;

	// restore debug checkbox state
	const dbg = localStorage.getItem('debug');
	const dbgChecked = dbg === '1';
	try{ document.getElementById('debug').checked = dbgChecked; }catch(_){}
	if(dbgChecked) { document.getElementById('stage').classList.add('debug'); }

	buildAll();
	createPalette();
	try{ updatePaletteGap(); }catch(_){ }
    
  
// DEBUG: announce palette size
setTimeout(()=>{
	const n = document.querySelectorAll('#palette .token-template').length;
	if(n===0){ try{ showToast('No se pudo construir la paleta; reintentando...'); }catch(_){} createPalette(); }
}, 60);

	attachPenDnD();
	hydrateUI();
	recalcScore();

	// Ensure rey checkbox wiring is present
	ensureReyCheckbox();
	// ensure per-pen labels exist and wrapping is computed
	$$("#stage .pen").forEach(p=>{ setPenHint(p); computeWrapForPen(p); });

	// Pyramid editor removed: no initialization required
	window.addEventListener('resize', ()=>{ setTimeout(()=>{ positionOverlayLabels(); $$("#stage .pen").forEach(p=>computeWrapForPen(p)); try{ updatePaletteGap(); }catch(_){ } }, 60); });
	})();

