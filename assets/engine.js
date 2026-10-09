/* Psytesty — silnik testów.
 *
 * Nie zawiera treści żadnego testu. Wczytuje definicję z pliku JSON
 * wskazanego w adresie: test.html?id=przywiazanie  ->  testy/przywiazanie.json
 *
 * Dodanie nowego testu = jeden plik JSON w katalogu testy/ i jeden wpis
 * w testy/index.json. Tego pliku nie trzeba wtedy dotykać.
 */
(function(){
'use strict';

var app = document.getElementById('app');
var def = null;          // definicja testu z JSON
var state = {
  view: 'home',
  qIdx: 0,
  answers: [],
  viewingFull: null,
  lastResult: null,
  lastAnswers: null,
  lastId: null,
  lastDate: null,
  lastSaveError: null
};

/* --- narzędzia --------------------------------------------------------- */

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function param(name){
  var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g,' ')) : null;
}

function formatDate(iso){
  var d = new Date(iso);
  return d.toLocaleDateString('pl-PL', {day:'2-digit', month:'2-digit', year:'numeric'}) +
         ', ' + d.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
}

function genId(){
  var d = new Date();
  function p(n){ return String(n).padStart(2,'0'); }
  var stamp = d.getFullYear() + p(d.getMonth()+1) + p(d.getDate()) + '-' +
              p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  return 'T-' + stamp + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
}

function dimension(key){
  for (var i = 0; i < def.dimensions.length; i++){
    if (def.dimensions[i].key === key) return def.dimensions[i];
  }
  return null;
}

function scaleLabel(v){
  var idx = v - def.scale.min;
  return (def.scale.labels && def.scale.labels[idx]) ? def.scale.labels[idx] : String(v);
}

/* --- punktacja --------------------------------------------------------- */

function computeResult(answers){
  var min = def.scale.min, max = def.scale.max;
  var buckets = {}, pct = {};
  def.dimensions.forEach(function(d){ buckets[d.key] = []; });

  def.items.forEach(function(it, i){
    var v = answers[i];
    if (v === null || v === undefined) return;
    if (it.r) v = (min + max) - v;            // pozycja odwrócona
    if (buckets[it.d]) buckets[it.d].push(v);
  });

  def.dimensions.forEach(function(d){
    var arr = buckets[d.key];
    var avg = arr.length ? arr.reduce(function(a,b){ return a+b; }, 0) / arr.length : min;
    pct[d.key] = Math.round(((avg - min) / (max - min)) * 100);
  });

  var sc = def.scoring;
  var name = '', desc = '';

  if (sc.type === 'quadrant'){
    var th = (typeof sc.threshold === 'number') ? sc.threshold : 50;
    for (var i = 0; i < sc.results.length; i++){
      var r = sc.results[i], ok = true;
      for (var key in r.when){
        if (!Object.prototype.hasOwnProperty.call(r.when, key)) continue;
        var isHigh = pct[key] > th;
        if ((r.when[key] === 'high') !== isHigh){ ok = false; break; }
      }
      if (ok){ name = r.name; desc = r.desc; break; }
    }
  } else if (sc.type === 'bands'){
    var value = pct[sc.dimension];
    for (var j = 0; j < sc.results.length; j++){
      var b = sc.results[j];
      if (value >= b.from && value <= b.to){ name = b.name; desc = b.desc; break; }
    }
  }

  return { pct: pct, style: name, desc: desc };
}

/* --- zapis w przeglądarce ---------------------------------------------- */
/* Dane zostają wyłącznie na urządzeniu użytkownika. Nic nie jest wysyłane. */

var store = (function(){
  var hasClaude = !!(window.storage &&
                     typeof window.storage.get === 'function' &&
                     typeof window.storage.set === 'function');
  var hasLocal = false;
  try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); hasLocal = true; } catch(e){}
  return {
    available: hasClaude || hasLocal,
    get: function(key){
      if (hasClaude) return window.storage.get(key, false).then(function(r){
        return (r && r.value) ? r.value : null;
      });
      if (hasLocal) return Promise.resolve(localStorage.getItem(key));
      return Promise.resolve(null);
    },
    set: function(key, value){
      if (hasClaude) return window.storage.set(key, value, false);
      if (hasLocal){ localStorage.setItem(key, value); return Promise.resolve(); }
      return Promise.reject(new Error('brak dostępnego magazynu danych'));
    }
  };
})();

