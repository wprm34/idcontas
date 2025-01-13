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

    const url = 'https://www.tiktok.com/@gkzx7_';
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

        // Esperar a página carregar completamente
        await page.waitForSelector('body');

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

        // Aguardar 3 segundos antes de tentar novamente
        await page.waitForTimeout(3000);

        // Se não capturar uniqueIds, tentar novamente
        if (uniqueIds.length === 0) {
            await captureApiResponse(retryCount + 1);
        }
    }

    // Iniciar a captura da resposta da API
    await captureApiResponse();
})();
