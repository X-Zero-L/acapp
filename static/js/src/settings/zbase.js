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

    getinfo()
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
        this.add_listening_events();
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
}