let GET_DIST = function(x1, y1, x2, y2)
{
    let dx = x1 - x2, dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

let EPS=0.1;

class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, is_me, speed) {
        super(true);

        this.playground = playground; // 所属playground
        this.ctx = this.playground.game_map.ctx; // 操作的画笔

        this.x = x;  // 坐标
        this.y = y; // 坐标
        this.radius = radius; // 半径
        this.color = color; // 颜色
        this.is_me = is_me; // 玩家类型
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.speed = speed; // 速度
        this.is_alive = true; // 是否存活

        this.eps = 0.1; // 精度
        //this.start();

        this.cur_skill = null;

    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;//关闭画布的原右键监听事件
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (!outer.is_alive) return false;//已经去世的球不能动
            let ee = e.which; // e.which是鼠标对应点击的值
            if (ee === 3) // 右键
            {
                outer.move_to(e.clientX, e.clientY);//分别为鼠标点击处的x坐标和y坐标
            } else if (ee === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
                    return false;
                }
                outer.cur_skill = null;//点击之后清空
            }
        });

        $(window).keydown(function (e) {
            if (!outer.is_alive) return false;
            let ee = e.which;
            if (ee === 81) //81是Q的key-code
            {
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        //console.log(tx, ty);
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let color = "orange";
        let damage = this.playground.height * 0.01;
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = this.playground.height * 0.5;
        let move_dist = this.playground.height * 1;

        new Fireball(this.playground, this, x, y, radius, color, damage, vx, vy, speed, move_dist);
    }

    is_attacked(obj) {
        let angle = Math.atan2(this.y - obj.y, this.x - obj.x);
        let damage = obj.damage;
        console.log("球被攻击");
        this.is_attacked_concrete(angle, damage);
    }

    is_attacked_concrete(angle, damage) {
        //this.explode_particle();
        this.radius -= damage;
        this.friction_damage = 0.8;

        if (this.is_died()) return false;

        this.x_damage = Math.cos(angle);
        this.y_damage = Math.sin(angle);
        this.speed_damage = damage * 100;
        this.explode_particle();//粒子爆发
    }

    explode_particle() {
        for (let i = 0; i < 10 + Math.random() * 5; ++i) {
            let x = this.x, y = this.y;
            let radius = this.radius / 3;
            let angle = Math.PI * 2 * Math.random();//随机方向粒子爆发
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;

            new Particle(this.playground, x, y, radius, color, vx, vy, speed);//粒子对象创建


        }
    }

    is_died() {
        if (this.radius < EPS * 10) {
            this.destroy();
            return true;
        }
        return false;
    }

    move_to(tx, ty) {
        this.move_length = GET_DIST(this.x, this.y, tx, ty);
        let dx = tx - this.x, dy = ty - this.y;
        let angle = Math.atan2(dy, dx);//角度
        this.vx = Math.cos(angle);//余弦
        this.vy = Math.sin(angle);//正弦
        //console.log("move_to", tx, ty);
        //console.log("x,y:", parseInt(this.x), parseInt(this.y));
        //console.log("dx,dy:", dx, dy);
        //console.log("length", this.move_length);

    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        }
        this.cold_time = 5;
    }

    update() {
        //this.x+=this.vx;
        //this.y+=this.vy;
        this.update_move();
        this.render();
        this.update_AI();
    }

    update_AI() {
        if (this.is_me) return false;

        this.update_AI_move();
        if (!this.update_AI_cold_time()) return false;
        this.update_AI_shoot_fireball();
    }

    update_AI_cold_time()
    {
        if(this.cold_time>0)
        {
            this.cold_time -= this.timedelta/1000;
            return false;
        }
        return true;
    }

    update_AI_shoot_fireball()
    {
        if(Math.random()<1/300.0)
        {
            let player = this.playground.players[0];
            this.shoot_fireball(player.x,player.y);
        }
    }

    update_AI_move()
    {
        if(this.move_length<EPS)
        {
            let tx = Math.random()*this.playground.width;
            let ty = Math.random()*this.playground.height;
            this.move_to(tx,ty);
        }
    }

    update_move() // 将移动单独写为一个过程
    {
        if (this.speed_damage&&this.speed_damage>EPS)
        {
            this.vx=this.vy=0;
            this.move_length=0;
            this.x+=this.x_damage*this.speed_damage*this.timedelta/1000;
            this.y+=this.y_damage*this.speed_damage*this.timedelta/1000;
            this.speed_damage*=this.friction_damage;
        }

        if (this.move_length < EPS) // 移动距离没了（小于精度）
        {
            //console.log(this.x,this.y);
            this.move_length = 0; // 全都停下了
            this.vx = this.vy = 0;
        }
        else // 否则继续移动
        {
            //let moved = this.speed * this.timedelta / 1000;
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 每个时间微分里该走的距离
            // 注意：this.timedelta 的单位是毫秒，所以要 / 1000 转换单位为秒
            //console.log(this.x,this.y);
            this.x += this.vx * moved; // 移动
            this.y += this.vy * moved; // 移动
            this.move_length -=moved;
            //this.x+=this.vx;
            //this.y+=this.vy;
        }
    }

    on_destroy() // 死之前在this.playground.players数组里面删掉这个player
    {
        this.is_alive = false; // 已经去世了
        for (let i = 0; i < this.playground.players.length; ++ i)
        {
            let player = this.playground.players[i];
            if (this === player)
            {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
