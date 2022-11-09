from django.shortcuts import redirect
from random import randint
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from django.contrib.auth import login
from game.models.player.player import Player


def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return redirect("index")

    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"  # 申请授权令牌的api
    params = {
        'appid': "1619",
        'secret': "232d8fde30f34764afdff83c41e42583",
        'code': code,
    }

    access_token_res = requests.get(apply_access_token_url, params=params).json()

    print(access_token_res)

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)
    if players.exists():  # 如果已经存在该用户，直接登录,然后重定向至主页即可
        login(request, players[0].user)
        return redirect("index")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"  # 新用户则还需要获取用户信息
    params = {
        "access_token": access_token,
        "openid": openid,
    }
    userinfo_res = requests.get(get_userinfo_url, params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists():  # 出现重名则不断添加随机数直到不重名
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)
    login(request, user)

    return redirect("index")
