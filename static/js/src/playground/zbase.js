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
