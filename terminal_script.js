
    // --- Sistema em Tempo Real Terminal Animation ---
    const terminalMessages = [
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

    const terminalBody = document.getElementById('telemetry-terminal');
    let currentMessageIndex = 0;

    function addTerminalMessage() {
        if (!terminalBody) return;
        
        const message = terminalMessages[currentMessageIndex];
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        if (message.startsWith('✓')) {
            line.classList.add('success');
        } else if (message.startsWith('>')) {
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
