class Obstacle {
    constructor(x, y, t, c) {
        switch(t) {
            case 0: //small obstacle
            this.w = 40;
            this.h = 80;
            break;
            case 1: //big obstacle
            this.w = 60;
            this.h = 120;
            break;
            case 2: //medium obstacle
            this.w = 120;
            this.h = 80;
            break;
        }

        this.x = x + this.w;
        this.y = y - this.h - 130;
        this.c = c;
        this.dx = -gameSpeed;
    }

    Update() {
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }

    Draw() {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}