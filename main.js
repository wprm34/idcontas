import { Worker } from 'worker_threads';

// Função para criar um atraso
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Função para executar um worker
async function startWorker(id) {
    while (true) {
        try {
            console.log(`Iniciando worker ${id}...`);
            await new Promise((resolve, reject) => {
                const worker = new Worker(new URL('./myscript.js', import.meta.url), { workerData: { id } });
                worker.on('message', (message) => resolve(message));
                worker.on('error', (error) => reject(error));
                worker.on('exit', (code) => {
                    if (code !== 0) reject(new Error(`Worker ${id} finalizou com código ${code}`));
                });
            });
            console.log(`Worker ${id} finalizado com sucesso.`);
            break; // Sai do loop se o worker for concluído sem erros
        } catch (error) {
            console.error(`Erro no Worker ${id}: ${error}. Reiniciando após 5 segundos...`);
            await delay(5000); // Aguardando antes de tentar novamente
        }
    }
}

// Função para manter os workers sempre ativos
async function maintainWorkers(totalWorkers) {
    const workersStatus = new Array(totalWorkers).fill(null);

    while (true) {
        for (let i = 0; i < totalWorkers; i++) {
            if (workersStatus[i] === null) {
                workersStatus[i] = startWorker(i + 1)
                    .then(() => {
                        workersStatus[i] = null; // Libera o slot quando o worker finaliza com sucesso
                    })
                    .catch(() => {
                        workersStatus[i] = null; // Reinicia o slot se houver erro
                    });
            }
        }

        // Aguarda um segundo antes de verificar novamente o estado dos workers
        await delay(1000);
    }
}

// Inicia o gerenciamento dos workers
maintainWorkers(1);
