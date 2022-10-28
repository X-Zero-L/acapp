class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        //this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width;
        this.height = this.$playground.height;

        this.$back = this.$playground.find('.ac-game-playground-item-back')

        this.start();
    }

    add_listening_events()//监听事件
    {
        let outer = this;
        this.$back.click(function (){
            outer.hide();
            outer.root.$menu.show();
        });
    }

    show() {  // 打开playground界面
        this.$playground.show();
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

    start() {
        this.hide();
        this.add_listening_events();
    }

    update()
    {

    }
}