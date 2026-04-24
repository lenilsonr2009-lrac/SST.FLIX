// ============================================
// GERENCIAMENTO DE TEMA (Escuro/Claro)
// ============================================

// Removido as constantes globais do topo para evitar erro de inicialização
let themeToggle;
let body;
let currentFilterNR = 'all';
let currentCategorySSTFLIX = 'all';

// Armazenar conteúdo original das seções
let originalContent = {};

// Conteúdo para modo "Direto ao Ponto" (notícias diárias)
const newsContent = {
  introducao: `<h2>Notícias do Trabalho</h2><p id="news-loading">Buscando as últimas notícias em tempo real...</p>`,
  regras: `
    <h2>Direitos Trabalhistas em Destaque</h2>
    <ul>
      <li><strong>FGTS:</strong> Saque-aniversário permite retirada de até 50% do saldo + parcela adicional.</li>
      <li><strong>Férias:</strong> Trabalhador pode parcelar em até 3 períodos, desde que um deles tenha mínimo 14 dias corridos.</li>
      <li><strong>Insalubridade:</strong> Adicional de 20%, 40% ou 60% conforme grau de exposição a agentes nocivos.</li>
      <li><strong>Horas extras:</strong> Pagamento com acréscimo mínimo de 50% sobre hora normal.</li>
      <li><strong>13º salário:</strong> Deve ser pago até 30 de novembro, proporcional ao tempo trabalhado.</li>
      <li><strong>Aviso prévio:</strong> 30 dias para contratos até 1 ano, aumenta conforme tempo de serviço.</li>
      <li><strong>Seguro-desemprego:</strong> Até 5 parcelas dependendo do tempo trabalhado.</li>
    </ul>
  `,
  atualizacoes: `
    <h2>Atualizações Trabalhistas</h2>
    <div class="alert">
      <strong>Novidade:</strong> Reforma trabalhista completa 6 anos. Principais mudanças incluem trabalho intermitente e jornada 12x36.
    </div>
    <div class="news-item">
      <h3>💼 CLT moderna em discussão</h3>
      <p>Congresso analisa propostas para modernizar a Consolidação das Leis do Trabalho, incluindo regulamentação de trabalho por aplicativo.</p>
      <small>Atualizado em 28/03/2026</small>
    </div>
    <div class="news-item">
      <h3>📱 Trabalho híbrido regulamentado</h3>
      <p>Nova portaria estabelece regras claras para trabalho híbrido, definindo responsabilidades de empregadores e empregados.</p>
      <small>Atualizado em 25/03/2026</small>
    </div>
    <div class="news-item">
      <h3>🎓 Qualificação profissional</h3>
      <p>Governo lança programa de qualificação profissional gratuito, com foco em tecnologia e indústria 4.0.</p>
      <small>Atualizado em 20/03/2026</small>
    </div>
    <div class="news-item">
      <h3>⚖️ Justiça do Trabalho</h3>
      <p>TST estabelece precedentes sobre assédio moral e sexual no ambiente de trabalho.</p>
      <small>Atualizado em 15/03/2026</small>
    </div>
  `,
  referencias: `
    <h2>Links Essenciais do Trabalhador</h2>
    <ul>
      <li><a href="https://portal.mte.gov.br/" target="_blank" rel="noopener noreferrer">Ministério do Trabalho e Previdência</a> - Informações oficiais sobre direitos trabalhistas.</li>
      <li><a href="https://www.tst.jus.br/" target="_blank" rel="noopener noreferrer">Tribunal Superior do Trabalho (TST)</a> - Jurisprudência e decisões trabalhistas.</li>
      <li><a href="https://www.fgts.gov.br/" target="_blank" rel="noopener noreferrer">FGTS</a> - Fundo de Garantia do Tempo de Serviço.</li>
      <li><a href="https://www.gov.br/trabalho-e-emprego" target="_blank" rel="noopener noreferrer">Ministério do Trabalho</a> - Políticas trabalhistas e emprego.</li>
      <li><a href="https://www.caixa.gov.br/seguro-desemprego/" target="_blank" rel="noopener noreferrer">Seguro-Desemprego</a> - Como solicitar benefício.</li>
      <li><a href="https://www.dataprev.gov.br/" target="_blank" rel="noopener noreferrer">Dataprev</a> - Consulta de benefícios previdenciários.</li>
    </ul>
  `
};

