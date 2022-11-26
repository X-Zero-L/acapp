class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
            console.log("logout");
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}let AC_GAME_OBJECTS = []; // 储存所有可以“动”的元素的全局数组

class AcGameObject
{
    constructor(hurtable = false) // 构造函数
    {
        AC_GAME_OBJECTS.push(this);  // 将这个对象加入到储存动元素的全局数组里

        this.has_call_start = false; // 记录这个对象是否已经调用了start函数
        this.timedelta = 0; // 当前距离上一帧的时间间隔，相等于时间微分，用来防止因为不同浏览器不同的帧数，物体移动若按帧算会不同，所以要用统一的标准，就要用时间来衡量

        this.hurtable = hurtable; // 决定这个元素能否被碰撞，默认为不能
        this.uuid = this.create_uuid();
    }

    create_uuid(){
        let res="";
        for(let i=0;i<8;i++){
            let x=parseInt(Math.floor(Math.random()*10));
            res+=x;
        }
        return res;
    }

    start()
    {
        // 只会在第一帧执行一次的过程
    }

    update()
    {
        // 每一帧都会执行的过程
    }

    destroy()
    {
        this.on_destroy();
        // 删除这个元素
        for (let i = 0; i < AC_GAME_OBJECTS.length; ++ i)
        {
            if (AC_GAME_OBJECTS[i] === this)
             {
                 AC_GAME_OBJECTS.splice(i, 1); // 从数组中删除元素的函数splice()
                 break;
             }
        }
    }

    on_destroy()
    {
        // 被删除之前的过程，“临终遗言”
    }
}

let last_timestp; // 上一帧的时间
let AC_GAME_ANIMATION = function(timestp) // timestp 是传入的一个参数，就是当前调用的时间
{
    for (let i = 0; i < AC_GAME_OBJECTS.length; ++ i) // 所有动的元素都进行更新。
    {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start)
        {
            obj.start(); // 调用start()
            obj.has_called_start = true; // 表示已经调用过start()了
        }
        else
        {
            obj.timedelta = timestp - last_timestp; // 时间微分
            obj.update(); // 不断调用
        }
    }
    last_timestp = timestp; // 进入下一帧时当前时间戳就是这一帧的时间戳

    requestAnimationFrame(AC_GAME_ANIMATION); // 不断递归调用
}

