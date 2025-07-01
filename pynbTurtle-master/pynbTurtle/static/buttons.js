// Datei: pynbTurtle/static/buttons.js

window.initButtonFunctions = function() {
    // Hilfsfunktion: Registriert Event Listener für alle Elemente, deren ID
    // mit "prefix_" beginnt (das "_" trennt den statischen Teil von der eindeutigen ID).
    function addListener(prefix, event, handler) {
        var selector = "[id^='" + prefix + "_']";
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
            // Falls noch kein Listener angehängt wurde, füge ihn hinzu.
            if (!el.dataset.listenerAttached) {
                el.addEventListener(event, handler);
                el.dataset.listenerAttached = "true";
            }
        });
    }

    // Zoom-In: Erhöhe den globalen Zoom-Level und aktualisiere die Szene.
    addListener("zoomInButton", "click", function() {
        zoomLevel *= 1.1;
        drawScene();
    });

    // Zoom-Out: Verringere den globalen Zoom-Level und aktualisiere die Szene.
    addListener("zoomOutButton", "click", function() {
        zoomLevel /= 1.1;
        drawScene();
    });

    // Toggle-Turtle: Wechselt den Sichtbarkeitsstatus der Turtle.
    addListener("toggleTurtleButton", "click", function() {
        turtleVisible = !turtleVisible;
        var btn = document.querySelector("[id^='toggleTurtleButton_']");
        if (btn) {
            btn.innerText = turtleVisible ? "Turtle" : "Turtle";
        }
        drawScene();
    });

    // Toggle-Grid: Schaltet das Grid an/aus.
    addListener("toggleGridButton", "click", function() {
        gridVisible = !gridVisible;
        var btn = document.querySelector("[id^='toggleGridButton_']");
        if (btn) {
            btn.innerText = gridVisible ? "Grid" : "Grid";
        }
        drawScene();
    });

    // Center: Zentriert das aktuelle Bild auf dem Canvas.
    addListener("centerButton", "click", function() {
        var x_min = Infinity, x_max = -Infinity, y_min = Infinity, y_max = -Infinity;
        for (var i = 0; i < turtleSegments.length; i++) {
            var seg = turtleSegments[i];
            for (var j = 0; j < seg.points.length; j++) {
                var pt = seg.points[j];
                if (pt.x < x_min) { x_min = pt.x; }
                if (pt.x > x_max) { x_max = pt.x; }
                if (pt.y < y_min) { y_min = pt.y; }
                if (pt.y > y_max) { y_max = pt.y; }
            }
        }
        if (x_min === Infinity || y_min === Infinity) {
            x_min = 200; x_max = 200; y_min = 200; y_max = 200;
        }
        var drawingCenterX = (x_min + x_max) / 2;
        var drawingCenterY = (y_min + y_max) / 2;
        panX = - (drawingCenterX - canvas.width / 2) * zoomLevel;
        panY = - (drawingCenterY - canvas.height / 2) * zoomLevel;
        drawScene();
    });

    // Pan-Up: Verschiebt den Pan-Versatz nach oben.
    addListener("panUpButton", "click", function() {
        panY -= 20;
        drawScene();
    });

    // Pan-Down: Verschiebt den Pan-Versatz nach unten.
    addListener("panDownButton", "click", function() {
        panY += 20;
        drawScene();
    });

    // Pan-Left: Verschiebt den Pan-Versatz nach links.
    addListener("panLeftButton", "click", function() {
        panX -= 20;
        drawScene();
    });

    // Pan-Right: Verschiebt den Pan-Versatz nach rechts.
    addListener("panRightButton", "click", function() {
        panX += 20;
        drawScene();
    });

    // Export: Exportiert den aktuellen Canvas als PNG und startet den Download.
    addListener("exportButton", "click", function() {
        var dataURL = canvas.toDataURL('image/png');
        var link = document.createElement('a');
        link.href = dataURL;
        link.download = 'turtle_drawing.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Reset: Setzt die Turtle zurück, stoppt alle laufenden Animationen und löscht alle Befehle.
    addListener("resetButton", "click", function() {
        // stoppe laufende Animation
        if (window._turtleInterval) {
            clearInterval(window._turtleInterval);
            delete window._turtleInterval;
        }
        // lösche alle noch ausstehenden Befehle
        window._turtleCommands.length = 0;
        // setze Turtle zurück und zeichne Szene neu
        resetTurtle();
        drawScene();
    });

}
