// --- Sistema em Tempo Real Terminal Animation ---
const createHomeMessages = () => [
    "$ Buscando desafios reais...",
    "✓ Desafio encontrado: API REST para E-commerce",
    "$ Aluno @maria_dev iniciou desafio da Empresa Emregar.me",
    "✓ Commit enviado para GitHub: feat: implement auth system",
    "$ Sistema de gamificação ativo",
    "✓ Aluno @pedro_code completou desafio e ganhou +500 XP",
    "$ Validando experiência via GitHub...",
    "✓ Pull Request aprovado • Projeto em produção",
    "$ Novo desafio disponível: Dashboard Analytics",
    "$ Task: Implementar autenticação OAuth2 para TechFlow Solutions",
    "✓ @ana_silva resolveu bug crítico em produção • Severity: High",
    "$ Desafio da Empresa DataVision: Otimizar queries de banco de dados",
    "✓ Pull Request merged • Code Review aprovado por 2 devs",
    "$ Sistema alertando: Deploy automático em 5 minutos",
    "✓ @lucas_frontend completou UI/UX refactor • +300 XP ganhos",
    "$ Novo task atribuído: Migração para microserviços na StartupX",
    "✓ Testes unitários passaram • Coverage: 95%",
    "$ CI/CD pipeline executando build em /CloudBase Inc",
    "✓ Documentação atualizada • Wiki sincronizado com repositório"
];

const createRecyclingMessages = () => {
    const actions = [
        'retirada agendada',
        'retirada concluída',
        'desmontagem iniciada',
        'desmontagem finalizada',
        'triagem de componentes',
        'rebuild educacional',
        'premiação liberada',
        'projeto publicado',
        'kit montado',
        'doação convertida'
    ];

    const students = [
        'ana_dev', 'bruno_code', 'carla_lab', 'davi_stack', 'evelyn_iot',
        'felipe_maker', 'giovana_full', 'heitor_rebuild', 'isabela_js', 'joao_xp'
    ];

    const projects = [
        'Robô Educacional', 'Plataforma de Reuso', 'Painel IoT Escolar', 'Braço Mecânico',
        'Monitor de Energia', 'Mini CNC', 'Estação Meteorológica', 'Carro Seguidor',
        'Luminária Inteligente', 'Servidor de Campus'
    ];

    const materials = [
        'placa-mãe', 'fontes ATX', 'motores DC', 'memórias DDR', 'teclados',
        'monitores', 'cabos de rede', 'sensores', 'notebooks', 'roteadores'
    ];

    const lines = [];
    for (let i = 0; i < 100; i += 1) {
        const student = students[i % students.length];
        const project = projects[i % projects.length];
        const material = materials[i % materials.length];
        const action = actions[i % actions.length];
        const batch = String(i + 1).padStart(2, '0');
        const xp = 150 + (i % 10) * 50;
        const badge = 1 + (i % 8);

        if (i % 5 === 0) {
            lines.push(`$ Lote #${batch}: ${action} de ${material} para ${project}`);
        } else if (i % 5 === 1) {
            lines.push(`✓ ${student} concluiu o rebuild de ${project} • +${xp} XP`);
        } else if (i % 5 === 2) {
            lines.push(`$ Equipe de desmontagem separou ${material} e recuperou peças úteis`);
        } else if (i % 5 === 3) {
            lines.push(`✓ Premiação enviada para ${student} • Badge #${badge} desbloqueado`);
        } else {
            lines.push(`$ Projeto ${project} validado com componentes recuperados do lixo eletrônico`);
        }
    }

    return lines;
};

const terminalBody = document.getElementById('telemetry-terminal');
if (terminalBody) {
    const isRecyclingPage = window.location.pathname.includes('reciclagem-tech');
    const terminalMessages = isRecyclingPage ? createRecyclingMessages() : createHomeMessages();
    let currentMessageIndex = 0;

    function addTerminalMessage() {
        const message = terminalMessages[currentMessageIndex];
        const line = document.createElement('div');
        line.className = 'terminal-line';

        if (message.startsWith('✓')) {
            line.classList.add('success');
        } else if (message.startsWith('>') || message.startsWith('$')) {
            line.classList.add('info');
        }

        line.textContent = message;
        terminalBody.appendChild(line);

        // Keep only the last 8 messages
        if (terminalBody.children.length > 8) {
            terminalBody.removeChild(terminalBody.firstChild);
        }

        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;

        currentMessageIndex = (currentMessageIndex + 1) % terminalMessages.length;

        // Random delay between 1s and 3s
        const delay = Math.random() * 2000 + 1000;
        setTimeout(addTerminalMessage, delay);
    }

    // Start animation
    setTimeout(addTerminalMessage, 1000);
}
