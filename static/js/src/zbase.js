export class AcGame {
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