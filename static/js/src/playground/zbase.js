let HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

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