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
            设置
        </div>
    </div>
</div>
`);
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
            console.log("click settings");
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
class GameMap extends AcGameObject {
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

class Player extends AcGameObject
{
    constructor(playground, x, y, radius, color, is_me, speed)
    {
        super(true);

        this.playground = playground; // 所属playground
        this.ctx = this.playground.game_map.ctx; // 操作的画笔

        this.x = x;  // 坐标
        this.y = y; // 坐标
        this.radius = radius; // 半径
        this.color = color; // 颜色
        this.is_me = is_me; // 玩家类型
        this.vx =0;
        this.vy =0;
        this.move_length =0;
        this.speed = speed; // 速度
        this.is_alive = true; // 是否存活

        this.eps = 0.1; // 精度
        //this.start();

    }

    add_listening_events()
    {
        let outer=this;
        this.playground.game_map.$canvas.on("contextmenu",function (){
            return false;//关闭画布的原右键监听事件
        });
        this.playground.game_map.$canvas.mousedown(function (e){
            if(!outer.is_alive) return false;//已经去世的球不能动
            let ee = e.which; // e.which是鼠标对应点击的值
            if (ee===3) // 右键
            {
                outer.move_to(e.clientX,e.clientY);//分别为鼠标点击处的x坐标和y坐标
            }
        });
    }

    move_to(tx,ty)
    {
        this.move_length = GET_DIST(this.x,this.y,tx,ty);
        let dx=tx-this.x,dy=ty-this.y;
        let angle = Math.atan2(dy,dx);//角度
        this.vx=Math.cos(angle);//余弦
        this.vy=Math.sin(angle);//正弦
        console.log("move_to",tx,ty);
        console.log("x,y:",parseInt(this.x),parseInt(this.y));
        console.log("dx,dy:",dx,dy);
        console.log("length",this.move_length);

    }
    render()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    start()
    {
        if (this.is_me)
        {
            this.add_listening_events();
        }
    }

    update()
    {
        //this.x+=this.vx;
        //this.y+=this.vy;
        this.update_move();
        this.render(); // 同样要一直画一直画（yxc：“人不吃饭会死，物体不一直画会消失。”）
    }

    update_move() // 将移动单独写为一个过程
    {
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
class AcGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground"></div>
`);

        this.root.$ac_game.append(this.$playground);

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this); // 创建一个地图
        this.players = []; // 创建一个用于储存玩家的数组

        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "red", true, this.height * 0.15));

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
export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {
    }
}