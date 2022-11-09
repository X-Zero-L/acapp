from django.core.cache import cache
from django.http import JsonResponse
from urllib.parse import quote
from random import randint


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(request):
    appid = "1619"
    redirect_uri = quote("https://app1619.acapp.acwing.com.cn/settings/acwing/acapp/receive_code")  # 重定向链接，收到授权码之后的跳转
    scope = "userinfo"  # 申请授权范围
    state = get_state()  # 对一种暗号

    cache.set(state, True, 7200)  # 将state放到redis中，有效期为2小时

    # apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
        # 'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (
        # appid, redirect_uri, scope, state)
    })
