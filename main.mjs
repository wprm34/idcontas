import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    const cookiesDir = path.resolve(__dirname, 'cookies tiktok');
    const cookiesFile = path.join(cookiesDir, 'cookies.json');

    let browser;

    try {
        // Iniciar o navegador localmente
        browser = await chromium.launch({
            headless: false, // Define como `true` se quiser rodar em modo headless
        });
    } catch (error) {
        console.error('Erro ao iniciar o navegador:', error);
        return;
    }

    const context = await browser.newContext({
        viewport: null, // Remove o limite padrão de viewport
        userAgent: 'Mozilla/5.0 ...', // Substitua com o userAgent desejado
    });

    const page = await context.newPage();

    // Maximizar a janela usando as dimensões de tela
    const screenWidth = 1920; // Substitua com a largura desejada
    const screenHeight = 1080; // Substitua com a altura desejada
    await page.setViewportSize({ width: screenWidth, height: screenHeight });

    // Carregar cookies, se disponíveis
    if (fs.existsSync(cookiesFile)) {
        try {
            const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
            await context.addCookies(cookies);
            console.log(`Cookies carregados com sucesso.`);
        } catch (error) {
            console.error(`Erro ao carregar cookies:`, error.message);
        }
    }

    const url = 'https://www.tiktok.com/api/user/list/?WebIdLastTime=1735858074&aid=1988&app_language=pt-BR&app_name=tiktok_web&browser_language=pt-BR&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F131.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=30&data_collection_enabled=true&device_id=7455453607727662598&device_platform=web_pc&focus_state=true&from_page=user&history_len=3&is_fullscreen=false&is_page_visible=true&maxCursor=0&minCursor=0&odinId=7456514841726583814&os=windows&priority_region=BR&referer=&region=BR&scene=67&screen_height=768&screen_width=1366&secUid=MS4wLjABAAAA3iMkzfXhm41Kb95MU9tdJ1atYGEHz6aWSPk4OXmR3rZnqPbYd9kOqXcz02iNq-3j&tz_name=America%2FSao_Paulo&user_is_login=true&verifyFp=verify_m5lie4tj_Api59hbm_UKCY_4wMf_AvM7_AGPeWeEjacWi&webcast_language=pt-BR&msToken=VPInQ-Fg-DG8zjtysbOfK8dbrrLw9UNia83WHJdlWEd8HhDjM4NAuqElxgVIIwjcCVB3JzRfBqqmlPyRLtZ0jvjSk3RpLiNyDXqBBSOBTNTS-BWlleK3kuIdBTqyDRoX5_5x_nhiQJihmhEnfBQlTkc8rv9k&X-Bogus=DFSzswVY1yzANjact8iNfWhPmk3H&_signature=_02B4Z6wo000018yHpKAAAIDDv1rmATHi4fPMh6AAAJRm6b';
    console.log(`Acessando a URL: ${url}`);

    // Função para tentar capturar a resposta da API até 100 vezes
    async function captureApiResponse(retryCount = 0) {
        if (retryCount >= 100) {
            console.log('Número máximo de tentativas atingido.');
            await browser.close();
            return;
        }

        console.log(`Tentativa ${retryCount + 1} de capturar a resposta da API...`);

        // Atualizar a página
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Variável para armazenar os uniqueIds encontrados
        let uniqueIds = [];

        // Capturar a requisição da API que contém a lista de usuários
        page.on('response', async response => {
            const apiUrl = response.url();
            if (apiUrl.includes('/api/user/list/')) {
                console.log(`Resposta capturada da API: ${apiUrl}`);
                try {
                    const jsonResponse = await response.json();
                    console.log(`Resposta completa da API:`, JSON.stringify(jsonResponse, null, 2));

                    // Captura todos os uniqueId dos usuários na resposta
                    uniqueIds = jsonResponse?.userList?.map(user => user.user?.uniqueId) || [];
                    if (uniqueIds.length > 0) {
                        console.log(`Unique IDs capturados:`, uniqueIds);

                        // Seleciona um uniqueId aleatório
                        const randomUniqueId = uniqueIds[Math.floor(Math.random() * uniqueIds.length)];
                        console.log(`Unique ID selecionado aleatoriamente: ${randomUniqueId}`);

                        // Encerrar o navegador após encontrar um uniqueId
                        await browser.close();
                        return;
                    } else {
                        console.log('Nenhum uniqueId encontrado na resposta.');
                    }
                } catch (error) {
                    console.error('Erro ao processar a resposta da API:', error.message);
                }
            }
        });

        // Atualizar a página continuamente enquanto tenta capturar a resposta
        await page.reload({ waitUntil: 'domcontentloaded' });

        // Se não capturar uniqueIds, tentar novamente
        await captureApiResponse(retryCount + 1);
    }

    // Iniciar a captura da resposta da API
    await captureApiResponse();
})();