// Função para buscar notícias reais via RSS do Google News
async function fetchRealNews() {
  try {
    // Busca integrada: G1, Folha de SP e Diário de Pernambuco
    const query = encodeURIComponent('(site:g1.globo.com OR site:folha.uol.com.br OR site:diariodepernambuco.com.br) "Segurança do Trabalho" OR "Trabalho"');
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    // Adicionado timestamp (_cb) para garantir notícias novas a cada clique
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&_cb=${Date.now()}`;

    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.status === 'ok' && data.items.length > 0) {
      let newsHtml = '<h2>Notícias do Trabalho (G1, Folha, Diário)</h2>';
      
      // Pega as 5 notícias mais recentes
      data.items.slice(0, 5).forEach(item => {
        let date = 'Recente';
        try {
           date = new Date(item.pubDate).toLocaleDateString('pt-BR');
        } catch(e) { /* fallback */ }
        
        // Limpa a descrição de tags HTML que o Google News costuma enviar
        const cleanDesc = item.description.replace(/<[^>]*>?/gm, '').substring(0, 180);
        
        // Identifica a fonte de forma amigável
        let sourceName = item.author || 'Portal de Notícias';
        if (item.link.includes('globo.com')) sourceName = 'G1';
        else if (item.link.includes('folha.uol')) sourceName = 'Folha de S.Paulo';
        else if (item.link.includes('diariodepernambuco')) sourceName = 'Diário de Pernambuco';

        newsHtml += `
          <div class="news-item">
            <h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
            <p>${cleanDesc}...</p>
            <small>Fonte: <strong>${sourceName}</strong> | Publicado em ${date}</small>
          </div>
        `;
      });
      
      newsContent.introducao = newsHtml;
      // Se estiver no modo dark, atualiza a seção imediatamente
      if (body.classList.contains('netflix-theme')) {
        document.getElementById('introducao').innerHTML = newsHtml;
      }
    }
  } catch (e) { 
    console.error('Erro ao carregar notícias:', e);
    // Fallback: Se a API falhar, removemos o aviso de "carregando" e colocamos uma notícia padrão
    const fallbackHtml = `
      <h2>Notícias G1 - Trabalho</h2>
      <div class="news-item">
        <h3>📢 Portal de Notícias SST Atualizado</h3>
        <p>As atualizações das NRs e legislações vigentes podem ser consultadas diretamente nos links da seção de referências abaixo.</p>
      </div>`;
    newsContent.introducao = fallbackHtml;
    if (body.classList.contains('netflix-theme')) document.getElementById('introducao').innerHTML = fallbackHtml;
  }
}

// Função para salvar conteúdo original
function saveOriginalContent() {
  if (Object.keys(originalContent).length === 0) {
    originalContent.introducao = document.getElementById('introducao').innerHTML;
    originalContent.regras = document.getElementById('regras').innerHTML;
    const sections = document.querySelectorAll('section:not(#introducao):not(#nrs):not(#regras)');
    sections.forEach((section, index) => {
      if (section.querySelector('h2') && section.querySelector('h2').textContent.includes('Atualizações')) {
        originalContent.atualizacoes = section.innerHTML;
      } else if (section.querySelector('h2') && section.querySelector('h2').textContent.includes('Referências')) {
        originalContent.referencias = section.innerHTML;
      }
    });
  }
}

// Função para aplicar conteúdo baseado no tema
function applyContent(theme) {
  saveOriginalContent();
  
  const introducaoSection = document.getElementById('introducao');
  const regrasSection = document.getElementById('regras');
  
  if (theme === 'dark') {
    // Modo "Direto ao Ponto" - mostrar notícias
    introducaoSection.innerHTML = newsContent.introducao;
    regrasSection.innerHTML = newsContent.regras;
    
    // Encontrar seções de atualizações e referências de forma mais robusta
    const allSections = document.querySelectorAll('main section');
    allSections.forEach(section => {
      const h2 = section.querySelector('h2');
      if (h2) {
        if (h2.textContent.includes('Atualizações') || h2.textContent.includes('boas práticas')) {
          section.innerHTML = newsContent.atualizacoes;
        } else if (h2.textContent.includes('Referências') || h2.textContent.includes('importantes')) {
          section.innerHTML = newsContent.referencias;
        }
      }
    });
  } else {
    // Modo normal - restaurar conteúdo original
    introducaoSection.innerHTML = originalContent.introducao;
    regrasSection.innerHTML = originalContent.regras;
    
    const allSections = document.querySelectorAll('main section');
    allSections.forEach(section => {
      const h2 = section.querySelector('h2');
      if (h2) {
        if (h2.textContent.includes('Atualizações') || h2.textContent.includes('boas práticas')) {
          section.innerHTML = originalContent.atualizacoes;
        } else if (h2.textContent.includes('Referências') || h2.textContent.includes('importantes')) {
          section.innerHTML = originalContent.referencias;
        }
      }
    });
  }
}

// Função para inicializar tema
function initTheme() {
  let theme = localStorage.getItem('theme');
  
  // Se não houver tema salvo, usar preferência do sistema
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default';
  }
  
  applyTheme(theme);
}

// Função para aplicar tema
function applyTheme(theme) {
  const favicon = document.getElementById('dynamic-favicon');
  const mascotImg = document.getElementById('mascot-img');
  const mascotTooltip = document.getElementById('mascot-tooltip');
  const isDark = theme === 'dark';

  if (theme === 'dark') {
    body.classList.add('netflix-theme');
    themeToggle.textContent = '📖 Completo';
    if (mascotImg) mascotImg.src = 'ing/mascote sst.2.png';
    if (mascotTooltip) mascotTooltip.textContent = 'vamos evitar virar camisa de saudade?';
    fetchRealNews(); // Busca as notícias assim que o modo é ativado
  } else {
    body.classList.remove('netflix-theme');
    themeToggle.textContent = '👉 Direto ao Ponto';
    if (mascotImg) mascotImg.src = 'ing/mascote sst.png';
    if (mascotTooltip) mascotTooltip.textContent = 'Olá! Vamos trabalhar com segurança hoje?';
  }

  if (favicon) {
    const iconColor = isDark ? '%23e50914' : '%231a9d3f';
    favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M15,95 Q50,65 85,95' fill='${iconColor}' stroke='%23333' stroke-width='2'/><circle cx='50' cy='50' r='22' fill='%23ffdbac' stroke='%23333' stroke-width='2'/><path d='M28,50 Q28,25 50,25 Q72,25 72,50' fill='%23FFD700' stroke='%23333' stroke-width='2'/><rect x='25' y='46' width='50' height='6' rx='2' fill='%23FFD700' stroke='%23333' stroke-width='2'/></svg>`;
  }

  applyContent(theme);
  localStorage.setItem('theme', theme);
}

// ============================================
// BUSCA E FILTRO DE NRs
// ============================================
const nrSearch = document.getElementById('nrSearch');
const filterButtons = document.querySelectorAll('.filter-btn');
let currentFilter = 'all';

