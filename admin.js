/* ============================================================
   ADMIN.JS — painel de edição (frontend puro)
   - Senha local: apenas filtro de tela (sem backend / sem
     segurança real — ver LEIA-ME.md).
   - CRUD de poetisas e capas + moderação de comentários +
     exportar/importar JSON, tudo via Loja (data.js).
   ============================================================ */

(function () {
  'use strict';

  var SENHA_ADM = 'cordel2026'; // senha do painel (trocar aqui)
  var CHAVE_SESSAO = 'mpc_adm_sessao';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function el(tag, classe, texto) {
    var node = document.createElement(tag);
    if (classe) node.className = classe;
    if (texto !== undefined) node.textContent = texto;
    return node;
  }

  /* ---------------- toast ---------------- */

  var toastTimer = null;
  function toast(msg, erro) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast' + (erro ? ' error' : '');
    requestAnimationFrame(function () { t.classList.add('visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('visible'); }, 3200);
  }

  /* ---------------- login ---------------- */

  function sessaoAtiva() {
    return window.sessionStorage.getItem(CHAVE_SESSAO) === 'ok';
  }

  function initLogin() {
    var form = $('[data-login-form]');
    var screen = $('[data-login-screen]');
    var app = $('[data-admin-app]');

    function mostrarApp() {
      screen.hidden = true;
      app.hidden = false;
      atualizarTudo();
    }

    function mostrarLogin() {
      screen.hidden = false;
      app.hidden = true;
    }

    if (sessaoAtiva()) mostrarApp();
    else mostrarLogin();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valor = $('#adm-senha').value;
      var erro = $('[data-login-error]');
      if (valor === SENHA_ADM) {
        erro.textContent = '';
        form.reset();
        window.sessionStorage.setItem(CHAVE_SESSAO, 'ok');
        mostrarApp();
      } else {
        erro.textContent = 'Senha incorreta.';
      }
    });

    $('[data-logout]').addEventListener('click', function () {
      window.sessionStorage.removeItem(CHAVE_SESSAO);
      mostrarLogin();
    });
  }

  /* ---------------- navegação de seções ---------------- */

  var TITULOS = {
    poetisas: 'Todas as poetisas',
    comentarios: 'Comentários',
    dados: 'Dados do acervo'
  };

  function initNavegacao() {
    $$('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var alvo = btn.getAttribute('data-nav');
        $$('[data-nav]').forEach(function (b) {
          b.setAttribute('aria-current', b === btn ? 'true' : 'false');
        });
        $$('[data-section]').forEach(function (s) {
          s.hidden = s.getAttribute('data-section') !== alvo;
        });
        $('[data-admin-title]').textContent = TITULOS[alvo] || 'Painel';
        $('[data-new-poetisa]').hidden = alvo !== 'poetisas';
        if (alvo !== 'poetisas') fecharForm();
      });
    });
  }

  /* ---------------- estatísticas / badges ---------------- */

  function atualizarContadores() {
    var poetisas = Loja.getPoetisas();
    var comentarios = Loja.getComentarios();
    var pendentes = comentarios.filter(function (c) { return c.status === 'pendente'; }).length;
    var publicados = comentarios.length - pendentes;

    var set = function (sel, valor) {
      var n = $(sel);
      if (n) n.textContent = String(valor);
    };

    set('[data-stat-poetisas]', poetisas.length);
    set('[data-stat-com-foto]', poetisas.filter(function (p) { return p.photoUrl; }).length);
    set('[data-stat-capas]', poetisas.reduce(function (s, p) {
      return s + (Array.isArray(p.covers) ? p.covers.length : 0);
    }, 0));
    set('[data-stat-pendentes]', pendentes);
    set('[data-stat-publicados]', publicados);

    var bP = $('[data-badge-poetisas]');
    if (bP) bP.textContent = String(poetisas.length);
    var bC = $('[data-badge-comentarios]');
    if (bC) {
      bC.hidden = pendentes === 0;
      bC.textContent = String(pendentes);
    }
  }

  /* ---------------- lista de poetisas ---------------- */

  function renderListaPoetisas() {
    var lista = $('[data-poetisa-list]');
    var vazio = $('[data-poetisa-empty]');
    if (!lista) return;

    var poetisas = Loja.getPoetisas().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'pt-BR');
    });

    lista.textContent = '';
    vazio.hidden = poetisas.length > 0;

    poetisas.forEach(function (p) {
      var item = el('div', 'admin-item');

      var thumb = el('div', 'admin-item__thumb');
      if (p.photoUrl) {
        var img = document.createElement('img');
        img.src = p.photoUrl;
        img.alt = '';
        img.addEventListener('error', function () {
          thumb.replaceChildren(document.createTextNode(p.initials || '—'));
        });
        thumb.appendChild(img);
      } else {
        thumb.textContent = p.initials || '—';
      }
      item.appendChild(thumb);

      var body = el('div', 'admin-item__body');
      body.appendChild(el('strong', '', p.name));
      var detalhes = p.subtitle ? p.subtitle + ' · ' : '';
      detalhes += (Array.isArray(p.covers) ? p.covers.length : 0) + ' capa(s)';
      body.appendChild(el('span', '', detalhes));
      item.appendChild(body);

      var acoes = el('div', 'admin-item__actions');

      var btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'btn-sm btn-sm--edit';
      btnEdit.textContent = 'Editar';
      btnEdit.addEventListener('click', function () { abrirForm(p.id); });
      acoes.appendChild(btnEdit);

      var btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn-sm btn-sm--danger';
      btnDel.textContent = 'Excluir';
      btnDel.addEventListener('click', function () {
        if (window.confirm('Excluir "' + p.name + '" do acervo? Essa ação não pode ser desfeita.')) {
          Loja.excluirPoetisa(p.id);
          toast('Poetisa excluída.');
          atualizarTudo();
        }
      });
      acoes.appendChild(btnDel);

      item.appendChild(acoes);
      lista.appendChild(item);
    });
  }

  /* ---------------- formulário de poetisa ---------------- */

  var editandoId = null;
  var fotoManual = false; // iniciais editadas manualmente

  function initFormulario() {
    var form = $('[data-poetisa-form]');
    if (!form) return;

    $('[data-new-poetisa]').addEventListener('click', function () { abrirForm(null); });
    $('[data-cancel-form]').addEventListener('click', fecharForm);

    /* iniciais automáticas */
    var nomeInput = $('[data-field="name"]');
    var initialsInput = $('[data-field="initials"]');
    var badge = $('[data-initials-badge]');

    function atualizarIniciais() {
      var valor = initialsInput.value.trim().toUpperCase();
      badge.textContent = valor || '—';
    }

    nomeInput.addEventListener('input', function () {
      if (!fotoManual) {
        initialsInput.value = Loja.iniciaisDe(nomeInput.value);
      }
      atualizarIniciais();
    });
    initialsInput.addEventListener('input', function () {
      fotoManual = true;
      atualizarIniciais();
    });

    /* abas de foto */
    $$('[data-photo-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var tipo = tab.getAttribute('data-photo-tab');
        $$('[data-photo-tab]').forEach(function (t) {
          t.setAttribute('aria-pressed', t === tab ? 'true' : 'false');
        });
        $$('[data-photo-panel]').forEach(function (p) {
          p.hidden = p.getAttribute('data-photo-panel') !== tipo;
        });
      });
    });

    /* preview da foto */
    var urlInput = $('[data-field="photoUrl"]');
    var preview = $('[data-photo-preview]');
    var previewImg = $('[data-photo-preview-img]');
    urlInput.addEventListener('input', function () {
      var url = Loja.fotoDireta(urlInput.value);
      if (url && url.indexOf('http') === 0) {
        previewImg.src = url;
        preview.classList.add('visible');
      } else {
        preview.classList.remove('visible');
      }
    });
    previewImg.addEventListener('error', function () {
      preview.classList.remove('visible');
    });

    /* capas */
    $('[data-add-cover]').addEventListener('click', function () {
      adicionarLinhaCapa({ url: '', title: '' });
    });

    /* salvar */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      salvar();
    });
  }

  function abrirForm(id) {
    var form = $('[data-poetisa-form]');
    editandoId = id || null;
    fotoManual = false;

    form.reset();
    $('[data-photo-preview]').classList.remove('visible');
    $('[data-covers-editor]').textContent = '';

    if (id) {
      var p = Loja.getPoetisa(id);
      if (!p) return;
      $('[data-form-title]').textContent = 'Editar poetisa';
      $('[data-field="name"]').value = p.name || '';
      $('[data-field="initials"]').value = p.initials || '';
      $('[data-field="subtitle"]').value = p.subtitle || '';
      $('[data-field="summary"]').value = p.summary || '';
      $('[data-field="bio"]').value = p.bio || '';
      $('[data-field="photoUrl"]').value = p.photoUrl || '';
      $('[data-initials-badge]').textContent = p.initials || '—';

      if (p.photoUrl) {
        ativarAbaFoto('url');
        $('[data-photo-preview-img]').src = p.photoUrl;
        $('[data-photo-preview]').classList.add('visible');
      } else {
        ativarAbaFoto('none');
      }

      (p.covers || []).forEach(function (c) { adicionarLinhaCapa(c); });
    } else {
      $('[data-form-title]').textContent = 'Nova poetisa';
      $('[data-initials-badge]').textContent = '—';
      ativarAbaFoto('url');
    }

    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('[data-field="name"]').focus();
  }

  function fecharForm() {
    var form = $('[data-poetisa-form]');
    if (!form || form.hidden) return;
    form.hidden = true;
    editandoId = null;
  }

  function ativarAbaFoto(tipo) {
    $$('[data-photo-tab]').forEach(function (t) {
      t.setAttribute('aria-pressed', t.getAttribute('data-photo-tab') === tipo ? 'true' : 'false');
    });
    $$('[data-photo-panel]').forEach(function (p) {
      p.hidden = p.getAttribute('data-photo-panel') !== tipo;
    });
  }

  function adicionarLinhaCapa(dados) {
    var editor = $('[data-covers-editor]');
    var row = el('div', 'cover-row');

    var img = document.createElement('img');
    img.alt = '';
    if (dados.url) {
      img.src = Loja.fotoDireta(dados.url);
    } else {
      img.style.visibility = 'hidden';
    }
    row.appendChild(img);

    var campos = el('div');
    var inputUrl = document.createElement('input');
    inputUrl.type = 'url';
    inputUrl.placeholder = 'Link da capa (aceita Google Drive)';
    inputUrl.value = dados.url || '';
    inputUrl.setAttribute('aria-label', 'Link da capa');

    var inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.placeholder = 'Título / legenda do folheto';
    inputTitulo.value = dados.title || '';
    inputTitulo.setAttribute('aria-label', 'Título da capa');

    inputUrl.addEventListener('input', function () {
      var url = Loja.fotoDireta(inputUrl.value);
      if (url && url.indexOf('http') === 0) {
        img.src = url;
        img.style.visibility = 'visible';
      } else {
        img.style.visibility = 'hidden';
        img.removeAttribute('src');
      }
    });
    img.addEventListener('error', function () {
      img.style.visibility = 'hidden';
    });

    campos.appendChild(inputUrl);
    campos.appendChild(inputTitulo);
    row.appendChild(campos);

    var btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-sm btn-sm--danger';
    btnRemove.textContent = 'Remover';
    btnRemove.addEventListener('click', function () { row.remove(); });
    row.appendChild(btnRemove);

    editor.appendChild(row);
    return row;
  }

  function coletarCapas() {
    return $$('[data-covers-editor] .cover-row').map(function (row) {
      var inputs = $$('input', row);
      return { url: inputs[0].value.trim(), title: inputs[1].value.trim() };
    }).filter(function (c) { return c.url; });
  }

  function salvar() {
    var form = $('[data-poetisa-form]');
    var nome = $('[data-field="name"]').value.trim();
    if (!nome) {
      toast('Informe o nome da poetisa.', true);
      $('[data-field="name"]').focus();
      return;
    }

    var abaAtiva = $('[data-photo-tab][aria-pressed="true"]');
    var tipoFoto = abaAtiva ? abaAtiva.getAttribute('data-photo-tab') : 'url';

    var dados = {
      id: editandoId || undefined,
      name: nome,
      initials: $('[data-field="initials"]').value,
      subtitle: $('[data-field="subtitle"]').value,
      summary: $('[data-field="summary"]').value,
      bio: $('[data-field="bio"]').value,
      photoUrl: tipoFoto === 'url' ? $('[data-field="photoUrl"]').value : '',
      covers: coletarCapas()
    };

    var salvo = Loja.salvarPoetisa(dados);
    if (!salvo) {
      toast('Não foi possível salvar.', true);
      return;
    }

    toast(editandoId ? 'Poetisa atualizada!' : 'Poetisa adicionada ao acervo!');
    form.reset();
    fecharForm();
    atualizarTudo();
  }

  /* ---------------- comentários ---------------- */

  function renderComentarios() {
    var pend = $('[data-comments-pendentes]');
    var pub = $('[data-comments-publicados]');
    if (!pend || !pub) return;

    var todos = Loja.getComentarios();
    var pendentes = todos.filter(function (c) { return c.status === 'pendente'; });
    var publicados = todos.filter(function (c) { return c.status === 'publicado'; });

    $('[data-comments-pendentes-empty]').hidden = pendentes.length > 0;
    $('[data-comments-publicados-empty]').hidden = publicados.length > 0;

    pend.textContent = '';
    pendentes.forEach(function (c) { pend.appendChild(cartaoComentario(c, true)); });

    pub.textContent = '';
    publicados.forEach(function (c) { pub.appendChild(cartaoComentario(c, false)); });
  }

  function cartaoComentario(c, pendente) {
    var item = el('div', 'admin-item');
    var body = el('div', 'admin-item__body');
    body.appendChild(el('strong', '', c.nome));
    body.appendChild(el('span', '', c.mensagem));
    item.appendChild(body);

    var acoes = el('div', 'admin-item__actions');

    if (pendente) {
      var ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'btn-sm btn-sm--ok';
      ok.textContent = 'Publicar';
      ok.addEventListener('click', function () {
        Loja.moderarComentario(c.id, 'publicado');
        toast('Comentário publicado no site.');
        atualizarTudo();
      });
      acoes.appendChild(ok);
    }

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-sm btn-sm--danger';
    del.textContent = 'Excluir';
    del.addEventListener('click', function () {
      if (window.confirm('Excluir o comentário de "' + c.nome + '"?')) {
        Loja.excluirComentario(c.id);
        toast('Comentário excluído.');
        atualizarTudo();
      }
    });
    acoes.appendChild(del);

    item.appendChild(acoes);
    return item;
  }

  /* ---------------- dados: exportar / importar / restaurar ---------------- */

  function initDados() {
    var btnExport = $('[data-export]');
    var inputImport = $('[data-import]');
    var btnReset = $('[data-reset]');

    if (btnExport) {
      btnExport.addEventListener('click', function () {
        var blob = new Blob([Loja.exportarTudo()], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'acervo-poetisas-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast('Arquivo .json baixado.');
      });
    }

    if (inputImport) {
      inputImport.addEventListener('change', function () {
        var arquivo = inputImport.files && inputImport.files[0];
        if (!arquivo) return;
        var leitor = new FileReader();
        leitor.onload = function () {
          try {
            var qtd = Loja.importarTudo(String(leitor.result));
            toast(qtd + ' poetisa(s) importada(s)!');
            atualizarTudo();
          } catch (e) {
            toast('Arquivo inválido: ' + e.message, true);
          }
          inputImport.value = '';
        };
        leitor.readAsText(arquivo);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (window.confirm('Restaurar o acervo original? Os dados deste navegador serão substituídos.')) {
          Loja.resetarPoetisas();
          toast('Acervo restaurado.');
          atualizarTudo();
        }
      });
    }
  }

  /* ---------------- atualização geral ---------------- */

  function atualizarTudo() {
    atualizarContadores();
    renderListaPoetisas();
    renderComentarios();
  }

  /* ---------------- início ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    initNavegacao();
    initFormulario();
    initDados();
    initLogin();
  });
})();
