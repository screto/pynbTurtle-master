# Datei: pynbTurtle/turtle.py

from IPython import get_ipython
from importlib import resources
from IPython.display import HTML, Javascript, display
import uuid
import inspect
import html



class Turtle:
    _instances = []
    

    def __init__(self, command_delay=50):
        """
        Initialisiert eine neue Turtle-Instanz mit einem eindeutigen Canvas.
        
        t = Turtle()

        """
        self.command_delay = command_delay
        self._step_size    = 1
        self._js_queue     = []
        self._history      = []
        self.angle         = -90
        self._paused       = False

        # 1) Generiert pro Instanz eine eindeutige ID, um Canvas-Kollisionen zu vermeiden
        self._uid      = uuid.uuid4().hex[:8]
        canvas_id      = f"turtleCanvas_{self._uid}"
        controls_id    = f"controls_{self._uid}"

        # 2) Ladet und modifiziert das HTML-Template
        html = resources.read_text(__package__ + ".static", "turtleCanvas.html")
        # Ersetzt Platzhalter canvas_id und controls_id im Template
        html = html.replace("{{CANVAS_ID}}", canvas_id) \
                    .replace("{{CONTROLS_ID}}", controls_id) \
                    .replace("{{UID}}", self._uid)
        display(HTML(html))

        # 3) JS-Dateien inline laden
        graphics_js = resources.read_text(__package__ + ".static", "turtleGraphics.js")
        buttons_js  = resources.read_text(__package__ + ".static", "buttons.js")
        code_control_js  = resources.read_text(__package__ + ".static", "codeControl.js")
        display(Javascript(graphics_js + "\n\n" + buttons_js + "\n\n" + code_control_js))

        # 4) Reset + Init + Draw in einem einzigen, garantiert nach dem HTML-Inject laufenden Block
        js = f"""
        (function() {{
          resetTurtle();            // leert turtleSegments, setzt turtleX/Y/Angle
          initButtonFunctions();    // bindet die Buttons
          drawScene();              // rendert komplett neu ohne Rest-Spuren
        }})();
        """
        display(Javascript(js))

        Turtle._instances.append(self)

       

    def forward(self, steps):
        """
        Bewege die Turtle schrittweise vorwärts.

        t.forward(100)

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        remaining = int(steps)
        while remaining > 0:
            chunk = min(self._step_size, remaining)
            self._send_js(f"moveTurtle({chunk}, {self.angle});")
            remaining -= chunk

    def backward(self, steps):
        """
        Bewege die Turtle schrittweise rückwärts.

        t.backward(100)

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        remaining = int(steps)
        while remaining > 0:
            chunk = min(self._step_size, remaining)
            self._send_js(f"moveTurtle({-chunk}, {self.angle});")
            remaining -= chunk

    def left(self, deg):
        """
        Drehe die Turtle schrittweise nach links.

        t.left(90)

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        self.angle = (self.angle - deg) % 360
        self._send_js(f"rotateTurtle({-deg});")

    def right(self, deg):
        """
        Drehe die Turtle schrittweise nach rechts.

        t.right(90)

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        self.angle = (self.angle + deg) % 360
        self._send_js(f"rotateTurtle({deg});")
        
    def penup(self):
        """
        Hebe den Stift an (zeichne nicht mehr).

        t.penup()

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        self._send_js("window.penup();")

    def pendown(self):
        """
        Senke den Stift (zeichne wieder).

        t.pendown()

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        self._send_js("window.pendown();")

    def setposition(self, x, y):
        """
        Setze die Position der Turtle.

        t.setposition(100, 200)

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        self._send_js(f"window.setposition({x}, {y});")

    def pencolor(self, color):
        """
        Setze die Stiftfarbe.

        t.pencolor('red')

        """
        lineno = inspect.currentframe().f_back.f_lineno
        self._send_js(f"window.highlightLine('{self._uid}', {lineno});")
        self._send_js(f"window.setStrokeColor('{color}');")

    def speed(self, s):
        """
        Setzt Animationstempo 1-10 (1 = langsam, 10 = schnell)
        
        t.speed(5)

        """
        s = max(1, min(10, int(s)))
        # mappe linear auf delay-Bereich [200..2]
        self._step_size = s
        max_d, min_d = 200, 2
        span = max_d - min_d
        self.command_delay = int(max_d - (s - 1) * span / 9)

    def flush(self):
        # Starte die JS-Animation für alle gesammelten Befehle.
        if not self._js_queue:
            return
        # Baue globale Befehls-Queue als echtes Array
        cmds_list = ', '.join(repr(cmd) for cmd in self._js_queue)
        delay = self.command_delay

        # JS-Snippet: Arbeite mit window._turtleCommands
        js = f"""
        // Verwende zentralen Flush in codeControl.js
            window._turtleFlush([{cmds_list}], {delay});  
        """
        display(Javascript(js))
        self._js_queue.clear()
    
      
    def _send_js(self, cmd):
        # In die interne Queue legen oder direkt ausführen (immer gepuffert).
        self._js_queue.append(cmd)
        self._history.append(cmd)

    def _ipython_display_(self):
        # Automatisch am Ende der Zelle flushen
        self.flush()
    
    def show_code(self, mode='play'):
        self.showcode(mode)

    def showcode(self, mode='play'):
        """
        Stelle die zuletzt ausgeführte Notebook-Zelle als Code-Block dar und 
        hebe den aktuellen Befehl hervor. Mit 'pause' wird die Animation pausiert, 
        mit 'play' läuft sie weiter.

        t.showcode('pause') oder t.showcode('play') oder t.showcode()

        """
        self.speed(1)

        if mode == 'pause':
            js_mode_cmd = "window._turtleStop();"
        elif mode == 'play':
            js_mode_cmd = "window._turtlePlay();"

        # Lade codeControl.js erneut
        code_control_js = resources.read_text(__package__ + ".static", "codeControl.js")
        display(Javascript(code_control_js))

        if self._history:
            cmds = ', '.join(repr(c) for c in self._history)
            js_flush = f"window._turtleFlush([{cmds}], {self.command_delay});"
            display(Javascript(js_flush))

        # In[]-History holen (letzte Zelle)
        try:
            shell = get_ipython()
            history = shell.user_ns.get('In', [])
            raw = history[-1] if history else ''
        except NameError:
            raw = ''

        # HTML-escape und split in Zeilen
        raw = raw.replace('\r\n', '\n').replace('\r', '\n')
        escaped = html.escape(raw)
        
        # JS-Aufruf: Code block + Controls initialisieren
        js = f"initTurtleCodeBlock('{self._uid}', `{escaped}`);"
        js += f"initTurtleCodeControls('{self._uid}', {self.command_delay});"
        js += js_mode_cmd
        display(Javascript(js))
        
        
# IPython-Hook: flush aller Turtle-Instanzen nach jeder Zelle
ip = get_ipython()
if ip:
    def _flush_all_turtles(_result):
        for inst in Turtle._instances:
            # Führe dann alle gesammelten JS-Befehle aus (inkl. Highlight)
            if inst._js_queue:
                inst.flush()
    ip.events.register('post_run_cell', _flush_all_turtles)