function indexKey(){ return 'psy_index_' + def.id; }
function fullKey(id){ return 'psy_full_' + def.id + '_' + id; }

/* Przeniesienie historii z pierwszej wersji aplikacji (klucze ecrr_*). */
function migrateLegacy(){
  if (def.id !== 'przywiazanie' || !store.available) return Promise.resolve();
  return store.get(indexKey()).then(function(current){
    if (current) return null;
    return store.get('ecrr_index').then(function(old){
      if (!old) return null;
      var list;
      try { list = JSON.parse(old); } catch(e){ return null; }
      if (!list || !list.length) return null;
      var chain = Promise.resolve();
      list.forEach(function(row){
        chain = chain.then(function(){
          return store.get('ecrr_full_' + row.id).then(function(full){
            if (!full) return null;
            var obj;
            try { obj = JSON.parse(full); } catch(e){ return null; }
            if (obj && obj.anxPct !== undefined && !obj.pct){
              obj.pct = { anx: obj.anxPct, avo: obj.avoPct };
            }
            return store.set(fullKey(row.id), JSON.stringify(obj));
          });
        });
      });
      return chain.then(function(){
        var migrated = list.map(function(r){
          return { id:r.id, date:r.date, style:r.style,
                   pct: r.pct || { anx:r.anxPct, avo:r.avoPct } };
        });
        return store.set(indexKey(), JSON.stringify(migrated));
      });
    });
  }).catch(function(){ return null; });
}

function loadIndex(){
  if (!store.available) return Promise.resolve([]);
  return store.get(indexKey()).then(function(v){
    try { return v ? JSON.parse(v) : []; } catch(e){ return []; }
  }).catch(function(){ return []; });
}

function loadFull(id){
  return store.get(fullKey(id)).then(function(v){
    try { return v ? JSON.parse(v) : null; } catch(e){ return null; }
  }).catch(function(){ return null; });
}

function saveTest(answers, result){
  var id = genId();
  var date = new Date().toISOString();
  var full = { id:id, date:date, answers:answers, pct:result.pct, style:result.style, desc:result.desc };

  if (!store.available){
    return Promise.resolve({ full: full, saveError:
      'Zapis historii jest wyłączony w tej przeglądarce, więc ten wynik nie zostanie zapamiętany. Możesz go teraz przeczytać, wydrukować lub zapisać jako PDF.' });
  }
  return store.set(fullKey(id), JSON.stringify(full))
    .then(loadIndex)
    .then(function(idx){
      idx.unshift({ id:id, date:date, style:result.style, pct:result.pct });
      return store.set(indexKey(), JSON.stringify(idx));
    })
    .then(function(){ return { full: full, saveError: null }; })
    .catch(function(e){
      return { full: full, saveError:
        'Nie udało się zapisać wyniku w pamięci przeglądarki (' +
        (e && e.message ? e.message : 'nieznany powód') +
        '). Wynik jest widoczny poniżej, ale nie trafi do historii.' };
    });
}

/* --- widoki ------------------------------------------------------------ */

function render(){
  if (state.view === 'home') renderHome();
  else if (state.view === 'quiz') renderQuiz();
  else if (state.view === 'result') renderResult(state.lastResult, state.lastAnswers, state.lastId, state.lastDate, false);
  else if (state.view === 'detail'){
    var f = state.viewingFull;
    renderResult({ pct:f.pct, style:f.style, desc:f.desc }, f.answers, f.id, f.date, true);
  }
  window.scrollTo(0,0);
}

var SHIELD = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 1.8 2.7 4.5v4.2c0 3.6 2.6 6.4 6.3 7.5 3.7-1.1 6.3-3.9 6.3-7.5V4.5Z"/><path d="m6.6 8.8 1.8 1.8 3.3-3.6"/></svg>';

