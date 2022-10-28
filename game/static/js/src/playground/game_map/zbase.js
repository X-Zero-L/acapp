class GameMap extends AcGameObject
{
    constructor(playground) {
        super();

        this.playground=playground;
        this.$canvas = $(`<canvas></canvas>`); // canvas是画布
        this.ctx = this.$canvas[0].getContext(`2d`);

        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas)
    }

    render()//绘制画布
    {
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";//绘制黑色透明背景
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);//指定坐标填充上画布
    }

    start()
    {

    }

    update()//更新画布
    {
        this.render();
    }
}