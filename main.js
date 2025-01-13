import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    const cookiesDir = path.resolve(__dirname, 'cookies tiktok');
    const cookiesFile = path.join(cookiesDir, 'cookies.json');

    let browser;

    try {
        // Iniciar o navegador localmente, sem depuração remota
        browser = await chromium.launch({
            headless: true, // Define como `true` se quiser rodar em modo headless
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
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Esperando até a página carregar
    await page.waitForSelector('body');

    // Capturar a requisição da API que contém a lista de usuários
    page.on('response', async response => {
        const apiUrl = response.url();
        if (apiUrl.includes('/api/user/list/')) {
            console.log(`Resposta capturada da API: ${apiUrl}`);
            try {
                const jsonResponse = await response.json();
                console.log(`Resposta completa da API:`, JSON.stringify(jsonResponse, null, 2));

                // Captura todos os uniqueId dos usuários na resposta
                const uniqueIds = jsonResponse?.userList?.map(user => user.user?.uniqueId);
                if (uniqueIds && uniqueIds.length > 0) {
                    console.log(`Unique IDs capturados:`, uniqueIds);
                } else {
                    console.log('Nenhum uniqueId encontrado na resposta.');
                }
            } catch (error) {
                console.error('Erro ao processar a resposta da API:', error.message);
            }
        }
    });

})();
