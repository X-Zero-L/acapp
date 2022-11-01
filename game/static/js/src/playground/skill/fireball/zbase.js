class Fireball extends AcGameObject
{
    constructor(playground,player,x,y,radius,color,damage,vx,vy,speed,move_dist) {
        super(true);
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;

        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color = color;
        this.damage = damage;

        this.vx=vx;
        this.vy=vy;
        this.speed=speed;
        this.move_dist=move_dist
    }

    render()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,o0Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }

    start()
    {

    }

    update()
    {
        this.update_move();
        this.render();
    }

    update_move()
    {
        if(this.move_dist<EPS)
        {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_dist,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.move_dist-=moved;
    }


}