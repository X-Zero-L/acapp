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
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
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

        //this.move_length=move_length;
        this.eps = 0.01;
        this.friction=0.9;
    }

    render()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius*2,0,Math.PI*2,false);
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
        let moved = Math.min(this.radius,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vx*moved;

        this.speed *= this.friction_speed;
        this.radius *= this.friction_radius;
        //this.move_length -=moved;
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
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
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
        if(this.is_me)
        {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
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
            const rect =outer.ctx.canvas.getBoundingClientRect();
            if (!outer.is_alive) return false;//已经去世的球不能动
            let ee = e.which; // e.which是鼠标对应点击的值
            if (ee === 3) // 右键
            {
                outer.move_to(e.clientX-rect.left, e.clientY-rect.top);//分别为鼠标点击处的x坐标和y坐标
            } else if (ee === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX-rect.left, e.clientY-rect.top);
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
        for (let i = 0; i < 10 + Math.random() * 5; ++i) {
            let x = this.x, y = this.y;
            let radius = this.radius / 3;
            let angle = Math.PI * 2 * Math.random();//随机方向粒子爆发
            let vx = Math.cos(angle), vy = Math.sin(angle);
            //let color = this.color;
            let color = GET_RANDOM_COLOR();
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
        if(this.is_me)
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
            this.lineWidth = EPS*10;
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2);
            this.ctx.restore();
        }
        else
        {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
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
let IS_COLLISION = function (obj1,obj2)
{
    return GET_DIST(obj1.x,obj1.y,obj2.x,obj2.y)<obj1.radius+obj2.radius;
}

class Fireball extends AcGameObject {
    constructor(playground, player, x, y, radius, color, damage, vx, vy, speed, move_dist) {
        // 有些步骤前面重复过，这里不再赘述
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    start() {

    }

    update() {
        this.update_attack();
        this.update_move();
        this.render();
    }

    update_attack() {
        for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
            let obj = AC_GAME_OBJECTS[i];
            if (this.is_satisfy_collision(obj)) // 如果真的碰撞了（这样可以保证碰撞条件可以自行定义，以后会很好维护）
            {
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


        this.$back = this.$playground.find('.ac-game-playground-item-back')
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


    show()
    {
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this); // 创建一个地图
        this.players = []; // 创建一个用于储存玩家的数组

        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "red", true, this.height * 0.15));
        for(let i=0;i<5;++i)
        {
            this.players.push(new Player(this,this.width / 2,this.height/2,this.height*0.05,GET_RANDOM_COLOR(),false,this.height*0.15))
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
    }

    update()
    {

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