function filterNRs() {
  const nrSearch = document.getElementById('nrSearch');
  if (!nrSearch) return;
  
  const searchTerm = nrSearch.value.toLowerCase();
  const nrCards = document.querySelectorAll('.nrcard');

  nrCards.forEach(card => {
    const text = card.innerText.toLowerCase();
    const category = card.parentElement.className.toLowerCase();
    
    // Verificar se está visível por filtro
    const categoryMatch = currentFilterNR === 'all' || category.includes(`nr-${currentFilterNR}`);
    // Verificar se está visível por busca
    const searchMatch = !searchTerm || text.includes(searchTerm);
    
    // Mostrar/Ocultar card
    card.style.display = categoryMatch && searchMatch ? 'block' : 'none';
  });

  // Mostrar/Ocultar categorias e adicionar mensagem quando vazio
  document.querySelectorAll('.nr-gerais, .nr-especiais, .nr-setoriais, .nr-revogadas').forEach(category => {
    const visibleCards = category.querySelectorAll('.nrcard[style="display: block"], .nrcard:not([style])');
    const hasVisible = Array.from(visibleCards).some(card => card.style.display !== 'none');
    
    // Remover mensagem anterior se existir
    const existingMsg = category.querySelector('.no-results-msg');
    if (existingMsg) existingMsg.remove();
    
    if (hasVisible) {
      category.style.display = 'block';
    } else {
      category.style.display = 'block'; // Manter categoria visível
      // Adicionar mensagem de nenhum resultado
      const msg = document.createElement('div');
      msg.className = 'no-results-msg';
      msg.textContent = 'Nenhum resultado encontrado nesta categoria';
      msg.style.cssText = 'color: #666; font-style: italic; padding: 10px; text-align: center;';
      category.appendChild(msg);
    }
  });
}

// ============================================
// BOTÃO VOLTAR AO TOPO
// ============================================

function handleBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// PERFORMANCE: PRELOAD LINKS EXTERNOS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  themeToggle = document.getElementById('theme-toggle');
  body = document.body;

  // Corrigindo o botão Direto ao Ponto (Troca de Tema)
  // Ensure themeToggle exists before adding event listener
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.classList.contains('netflix-theme');
      const newTheme = isDark ? 'default' : 'dark';
      
      // Força a atualização das notícias ao clicar no botão
      if (newTheme === 'dark') fetchRealNews();
      
      applyTheme(newTheme);
    });
  }

  // Lógica do Modal (Scroll e Busca Expansível)
  const modal = document.getElementById('avoid-modal');
  const modalHeader = document.getElementById('modal-header');
  const modalSearchTrigger = document.getElementById('modal-search-trigger');
  const modalSearchContainer = document.getElementById('modal-search-container');
  const modalSearchInput = document.getElementById('modal-global-search');
  
  // Lógica do Modal de Jornais - Corrigida
  const newsModalBtn = document.getElementById('news-modal-btn');
  const newsModal = document.getElementById('news-modal');
  const newsModalClose = document.getElementById('news-modal-close');

  if (newsModalBtn && newsModal) {
    newsModalBtn.addEventListener('click', () => {
      newsModal.classList.add('active');
    });
    newsModalClose.addEventListener('click', () => {
      newsModal.classList.remove('active');
    });
    newsModal.addEventListener('click', (e) => {
      if (e.target === newsModal) newsModal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('scroll', () => {
      if (modal.scrollTop > 50) modalHeader.classList.add('scrolled');
      else modalHeader.classList.remove('scrolled');
    });
  }

  if (modalSearchTrigger && modalSearchContainer) {
    modalSearchTrigger.addEventListener('click', () => {
      modalSearchContainer.classList.toggle('active');
      if (modalSearchContainer.classList.contains('active')) modalSearchInput.focus();
    });
    
    modalSearchInput.addEventListener('input', () => {
      currentCategorySSTFLIX = 'all';
      renderVideoGrid();
    });
  }

  // Setup NR Search
  const nrSearch = document.getElementById('nrSearch');
  if (nrSearch) nrSearch.addEventListener('input', filterNRs);

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilterNR = btn.dataset.filter;
      filterNRs();
    });
  });

  handleBackToTop();

  // Copy to Clipboard
  document.querySelectorAll('.sigla-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.title = 'Clique para copiar';
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') {
        navigator.clipboard.writeText(item.textContent.trim()).then(() => {
          const originalBg = item.style.backgroundColor;
          item.style.backgroundColor = body.classList.contains('netflix-theme') ? '#e5091444' : 'rgba(26, 157, 63, 0.3)';
          setTimeout(() => item.style.backgroundColor = originalBg, 300);
        });
      }
    });
  });

  // Inicializar tema e buscar notícias reais se estiver no modo Direto ao Ponto
  initTheme();

  // Adicionar preconnect para domínios externos
  const links = [
    { rel: 'preconnect', href: 'https://www.folha.uol.com.br' },
    { rel: 'preconnect', href: 'https://www.anvisa.gov.br' },
    { rel: 'preconnect', href: 'https://www.fiesp.com.br' },
    { rel: 'preconnect', href: 'https://www.youtube.com' },
    { rel: 'dns-prefetch', href: 'https://www.youtube-nocookie.com' }
  ];

  links.forEach(link => {
    const preconnect = document.createElement('link');
    preconnect.rel = link.rel;
    preconnect.href = link.href;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);
  });

  // Mini calendário com tema mensal
  const miniCalendar = document.getElementById('mini-calendar');
  if (!miniCalendar) return;

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const monthThemeData = {
    Janeiro:  { colors: ['#ffffff', '#d3d3d3'], textColor: '#333', campaign: 'Janeiro Branco (Saúde Mental)' },
    Fevereiro: { colors: ['#800080', '#d1b2ff'], textColor: '#fff', campaign: 'Fevereiro Roxo (Transtornos, Alzheimer e Fibromialgia)' },
    Março:   { colors: ['#C8A2C8', '#F8BBD0'], textColor: '#333', campaign: 'Março Lilás (Combate ao Câncer de Colo de Útero)' },
    Abril:   { colors: ['#0099FF', '#66B2FF'], textColor: '#fff', campaign: 'Abril Azul (Autismo)' },
    Maio:    { colors: ['#FFD700', '#FFA500'], textColor: '#333', campaign: 'Maio Amarelo (Segurança no Trânsito)' },
    Junho:   { colors: ['#8B00FF', '#D2B4FF'], textColor: '#fff', campaign: 'Junho Violeta (Combate ao Abuso)' },
    Julho:   { colors: ['#008000', '#66CDAA'], textColor: '#fff', campaign: 'Julho Verde (Doenças Raras)' },
    Agosto:  { colors: ['#FFCE00', '#FFD700'], textColor: '#333', campaign: 'Agosto Dourado (Amamentação)' },
    Setembro:{ colors: ['#FFD700', '#FFEC8B'], textColor: '#333', campaign: 'Setembro Amarelo (Prevenção ao Suicídio)' },
    Outubro: { colors: ['#FF69B4', '#FFB6C1'], textColor: '#333', campaign: 'Outubro Rosa (Combate ao Câncer de Mama)' },
    Novembro:{ colors: ['#1E90FF', '#87CEFA'], textColor: '#fff', campaign: 'Novembro Azul (Combate ao Câncer de Próstata)' },
    Dezembro:{ colors: ['#DC143C', '#FF6347'], textColor: '#fff', campaign: 'Dezembro Vermelho (Aids/HIV)' }
  };

  const makeGradient = (colors) => {
    if (!colors || !colors.length) return '#ccc';
    if (colors.length === 1) return colors[0];
    return `linear-gradient(90deg, ${colors.join(', ')})`;
  };

  function updateMiniCalendar() {
    const now = new Date();
    const currentWeekday = weekDays[now.getDay()];
    const currentMonthName = monthNames[now.getMonth()];
    const currentDate = now.getDate();
    const currentYear = now.getFullYear();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const monthCells = monthNames.map((month) => {
      const info = monthThemeData[month] || { colors: ['#ccc'], textColor: '#000', campaign: 'Sem campanha específica' };
      const background = makeGradient(info.colors);
      const isCurrent = month === currentMonthName;
      return `<span class="${isCurrent ? 'current' : ''}" title="${info.campaign}" style="background:${background}; color:${info.textColor}; cursor: help;">${month.substring(0,3)}</span>`;
    }).join('');

    const currentCampaign = monthThemeData[currentMonthName]?.campaign || 'Sem campanha específica';

    miniCalendar.innerHTML = `
      <span><strong>${currentWeekday}</strong>, ${currentDate}</span>
      <span>${currentMonthName} de ${currentYear}</span>
      <span>${currentTime}</span>
      <span style="font-size:0.75rem; opacity:0.9; margin-top:0.3rem; display:block;">${currentCampaign}</span>
      <div class="month-legend">${monthCells}</div>
    `;
  }

  updateMiniCalendar();
  setInterval(updateMiniCalendar, 60 * 1000);

  // ============================================
  // CATÁLOGO DE VÍDEOS (NETFLIX STYLE)
  // ============================================
  const avoidBtn = document.getElementById('avoid-btn');
  const avoidModal = document.getElementById('avoid-modal');
  const avoidClose = document.getElementById('avoid-close');
  const avoidGrid = document.getElementById('avoid-grid');
  let lastFocusedElement = null;
  
  const playerModal = document.getElementById('player-modal');
  const playerClose = document.getElementById('player-close');
  const playerVideo = document.getElementById('player-video');
  const playerTitle = document.getElementById('player-title');

  // Dados de vídeos com ícones/emojis para thumbnail
  const videosCatalog = [
    {
      id: 1,
      title: '📋 NR-1: Disposições Gerais',
      emoji: '📋',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/28XJAdBkKwI'
    },
    {
      id: 2,
      title: '👥 NR-2: (revogada) Inspeção Prévia',
      emoji: '👥',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/ISE2jOljf-c'
    },
    {
      id: 3,
      title: '🏢 NR-3: Embargo ou Interdição',
      emoji: '🏢',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/WpRQoKU4UL8'
    },
    {
      id: 4,
      title: '👷 NR-4: Serviços Especializados',
      emoji: '👷',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/DaRMvmdbacs'
    },
    {
      id: 5,
      title: '📊 NR-5: Comissão Interna de Prevenção',
      emoji: '📊',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/ubKm_hbUuzA'
    },
    {
      id: 6,
      title: '🛡️ NR-6: Equipamentos de Proteção',
      emoji: '🛡️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/2kf-wk5aIhc'
    },
    {
      id: 7,
      title: '🏥 NR-7: PCMSO',
      emoji: '🏥',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/BrOW-NI-y7E'
    },
    {
      id: 8,
      title: '📚 NR-8: Edificações',
      emoji: '📚',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/RQhOvZ8I3LQ'
    },
    {
      id: 9,
      title: '🏭 NR-9: Programa de Prevenção de Riscos Ambientais',
      emoji: '🏭',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/FCo71u26ZsA'
    },
    {
      id: 10,
      title: '⚡ NR-10: Segurança com Eletricidade',
      emoji: '⚡',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/7R-ZBHbTQcY'
    },
    {
      id: 11,
      title: '🔌 NR-11: Transporte e Movimentação de Materiais',
      emoji: '🔌',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/vSnfdqverGE'
    },
    {
      id: 12,
      title: '⚙️ NR-12: Segurança em Máquinas',
      emoji: '⚙️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/Ufm7wEUwgDY'
    },
    {
      id: 13,
      title: '📈 NR-13: Caldeiras, Vasos de Pressão e Tubulações',
      emoji: '📈',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/UbcPdIr3BRI'
    },
    {
      id: 14,
      title: '🚪 NR-14: Fornos',
      emoji: '🚪',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/fXtl8iZ46wM'
    },
    {
      id: 15,
      title: '☣️ NR-15: Atividades Insalubres',
      emoji: '☣️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/9RxhsyTTkkE'
    },
    {
      id: 16,
      title: '🌡️ NR-16: Atividades e Operações Perigosas',
      emoji: '🌡️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/tYCv4S7U0lk'
    },
    {
      id: 17,
      title: '💼 NR-17: Ergonomia',
      emoji: '💼',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/aiJZ3ElmXjg'
    },
    {
      id: 18,
      title: '🏗️ NR-18: Construção Civil',
      emoji: '🏗️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/DRpUc-j5Ql0'
    },
    {
      id: 19,
      title: '🚀 NR-19: Explosivos',
      emoji: '🚀',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/SqpPULzd4bI'
    },
    {
      id: 20,
      title: '⚗️ NR-20: Segurança com Inflamáveis e Combustíveis',
      emoji: '⚗️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/iypF-8JUXSk'
    },
    {
      id: 21,
      title: '🚛 NR-21: Trabalhos a Céu Aberto',
      emoji: '🚛',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/hxBQ2-ItBhw'
    },
    {
      id: 22,
      title: '🛢️ NR-22: Segurança e Saúde na Mineração',
      emoji: '🛢️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/EB-qn0ZTrzQ'
    },
    {
      id: 23,
      title: '🔥 NR-23: Proteção Contra Incêndios',
      emoji: '🔥',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/T0r1gQEpmMM'
    },
    {
      id: 24,
      title: '🌿 NR-24: Condições Sanitárias e Conforto',
      emoji: '🌿',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/BEE5vrFdfPQ'
    },
    {
      id: 25,
      title: '📞 NR-25: Resíduos Industriais',
      emoji: '📞',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/neh45QfzHxY'
    },
    {
      id: 26,
      title: '🖥️ NR-26: Sinalização de Segurança',
      emoji: '🖥️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/kxpPJQK7kGE'
    },
    {
      id: 27,
      title: '📝 NR-27: (revogada) Registro Profissional TST',
      emoji: '📝',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/SqaVLN7-yIE'
    },
    {
      id: 28,
      title: '🔍 NR-28: Fiscalização e Penalidades',
      emoji: '🔍',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/o8Arn4iQRVg'
    },
    {
      id: 29,
      title: '📋 NR-29: Segurança no Trabalho Portuário',
      emoji: '📋',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/14b4jPVxAOA'
    },
    {
      id: 30,
      title: '🏗️ NR-30: Segurança no Trabalho Aquaviário',
      emoji: '🏗️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/txlHs9Nu9a8'
    },
    {
      id: 31,
      title: '🚀 NR-31: Segurança na Agricultura e Pecuária',
      emoji: '🚀',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/TKT3X6AsXK4'
    },
    {
      id: 32,
      title: '🛩️ NR-32: Segurança em Serviços de Saúde',
      emoji: '🛩️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/MuTvuPO274c'
    },
    {
      id: 33,
      title: '🔒 NR-33: Espaços Confinados',
      emoji: '🔒',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/2CJCTnQLpy0'
    },
    {
      id: 34,
      title: '🏔️ NR-34: Construção e Reparação Naval',
      emoji: '🏔️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/uhAJ57fSelY'
    },
    {
      id: 35,
      title: '🏗️ NR-35: Trabalho em Altura',
      emoji: '🏗️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/jPQy_-fD1Do'
    },
    {
      id: 36,
      title: '🌍 NR-36: Empresas de Abate de Carnes',
      emoji: '🌍',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/pgXsoo4v3Cw'
    },
    {
      id: 37,
      title: '🔥 NR-37: Segurança em Plataformas de Petróleo',
      emoji: '🔥',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/6XkSgEF64mE'
    },
    {
      id: 38,
      title: '⚡ NR-38: Segurança em Limpeza Urbana',
      emoji: '⚡',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/8P9QaxLR_BQ'
    },
    {
      id: 39,
      title: '⚠️ Sem EPI em altura',
      emoji: '⚠️',
      category: 'risco/humor',
      embed: 'https://www.youtube.com/embed/z-6u1-3DRh8'
    },
    {
      id: 40,
      title: '😵 Equilibrista da morte',
      emoji: '😵',
      category: 'humor',
      embed: 'https://www.youtube.com/embed/FXKFjr2rr5k'
    },
    {
      id: 41,
      title: '⚡ Fio na mão',
      emoji: '⚡',
      category: 'risco/humor',
      embed: 'https://www.youtube.com/embed/U9CXtycJz_g'
    },
    {
      id: 42,
      title: '⛔ Zona de risco',
      emoji: '⛔',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/zXHGUoq1bVE'
    },
    {
      id: 43,
      title: '😂 Acrobacia criativa',
      emoji: '😂',
      category: 'profissional/risco/humor',
      embed: 'https://www.youtube.com/embed/Bu4MbxUHMRM'
    },
    {
      id: 44,
      title: '🔨 Gambiarra',
      emoji: '🔨',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/gVuRN7MbwJw'
    },
    {
      id: 45,
      title: '👕 Sinalização de segurança',
      emoji: '👕',
      category: 'humor',
      embed: 'https://www.youtube.com/embed/UnYKkVV4AoQ'
    },
    {
      id: 46,
      title: '⚙️ Máquina liberada',
      emoji: '⚙️',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/1h4PyBwIEPc'
    },
    {
      id: 47,
      title: '🏊 Escorreguete da obra',
      emoji: '🏊',
      category: 'humor',
      embed: 'https://www.youtube.com/embed/vlM_VYNMhS8'
    },
    {
      id: 48,
      title: '🏔️ Montanha de empilhadeira',
      emoji: '🏔️',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/kiatjbeC1jQ'
    },
    {
      id: 49,
      title: '🚑 Primeiros Socorros e Suporte à Vida',
      emoji: '🚑',
      category: 'normas/comportamento',
      embed: 'https://www.youtube.com/embed/_lvi5LO7vrg'
    },
    {
      id: 50,
      title: '🧠 Saúde Mental e Bem-estar Ocupacional',
      emoji: '🧠',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/LEwaHFN-D6Q'
    },
    {
      id: 51,
      title: '🧤 Luvas de Proteção: Tipos e Usos',
      emoji: '🧤',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/JC1sjCeXi6k'
    },
    {
      id: 52,
      title: '🥾 Calçados de Segurança: O que observar?',
      emoji: '🥾',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/y_nHSrKEf6o'
    },
    {
      id: 53,
      title: '🥽 Proteção Ocular',
      emoji: '🥽',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/gTFy6AovXe8'
    },
    {
      id: 54,
      title: '🎧 Protetor Auricular',
      emoji: '🎧',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/rFElcBzkyxQ'
    },
    {
      id: 55,
      title: '🎭 Respiradores e Teste de Vedação',
      emoji: '🎭',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/rOBgEdBI0XI'
    },
    {
      id: 56,
      title: '🧱 Estabilidade em Empilhamento de Blocos',
      emoji: '🧱',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/XRqUbWDgmeE'
    },
    {
      id: 57,
      title: '🪜 manuseio de escadas',
      emoji: '🪜',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/3Z98G9nSCxI'
    },
    {
      id: 58,
      title: '🚜 Operação Segura de Retroescavadeira',
      emoji: '🚜',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/ap03NwLgD2A'
    },
    {
      id: 59,
      title: '🚛 Ponto Cego em Veículos Pesados',
      emoji: '🚛',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/YlQBCjd-_Fg'
    },
    {
      id: 60,
      title: '🚧 Isolamento de Área de Carga Suspensa',
      emoji: '🚧',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/ydlvxkF598c'
    },
    {
      id: 61,
      title: '🧯 classes de incêndio',
      emoji: '🧯',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/HhUF2tf987M'
    },
    {
      id: 62,
      title: '🔥 Brigada de Incêndio',
      emoji: '🔥',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/jiwRHghrd4o'
    },
    {
      id: 63,
      title: '🧴 segurança com químicos',
      emoji: '🧴',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/RdQWKM8mGvE'
    },
    {
      id: 64,
      title: '🧪 Lendo a Ficha de Segurança (FDS/FISPQ)',
      emoji: '🧪',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/ZYAEHjZVb1w'
    },
    {
      id: 65,
      title: '☣️ Riscos Biológicos',
      emoji: '☣️',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/z_ujKQr0G88'
    },
    {
      id: 66,
      title: '☢️ Radiações Ionizantes',
      emoji: '☢️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/KbxIH5B3PrE'
    },
    {
      id: 67,
      title: '🧘 Ginástica Laboral',
      emoji: '🧘',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/6-Mxh62G7a4'
    },
    {
      id: 68,
      title: '💻 Home Office',
      emoji: '💻',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/uahZWHddtEk'
    },
    {
      id: 69,
      title: '📦 conforto termico',
      emoji: '📦',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/Zqyqb6h7vAs'
    },
    {
      id: 70,
      title: '🪑 Ergonomia: Ajuste de Cadeiras',
      emoji: '🪑',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/PFkHH17ZZzg'
    },
    {
      id: 71,
      title: '🔌 Choque Elétrico',
      emoji: '🔌',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/3T9myY-kR7E'
    },
    {
      id: 72,
      title: '⛈️ Proteção contra Raios em Campo',
      emoji: '⛈️',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/Ihzp5FOMfaw'
    },
    {
      id: 73,
      title: '🪚 Segurança com Motosserra',
      emoji: '🪚',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/Zc6_ARyzw-0'
    },
    {
      id: 74,
      title: '🔨 soterramento',
      emoji: '🔨',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/EAhRImcRqkg'
    },
    {
      id: 75,
      title: '⛏️ Escavações: Prevenção',
      emoji: '⛏️',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/-6NX02Ge7m8'
    },
    {
      id: 76,
      title: '🚢 Segurança em Docas e Portos-sinalização',
      emoji: '🚢',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/bIfg_n2Cv1A'
    },
    {
      id: 77,
      title: '✈️ quedas',
      emoji: '✈️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/mvOpzyyS_ag'
    },
    {
      id: 78,
      title: '🏢 Prédios Inteligentes',
      emoji: '🏢',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/TZ3JbcR6Ors'
    },
    {
      id: 79,
      title: '🌑 Ciclo Circadiano',
      emoji: '🌑',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/Fgk4MMQAXdU'
    },
    {
      id: 80,
      title: '🧳 poeira de trabalho',
      emoji: '🧳',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/tfWPTWxE8gw'
    },
    {
      id: 81,
      title: '💧 Hidratação e Estresse Térmico',
      emoji: '💧',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/xAtFMKyrUKA'
    },
    {
      id: 82,
      title: '❄️ Trabalho em Ambientes Frigoríficos',
      emoji: '❄️',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/dgLDkPDo2pk'
    },
    {
      id: 83,
      title: '🚭 Tabagismo no Ambiente de Trabalho',
      emoji: '🚭',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/FzNjOTBCf_M'
    },
    {
      id: 84,
      title: '🍺 Álcool no trabalho',
      emoji: '🍺',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/fUxGPRlOBkA'
    },
    {
      id: 85,
      title: '🗣️ Comunicação',
      emoji: '🗣️',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/rd1mCZVNnxE'
    },
    {
      id: 86,
      title: '📋 APR (análise preliminar de risco)',
      emoji: '📋',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/NB57u88zwFU'
    },
    {
      id: 87,
      title: '🕵️ Investigação de Acidentes',
      emoji: '🕵️',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/M-sl-re__GY'
    },
    {
      id: 88,
      title: '📊 Indicadores de SST: O que medir?',
      emoji: '📊',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/Kc71UUOQOMA'
    },
    {
      id: 89,
      title: '🤝 A importância do DDS Diário',
      emoji: '🤝',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/lY5WdCe12I4'
    },
    {
      id: 90,
      title: '📢 Sinalização Sonora',
      emoji: '📢',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/DZ2OsIyhfxY'
    },
    {
      id: 91,
      title: '🚲 Segurança para Entregadores Ciclistas',
      emoji: '🚲',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/zFEPNQWInBo'
    },
    {
      id: 92,
      title: '🏍️ Direção Defensiva: Motociclistas',
      emoji: '🏍️',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/QKhLPQZSzUE'
    },
    {
      id: 93,
      title: '🚗 ponto cego: carro',
      emoji: '🚗',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/0m7loEQ_o6o'
    },
    {
      id: 94,
      title: '🚦 Sinalização Interna',
      emoji: '🚦',
      category: 'normas',
      embed: 'https://www.youtube.com/embed/9ByEDSsK2PY'
    },
    {
      id: 95,
      title: '🐕 Ataques de Animais peçonhento areas rurais',
      emoji: '🐕',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/8fKQ81tGri4'
    },
    {
      id: 96,
      title: '🐝 Alergias e Picadas de Insetos',
      emoji: '🐝',
      category: 'risco',
      embed: 'https://www.youtube.com/embed/DS8TG-RntcI'
    },
    {
      id: 97,
      title: '☀️ rede elétrica nos campos Rurais',
      emoji: '☀️',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/BTpwpYow2Kg'
    },
    {
      id: 98,
      title: '🧥 Vestimentas de segurança, uniformes',
      emoji: '🧥',
      category: 'equipamento',
      embed: 'https://www.youtube.com/embed/AGXnlShR7v0'
    },
    {
      id: 99,
      title: '🧹 Organização (5S) e Segurança',
      emoji: '🧹',
      category: 'comportamento',
      embed: 'https://www.youtube.com/embed/FgHXoMfYCbo'
    },
    {
      id: 100,
      title: '🏁 1000 sem Acidentes!',
      emoji: '🏁',
      category: 'humor/tragico',
      embed: 'https://www.youtube.com/embed/t4QtwLWMvi8'
    }
  ];

  const avoidSearchInput = document.getElementById('avoid-search');
  const avoidCategoryFilter = document.getElementById('avoid-category-filter');
  const avoidEmpty = document.getElementById('avoid-empty');
  const favGrid = document.getElementById('favorites-grid');
  const favRow = document.getElementById('favorites-row');
  const heroSection = document.getElementById('hero-section');
  const avoidGridCategories = document.getElementById('avoid-grid-categories');

  let favorites = JSON.parse(localStorage.getItem('sst-favorites') || '[]');
  let watched = JSON.parse(localStorage.getItem('sst-watched') || '[]');

  // Persistência de Favoritos
  function toggleFavorite(id, event) {
    event.stopPropagation();
    const index = favorites.indexOf(id);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(id);
    localStorage.setItem('sst-favorites', JSON.stringify(favorites));
    renderVideoGrid();
  }

  window.renderHeroBanner = function() {
    // HERO DINÂMICO: Seleção aleatória
    const randomIndex = Math.floor(Math.random() * videosCatalog.length);
    const heroVideo = videosCatalog[randomIndex];
    const heroBanner = document.getElementById('hero-banner');
    
    // Extração de ID do YouTube para Thumbnail HD
    const ytId = heroVideo.embed.split('embed/')[1]?.split('?')[0];
    const bgUrl = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1920';
    
    if (heroBanner) {
      heroBanner.style.backgroundImage = `url('${bgUrl}')`;
      heroBanner.innerHTML = `
        <div class="hero-content">
          <h1>${heroVideo.title}</h1>
          <p>Treinamento de alto impacto: Proteja sua vida e a de seus colegas dominando as normas de ${heroVideo.category.split('/')[0]}.</p>
          <button class="btn-play" onclick="window.openVideo(${heroVideo.id})">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8V4z"/></svg> Assistir
          </button>
        </div>
      `;
    }
  }

  window.openCategory = (categoryFilter) => {
    const modal = document.getElementById('avoid-modal');
    const modalSearchInput = document.getElementById('modal-global-search');
    
    if (modalSearchInput) modalSearchInput.value = '';
    renderVideoGrid();

    if (categoryFilter === 'all') {
      modal.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetRow = document.getElementById(`row-${categoryFilter}`);
      if (targetRow) {
        const modalRect = modal.getBoundingClientRect();
        const rowRect = targetRow.getBoundingClientRect();
        const scrollTarget = modal.scrollTop + (rowRect.top - modalRect.top) - 100;
        modal.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    }
  };

  window.openVideo = (id) => {
    const video = videosCatalog.find(v => v.id === id);
    if (video) {
      if (!watched.includes(id)) {
        watched.push(id);
        localStorage.setItem('sst-watched', JSON.stringify(watched));
      }
      openPlayerModal(video);
    }
  };

  // Função de scroll estilo Netflix: passa a fileira visível inteira
  window.sideScroll = function(element, direction) {
    // Agora move 100% para alinhar com os segmentos de paginação
    const scrollAmount = element.clientWidth; 
    element.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  window.updatePagination = function(container) {
    const row = container.closest('.sstflix-row');
    if (!row) return;
    const segments = row.querySelectorAll('.pagination-segment');
    if (!segments.length) return;

    const scrollLeft = container.scrollLeft;
    // Usamos clientWidth para definir o tamanho de uma "página"
    const width = container.clientWidth; 
    const activePage = Math.round(scrollLeft / width);

    segments.forEach((seg, i) => {
      seg.classList.toggle('active', i === activePage);
    });
  };

  function renderVideoGrid() {
    const modalSearchInput = document.getElementById('modal-global-search');
    const searchTerm = modalSearchInput ? modalSearchInput.value.trim().toLowerCase() : '';

    const filterLogic = video => {
      const matchSearch = !searchTerm || [video.title, video.category, video.emoji].some(value =>
        value.toLowerCase().includes(searchTerm)
      );
      return matchSearch;
    };

    const filteredVideos = videosCatalog.filter(filterLogic);
    const favVideos = videosCatalog.filter(v => favorites.includes(v.id) && filterLogic(v));
    
    const createCard = video => {
      const ytId = video.embed.split('embed/')[1]?.split('?')[0];
      const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '';

      return `
        <div class="avoid-card ${favorites.includes(video.id) ? 'is-favorite' : ''} ${watched.includes(video.id) ? 'watched' : ''}" onclick="openVideo(${video.id})">
          <button class="fav-toggle ${favorites.includes(video.id) ? 'active' : ''}" 
                  onclick="event.stopPropagation(); window.toggleFavorite(${video.id}, event)" title="Favoritar">
            ${favorites.includes(video.id) ? '★' : '☆'}
          </button>
          <div class="avoid-card-thumbnail">
            <img src="${thumbUrl}" alt="${video.title}" class="card-img">
            <div class="card-overlay">
              <div class="emoji-display">${video.emoji}</div>
              <div class="video-type-label">${video.category.split('/')[0].toUpperCase()}</div>
            </div>
          </div>
          <h3 class="avoid-card-title">${video.title}</h3>
        </div>
      `;
    };

    favRow.hidden = favVideos.length === 0;
    favGrid.innerHTML = favVideos.map(createCard).join('');

    // Categorias organizadas
    const categories = ['humor', 'equipamento', 'risco', 'comportamento', 'normas'];
    
    avoidGridCategories.innerHTML = categories.map(cat => {
      const catVideos = filteredVideos.filter(v => v.category.toLowerCase().includes(cat));
      if (catVideos.length === 0 && searchTerm !== '') return '';
      
      // Polimento na matemática de paginação
      const containerWidth = window.innerWidth * 0.92; 
      const cardWidthWithGap = 258; // 250px largura + 8px gap
      const itemsInView = Math.floor((containerWidth + 8) / cardWidthWithGap) || 1;
      const totalItems = catVideos.length;
      const pageCount = Math.ceil(totalItems / itemsInView);
      
      const segmentsHtml = (totalItems > itemsInView && pageCount < 15) ? Array.from({ length: pageCount })
        .map((_, i) => `<div class="pagination-segment ${i === 0 ? 'active' : ''}"></div>`)
        .join('') : '';

      return `
        <div class="sstflix-row" id="row-${cat}">
          <div class="row-header-wrapper">
            <h2 class="row-title" onclick="window.openCategory('${cat}')">${cat.toUpperCase()}</h2>
            <div class="pagination-indicator">${segmentsHtml}</div>
          </div>
          <div class="row-wrapper">
            <button class="scroll-handle left" onclick="window.sideScroll(this.nextElementSibling, 'left')">›</button>
            <div class="row-container" onscroll="window.updatePagination(this)">
              ${catVideos.map(createCard).join('')}
            </div>
            <button class="scroll-handle right" onclick="window.sideScroll(this.previousElementSibling, 'right')">‹</button>
          </div>
        </div>
      `;
    }).join('');

    avoidEmpty.hidden = filteredVideos.length > 0;
  }

  window.toggleFavorite = toggleFavorite;

  // Abrir player modal
  function openPlayerModal(video) {
    lastFocusedElement = document.activeElement;
    playerTitle.textContent = video.title;
    document.getElementById('player-cat-badge').textContent = video.category.toUpperCase();
    document.getElementById('player-desc').textContent = `Este conteúdo aborda conceitos fundamentais de ${video.category} aplicados à Segurança do Trabalho.`;
    
    // Dicas dinâmicas baseadas na categoria
    const tipsObj = {
      normas: ["Consulte sempre o texto oficial da NR no site do Governo.", "Mantenha o PGR atualizado conforme os riscos apresentados."],
      risco: ["Identifique o perigo antes de iniciar a tarefa.", "Use a hierarquia de controle de riscos."],
      equipamento: ["Inspecione o equipamento antes do uso.", "O uso de EPI é obrigatório e fiscalizável."]
    };
    const tips = tipsObj[video.category.split('/')[0]] || ["Siga os procedimentos operacionais padrão.", "Em caso de dúvida, pare a tarefa e chame o supervisor."];
    
    document.getElementById('player-tips').innerHTML = `
      <h3>💡 Dicas Técnicas</h3>
      <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
    `;

    const youtubeUrl = video.embed.includes('?') 
      ? `${video.embed}&rel=0&modestbranding=1`
      : `${video.embed}?rel=0&modestbranding=1`;
    playerVideo.src = youtubeUrl;
    playerModal.classList.add('active');
    playerModal.setAttribute('aria-hidden', 'false');
    playerModal.focus();
  }

  // Fechar player modal
  function closePlayerModal() {
    playerModal.classList.remove('active');
    playerModal.setAttribute('aria-hidden', 'true');
    playerVideo.src = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  // Event listeners - Catálogo
  avoidBtn.addEventListener('click', () => {
    lastFocusedElement = document.activeElement;
    avoidModal.classList.add('active');
    avoidModal.classList.add('netflix-theme'); // Add netflix-theme to modal
    avoidModal.setAttribute('aria-hidden', 'false');
    renderHeroBanner(); // Call the hero banner render function
    renderVideoGrid();
    avoidModal.focus();
  });

  avoidClose.addEventListener('click', () => {
    avoidModal.classList.remove('active');
    avoidModal.setAttribute('aria-hidden', 'true');
    if (lastFocusedElement) lastFocusedElement.focus();
  });

  // Lógica para transformar a logo em vermelho
  const logoToggleBtn = document.getElementById('logo-color-toggle');
  const sstLogo = document.querySelector('.sstflix-logo');
  
  if (logoToggleBtn && sstLogo) {
    logoToggleBtn.addEventListener('click', () => {
      sstLogo.classList.toggle('red-logo');
    });
  }

  avoidModal.addEventListener('click', (e) => {
    if (e.target === avoidModal) {
      avoidModal.classList.remove('active');
      avoidModal.setAttribute('aria-hidden', 'true');
    }
  });

  // Event listeners - Player
  playerClose.addEventListener('click', closePlayerModal);

  playerModal.addEventListener('click', (e) => {
    if (e.target === playerModal) {
      closePlayerModal();
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (playerModal.classList.contains('active')) {
        closePlayerModal();
      } else if (avoidModal.classList.contains('active')) {
        avoidModal.classList.remove('active');
        avoidModal.setAttribute('aria-hidden', 'true');
      } else if (newsModal && newsModal.classList.contains('active')) {
        newsModal.classList.remove('active');
      }
    }
  });
});