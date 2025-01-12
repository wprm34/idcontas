

const url = "https://www.tiktok.com/api/user/list/?WebIdLastTime=1735858074&aid=1988&app_language=pt-BR&app_name=tiktok_web&browser_language=pt-BR&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F131.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=30&data_collection_enabled=true&device_id=7455453607727662598&device_platform=web_pc&focus_state=true&from_page=user&history_len=3&is_fullscreen=false&is_page_visible=true&maxCursor=0&minCursor=0&odinId=7456514841726583814&os=windows&priority_region=BR&referer=&region=BR&scene=67&screen_height=768&screen_width=1366&secUid=MS4wLjABAAAA3iMkzfXhm41Kb95MU9tdJ1atYGEHz6aWSPk4OXmR3rZnqPbYd9kOqXcz02iNq-3j&tz_name=America%2FSao_Paulo&user_is_login=true&verifyFp=verify_m5lie4tj_Api59hbm_UKCY_4wMf_AvM7_AGPeWeEjacWi&webcast_language=pt-BR&msToken=VPInQ-Fg-DG8zjtysbOfK8dbrrLw9UNia83WHJdlWEd8HhDjM4NAuqElxgVIIwjcCVB3JzRfBqqmlPyRLtZ0jvjSk3RpLiNyDXqBBSOBTNTS-BWlleK3kuIdBTqyDRoX5_5x_nhiQJihmhEnfBQlTkc8rv9k&X-Bogus=DFSzswVY1yzANjact8iNfWhPmk3H&_signature=_02B4Z6wo000018yHpKAAAIDDv1rmATHi4fPMh6AAAJRm6b";

// Cabeçalhos da requisição
const headers = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "max-age=0",
  cookie:
    "tt_chain_token=5bfKzAiazKit6VsD4K0vKA==; tiktok_webapp_theme_source=system; tiktok_webapp_theme=dark; passport_csrf_token=10320b38f37ec0d8f8a69f91a3443e64; passport_csrf_token_default=10320b38f37ec0d8f8a69f91a3443e64; multi_sids=7326240229558715397:c866a690567ae498192a3672e7433a5e; cmpl_token=AgQQAPNkF-RO0rWS5gu-NN08_RIK-bYY_4TvYNr8bQ; sid_guard=c866a690567ae498192a3672e7433e5e|1735627777|15552000|Sun,+29-Jun-2025+06:49:37+GMT; uid_tt=920cd61cfce52c276d087fdbc43fb74062014c222cd5a3b0b613bdfec21f68b5; uid_tt_ss=920cd61cfce52c276d087fdbc43fb74062014c222cd5a3b0b613bdfec21f68b5; sid_tt=c866a690567ae498192a3672e7433e5e; sessionid=c866a690567ae498192a3672e7433e5e; sessionid_ss=c866a690567ae498192a3672e7433e5e; sid_ucp_v1=1.0.0-KGMyZWQwZGVkYzljODNhMWY4NzUwMmM1YWRjNmYzZjdlMjlmY2Q2ODAKIgiFiJiww5WC1mUQgajOuwYYswsgDDDKkbCtBjgHQPQHSAQQAxoGbWFsaXZhIiBjODY2YTY5MDU2N2FlNDk4MTkyYTM2NzJlNzQzM2E1ZQ; ssid_ucp_v1=1.0.0-KGMyZWQwZGVkYzljODNhMWY4NzUwMmM1YWRjNmYzZjdlMjlmY2Q2ODAKIgiFiJiww5WC1mUQgajOuwYYswsgDDDKkbCtBjgHQPQHSAQQAxoGbWFsaXZhIiBjODY2YTY5MDU2N2FlNDk4MTkyYTM2NzJlNzQzM2E1ZQ",
  priority: "u=0, i",
  referer: "https://web.telegram.org/",
  "sec-ch-ua":
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "cross-site",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

// Requisição usando fetch
fetch("https://jsonplaceholder.typicode.com/posts")
  .then((response) => {
    console.log("Status da resposta:", response.status);
    return response.text(); // Verifica a resposta como texto
  })
  .then((text) => {
    console.log("Corpo da resposta:", text);
    try {
      const data = JSON.parse(text); // Tenta fazer o parse manualmente
      console.log(data);
    } catch (error) {
      console.error("Erro ao parsear JSON:", error);
    }
  })
  .catch((error) => {
    console.error("Erro na requisição:", error);
  });



