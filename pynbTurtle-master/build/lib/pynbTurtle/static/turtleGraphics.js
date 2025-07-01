window.drawTurtle= function(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);

    // Beine
    ctx.fillStyle = "darkgreen";
    ctx.beginPath();
    ctx.arc(-6,-7,4,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6,-7,4,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-6,7,4,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6,7,4,0,Math.PI*2);
    ctx.fill();

    // Körper
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();

    // Schwanz
    ctx.beginPath();
    ctx.moveTo(-9, 4);
    ctx.lineTo(-9, -4);
    ctx.lineTo(-16, 0);
    ctx.closePath();
    ctx.fillStyle = "darkgreen";
    ctx.fill();

    // Kopf
    ctx.beginPath();
    ctx.arc(12, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();

    // Augen
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(14, -2, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14, 2, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
