class Particle extends AcGameObject
{
    constructor(playground,x,y,radius,color,vx,vy,speed) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;

        this.vx=vx;
        this.vy=vy;
        this.speed=speed;
    }

    render()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
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
        if(this.speed<EPS*10||this.radius<EPS*10)
        {
            this.destroy();
            return false;
        }

        this.x+=this.vx*this.speed*this.timedelta/1000;
        this.y+=this.vx*this.speed*this.timedelta/1000;

        this.speed *= this.friction_speed;
        this.radius *= this.friction_radius;
    }

}