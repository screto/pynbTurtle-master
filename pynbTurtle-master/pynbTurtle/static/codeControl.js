// Datei: pynbTurtle/static/codeControl.js

// ----------------------------------------------------------------------------
// Hier finden sich Funktionen, die die Turtle-API erweitern,
// um die Code-Blocks und die Steuerung (Play/Step/Stop) zu ermöglichen
// ----------------------------------------------------------------------------

// 1) Shared globals
window._turtleCommands       = window._turtleCommands || [];
window._turtleInterval       = null;
window._turtleCommandDelay   = 0;


// 2) hervorheben einer Code-Zeile
window.highlightLine = function(uid, n) {
  document.querySelectorAll('.code-container .highlight')
          .forEach(el=>el.classList.remove('highlight'));
  var c = document.getElementById('codeContainer_'+uid);
  if (!c) return;
  var sp = c.querySelector('.code-block span[data-line-number="'+n+'"]');
  if (sp) sp.classList.add('highlight');
};

// 3) abspielen der Turtle-Befehle
window._turtleFlush = function(cmds_list, delay) {
  window._turtleCommands     = cmds_list.slice();
  window._turtleCommandDelay = delay;
  window._turtlePlay();
};

// 4) Baut den <pre>…</pre>-Block in den codeContainer für die gegebene UID
window.initTurtleCodeBlock = function(uid, raw) {
  var container = document.getElementById('codeContainer_' + uid);
  if (!container) return;

  // a) Container leeren
  container.innerHTML = '';

  // b) <pre>-Element anlegen
  var pre = document.createElement('pre');
  pre.className = 'code-block';

  // c) Zeilen splitten und <span data-line-number> bauen
  raw.split('\n').forEach(function(line, idx) {
    var span = document.createElement('span');
    span.setAttribute('data-line-number', idx + 1);
    span.innerHTML = line === '' ? '&nbsp;' : line;
    pre.appendChild(span);
  });

  // d) Anfügen und zeigen
  container.appendChild(pre);
  container.style.display = 'block';
};

// 5) Play-Funktion: startet die Turtle-Befehle
window._turtlePlay = function() {
  if (window._turtleInterval) return;
  window._turtleInterval = setInterval(function() {
    if (!window._turtleCommands.length) {
      clearInterval(window._turtleInterval);
      window._turtleInterval = null;
      return;
    }
    var cmd = window._turtleCommands.shift();
    eval(cmd);
    // After each command, redraw the scene
    if (typeof window.drawScene === 'function') {
      window.drawScene();
    }
  }, window._turtleCommandDelay);
};

// 6) Stop-Funktion: pausiert die Turtle-Befehle
window._turtleStop = function() {
  if (window._turtleInterval) {
    clearInterval(window._turtleInterval);
    window._turtleInterval = null;
  }
};

// 7) Step-Funktion: pausiert die Turtle-Befehle und führt genau einen Befehl aus
window._turtleStep = function() {
  window._turtleStop();
  if (window._turtleCommands.length) {
    var cmd = window._turtleCommands.shift();
    eval(cmd);
    if (typeof window.drawScene === 'function') {
      window.drawScene();
    }
  }
};

// 8) Bedienknöpfe für die Turtle-Steuerung
window.initTurtleCodeControls = function(uid, commandDelay) {
  var wrapper = document.getElementById('codeControlsWrapper_'+uid);
  var container = document.getElementById('codeContainer_'+uid);
  if (!wrapper || !container) return;

  // alte Buttons entfernen
  var old = wrapper.querySelector('.code-controls');
  if (old) old.remove();

  // neue Buttons erstellen
  var ctrl = document.createElement('div');
  ctrl.className = 'code-controls';
  ['Stop','Step','Play'].forEach(function(label){
    var btn = document.createElement('button');
    btn.textContent = label;
    btn.id          = 'turtle_btn_' + label + '_' + uid;
    btn.style.marginRight = '4px';
    ctrl.appendChild(btn);
  });
  wrapper.appendChild(ctrl);
  window._turtleStop();

  var stopBtn = ctrl.children[0],
      stepBtn = ctrl.children[1],
      playBtn = ctrl.children[2];

stopBtn.addEventListener('click', window._turtleStop);
stepBtn.addEventListener('click', window._turtleStep);
playBtn.addEventListener('click', window._turtlePlay);
  // verbleibende Befehle anhalten
  window._turtleStop();
};