function renderHome(){
  loadIndex().then(function(idx){
    app.innerHTML =
      '<a class="backlink" href="index.html">Wszystkie testy</a>' +
      '<h1>' + esc(def.title) + '</h1>' +
      '<p class="lede">' + esc(def.intro) + '</p>' +
      '<div class="safe-note">' + SHIELD +
        '<span>Nie ma tu dobrych ani złych odpowiedzi. Odpowiadaj tak, jak jest naprawdę, a nie tak, jak uważasz, że powinno być. Możesz przerwać w dowolnym momencie.</span>' +
      '</div>' +
      '<button class="btn-primary btn-block" id="start">Zacznij test</button>' +
      '<h2>Twoje wcześniejsze wyniki</h2>' +
      (!store.available ? '<div class="banner">Ta przeglądarka ma wyłączoną pamięć lokalną (np. tryb prywatny), więc wyniki nie będą zapamiętywane. Sam test działa normalnie.</div>' : '') +
      '<div class="card" style="padding:4px 20px;">' +
        (idx.length === 0
          ? '<p class="empty">Pierwszy wynik pojawi się tutaj zaraz po ukończeniu testu.</p>'
          : idx.map(function(t){
              return '<button class="hist-item" data-id="' + esc(t.id) + '">' +
                '<span><span class="hist-style">' + esc(t.style) + '</span><br>' +
                '<span class="hist-date">' + formatDate(t.date) + '</span></span>' +
                '<svg class="hist-chevron" width="9" height="15" viewBox="0 0 9 15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1.5 1.5 6 6-6 6"/></svg>' +
              '</button>';
            }).join('')) +
      '</div>' +
      '<p class="note">Odpowiedzi i wyniki zostają wyłącznie na tym urządzeniu, w tej przeglądarce. Nic nie jest nigdzie wysyłane. Wynik ma charakter orientacyjny i nie zastępuje rozmowy ze specjalistą.</p>';

    document.getElementById('start').addEventListener('click', startTest);
    Array.prototype.forEach.call(app.querySelectorAll('.hist-item'), function(el){
      el.addEventListener('click', function(){
        loadFull(el.getAttribute('data-id')).then(function(full){
          if (full){ state.viewingFull = full; state.view = 'detail'; render(); }
        });
      });
    });
  });
}

function startTest(){
  state.view = 'quiz';
  state.qIdx = 0;
  state.answers = new Array(def.items.length).fill(null);
  render();
}

function renderQuiz(){
  var i = state.qIdx;
  var it = def.items[i];
  var pct = Math.round((i / def.items.length) * 100);
  var current = state.answers[i];
  var values = [];
  for (var v = def.scale.min; v <= def.scale.max; v++) values.push(v);

  app.innerHTML =
    '<div class="progress-head">' +
      '<span class="progress-count">Pytanie <b>' + (i+1) + '</b> z <b>' + def.items.length + '</b></span>' +
      '<span class="progress-pct">' + pct + '% ukończone</span>' +
    '</div>' +
    '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
    '<p class="statement">' + esc(it.q) + '</p>' +
    '<p class="statement-hint">' + esc(def.prompt || 'Na ile to zdanie pasuje do Ciebie?') + '</p>' +
    '<div class="scale">' +
      values.map(function(v){
        return '<button class="opt' + (current === v ? ' selected' : '') + '" data-v="' + v + '">' +
          '<span class="opt-num">' + v + '</span><span>' + esc(scaleLabel(v)) + '</span></button>';
      }).join('') +
    '</div>' +
    '<div class="nav-row">' +
      '<button id="back"' + (i === 0 ? ' disabled' : '') + '>Wstecz</button>' +
      '<button class="btn-quiet" id="abort">Przerwij test</button>' +
    '</div>';

  Array.prototype.forEach.call(app.querySelectorAll('.opt'), function(btn){
    btn.addEventListener('click', function(){
      answerQuestion(i, parseInt(btn.getAttribute('data-v'), 10));
    });
  });
  document.getElementById('back').addEventListener('click', function(){
    if (i > 0){ state.qIdx--; render(); }
  });
  document.getElementById('abort').addEventListener('click', function(){
    state.view = 'home'; render();
  });
}

function answerQuestion(i, value){
  state.answers[i] = value;
  if (i + 1 < def.items.length){
    state.qIdx++;
    render();
    return;
  }
  var result = computeResult(state.answers);
  var answers = state.answers.slice();
  saveTest(answers, result).then(function(res){
    state.lastResult = result;
    state.lastAnswers = answers;
    state.lastId = res.full.id;
    state.lastDate = res.full.date;
    state.lastSaveError = res.saveError;
    state.view = 'result';
    render();
  });
}