requestAnimationFrame(AC_GAME_ANIMATION);
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

}class ChatField{
    constructor(playground) {
        this.playground=playground;

        this.$history=$(`<div class="ac-game-chat-field-history"></div>`);
        this.$input=$(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();

        this.func_id=null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }
    add_listening_events(){
        let outer= this;
        this.$input.keydown(function (e){
            if(e.which===27){
                //ESC
                outer.hide_input();
                return false;
            }
            else if(e.which===13){
                let username=outer.playground.root.settings.username;
                let text=outer.$input.val();
                if(text){
                    outer.$input.val("");
                    outer.add_message(username,text);
                    outer.playground.mps.send_message(text);
                }
                return false;
            }
        });
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();
        if (this.func_id) clearTimeout(this.func_id);
        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}] ${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();    //输入时，聚焦于输入框
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();   //退出时，聚焦回游戏界面
    }
}class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.focus();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 111, 123, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class NoticeBoard extends AcGameObject {
    constructor(playground){
        super();

        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.text="已就绪：0人";
    }

    start(){

    }

    write(text) {
        this.text=text;
    }

    update(){
        this.render();
    }

    render() {
        this.ctx.font="20px serif";
        this.ctx.fillStyle="white";
        this.ctx.textAlign="center";
        this.ctx.fillText(this.text,this.playground.width/2,20);
    }
}let GET_DIST = function(x1, y1, x2, y2)
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

        this.playground.game_map.$canvas.keydown(function (e) {
            if(outer.playground.state!=="fighting")
                return false;
            if (!outer.is_alive) return false;
            let ee = e.which;
            if (ee === 81) //81是Q的key-code
            {
                if(outer.fireball_coldtime>=outer.eps)
                    return true;
                outer.cur_skill = "fireball";
                return false;
            }
            else if(ee===70){ // f键
                if(outer.blink_coldtime>=outer.eps) return true;
                outer.cur_skill="blink";
                return false;
            }
            else if(ee===13){
                if (outer.playground.mode==="multi mode") {
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }
            else if(ee===27){
                if (outer.playground.mode==="multi mode"){
                    outer.playground.chat_field.hide_input();
                    return false;
                }
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
let IS_COLLISION = function (obj1,obj2)
{
    return GET_DIST(obj1.x,obj1.y,obj2.x,obj2.y)<obj1.radius+obj2.radius;
}

class Fireball extends AcGameObject {
    constructor(playground, player, x, y, radius, color, damage, vx, vy, speed, move_dist) {
        super(true);
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;

        this.x = x;
        this.y = y;
        this.radius = radius; // 半径
        this.color = color;
        this.damage = damage; // 伤害值

        this.vx = vx; // 移动方向
        this.vy = vy; // 移动方向
        this.speed = speed; // 速度
        this.move_dist = move_dist; // 射程

    }

    is_satisfy_collision(obj) // 真的碰撞的条件
    {
        if (this === obj) return false; // 自身不会被攻击
        if (this.player === obj) return false; // 发射源不会被攻击
        return IS_COLLISION(this, obj); // 距离是否满足
    }

    hit(obj) // 碰撞
    {

        obj.is_attacked(this); // obj被this攻击了
        this.is_attacked(obj); // this被obj攻击了
    }

    is_attacked(obj) // 被伤害
    {
        this.is_attacked_concrete(0, 0); // 火球不需要关注伤害值和血量，因为碰到后就直接消失
    }

    is_attacked_concrete(angle, damage)
    {
        this.destroy(); // 直接消失
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x*scale, this.y*scale, this.radius*scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    start() {

    }

    update() {
        if(this.player.character!=="enemy") { // 火球的碰撞只在发射方进行检测，实现统一
            this.update_attack();
        }
        this.update_move();
        this.render();
    }

    update_attack() {
        for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
            let obj = AC_GAME_OBJECTS[i];
            if (this.is_satisfy_collision(obj)) // 如果真的碰撞了（这样可以保证碰撞条件可以自行定义，以后会很好维护）
            {
                if(this.playground.mode==="multi mode"){//多人模式中，向其他玩家发送某个obj被这个小球击中的信息
                    let angle = Math.atan2(obj.y - this.y, obj.x - this.x);
                    this.playground.mps.send_attack(obj.uuid,obj.x,obj.y,angle,this.damage,this.uuid);
                }
                this.hit(obj); // 两个物体碰撞了
                break; // 火球，只能碰到一个物体
            }
        }
    }

    update_move() {
        if (this.move_dist < EPS) // 如果走完射程了就消失
        {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_dist, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_dist -= moved;
    }

    on_destroy() {
        let fireballs = this.player.fireballs;
        for(let i = 0 ; i <fireballs.length;i++)
        {
            if(fireballs[i]===this)
            {
                fireballs.splice(i,1);
                break;
            }
        }
    }
}class MultiPlayerSocket{
    constructor(playground)
    {
        this.playground = playground;
        this.ws = new WebSocket("wss://app1619.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start(){
        this.reveive();
    }

    reveive(){  //监听ws传输的信息
        let outer = this;
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid,data.username,data.photo);
            }
            else if(event === "move_to") {
                //console.log("接收到其他玩家的移动信息！");
                outer.receive_move_to(uuid,data.tx,data.ty);
            }
            else if(event==="shoot_fireball") {
                console.log("有玩家发射了火球！！！");
                outer.receive_shoot_fireball(uuid,data.tx,data.ty,data.ball_uuid);
            }
            else if(event==="attack"){
                console.log("有物品受到了火球的碰撞！！！");
                outer.receive_attack(uuid,data.attackee_uuid,data.x,data.y,data.angle,data.damage,data.ball_uuid);
            }
            else if(event==="blink"){
                console.log("有玩家使用了闪现！！！");
                outer.receive_blink(uuid,data.tx,data.ty);
            }
            else if(event==="message"){
                console.log("有玩家发送了信息！！！");
                outer.receive_message(data.username,data.text);
            }
        }
    }


    send_move_to(tx,ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':'move_to',
            'uuid':outer.uuid,
            'tx':tx,
            'ty':ty,
        }));
    }

    get_player(uuid) {
        let players = this.playground.players;
        for(let i = 0;i<players.length;i++){
            let player = players[i];
            if(player.uuid===uuid){
                return player;
            }
        }
        return null;
    }

    receive_move_to(uuid,tx,ty){
        let player = this.get_player(uuid);
        if(player){
            player.move_to(tx,ty);
        }
    }

    send_create_player(username,photo){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':'create_player',
            'uuid':outer.uuid,
            'username':username,
            'photo':photo,
        }));
    }

    receive_create_player(uuid,username,photo){
        let player = new Player(this.playground, this.playground.width / 2 / this.playground.scale, 0.5, 0.05, "white", "enemy", 0.15,username,photo);
        player.uuid = uuid;
        this.playground.players.push(player);
        //console.log("success create a enemy!!!");
    }

    send_shoot_fireball(tx,ty,ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':"shoot_fireball",
            'uuid':outer.uuid,
            'tx':tx,
            'ty':ty,
            'ball_uuid':ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid,tx,ty,ball_uuid){
        let player = this.get_player(uuid);
        if(player){
            let fireball = player.shoot_fireball(tx,ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid,x,y,angle,damage,ball_uuid){
        let outer=this;
        this.ws.send(JSON.stringify({
            'event':"attack",
            'uuid':outer.uuid,
            'attackee_uuid':attackee_uuid,
            'x':x,
            'y':y,
            'angle':angle,
            'damage':damage,
            'ball_uuid':ball_uuid,
        }));
    }

    receive_attack(uuid,attackee_uuid,x,y,angle,damage,ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx,ty){
        let outer=this;
        this.ws.send(JSON.stringify({
            'event':"blink",
            'uuid':outer.uuid,
            'tx':tx,
            'ty':ty,
        }));
    }

    receive_blink(uuid,tx,ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_message(text){
        let outer=this;
        this.ws.send(JSON.stringify({
            'event':"message",
            'uuid':outer.uuid,
            'username':outer.playground.root.settings.username,
            'text':text,
        }));
    }

    receive_message(username,text){
        this.playground.chat_field.add_message(username,text);
    }
}let HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

let GET_RANDOM_COLOR = function (){
    let color = "#";//#开头表示的是一个十六进制的颜色编码，后面总共6位数
    for (let i = 0 ; i < 6 ; ++i)
    {
        color +=HEX[Math.floor(Math.random()*16)];
    }
    return color;
}


class AcGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground"></div>
`);

        this.root.$ac_game.append(this.$playground);
        this.$back = this.$playground.find('.ac-game-playground-item-back')
        this.width = this.$playground.width;
        this.height = this.$playground.height;
        this.scale = this.height;
        //this.uuid = this.create_uuid();
        this.start();
    }

    add_listening_events()
    {
        let outer = this;
        this.$back.click(function(){
            outer.hide();
            outer.root.$menu.show();
        });
    }


    show(mode)
    {
        this.$playground.show();
        this.resize();
        this.game_map = new GameMap(this); // 创建一个地图
        this.state="waiting";
        this.notice_board=new NoticeBoard(this);
        this.player_count=0;
        this.players = []; // 创建一个用于储存玩家的数组
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "red", "me", 0.15,this.root.settings.username,this.root.settings.photo));
        if(mode==="single mode") {
            for (let i = 0; i < 20; ++i) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, GET_RANDOM_COLOR(), "robot", 0.15))
            }
            console.log(mode);
        }
        else if(mode==="multi mode"){
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            let outer = this;
            this.mps.ws.onopen = function (){
                outer.mps.send_create_player(outer.root.settings.username,outer.root.settings.photo);
            };
            console.log(mode);
            this.mode=mode;
        }
    }

    hide()
    {
        this.$playground.hide();
    }

    start()
    {
        this.hide();
        this.add_listening_events();
        let outer = this;
        $(window).resize(function (){
            outer.resize();
        })
    }

    update()
    {

    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width/16,this.height/9);
        this.width = unit*16;
        this.height = unit*9;

        this.scale = this.height;

        if(this.game_map) this.game_map.resize();
    }

}
class Settings
{
    constructor(root)
    {
        this.root=root;
        this.platform="WEB";
        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login"> <!--登录界面-->
        <div class="ac-game-settings-title"> <!--标题-->
            登录
        </div>
        <div class="ac-game-settings-username"> <!--用户名输入框-->
            <div class="ac-game-settings-item">
                <input type="text" placeholder="Username"> <!--输入处-->
            </div>
        </div>
        <div class="ac-game-settings-password"> <!--密码输入框-->
            <div class="ac-game-settings-item">
                <input type="password" placeholder="Password"> <!--密码输入处-->
            </div>
        </div>
        <div class="ac-game-settings-submit"> <!--按钮-->
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message"> <!--错误信息-->
            用户名或密码错误！
        </div>
        <div class="ac-game-settings-option"> <!--注册选项-->
            注册
        </div>
        <br> <!--这里一定要加上，不然一键登录图标不会居中，前面两行是inline的样式，可能会有bug-->
        <div class="ac-game-settings-acwing">
            <img src="https://app1619.acapp.acwing.com.cn/static/image/settings/acwing.png" width="30"> <!--一键登录图标-->
            <div> <!--图标下提示信息-->
                AcWingOS一键登录
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register"> <!--这是注册界面-->
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username"> <!--用户名输入框-->
            <div class="ac-game-settings-item">
                <input type="text" placeholder="Username"> <!--输入处-->
            </div>
        </div>
        <div class="ac-game-settings-password-first"> <!--密码输入框-->
            <div class="ac-game-settings-item">
                <input type="password" placeholder="Password"> <!--密码输入处-->
            </div>
        </div>
        <div class="ac-game-settings-password-second"> <!--确认密码输入框-->
            <div class="ac-game-settings-item">
                <input type="password" placeholder="Password Confirm"> <!--密码输入处-->
            </div>
        </div>
        <div class="ac-game-settings-submit"> <!--按钮-->
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message"> <!--错误信息-->
            用户名或密码不可用！
        </div>
        <div class="ac-game-settings-option"> <!--注册选项-->
            登录
        </div>
        <br> <!--这里一定要加上，不然一键登录图标不会居中，前面两行是inline的样式，可能会有bug-->
        <div class="ac-game-settings-acwing">
            <img src="https://app1619.acapp.acwing.com.cn/static/image/settings/acwing.png" width="30"> <!--一键登录图标-->
            <div> <!--图标下提示信息-->
                AcWingOS 一键登录
            </div>
        </div>
    </div>
</div>
`)
        this.username="";
        this.photo="";
        if(this.root.OS) this.platform="ACAPP";
        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");
        this.$login.hide();

        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();
        this.root.$ac_game.append(this.$settings);

        this.$acwing_login = this.$settings.find(".ac-game-settings-acwing img");

        this.start()
    }

    register()
    {
        this.$login.hide();
        this.$register.show();
    }

    login()
    {
        this.$register.hide();
        this.$login.show();
    }

    getinfo_web()
    {
        let outer = this;
        //console.log(outer.platform);
        $.ajax({
            url:"https://app1619.acapp.acwing.com.cn/settings/getinfo",
            type:"GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                if (resp.result === "success")
                {
                    //console.log(outer.platform);
                    outer.username=resp.username;
                    outer.photo=resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else
                {
                    outer.login();
                }
            }
        })
        //this.login();
    }

    getinfo_acapp()
    {
        let outer = this;

        $.ajax({
            url:"https://app1619.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type:"GET",
            success:function(resp){
                if(resp.result==="success")
                {
                    outer.acapp_login(resp.appid,resp.redirect_uri,resp.scope,resp.state);
                }
            }
        })
    }

    acapp_login(appid,redirect_uri,scope,state)
    {
        let outer = this;

        this.root.OS.api.oauth2.authorize(appid,redirect_uri,scope,state,function(resp){
            console.log(resp);
            if(resp.result==="success")
            {
                outer.username=resp.username;
                outer.photo=resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
        this.root.menu.show();
    }

    hide()
    {
        this.$settings.hide();
    }

    show()
    {
        this.$settings.show();
    }

    start() {
        if (this.platform === "ACAPP")
        {
            this.getinfo_acapp();
        }
        else
        {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events()
    {
        this.add_listening_events_register();
        this.add_listening_events_login();
        this.add_listening_events_acwing_login();
    }

    add_listening_events_register()
    {
        let outer = this;
        this.$register_login.click(function (){
           outer.login();
        });
        this.$register_submit.click(function (){
           outer.register_on_remote();
        });
    }

    add_listening_events_login()
    {
        let outer = this;
        this.$login_register.click(function(){
           outer.register();
        });
        this.$login_submit.click(function(){
           outer.login_on_remote();
        });
    }

    add_listening_events_acwing_login()
    {
        let outer=this;

        this.$acwing_login.click(function(){
           outer.acwing_login();
        });
    }

    acwing_login()
    {
        console.log("click acwing login");
        $.ajax({
            url:"https://app1619.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type:"GET",
            success:function(resp){
                console.log(resp);
                if(resp.result==="success")
                {
                    window.location.replace(resp.apply_code_url);
                    //前端页面重定向到AcWingOs申请Code的页面
                }
            }
        })
    }

    register_on_remote()
    {
        let outer = this;
        let username=this.$register_username.val();
        let password=this.$register_password.val();
        let password_confirm=this.$register_password_confirm.val();

        this.$register_error_message.empty();

        $.ajax({
            url:"https://app1619.acapp.acwing.com.cn/settings/register/",
            type:"GET",
            data: {
                username:username,
                password:password,
                password_confirm:password_confirm,
            },
            success: function (resp){
                console.log(resp);
                if(resp.result==="success")
                {
                    location.reload();
                }
                else
                {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    login_on_remote()//当点击登录按钮时，对用户名和密码进行获取，然后进行登录的验证
    {
        let outer = this;

        let username = this.$login_username.val();
        let password = this.$login_password.val();

        this.$login_error_message.empty();//清除错误信息

        $.ajax({
            url: "https://app1619.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();//接收到success说明登录成功，刷新页面即可
                } else {
                    outer.$login_error_message.html(resp.result);
                    //失败了就将错误信息写入error_message然后显示
                }
            }
        });
    }

    logout_on_remote()
    {
        if(this.platform==="ACAPP") return false;//acwing平台不需要退出账号，直接退出即可

        $.ajax({
           url:"https://app1619.acapp.acwing.com.cn/settings/logout/",
           type:"GET",
           success:function (resp){
               console.log(resp);
               if(resp.result==="success")
               {
                   location.reload();
               }
               else
               {

               }
           }
        });
    }
}export class AcGame {
    constructor(id,OS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.OS=OS;
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
        //this.menu.hide();
    }
}