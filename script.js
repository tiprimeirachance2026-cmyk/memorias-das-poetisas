/* ============================================================
   SCRIPT.JS — comportamento do site público
   (menu, acervo, biografia + capas, comentários, contato)
   Sem innerHTML para dados: DOM API + textContent.
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- utilitários ---------------- */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function el(tag, classe, texto) {
    var node = document.createElement(tag);
    if (classe) node.className = classe;
    if (texto !== undefined) node.textContent = texto;
    return node;
  }

  function formatarData(iso) {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  /* ---------------- menu mobile ---------------- */

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-site-nav]');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.setAttribute('data-open', open ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    var mq = window.matchMedia('(min-width: 64.11rem)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------------- ano corrente ---------------- */

  function initAno() {
    $$('[data-current-year]').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------- cartão de poetisa ---------------- */

  function criarFallback(p, classe) {
    return el('div', classe || 'poetisa-card__fallback', p.initials || '?');
  }

  function criarCartao(p, aoAbrir) {
    var card = el('article', 'poetisa-card');

    var retrato = el('div', 'poetisa-card__portrait');
    if (p.photoUrl) {
      var img = document.createElement('img');
      img.src = p.photoUrl;
      img.alt = 'Foto de ' + p.name;
      img.loading = 'lazy';
      img.addEventListener('error', function () {
        retrato.replaceChildren(criarFallback(p));
      });
      retrato.appendChild(img);
    } else {
      retrato.appendChild(criarFallback(p));
    }
    card.appendChild(retrato);

    var body = el('div', 'poetisa-card__body');
    if (p.subtitle) body.appendChild(el('p', 'poetisa-card__subtitle', p.subtitle));
    body.appendChild(el('h3', 'poetisa-card__name', p.name));
    if (p.summary) body.appendChild(el('p', 'poetisa-card__summary', p.summary));

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'poetisa-card__action';
    btn.textContent = 'Ler biografia';
    btn.addEventListener('click', function () { aoAbrir(p); });
    body.appendChild(btn);

    card.appendChild(body);
    return card;
  }

  /* ---------------- página inicial ---------------- */

  function initHome() {
    var grid = $('[data-featured-grid]');
    var countNodes = $$('[data-poetisas-count]');
    var coversNodes = $$('[data-covers-count]');
    if (!grid && countNodes.length === 0) return;

    var lista = Loja.getPoetisas().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'pt-BR');
    });

    var totalCapas = lista.reduce(function (soma, p) {
      return soma + (Array.isArray(p.covers) ? p.covers.length : 0);
    }, 0);

    countNodes.forEach(function (n) { n.textContent = String(lista.length); });
    coversNodes.forEach(function (n) { n.textContent = String(totalCapas); });

    if (!grid) return;
    grid.textContent = '';

    if (lista.length === 0) {
      var vazio = el('div', 'state-panel');
      vazio.appendChild(el('h3', '', 'Acervo em preparação'));
      vazio.appendChild(el('p', '', 'As poetisas serão publicadas em breve.'));
      grid.appendChild(vazio);
      return;
    }

    lista.slice(0, 3).forEach(function (p) {
      grid.appendChild(criarCartao(p, abrirBiografia));
    });
  }

  /* ---------------- catálogo (biografias) ---------------- */

  var catalogoEstado = { letra: '', busca: '' };

  function initCatalogo() {
    var grid = $('[data-poetisa-grid]');
    if (!grid) return;

    var filtro = $('[data-letter-filter]');
    var busca = $('[data-poetisa-search]');
    var status = $('[data-catalog-status]');
    var vazio = $('[data-catalog-empty]');
    var todas = Loja.getPoetisas().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'pt-BR');
    });

    /* letras disponíveis */
    var letrasUsadas = {};
    todas.forEach(function (p) {
      var l = (p.name || '').trim()[0];
      if (l) letrasUsadas[normalizar(l).toUpperCase()[0]] = true;
    });

    if (filtro) {
      filtro.textContent = '';

      var btnTodos = document.createElement('button');
      btnTodos.type = 'button';
      btnTodos.textContent = 'Todos';
      btnTodos.setAttribute('data-letter', '');
      btnTodos.setAttribute('aria-pressed', 'true');
      filtro.appendChild(btnTodos);

      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (l) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = l;
        b.setAttribute('data-letter', l);
        b.disabled = !letrasUsadas[l];
        b.setAttribute('aria-pressed', 'false');
        filtro.appendChild(b);
      });

      filtro.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-letter]');
        if (!btn) return;
        catalogoEstado.letra = btn.getAttribute('data-letter');
        $$('button[data-letter]', filtro).forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderCatalogo(todas, grid, status, vazio);
      });
    }

    if (busca) {
      var timer = null;
      busca.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          catalogoEstado.busca = busca.value;
          renderCatalogo(todas, grid, status, vazio);
        }, 250);
      });
    }

    renderCatalogo(todas, grid, status, vazio);
  }

  function renderCatalogo(todas, grid, status, vazio) {
    var filtradas = todas.filter(function (p) {
      var okLetra = !catalogoEstado.letra ||
        normalizar(p.name).charAt(0).toUpperCase() === catalogoEstado.letra;
      var okBusca = !catalogoEstado.busca ||
        normalizar(p.name).indexOf(normalizar(catalogoEstado.busca)) !== -1;
      return okLetra && okBusca;
    });

    grid.textContent = '';

    filtradas.forEach(function (p) {
      grid.appendChild(criarCartao(p, abrirBiografia));
    });

    var semResultado = filtradas.length === 0;
    grid.hidden = semResultado;
    if (vazio) vazio.hidden = !semResultado;

    if (status) {
      if (todas.length === 0) {
        status.textContent = 'Acervo em preparação — nenhuma poetisa cadastrada ainda.';
      } else if (semResultado) {
        status.textContent = 'Nenhuma poetisa encontrada para este filtro.';
      } else {
        status.textContent = 'Exibindo ' + filtradas.length + ' de ' + todas.length +
          (todas.length === 1 ? ' poetisa' : ' poetisas');
      }
    }
  }

  /* ---------------- modal de biografia + capas ---------------- */

  var overlayModal = null;
  var overlayLightbox = null;
  var ultimoFoco = null;

  function initModal() {
    overlayModal = $('[data-modal-overlay]');
    overlayLightbox = $('[data-lightbox]');
    if (!overlayModal) return;

    $('[data-modal-close]').addEventListener('click', fecharBiografia);
    overlayModal.addEventListener('click', function (e) {
      if (e.target === overlayModal) fecharBiografia();
    });

    if (overlayLightbox) {
      $('[data-lightbox-close]').addEventListener('click', fecharLightbox);
      overlayLightbox.addEventListener('click', function (e) {
        if (e.target === overlayLightbox) fecharLightbox();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (overlayLightbox && !overlayLightbox.hidden) fecharLightbox();
      else if (!overlayModal.hidden) fecharBiografia();
    });
  }

  function abrirBiografia(p) {
    if (!overlayModal) return;
    ultimoFoco = document.activeElement;

    $('[data-modal-name]').textContent = p.name;
    var body = $('[data-modal-body]');
    body.textContent = '';

    /* layout biografia */
    var layout = el('div', 'bio-layout');

    var retrato = el('div', 'bio-portrait');
    if (p.photoUrl) {
      var img = document.createElement('img');
      img.src = p.photoUrl;
      img.alt = 'Foto de ' + p.name;
      img.addEventListener('error', function () {
        retrato.replaceChildren(criarFallback(p, 'bio-portrait__fallback'));
      });
      retrato.appendChild(img);
    } else {
      retrato.appendChild(criarFallback(p, 'bio-portrait__fallback'));
    }
    layout.appendChild(retrato);

    var coluna = el('div', 'bio-text');
    if (p.subtitle) coluna.appendChild(el('p', 'bio-subtitle', p.subtitle));
    String(p.bio || 'Biografia em catalogação.').split(/\n{2,}/).forEach(function (par) {
      if (par.trim()) coluna.appendChild(el('p', '', par.trim()));
    });
    layout.appendChild(coluna);
    body.appendChild(layout);

    /* capas e folhetos */
    var works = el('div', 'works');
    var head = el('div', 'works__head');
    head.appendChild(el('h3', '', 'Capas e folhetos'));
    var capas = Array.isArray(p.covers) ? p.covers : [];
    head.appendChild(el('span', 'works__count',
      capas.length + (capas.length === 1 ? ' item' : ' itens')));
    works.appendChild(head);

    if (capas.length === 0) {
      var estado = el('div', 'state-panel');
      estado.appendChild(el('p', '', 'As capas desta poetisa ainda estão em catalogação.'));
      works.appendChild(estado);
    } else {
      var gridCapas = el('div', 'works__grid');
      capas.forEach(function (c) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'work-card';
        card.setAttribute('aria-label', 'Ampliar capa: ' + (c.title || 'Capa'));

        var area = el('div', 'work-card__img');
        var imgC = document.createElement('img');
        imgC.src = c.url;
        imgC.alt = c.title || 'Capa de folheto';
        imgC.loading = 'lazy';
        imgC.addEventListener('error', function () {
          area.textContent = '';
          area.appendChild(el('div', 'poetisa-card__fallback', '?'));
        });
        area.appendChild(imgC);
        card.appendChild(area);
        card.appendChild(el('span', 'work-card__caption', c.title || 'Sem título'));

        card.addEventListener('click', function () {
          abrirLightbox(c);
        });
        gridCapas.appendChild(card);
      });
      works.appendChild(gridCapas);
    }
    body.appendChild(works);

    overlayModal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('[data-modal-close]').focus();
  }

  function fecharBiografia() {
    if (!overlayModal || overlayModal.hidden) return;
    overlayModal.hidden = true;
    if (overlayLightbox) overlayLightbox.hidden = true;
    document.body.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  function abrirLightbox(c) {
    if (!overlayLightbox) return;
    $('[data-lightbox-title]').textContent = c.title || 'Capa';
    var img = $('[data-lightbox-img]');
    img.src = c.url;
    img.alt = c.title || 'Capa de folheto ampliada';
    overlayLightbox.hidden = false;
    $('[data-lightbox-close]').focus();
  }

  function fecharLightbox() {
    if (overlayLightbox) overlayLightbox.hidden = true;
  }

  /* ---------------- comentários ---------------- */

  function initComentarios() {
    var form = $('[data-comment-form]');
    if (!form) return;

    renderComentarios();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = $('[data-comment-error]');
      var nome = form.elements['nome'].value.trim();
      var mensagem = form.elements['mensagem'].value.trim();

      if (!nome || !mensagem) {
        erro.textContent = 'Preencha seu nome e o comentário.';
        return;
      }
      erro.textContent = '';

      Loja.adicionarComentario(nome, mensagem);
      form.reset();

      var ok = $('[data-comment-ok]');
      if (ok) {
        ok.hidden = false;
        ok.className = 'comments__ok';
        ok.textContent = 'Comentário enviado! Ele aparecerá nesta lista depois da moderação.';
      }
    });
  }

  function renderComentarios() {
    var lista = $('[data-comment-list]');
    if (!lista) return;

    var publicados = Loja.comentariosPublicados();
    lista.textContent = '';

    if (publicados.length === 0) {
      lista.appendChild(el('p', 'comments__empty',
        'Nenhum comentário publicado ainda. Seja o primeiro depois da moderação.'));
      return;
    }

    publicados.forEach(function (c) {
      var item = el('article', 'comment');
      var head = el('div', 'comment__head');
      head.appendChild(el('span', 'comment__name', c.nome));
      head.appendChild(el('span', 'comment__date', formatarData(c.data)));
      item.appendChild(head);
      item.appendChild(el('p', 'comment__text', c.mensagem));
      lista.appendChild(item);
    });
  }

  /* ---------------- contato ---------------- */

  function initContato() {
    var form = $('[data-contact-form]');
    if (!form) return;

    var ok = $('[data-contact-ok]');
    var erro = $('[data-contact-error]');
    var CHAVE = 'mpc_contatos';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.elements['nome'].value.trim();
      var email = form.elements['email'].value.trim();
      var mensagem = form.elements['mensagem'].value.trim();

      if (!nome || !email || !mensagem) {
        erro.textContent = 'Preencha nome, e-mail e mensagem.';
        return;
      }
      if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
        erro.textContent = 'Informe um e-mail válido.';
        return;
      }
      erro.textContent = '';

      try {
        var atual = JSON.parse(window.localStorage.getItem(CHAVE) || '[]');
        atual.push({ nome: nome, email: email, mensagem: mensagem, data: new Date().toISOString() });
        window.localStorage.setItem(CHAVE, JSON.stringify(atual));
      } catch (e2) { /* armazenamento indisponível */ }

      form.hidden = true;
      if (ok) ok.hidden = false;
    });

    var reset = $('[data-contact-reset]');
    if (reset) {
      reset.addEventListener('click', function () {
        form.reset();
        form.hidden = false;
        if (ok) ok.hidden = true;
      });
    }
  }

  /* ---------------- início ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initAno();
    initModal();
    initHome();
    initCatalogo();
    initComentarios();
    initContato();
  });
})();
