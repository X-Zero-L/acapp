class Particle extends AcGameObject
{
    constructor(playground,x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 0.01;

    }

    render()
    {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x*scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }

    start()
    {
        this.friction_speed=0.8;
        this.friction_radius=0.8;
    }

    is_attacked()
    {
        return false;
    }

    update() {
        this.update_move();
        this.render();
    }

    update_move()
    {
        if(this.speed<this.eps||this.move_length<this.eps)
        {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vx*moved;

        this.speed *= this.friction;
        //this.radius *= this.friction_radius;
        this.move_length -=moved;
    }

}