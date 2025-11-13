// --- FUNÇÕES AUXILIARES DE DATA E TAGS ---
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// FORMATO 1: YYYY_MM_DD (Principal)
function formatTagDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}_${month}_${day}`;
}

// FORMATO 2: DD_MM_YYYY (Alternativa Jurídica)
function formatTagDateAlt(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}_${month}_${year}`;
}

// Função para copiar a tag
function copyTag(text) {
    navigator.clipboard.writeText(text).then(() => {
        // [REMOVIDO] alert(`Etiqueta copiada: ${text}`); 
        // A cópia será feita de forma silenciosa.
    }).catch(err => {
        console.error('Falha ao copiar a etiqueta: ', err);
        alert('Erro ao copiar a etiqueta. Por favor, tente novamente.');
    });
}

// Função para destacar a célula na matriz (Simplificada - Apenas para compatibilidade)
function highlightCell(cell, action) {
    if (action === 'over') {
        cell.classList.add('hover-active');
    } else {
        cell.classList.remove('hover-active');
    }
}
// ----------------------------

// Definição das etapas, intervalos e BASES DAS TAGS
const steps = [
    { name: 'DIA DO VENCIMENTO', interval: 0, color: '#1053A3', tagBase: '_Lembrete_vencimento', tagBaseInfobip: 'Lembrete_vencimento_' }, 
    { name: '1ª COBRANÇA', interval: 1, color: '#1053A3', tagBase: '_1_cobranca', tagBaseInfobip: '1_cobranca_' },
    { name: '7 DIAS', interval: 7, color: '#1053A3', tagBase: '_7_dias', tagBaseInfobip: 'Lembrete_7_dias_' },
    { name: '2ª COBRANÇA', interval: 15, color: '#1053A3', tagBase: '_2_cobranca', tagBaseInfobip: '2_cobranca_' },
    // 3ª COBRANÇA: AGORA TEM 3 TAGS
    { name: '3ª COBRANÇA', interval: 30, color: '#1053A3', tagBase: '_3_cobranca', tagBaseAlt: '_3_cobranca_GURU', tagBaseInfobip: '3_cobranca_' }, 
    // JURÍDICA: Mantém 2 Tags
    { name: '1ª JURÍDICA', interval: 45, color: '#6A1B9A', tagBase: '_1_cobranca_juridica', tagBaseAlt: '1_cobranca_juridica_' },
    { name: '2ª JURÍDICA', interval: 60, color: '#6A1B9A', tagBase: '_2_cobranca_juridica', tagBaseAlt: '2_cobranca_juridica_' }
];

const container = document.getElementById('date-container');
const today = new Date();


// FUNÇÃO PRINCIPAL: Calcula e exibe as datas
function calculateDates(daysCount, clickedButton) {
    // ------------------------------------------
    // NOVO: GESTÃO DO ESTADO ATIVO DOS BOTÕES
    // ------------------------------------------
    if (clickedButton) {
        // Remove a classe 'active' de todos os botões do contêiner
        const controlButtons = clickedButton.parentNode.querySelectorAll('.control-button');
        controlButtons.forEach(btn => btn.classList.remove('active'));

        // Adiciona a classe 'active' ao botão clicado
        clickedButton.classList.add('active');
    }
    // ------------------------------------------
    
    // 1. Limpa os contêineres e prepara as datas (continua o código original)
    document.getElementById('cob-container').innerHTML = '';
    document.getElementById('juridica-container').innerHTML = '';
    
    today.setHours(0, 0, 0, 0); 
    
    const todayTagDate = formatTagDate(today); 
    const todayTagDateAlt = formatTagDateAlt(today); 

    steps.forEach(step => {
        const dateBlock = document.createElement('div');
        dateBlock.className = 'date-block';
        dateBlock.style.backgroundColor = step.color;
        
        // Adiciona classe de centralização vertical
        if (step.interval === 0) {
            dateBlock.classList.add('single-date');
        }

        let datesHTML = `<div class="step-name">${step.name}</div>`;
        
        // --- 1. Geração das Datas de Vencimento ---
        // CORREÇÃO: loopCount agora usa o daysCount do botão, exceto para o Dia do Vencimento.
        const loopCount = step.interval === 0 ? 1 : daysCount; 
        
        for (let i = loopCount - 1; i >= 0; i--) { 
            let targetVencimentoDate;

            if (step.interval === 0) {
                targetVencimentoDate = addDays(today, 0); 
            } else {
                const currentDisparoDate = addDays(today, -i); 
                targetVencimentoDate = addDays(currentDisparoDate, -step.interval);
            }
            
            targetVencimentoDate.setHours(0, 0, 0, 0); 
            const isPastDue = targetVencimentoDate < today;

            const formattedDate = formatDate(targetVencimentoDate);
            datesHTML += `<div class="step-date ${isPastDue ? 'past-due' : ''}">${formattedDate}</div>`;
        }

        // DIRECIONAMENTO PARA A LINHA CORRETA
        if (step.color === '#6A1B9A') { 
            dateBlock.classList.add('juridica-sector'); // NOVO: Adiciona a classe de setor
            document.getElementById('juridica-container').appendChild(dateBlock);
        } else {
            document.getElementById('cob-container').appendChild(dateBlock);
        }
        
        // --- 2. Geração da TAG PRINCIPAL (Active - YYYY_MM_DD_...) ---
        const tag1 = todayTagDate + step.tagBase;
        datesHTML += `<span class="copy-tag primary-tag" onclick="copyTag('${tag1}')">${tag1}</span>`;

        
        // --- 3. Geração da TAG ALTERNATIVA 1 (GURU ou Jurídica Infobip) ---
        if (step.tagBaseAlt) {
            let tag2;
            let tag2Display;
            
            if (step.tagBaseAlt.includes('juridica')) {
                tag2 = step.tagBaseAlt + todayTagDateAlt; 
                tag2Display = tag2;
            } else {
                tag2 = todayTagDate + step.tagBaseAlt;
                tag2Display = tag2;
            }
            
            datesHTML += `<span class="copy-tag alternate-tag" onclick="copyTag('${tag2}')">${tag2Display}</span>`;
        }

        // --- 4. Geração da NOVA TAG INFOBIP (Tag 3) ---
        if (step.tagBaseInfobip) {
            const tag3 = step.tagBaseInfobip + todayTagDateAlt;
            
            datesHTML += `<span class="copy-tag infobip-tag" onclick="copyTag('${tag3}')">${tag3}</span>`;
        }


        dateBlock.innerHTML = datesHTML;
        
        // DIRECIONAMENTO PARA A LINHA CORRETA
        if (step.color === '#6A1B9A') { 
            document.getElementById('juridica-container').appendChild(dateBlock);
        } else {
            document.getElementById('cob-container').appendChild(dateBlock);
        }
    });
}


