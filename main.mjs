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

    const url = 'https://www.tiktok.com/api/user/list';
    console.log(`Acessando a URL: ${url}`);

    // Função para capturar resposta da API com limite de atualizações
    async function captureApiResponse(maxRetries = 10) {
        let uniqueIds = [];
        let attempts = 0;

        while (attempts < maxRetries) {
            console.log(`Tentativa ${attempts + 1} de capturar a resposta da API...`);

            // Navegar para a URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Configurar evento para capturar respostas
            let responseCaptured = false;
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
                            responseCaptured = true;
                            console.log(`Unique IDs capturados:`, uniqueIds);

                            // Seleciona um uniqueId aleatório
                            const randomUniqueId = uniqueIds[Math.floor(Math.random() * uniqueIds.length)];
                            console.log(`Unique ID selecionado aleatoriamente: ${randomUniqueId}`);
                        } else {
                            console.log('Nenhum uniqueId encontrado na resposta.');
                        }
                    } catch (error) {
                        console.error('Erro ao processar a resposta da API:', error.message);
                    }
                }
            });

            // Criar um temporizador de 10 segundos
            const timeout = new Promise(resolve =>
                setTimeout(() => {
                    resolve(false);
                }, 10000)
            );

            // Esperar resposta ou timeout
            const result = await Promise.race([new Promise(resolve => page.once('response', resolve)), timeout]);

            if (responseCaptured) {
                console.log('Resposta capturada com sucesso.');
                break;
            } else {
                console.log('Tempo limite atingido. Atualizando a página...');
            }

            attempts++;
        }

        if (attempts === maxRetries) {
            console.log(`Tentativas máximas (${maxRetries}) atingidas. Nenhuma resposta capturada.`);
        }
    }

    // Iniciar a captura da resposta da API
    await captureApiResponse();

    // Fechar o navegador após finalizar
    await browser.close();
})();
