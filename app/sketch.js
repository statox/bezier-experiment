let appSettings = {
    nbCheckpoints: 3,
    steps: 1,
    bezierT: 0.5,
    move: false
};

let checkpoints;

function customResizeCanvas() {
    const dim = Math.min(windowHeight, windowWidth) * 0.9;
    resizeCanvas(dim, dim);
}

function setup() {
    app = new Vue({
        el: '#appDiv',
        data: appSettings
    });

    // Create the canvas and put it in its div
    const myCanvas = createCanvas(600, 600);
    // customResizeCanvas();
    myCanvas.parent('canvasDiv');

    initInterface();

    generatePoints();
}

function mouseDragged(event) {
    if (mouseX > 0 && mouseY > 0 && mouseX < width && mouseY < height) {
        const draggedPoint = checkpoints.find((p) => {
            const pos = createVector(p.x, p.y);
            const mouse = createVector(mouseX, mouseY);
            const d = pos.dist(mouse);
            return d < 50;
        });

        if (draggedPoint) {
            draggedPoint.x = mouseX;
            draggedPoint.y = mouseY;

            refreshCurve();
        }
    }
}

function draw() {
    background(10);
    fill('blue');
    drawPath(checkpoints, 250);
    drawPath(bezierpoints, 'red', true);

    if (appSettings.move) {
        move();
        refreshCurve();
    }
}

function move() {
    for (let i = 0; i < checkpoints.length; i++) {
        const p = checkpoints[i];
        const nx = noise(1000 * i + p.x * 0.001) - 0.5;
        const ny = noise(2000 * i + p.y * 0.001) - 0.5;
        p.x = constrain(p.x + nx, 0, width);
        p.y = constrain(p.y + ny, 0, height);
    }
}

function drawPath(points, color, lineOnly) {
    fill(color);
    if (!lineOnly) {
        for (let i = 0; i < points.length; i++) {
            const c = points[i];
            circle(c.x, c.y, 10);
            text(i, c.x, c.y - 10);
        }
    }

    const tmp = [...points, points[0]];
    stroke(color);
    for (let i = 0; i < points.length; i++) {
        line(tmp[i].x, tmp[i].y, tmp[i + 1].x, tmp[i + 1].y);
    }
}

function generatePoints() {
    generateCheckpoints();
    refreshCurve();
}

function refreshCurve() {
    bezierpoints = generateCurve(checkpoints, appSettings.steps - 1);
}

function indexMod(i, l) {
    if (i < 0) {
        return indexMod(l + i, l);
    }
    if (i >= l) {
        return indexMod(i - l, l);
    }
    return i;
}

function generateCurve(points, step) {
    const curve = [];
    for (let i = 0; i < points.length; i++) {
        const a = points[indexMod(i - 1, points.length)];
        const b = points[indexMod(i, points.length)];
        const c = points[indexMod(i + 1, points.length)];
        const d = points[indexMod(i + 2, points.length)];

        const curvePoint = {
            x: myBezierPoint(a.x, b.x, c.x, d.x, appSettings.bezierT),
            y: myBezierPoint(a.y, b.y, c.y, d.y, appSettings.bezierT)
        };
        curve.push(points[indexMod(i)]);
        curve.push(curvePoint);
    }
    if (!step || step === 0) {
        return curve;
    }
    return generateCurve(curve, step - 1);
}

function generateCheckpoints() {
    if (!checkpoints) {
        checkpoints = [];
    }
    if (checkpoints.length < appSettings.nbCheckpoints) {
        while (checkpoints.length < appSettings.nbCheckpoints) {
            checkpoints.push({
                x: map(Math.random(), 0, 1, 100, 600),
                y: map(Math.random(), 0, 1, 100, 500)
            });
        }
        return;
    }
    while (checkpoints.length > appSettings.nbCheckpoints) {
        checkpoints.pop();
        return;
    }
    /*
     * const points = [];
     * for (let _ = 0; _ < appSettings.nbCheckpoints; _++) {
     *     points.push({
     *         x: map(Math.random(), 0, 1, 100, 600),
     *         y: map(Math.random(), 0, 1, 100, 500)
     *     });
     * }
     * return points;
     */
}

function myBezierPoint(a, b, c, d, t) {
    const t3 = t * t * t,
        t2 = t * t,
        f1 = -0.5 * t3 + t2 - 0.5 * t,
        f2 = 1.5 * t3 - 2.5 * t2 + 1.0,
        f3 = -1.5 * t3 + 2.0 * t2 + 0.5 * t,
        f4 = 0.5 * t3 - 0.5 * t2;
    return a * f1 + b * f2 + c * f3 + d * f4;
}