/* Mapa dwóch wymiarów — rysowana tylko dla punktacji typu "quadrant". */
function quadrantMap(pct){
  var sc = def.scoring;
  var xKey = sc.x, yKey = sc.y;
  var x = 38 + (pct[xKey] / 100) * 228;
  var y = 244 - (pct[yKey] / 100) * 228;

  function nameFor(xState, yState){
    for (var i = 0; i < sc.results.length; i++){
      var w = sc.results[i].when;
      if (w[xKey] === xState && w[yKey] === yState) return sc.results[i].name.toLowerCase();
    }
    return '';
  }
  function lines(text, cx, cy){
    var parts = text.split('-');
    if (parts.length === 2 && text.length > 13){
      return '<text x="' + cx + '" y="' + (cy - 7) + '">' + esc(parts[0]) + '-</text>' +
             '<text x="' + cx + '" y="' + (cy + 7) + '">' + esc(parts[1]) + '</text>';
    }
    return '<text x="' + cx + '" y="' + cy + '">' + esc(text) + '</text>';
  }

  var xDim = dimension(xKey), yDim = dimension(yKey);

  return '<svg class="map" viewBox="0 0 280 276" role="img" aria-label="Twoja pozycja na mapie: ' +
      esc(yDim.short || yDim.name) + ' ' + pct[yKey] + ' procent, ' +
      esc(xDim.short || xDim.name) + ' ' + pct[xKey] + ' procent">' +
    '<rect x="38" y="16" width="114" height="114" fill="var(--heather-tint)"/>' +
    '<rect x="152" y="16" width="114" height="114" fill="var(--surface-2)"/>' +
    '<rect x="38" y="130" width="114" height="114" fill="var(--sage-tint)"/>' +
    '<rect x="152" y="130" width="114" height="114" fill="var(--surface-2)"/>' +
    '<g stroke="var(--line)" stroke-width="1">' +
      '<rect x="38" y="16" width="228" height="228" fill="none"/>' +
      '<line x1="152" y1="16" x2="152" y2="244"/>' +
      '<line x1="38" y1="130" x2="266" y2="130"/>' +
    '</g>' +
    '<g fill="var(--ink-3)" font-size="11" font-family="' + 'IBM Plex Sans, sans-serif' + '" text-anchor="middle">' +
      lines(nameFor('low','high'), 95, 73) +
      lines(nameFor('high','high'), 209, 73) +
      lines(nameFor('low','low'), 95, 194) +
      lines(nameFor('high','low'), 209, 194) +
    '</g>' +
    '<g fill="var(--ink-3)" font-size="11" font-family="IBM Plex Sans, sans-serif">' +
      '<text x="152" y="266" text-anchor="middle">' + esc(xDim.short || xDim.name) + ' &#8594;</text>' +
      '<text x="16" y="130" text-anchor="middle" transform="rotate(-90 16 130)">' + esc(yDim.short || yDim.name) + ' &#8594;</text>' +
    '</g>' +
    '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12" fill="var(--calm)" opacity=".2"/>' +
    '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="var(--calm)" stroke="var(--surface)" stroke-width="2.2"/>' +
  '</svg>';
}

var PRINTER = '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7V2.3h9V7"/><rect x="2.3" y="7" width="13.4" height="6" rx="1.4"/><path d="M4.5 11.3h9v4.4h-9z"/></svg>';

