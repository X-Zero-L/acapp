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
}