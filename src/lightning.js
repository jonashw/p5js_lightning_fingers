function lightning(p5, x1, y1, x2/*optional*/, y2/*optional*/, d, strokeWeight) {
    p5.push();
    let x = x1;
    let y = y1;
    let x_next, y_next;
    let n = 10;
    let C = 5 * d / n;
    let HC = C / 2;
    let K = 10;
    p5.strokeWeight(strokeWeight);
    if (x2 != undefined && y2 != undefined) {
        for (var i = n; i > 0; i--) {
            dx = (x - x2) / i;
            dy = (y - y2) / i;
            x_next = x - dx + (p5.noise(p5.frameCount / p5.random(n)) * C - HC);
            y_next = y - dy + (p5.noise(p5.frameCount / p5.random(i)) * C - HC);
            p5.line(x, y, x_next, y_next);
            x = x_next;
            y = y_next;
        }
        p5.line(x, y, x2, y2);
    } else {
        p5.noStroke();
    }
    p5.pop();
}