// --- FUNÇÃO PARA GERAR A MATRIZ HISTÓRICA COMPLETA ---

function generateMatrix() {
    // 1. Definição das datas de início e fim da matriz (01/08/2025 a 31/12/2025)
    const startDate = new Date(2025, 7, 1); 
    const endDate = new Date(2025, 11, 31);
    
    // 2. Definição das colunas 
    const columns = [
        { name: 'Dia do venc.', days: 0 },
        { name: '1ª Cob.', days: 1 },
        { name: '7 dias', days: 7 },
        { name: '2ª Cob.', days: 15 },
        { name: '3ª Cob.', days: 30 },
        { name: '1ª Jur.', days: 45 },
        { name: '2ª Jur.', days: 60 }
    ];

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const todayWithoutTime = new Date();
    todayWithoutTime.setHours(0, 0, 0, 0);

    let tableHTML = '<table>';
    
    // Constrói o cabeçalho
    tableHTML += '<thead><tr>';
    columns.forEach(col => {
        tableHTML += `<th>${col.name}</th>`;
    });
    tableHTML += '</tr></thead>';

    // 5. Constrói as linhas de dados
    tableHTML += '<tbody>';
    
    let currentDate = startDate;
    while (currentDate <= endDate) {
        tableHTML += '<tr>';
        
        columns.forEach(col => {
            const stepDate = addDays(currentDate, col.days);
            const formattedDate = formatDate(stepDate);
            
            let cellClass = '';
            
            // Checa se a data é o dia de hoje (sem tempo)
            if (stepDate.getTime() === todayWithoutTime.getTime()) {
                cellClass = 'class="today-highlight"';
            }
            // Checa se a data está vencida (menor que hoje)
            else if (stepDate < todayWithoutTime) {
                cellClass = 'class="past-due-matrix"';
            }
            
            // Adiciona o evento de mouse para o destaque simples na célula
            tableHTML += `<td ${cellClass}
                               onmouseover="highlightCell(this, 'over')" 
                               onmouseout="highlightCell(this, 'out')">
                               ${formattedDate}
                          </td>`;
        });
        
        tableHTML += '</tr>';
        
        currentDate = addDays(currentDate, 1);
    }
    
    tableHTML += '</tbody></table>';

    const matrixContainer = document.getElementById('matrix-container'); 
    if (matrixContainer) {
        matrixContainer.innerHTML = tableHTML;
    }
}

// --- NOVO: FUNÇÃO PARA TROCA DE ABAS ---
function showTab(tabId, clickedButton) {
    // 1. Desativa o estilo 'active' em TODOS os botões de navegação
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 2. Esconde todo o conteúdo da aba
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // 3. Mostra a aba selecionada
    document.getElementById(tabId).classList.remove('hidden');
    
    // 4. ATIVA O ESTILO do botão clicado
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // 5. Gerencia a visibilidade dos controles de 1/2/3 dias
    const controls = document.getElementById('controls');
    if (tabId === 'tab-historico') {
        controls.style.display = 'none';
        // Garante que a matriz seja carregada (caso não tenha sido na inicialização)
        generateMatrix(); 
    } else {
        controls.style.display = 'block'; // Mostra os botões 1/2/3 dias
        // Chama o cálculo inicial das datas de disparo
        calculateDates(1); 
    }
}

// CHAMA A FUNÇÃO PARA GERAR A MATRIZ AO CARREGAR A PÁGINA
generateMatrix();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o conteúdo dos blocos de data
    calculateDates(1);

    // 2. Encontra o botão 'Datas de Disparo' (que tem a classe 'active' no HTML)
    const initialButton = document.querySelector('.nav-tab.active');

    // 3. Força a ativação visual da aba no carregamento
    if (initialButton) {
        showTab('tab-disparos', initialButton);
    } else {
        // Se a classe active sumiu do HTML, ative o primeiro botão como fallback
        showTab('tab-disparos', document.querySelector('.nav-tab'));
    }
});