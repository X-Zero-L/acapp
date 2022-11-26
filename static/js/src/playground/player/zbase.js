let GET_DIST = function(x1, y1, x2, y2)
{
    let dx = x1 - x2, dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

let EPS=0.1;

class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, character, speed,username,photo) {
        super(true);

        this.playground = playground; // 所属playground
        this.ctx = this.playground.game_map.ctx; // 操作的画笔

        this.x = x;  // 坐标
        this.y = y; // 坐标
        this.radius = radius; // 半径
        this.color = color; // 颜色
        this.character = character; // 玩家类型
        this.username=username;
        this.photo = photo;
        if(this.character!== "robot")
        {
            this.img = new Image();
            this.img.src = this.photo;
        }
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.speed = speed; // 速度
        this.is_alive = true; // 是否存活

        this.eps = 0.1; // 精度
        //this.start();
        if(this.character ==="me"){
            this.fireball_coldtime=3;
            this.fireball_img=new Image();
            this.fireball_img.src="https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
        this.cur_skill = null;
        this.fireballs = [];

    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;//关闭画布的原右键监听事件
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            if(outer.playground.state!=="fighting")
                return false;
            const rect =outer.ctx.canvas.getBoundingClientRect();
            if (!outer.is_alive) return false;//已经去世的球不能动
            let ee = e.which; // e.which是鼠标对应点击的值
            if (ee === 3) // 右键
            {
                let tx=(e.clientX-rect.left)/outer.playground.scale;
                let ty=(e.clientY-rect.top)/outer.playground.scale;
                outer.move_to(tx,ty);//分别为鼠标点击处的x坐标和y坐标
                if(outer.playground.mode==="multi mode") {  // 在多人模式中，需要同时向后端发送自己对应的移动信息
                    outer.playground.mps.send_move_to(tx,ty);
                }
            } else if (ee === 1) {
                let tx=(e.clientX-rect.left)/outer.playground.scale;
                let ty=(e.clientY-rect.top)/outer.playground.scale;
                if (outer.cur_skill === "fireball") {
                    let fireball=outer.shoot_fireball(tx, ty);
                    if(outer.playground.mode==="multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx,ty,fireball.uuid);
                    }
                    outer.fireball_coldtime=3;
                    //return false;
                }
                else if(outer.cur_skill==="blink"){
                    outer.blink(tx,ty);
                    if(outer.playground.mode==="multi mode"){
                        outer.playground.mps.send_blink(tx,ty);
                    }
                    outer.blink_coldtime=5;
                }
                outer.cur_skill = null;//点击之后清空
            }
        });

        $(window).keydown(function (e) {
            if(outer.playground.state!=="fighting")
                return false;
            if(outer.fireball_coldtime>=outer.eps)
                return false;
            if (!outer.is_alive) return false;
            let ee = e.which;
            if (ee === 81) //81是Q的key-code
            {
                outer.cur_skill = "fireball";
                return false;
            }
            else if(ee===70){ // f键
                if(outer.blink_coldtime>=outer.eps) return true;
                outer.cur_skill="blink";
                return false;
            }
        });
    }

    blink(tx,ty){
        let d=GET_DIST(this.x,this.y,tx,ty);
        d=Math.min(d,0.5);//最大闪现距离
        let angle = Math.atan2(ty-this.y,tx-this.x);
        this.x+=d*Math.cos(angle);
        this.y+=d*Math.sin(angle);

        this.move_length=0;//闪现后需要停下来
    }

    shoot_fireball(tx, ty) {
        //console.log(tx, ty);
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "orange";
        let damage = 0.01;
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.5;
        let move_dist = 1.0;

        let fireball = new Fireball(this.playground, this, x, y, radius, color, damage, vx, vy, speed, move_dist);
        this.fireballs.push(fireball);
        return fireball;
    }

    destroy_fireball(uuid) {
        for(let i=0;i<this.fireballs.length;i++){
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid){
                fireball.destroy();
                break;
            }
        }
    }

    receive_attack(x,y,angle,damage,ball_uuid,attacker){
       attacker.destroy_fireball(ball_uuid);
       this.x=x;
       this.y=y;
       this.is_attacked_concrete(angle,damage);
    }

    is_attacked(obj) {
        let angle = Math.atan2(this.y - obj.y, this.x - obj.x);
        let damage = obj.damage;
        //console.log("球被攻击");
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
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            let x = this.x, y = this.y;
            //let x=this.x+(2*Math.random()-1)*this.radius;
            //let y=Math.sqrt(this.radius*this.radius-(x-this.x)*(x-this.x));
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            //let vx=2*Math.random()-1;
            //let vy=2*Math.random()-1;
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

    }

    is_died() {
        if (this.radius < EPS*0.1) {
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
        let scale = this.playground.scale;
        if(this.character!="robot")
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x*scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
            this.lineWidth = EPS*10;
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img,(this.x-this.radius)*scale,(this.y-this.radius)*scale,this.radius*2*scale,this.radius*2*scale);
            this.ctx.restore();
        }
        else
        {
            this.ctx.beginPath();
            this.ctx.arc(this.x*scale, this.y*scale, this.radius*scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if(this.character==="me"&&this.playground.state==="fighting"){
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime(){
        let scale=this.playground.scale;

        let x=1.5,y=0.9,r=0.04;
        // 火球技能
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x*scale,y*scale,r*scale,0,Math.PI*2,false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img,(x-r)*scale,(y-r)*scale,r*2*scale,r * 2 * scale);
        this.ctx.restore();

        if(this.fireball_coldtime>=this.eps){
            this.ctx.beginPath();
            this.ctx.moveTo(x*scale,y*scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x*scale,y*scale);
            this.ctx.fillStyle="rgba(0,0,255,0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        // 闪现技能
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime >= this.eps){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    start() {
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");
        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }
        if (this.character==="me") {
            this.add_listening_events();
        }
        this.cold_time = 5;
    }

    update() {
        //this.x+=this.vx;
        //this.y+=this.vy;
        this.update_move();
        if(this.character==="me"&&this.playground.state==="fighting")
        {
            this.update_coldtime();
        }
        this.render();
        this.update_AI();
    }

    update_coldtime(){
        this.fireball_coldtime-=this.timedelta/1000;
        this.fireball_coldtime=Math.max(0,this.fireball_coldtime);

        this.blink_coldtime-=this.timedelta/1000;
        this.blink_coldtime=Math.max(0,this.blink_coldtime);
    }

    update_AI() {
        if (this.character!="robot") return false;

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
            let tx = Math.random()*this.playground.width/this.playground.scale;
            let ty = Math.random()*this.playground.height/this.playground.scale;
            this.move_to(tx,ty);
        }
    }

    update_move() // 将移动单独写为一个过程
    {
        if (this.speed_damage&&this.speed_damage>this.eps)
        {
            this.vx=this.vy=0;
            this.move_length=0;
            this.x+=this.x_damage*this.speed_damage*this.timedelta/1000;
            this.y+=this.y_damage*this.speed_damage*this.timedelta/1000;
            this.speed_damage*=this.friction_damage;
        }

        if (this.move_length < this.eps) // 移动距离没了（小于精度）
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
