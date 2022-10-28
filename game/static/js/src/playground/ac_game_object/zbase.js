let AC_GAME_OBJECTS = []; //存储所有可以动的元素的全局数组

class AcGameObject {
    constructor(hurtable = false) {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;// 记录是否调用了start函数
        this.timedelta = 0; // 当前距离上一帧的时间间隔，相等于时间微分
        this.hurtable = hurtable;//决定这个元素能否被碰撞
    }

    start() {
        // start只在第一帧执行一次
    }

    update() {
        // 每一帧都会执行的过程
    }

    destroy() {
        this.on_destroy;
        //删除这个元素
        for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
            if (AC_GAME_OBJECTS[i] == this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }

    on_destroy() {

        // 被删除之前的过程，"临终遗言"
    }

}
    let last_timestp; // 上一帧的时间
    let AC_GAME_ANIMATTON = function (timestp)
    {
        for(let i=0;i<AC_GAME_OBJECTS.length;++i) // 遍历所有产生的object，还没start的就start，其余的更新状态
        {
            let obj = AC_GAME_OBJECTS[i];
            if(!obj.has_called_start)
            {
                obj.start();
                obj.has_called_start=true;

            }
            else
            {
                obj.timedelta = timestp - last_timestp;//时间微分
                obj.update();//更新调用
            }
        }
        last_timestp = timestp;//更新时间戳

        requestAnimationFrame(AC_GAME_ANIMATTON)//递归调用函数自身
 }
requestAnimationFrame(AC_GAME_ANIMATTON)//调用函数