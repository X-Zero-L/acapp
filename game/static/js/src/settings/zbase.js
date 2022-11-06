class Settings
{
    constructor(root)
    {
        this.root=root;
        this.platform="WEB";
        this.$settings = $(`
       <div class="ac-game-settings">
        <div class="ac-game-settings-login">
          <div class="ac-game-settings-title">
            登录
          </div>"
          <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="Username">
            </div>
          </div>
          <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="Password">
            </div>
          </div>
          <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
          </div>
          <div class="ac-game-settings-error-message">
                用户名或密码错误！
          </div>
          <div class="ac-game-settings-option">
                注册
          </div>
         </div>
         <br>
         <div class="ac-game-settings-acwing">
            <img src="https://app1619.acapp.acwing.com.cn/static/image/settings/acwing.png">
            <div>
                AcWingOS一键登录
            </div>
         </div>
        <div class="ac-game-settings-register">
        </div>
       </div>
`)
        this.username="";
        this.photo="";
        if(this.root.OS) this.platform="ACAPP";
        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$register.hide();
        this.root.$ac_game.append(this.$settings);
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

    getinfo()
    {
        let outer = this;

        $.ajax({
            url:"https://app1619.acapp.acwing.com.cn",
            type:"GET",
            date: {
                platform:outer.root.platform,
            },
            success: function(resp){
                console.log(resp);
                if (resp.result === "success")
                {
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
    }

    hide()
    {
        this.$settings.hide();
    }

    show()
    {
        this.$settings.show();
    }

    start()
    {
        this.getinfo();
    }



}