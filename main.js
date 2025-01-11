import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    const token = '2e26eb3d-f55a-43db-bd25-d57f03287cab';
    const sha1 = 'e5990261605cd152f26c7919192d4cd6f6e22227';
    const tipoAcao = 3;
    const totalIteracoes = 99999; // Número total de iterações

    const cookiesDir = path.resolve(__dirname, 'cookies gnr');
    const cookiesFile = path.join(cookiesDir, '2e26eb3d-f55a-43db-bd25-d57f03287cab.json');

    let browser;

    try {
        // Iniciar o navegador sem depuração remota
        browser = await chromium.launch({
            headless: false, // Define como `true` se quiser rodar em modo headless
        });

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

        const maxRetries = 5; // Define o número máximo de tentativas

        // Map para contar as URLs obtidas
        const urlOccurrences = new Map();

        try {
            for (let iteracao = 1; iteracao <= totalIteracoes; iteracao++) {
                console.log(`\nIniciando iteração ${iteracao} de ${totalIteracoes}...`);
        
                const url = 'https://www.ganharnasredes.com/painel/?pagina=gerenciar_contas';

                try {
                    // Navega para a URL com configurações de espera e um tempo limite aumentado
                    await page.goto(url, {
                        waitUntil: 'domcontentloaded', // Espera até que o DOM seja carregado
                        timeout: 999999, // Aumenta o tempo limite para 60 segundos
                    });
                    console.log('Página carregada com sucesso.');
                } catch (error) {
                    // Trata erros de navegação
                    console.error('Erro ao carregar a página:', error);
                }               
        
                console.log(`Acessando a página: ${url}`);
                const pageContent = await page.content();
        
                const regex = /\[TT\]\s*([^<]+)<\/td><td>VALIDADA<\/td>/g;
                const matches = [...pageContent.matchAll(regex)];
        
                if (matches.length > 0) {
                    const usernames = matches.map(match => match[1]);
                    const randomUsername = usernames[Math.floor(Math.random() * usernames.length)];
                    console.log(`Usuário TikTok aleatório selecionado: ${randomUsername}`);
        
                    const bindTkUrl = `http://api.ganharnoinsta.com/bind_tk.php?token=${token}&sha1=${sha1}&nome_usuario=${encodeURIComponent(randomUsername)}`;
                    const bindTkResponse = await axios.get(bindTkUrl);
                    console.log('Resposta da API bind_tk.php:', bindTkResponse.data);
        
                    let idConta = bindTkResponse.data?.id_conta;
                    if (!idConta) {
                        console.error('Erro: id_conta não encontrado na resposta da API bind_tk.php.');
                        continue;
                    }
                    console.log(`id_conta capturado: ${idConta}`);
        
                    let retries = 0;
                    let secUserId = null;
                    
                    while (!secUserId && retries < maxRetries) {
                        if (retries > 0) {
                            console.log(`Tentativa ${retries + 1}: Fazendo nova chamada para a API get_action.`);
                        }
                    
                        const apiUrl = `http://api.ganharnoinsta.com/get_action.php?token=${token}&sha1=${sha1}&id_conta=7326240229558715397&is_tiktok=1&tipo=${tipoAcao}`;
                    
                        try {
                            const actionApiResponse = await axios.get(apiUrl);
                    
                            // Verificar se a resposta contém a chave url_dir
                            let urlDir = actionApiResponse.data?.url_dir;
                            if (!urlDir) {
                                console.error('Erro: URL não encontrada na resposta da API get_action.');
                                retries++;
                                continue; // Tentar novamente
                            }
                    
                            // Normalizar a URL para evitar diferenças por espaços, encoding, etc.
                            urlDir = new URL(urlDir.trim()).toString();
                    
                            // Incrementar a contagem da URL no mapa
                            const currentCount = urlOccurrences.get(urlDir) || 0;
                            urlOccurrences.set(urlDir, currentCount + 1);
                            console.log(`A URL ${urlDir} foi obtida ${urlOccurrences.get(urlDir)} vezes no total.`);
                    
                            // Verificar se a URL foi repetida 15 vezes
                            if (urlOccurrences.get(urlDir) >= 5) {
                                console.log(`A URL ${urlDir} foi retornada 5 vezes. Confirmando a ação...`);
                    
                                const confirmUrl = `http://api.ganharnoinsta.com/confirm_action.php?token=${token}&sha1=${sha1}&id_conta=7326240229558715397&id_pedido=${actionApiResponse.data.id_pedido}&is_tiktok=1`;
                    
                                try {
                                    const confirmResponse = await axios.get(confirmUrl);
                                    console.log('Resposta da API confirm_action:', confirmResponse.data);
                    
                                    if (confirmResponse.data?.success) {
                                        console.log('Ação confirmada com sucesso.');
                                        break; // Encerrar o loop
                                    } else {
                                        console.error('Falha ao confirmar a ação:', confirmResponse.data);
                                    }
                                } catch (error) {
                                    console.error('Erro ao chamar a API confirm_action:', error);
                                }
                            }
                    
                            console.log(`URL obtida da API get_action: ${urlDir}`);
                    
                            try {
                                // Acessar a URL obtida
                                await page.goto(urlDir, { timeout: 999999, waitUntil: 'domcontentloaded' });
                            } catch (error) {
                                console.error(`Erro ao acessar a URL: ${urlDir}`, error);
                                retries++;
                                continue; // Tentar novamente
                            }
                    
                            const updatedContent = await page.content();
                            const secUserIdRegex = /"secUid":"(.*?)"/;
                            const secUserIdMatch = updatedContent.match(secUserIdRegex);
                            secUserId = secUserIdMatch ? secUserIdMatch[1] : null;
                    
                            if (!secUserId) {
                                console.warn('sec_user_id não capturado. Tentando novamente...');
                                retries++;
                            }
                        } catch (error) {
                            console.error('Erro ao chamar a API get_action:', error);
                            retries++;
                        }
                    }
                
                    if (secUserId) {
                        console.log(`sec_user_id capturado: ${secUserId}`);

        const apiUrlWithSecUid = `https://www.tiktok.com/api/user/list/?WebIdLastTime=1735858074&aid=1988&app_language=pt-BR&app_name=tiktok_web&browser_language=pt-BR&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F131.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=30&data_collection_enabled=true&device_id=7455453607727662598&device_platform=web_pc&focus_state=true&from_page=user&history_len=3&is_fullscreen=false&is_page_visible=true&maxCursor=0&minCursor=0&odinId=7456514841726583814&os=windows&priority_region=BR&referer=&region=BR&scene=67&screen_height=768&screen_width=1366&secUid=${secUserId}&tz_name=America%2FSao_Paulo&user_is_login=true&verifyFp=verify_m5lie4tj_Api59hbm_UKCY_4wMf_AvM7_AGPeWeEjacWi&webcast_language=pt-BR&msToken=VPInQ-Fg-DG8zjtysbOfK8dbrrLw9UNia83WHJdlWEd8HhDjM4NAuqElxgVIIwjcCVB3JzRfBqqmlPyRLtZ0jvjSk3RpLiNyDXqBBSOBTNTS-BWlleK3kuIdBTqyDRoX5_5x_nhiQJihmhEnfBQlTkc8rv9k&X-Bogus=DFSzswVY1yzANjact8iNfWhPmk3H&_signature=_02B4Z6wo000018yHpKAAAIDDv1rmATHi4fPMh6AAAJRm6b`;

// Acessa a URL da API no navegador
console.log('Acessando a URL da API no navegador...');
try {
    await page.goto(apiUrlWithSecUid, { waitUntil: 'networkidle0', timeout: 999999 }); // Espera até que a rede esteja ociosa (0 conexões em andamento)
} catch (error) {
    console.error('Erro ao acessar a URL da API:', error);
}

// Função para adicionar uma pausa
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Aguarda 10 segundos após a atualização da página
console.log('Aguardando 10 segundos...');
await sleep(10000); // 10 segundos em milissegundos

// Captura todos os uniqueId presentes na resposta
const apiPageContent = await page.content();
const uniqueIdRegex = /"uniqueId":"(.*?)"/g;
const uniqueIds = [];

let match;
while ((match = uniqueIdRegex.exec(apiPageContent)) !== null) {
    uniqueIds.push(match[1]);
}

if (uniqueIds.length > 0) {
    console.log(`uniqueIds capturados: ${uniqueIds.join(', ')}`);

    // Seleciona um uniqueId aleatório
    const randomIndex = Math.floor(Math.random() * uniqueIds.length);
    const randomUniqueId = uniqueIds[randomIndex];
    console.log(`uniqueId selecionado aleatoriamente: ${randomUniqueId}`);

                         // Acessar a URL "adicionar_conta" antes de continuar o fluxo
                         console.log('Acessando a página de adicionar conta...');
                         await page.goto('https://www.ganharnasredes.com/painel/?pagina=adicionar_conta', { timeout: 999999 });
                         console.log('Página de adicionar conta carregada com sucesso.');
 
                         // Continuar com o fluxo no Ganhar nas Redes
                         await page.waitForSelector('span.hide-menu:has-text("Adicionar Conta")');
                         const adicionarContaButton = await page.$('span.hide-menu:has-text("Adicionar Conta")');
                         if (adicionarContaButton) {
                             await adicionarContaButton.click();
                             console.log('Clicado no botão "Adicionar Conta" com sucesso.');
                         } else {
                             console.warn('Botão "Adicionar Conta" não encontrado.');
                         }
 
                         // Selecionar o TikTok para adicionar conta
                         await page.waitForSelector('img[src="/painel/imgs/icones/gnitt.png"]');
                         const tiktokIcon = await page.$('img[src="/painel/imgs/icones/gnitt.png"]');
                         if (tiktokIcon) {
                             await tiktokIcon.click();
                             console.log('Clicado no ícone do TikTok para selecionar a rede social.');
                         } else {
                             console.warn('Ícone do TikTok não encontrado.');
                         }
 
                         // Prosseguir com a próxima etapa
                         await page.waitForSelector('button[type="submit"].btn.btn-block.btn-success');
                         const proximaEtapaButton = await page.$('button[type="submit"].btn.btn-block.btn-success');
                         if (proximaEtapaButton) {
                             await proximaEtapaButton.click();
                             console.log('Clicado no botão "Próxima Etapa" com sucesso.');
                         } else {
                             console.warn('Botão "Próxima Etapa" não encontrado.');
                         }
 
                         // Continuar com o fluxo de adicionar o uniqueId
                         await page.waitForSelector('input#uname.form-control[name="nome_usuario"]');
                         const nomeUsuarioInput = await page.$('input#uname.form-control[name="nome_usuario"]');
                         if (nomeUsuarioInput) {
                             const nomeUsuario = randomUniqueId; // Definindo nomeUsuario antes de usá-lo
                             await nomeUsuarioInput.fill(nomeUsuario);  // Passando o nomeUsuario corretamente
                             console.log(`UniqueId "${nomeUsuario}" inserido com sucesso.`);
 
                             // Selecionar a opção "Prefiro não informar" no campo de gênero
                             await page.waitForSelector('select#sexo.form-control[name="sexo"]');
                             const generoSelect = await page.$('select#sexo.form-control[name="sexo"]');
                             if (generoSelect) {
                                 await generoSelect.selectOption({ value: '3' });
                                 console.log('Opção "Prefiro não informar" selecionada com sucesso.');
                             } else {
                                 console.warn('Campo de seleção de gênero não encontrado.');
                             }
 
                             // Selecionar o estado "São Paulo" no campo de estado
                             await page.waitForSelector('select#estado.form-control[name="estado"]');
                             const estadoSelect = await page.$('select#estado.form-control[name="estado"]');
                             if (estadoSelect) {
                                 await estadoSelect.selectOption({ value: 'SP' });
                                 console.log('Estado "São Paulo" selecionado com sucesso.');
                             } else {
                                 console.warn('Campo de seleção de estado não encontrado.');
                             }
 
                             // Clicar no botão "Próxima Etapa"
                             await page.waitForSelector('button#btn_next.btn.btn-block.btn-success');
                             const proximaEtapaButton = await page.$('button#btn_next.btn.btn-block.btn-success');
                             if (proximaEtapaButton) {
                                 await proximaEtapaButton.click();
                                 console.log('Clicado no botão "Próxima Etapa" com sucesso.');
                             } else {
                                 console.warn('Botão "Próxima Etapa" não encontrado.');
                             }

                        // Novo trecho para repetir o processo com a URL mais repetida
                        const bindApiUrl = `https://api.ganharnoinsta.com/bind_tk.php?token=${token}&sha1=${sha1}&nome_usuario=${randomUniqueId}`;
                        const bindResponse = await axios.get(bindApiUrl);

                        console.log('Resposta completa da API bind_tk.php:', bindResponse.data);

                        if (!bindResponse.data || bindResponse.data.error) {
                            console.error('Erro na resposta da API bind_tk.php:', bindResponse.data.error || 'Resposta inválida');
                            break;
                        }

                        idConta = bindResponse.data.id_conta;
                        console.log(`id_conta obtido: ${idConta}`);

                        const actionApiUrl = `http://api.ganharnoinsta.com/get_action.php?token=${token}&sha1=${sha1}&id_conta=${idConta}&is_tiktok=1&tipo=${tipoAcao}`;
                        let attempt = 0;
                        let foundUrl = false;
                        let urlCount = {};

                        while (attempt < 100 && !foundUrl) {
                            attempt++;
                        
                            try {
                                const actionApiResponse = await axios.get(actionApiUrl);
                                console.log(`Resposta da API get_action.php na tentativa ${attempt}:`, actionApiResponse.data);
                        
                                if (actionApiResponse.data.status === 'ENCONTRADA' && actionApiResponse.data.url_dir) {
                                    const apiUrl = actionApiResponse.data.url_dir;
                        
                                    urlCount[apiUrl] = (urlCount[apiUrl] || 0) + 1;
                        
                                    const confirmResponse = await axios.get(
                                        `http://api.ganharnoinsta.com/confirm_action.php?token=${token}&sha1=${sha1}&id_conta=${idConta}&id_pedido=${actionApiResponse.data.id_pedido}&is_tiktok=1`
                                    );
                                    console.log('Resposta da confirmação:', confirmResponse.data);
                        
                                    if (confirmResponse.data.status === 'CONTA_INEXISTENTE') {
                                        console.warn('Status CONTA_INEXISTENTE recebido. Ignorando loop atual e avançando para a próxima etapa.');
                                        break; // Sai do loop atual e avança para a próxima etapa
                                    }
                        
                                    if (!confirmResponse.data || confirmResponse.data.error) {
                                        console.error('Erro na resposta da API confirm_action.php:', confirmResponse.data.error || 'Resposta inválida');
                                        break;
                                    }
                                }
                            } catch (error) {
                                console.error(`Erro na tentativa ${attempt}:`, error.message);
                            }
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    } else {
                        console.warn('URL não encontrada ou não repetida, continuando...');
                    }
                } else {
                    console.warn('Nenhum uniqueId foi encontrado na resposta da API.');
                }
            } else {
                console.warn('sec_user_id não capturado. Verifique o conteúdo da página.');

            }}}
        } catch (error) {
            console.error('Erro durante a execução do script:', error);
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error('Erro ao iniciar o navegador:', error.message);
    }
    })();