function renderResult(result, answers, id, date, fromHistory){
  var metrics = def.dimensions.map(function(d){
    var value = result.pct[d.key];
    return '<div class="metric">' +
      '<div class="metric-label"><span>' + esc(d.name) + '</span><span>' + value + '%</span></div>' +
      '<div class="metric-track"><div class="metric-fill" style="width:' + value + '%;background:var(--' + (d.color || 'calm') + ');"></div></div>' +
      (d.note ? '<p class="metric-note">' + esc(d.note) + '</p>' : '') +
    '</div>';
  }).join('');

  app.innerHTML =
    '<button class="backlink" id="toHome">Strona główna testu</button>' +
    ((!fromHistory && state.lastSaveError) ? '<div class="banner">' + esc(state.lastSaveError) + '</div>' : '') +
    '<div class="card">' +
      '<div class="print-only print-head">' +
        '<span class="print-title">' + esc(def.title) + '</span>' +
        '<span class="print-date">' + formatDate(date) + '</span>' +
      '</div>' +
      '<div class="result-head">' +
        '<span class="tag">' + (fromHistory ? 'Wynik z historii' : 'Twój wynik') + '</span>' +
        '<span class="result-id">' + formatDate(date) + '</span>' +
      '</div>' +
      '<p class="style-name">' + esc(result.style) + '</p>' +
      '<p class="style-desc">' + esc(result.desc) + '</p>' +
      (def.scoring.type === 'quadrant'
        ? quadrantMap(result.pct) + '<p class="map-caption">Twoje miejsce na dwóch wymiarach</p>'
        : '') +
      '<hr class="divider">' +
      metrics +
    '</div>' +
    '<p class="note">' + esc(def.closing || '') + ' Identyfikator tego wyniku: ' + esc(id) + '.</p>' +
    '<div class="result-actions">' +
      '<button class="btn-primary" id="newTest">Zrób test ponownie</button>' +
      '<button class="btn-secondary" id="printResult">' + PRINTER + 'Zapisz PDF lub drukuj</button>' +
    '</div>' +
    '<p style="margin:22px 0 10px;"><button class="link-btn" id="toggleAnswers">Pokaż wszystkie odpowiedzi</button></p>' +
    '<div class="card" id="answersPanel" style="display:none;padding:6px 20px;"></div>' +
    '<p class="print-only print-foot">Wynik orientacyjny, nie jest diagnozą. Wygenerowano z Psytesty, identyfikator ' + esc(id) + '.</p>';

  var panel = document.getElementById('answersPanel');
  panel.innerHTML = '<p class="print-only answers-title">Twoje odpowiedzi</p>' +
    def.items.map(function(it, i){
      return '<div class="answer-row">' +
        '<span class="answer-q">' + (i+1) + '. ' + esc(it.q) + '</span>' +
        '<span class="answer-v">' + answers[i] + ' &middot; ' + esc(scaleLabel(answers[i])) + '</span>' +
      '</div>';
    }).join('');

  document.getElementById('toHome').addEventListener('click', function(){ state.view='home'; render(); });
  document.getElementById('newTest').addEventListener('click', startTest);
  document.getElementById('printResult').addEventListener('click', function(){ window.print(); });

  var toggle = document.getElementById('toggleAnswers');
  var shown = false;
  toggle.addEventListener('click', function(){
    shown = !shown;
    panel.style.display = shown ? 'block' : 'none';
    toggle.textContent = shown ? 'Ukryj odpowiedzi' : 'Pokaż wszystkie odpowiedzi';
  });
}

/* Klawisze 1-9 wybierają odpowiedź w trakcie testu. */
document.addEventListener('keydown', function(e){
  if (state.view !== 'quiz' || !def) return;
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  var n = parseInt(e.key, 10);
  if (n >= def.scale.min && n <= def.scale.max){
    e.preventDefault();
    answerQuestion(state.qIdx, n);
  }
});

/* --- start ------------------------------------------------------------- */

function fail(message){
  app.innerHTML = '<a class="backlink" href="index.html">Wszystkie testy</a>' +
    '<h1>Nie udało się wczytać testu</h1>' +
    '<div class="banner">' + esc(message) + '</div>';
}

var id = param('id') || 'przywiazanie';
if (!/^[a-z0-9-]+$/.test(id)){
  fail('Nieprawidłowy identyfikator testu w adresie strony.');
} else {
  fetch('testy/' + id + '.json', {cache:'no-cache'})
    .then(function(r){
      if (!r.ok) throw new Error('plik testy/' + id + '.json nie istnieje (HTTP ' + r.status + ')');
      return r.json();
    })
    .then(function(data){
      def = data;
      document.title = def.title + ' — Psytesty';
      return migrateLegacy();
    })
    .then(function(){ render(); })
    .catch(function(e){
      var hint = (window.location.protocol === 'file:')
        ? 'Strona została otwarta bezpośrednio z dysku (adres file://), a przeglądarki blokują w tym trybie wczytywanie plików JSON. Otwórz ją przez adres https, np. opublikowaną wersję na GitHub Pages.'
        : 'Szczegóły: ' + (e && e.message ? e.message : 'nieznany błąd') + '.';
      fail(hint);
    });
}

})();
