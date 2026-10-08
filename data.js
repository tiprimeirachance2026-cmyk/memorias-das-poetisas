/* ============================================================
   DATA.JS — Camada de dados do acervo (frontend puro)
   - Seed com as poetisas documentadas (partida do acervo).
   - Persistência local via localStorage (sem backend).
   - O painel admin lê/escreve por aqui; exportar/importar JSON
     permite levar os dados entre navegadores ou para um backend
     futuro sem reescrita.
   ============================================================ */

var Loja = (function () {
  'use strict';

  var CHAVE_POETISAS = 'mpc_poetisas';
  var CHAVE_COMENTARIOS = 'mpc_comentarios';

  var POETISAS_SEED = [
    {
      id: 'antonia-pessoa-magalhaes',
      name: 'Antônia Pessoa Magalhães',
      subtitle: 'Poetisa cordelista',
      summary: 'Cordelista paraibana dedicada à preservação da literatura popular e à expressão feminina no cordel nordestino.',
      bio: 'Antônia Pessoa Magalhães é uma poetisa paraibana que dedica sua arte à preservação da literatura de cordel. Sua obra reflete as vivências do povo nordestino, com especial atenção à condição feminina e às tradições culturais da região.\n\nSeus versos transitam entre o humor, a crítica social e a celebração da cultura popular, mantendo viva a tradição oral que caracteriza o cordel.',
      initials: 'AP',
      photoUrl: '',
      covers: []
    },
    {
      id: 'benedita-silva-de-azevedo',
      name: 'Benedita Silva de Azevedo',
      subtitle: 'Poetisa e educadora',
      summary: 'Educadora e poetisa que utiliza a literatura de cordel como instrumento de transformação social e valorização cultural.',
      bio: 'Benedita Silva de Azevedo é uma poetisa e educadora que encontrou na literatura de cordel um instrumento poderoso de transformação social. Seus folhetos abordam temas como educação, direitos das mulheres e valorização da cultura popular.\n\nCom uma escrita engajada e acessível, Benedita contribui para a democratização do saber através da poesia popular, levando o cordel para escolas e comunidades.',
      initials: 'BS',
      photoUrl: '',
      covers: []
    },
    {
      id: 'clotilde-santa-cruz-tavares',
      name: 'Clotilde Santa Cruz Tavares',
      subtitle: 'Pioneira do cordel feminino',
      summary: 'Uma das pioneiras da literatura de cordel feminina no Nordeste brasileiro, quebrando barreiras em um gênero tradicionalmente masculino.',
      bio: 'Clotilde Santa Cruz Tavares é reconhecida como uma das pioneiras da literatura de cordel feminina no Nordeste brasileiro. Em uma época em que a produção cordelista era predominantemente masculina, Clotilde ousou ocupar esse espaço com talento e determinação.\n\nSua obra abrange temas variados, desde narrativas tradicionais até questões sociais contemporâneas, sempre com a musicalidade e a rima características do cordel.\n\nClotilde é referência para gerações de mulheres cordelistas que vieram depois dela, abrindo caminho para a participação feminina nessa forma de expressão cultural.',
      initials: 'CS',
      photoUrl: '',
      covers: []
    },
    {
      id: 'creusa-meira',
      name: 'Creusa Meira',
      subtitle: 'Poetisa popular',
      summary: 'Poetisa popular nordestina que mantém viva a tradição do cordel através de versos que retratam o cotidiano e as lutas do povo.',
      bio: 'Creusa Meira é uma poetisa popular nordestina cuja obra se destaca pela sensibilidade e pela conexão com as raízes culturais do Nordeste. Seus versos retratam o cotidiano, as lutas e as alegrias do povo, com uma linguagem acessível e profundamente poética.\n\nAtravés de seus folhetos, Creusa contribui para a preservação da memória cultural nordestina e para a valorização da voz feminina na literatura de cordel.',
      initials: 'CM',
      photoUrl: '',
      covers: []
    },
    {
      id: 'dora-ribeiro',
      name: 'Dora Ribeiro',
      subtitle: 'Cordelista e ativista cultural',
      summary: 'Cordelista e ativista cultural que promove a literatura de cordel como patrimônio imaterial brasileiro.',
      bio: 'Dora Ribeiro é cordelista e ativista cultural que dedica sua vida à promoção da literatura de cordel como patrimônio imaterial do Brasil. Seus versos combinam tradição e contemporaneidade, abordando temas atuais com a forma clássica do cordel.\n\nDora é atuante em movimentos culturais e educacionais, levando a arte do cordel para novos públicos e promovendo oficinas e encontros de cordelistas.',
      initials: 'DR',
      photoUrl: '',
      covers: []
    },
    {
      id: 'josenir-amorim-alves-de-lacerda',
      name: 'Josenir Amorim Alves de Lacerda',
      subtitle: 'Poetisa e pesquisadora',
      summary: 'Pesquisadora e poetisa que alia produção acadêmica à arte do cordel, contribuindo para a documentação da tradição cordelista feminina.',
      bio: 'Josenir Amorim Alves de Lacerda é poetisa e pesquisadora da literatura de cordel, dedicando-se tanto à produção poética quanto à documentação e estudo dessa tradição cultural.\n\nSua dupla atuação — como artista e acadêmica — contribui significativamente para a preservação e valorização do cordel feminino, produzindo tanto versos quanto reflexões críticas sobre o papel da mulher nessa manifestação cultural.',
      initials: 'JA',
      photoUrl: '',
      covers: []
    },
    {
      id: 'maria-das-neves-baptista-pimentel',
      name: 'Maria das Neves Baptista Pimentel',
      subtitle: 'Cordelista histórica',
      summary: 'Uma das primeiras mulheres a publicar folhetos de cordel no Brasil, figura fundamental na história da literatura popular.',
      bio: 'Maria das Neves Baptista Pimentel é uma figura histórica da literatura de cordel brasileira, sendo considerada uma das primeiras mulheres a publicar folhetos de cordel no país. Sua produção literária desafiou as convenções de gênero de sua época.\n\nSeus folhetos circularam amplamente pelas feiras e mercados do Nordeste, alcançando grande popularidade e provando que a arte do cordel não era exclusividade masculina.\n\nMaria das Neves é hoje celebrada como um marco na luta pela participação feminina na literatura popular brasileira.',
      initials: 'MN',
      photoUrl: '',
      covers: []
    },
    {
      id: 'salete-maria-da-silva',
      name: 'Salete Maria da Silva',
      subtitle: 'Poetisa e jurista',
      summary: 'Jurista e poetisa que utiliza o cordel como ferramenta de educação jurídica popular e empoderamento feminino.',
      bio: 'Salete Maria da Silva é jurista e poetisa que encontrou no cordel uma forma inovadora de democratizar o conhecimento jurídico. Seus folhetos tratam de direitos humanos, cidadania e empoderamento feminino em linguagem acessível.\n\nSua obra é um exemplo singular de como a literatura popular pode ser instrumento de educação e transformação social, levando informação sobre direitos fundamentais para comunidades que muitas vezes não têm acesso à linguagem jurídica formal.',
      initials: 'SM',
      photoUrl: '',
      covers: []
    }
  ];

  /* ---------------- utilidades ---------------- */

  function ler(chave, padrao) {
    try {
      var bruto = window.localStorage.getItem(chave);
      if (bruto === null) return padrao;
      return JSON.parse(bruto);
    } catch (erro) {
      return padrao;
    }
  }

  function gravar(chave, valor) {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  }

  function slugify(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function iniciaisDe(nome) {
    var partes = String(nome || '').trim().split(/\s+/);
    if (!partes[0]) return '';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  /* Converte link do Google Drive em imagem direta (lh3). */
  function fotoDireta(url) {
    url = String(url || '').trim();
    var m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
    m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m && url.indexOf('drive.google.com') !== -1) {
      return 'https://lh3.googleusercontent.com/d/' + m[1];
    }
    return url;
  }

  function novoId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------- poetisas ---------------- */

  function getPoetisas() {
    var lista = ler(CHAVE_POETISAS, null);
    if (!Array.isArray(lista) || lista.length === 0) {
      return POETISAS_SEED.map(function (p) { return Object.assign({}, p); });
    }
    return lista;
  }

  function setPoetisas(lista) {
    gravar(CHAVE_POETISAS, lista);
  }

  function salvarPoetisa(dados) {
    var lista = getPoetisas();
    var id = dados.id || novoId();
    var registro = {
      id: id,
      name: String(dados.name || '').trim(),
      subtitle: String(dados.subtitle || '').trim(),
      summary: String(dados.summary || '').trim(),
      bio: String(dados.bio || '').trim(),
      initials: String(dados.initials || '').trim().toUpperCase().substring(0, 3) || iniciaisDe(dados.name),
      photoUrl: fotoDireta(dados.photoUrl || ''),
      covers: Array.isArray(dados.covers)
        ? dados.covers
            .filter(function (c) { return c && c.url; })
            .map(function (c) {
              return { url: fotoDireta(c.url), title: String(c.title || '').trim() };
            })
        : []
    };
    if (!registro.name) return null;

    var idx = -1;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) { idx = i; break; }
    }
    if (idx >= 0) lista[idx] = registro;
    else lista.push(registro);

    setPoetisas(lista);
    return registro;
  }

  function excluirPoetisa(id) {
    var lista = getPoetisas().filter(function (p) { return p.id !== id; });
    setPoetisas(lista);
  }

  function resetarPoetisas() {
    window.localStorage.removeItem(CHAVE_POETISAS);
  }

  function getPoetisa(id) {
    var lista = getPoetisas();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) return lista[i];
    }
    return null;
  }

  /* ---------------- comentários ---------------- */

  function getComentarios() {
    var lista = ler(CHAVE_COMENTARIOS, []);
    return Array.isArray(lista) ? lista : [];
  }

  function setComentarios(lista) {
    gravar(CHAVE_COMENTARIOS, lista);
  }

  function adicionarComentario(nome, mensagem) {
    var lista = getComentarios();
    var item = {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nome: String(nome || '').trim(),
      mensagem: String(mensagem || '').trim(),
      data: new Date().toISOString(),
      status: 'pendente'
    };
    if (!item.nome || !item.mensagem) return null;
    lista.push(item);
    setComentarios(lista);
    return item;
  }

  function moderarComentario(id, status) {
    var lista = getComentarios().map(function (c) {
      if (c.id === id) c.status = status;
      return c;
    });
    setComentarios(lista);
  }

  function excluirComentario(id) {
    setComentarios(getComentarios().filter(function (c) { return c.id !== id; }));
  }

  function comentariosPublicados() {
    return getComentarios()
      .filter(function (c) { return c.status === 'publicado'; })
      .sort(function (a, b) { return (b.data || '').localeCompare(a.data || ''); });
  }

  /* ---------------- exportar / importar ---------------- */

  function exportarTudo() {
    return JSON.stringify({
      versao: 1,
      exportadoEm: new Date().toISOString(),
      poetisas: getPoetisas(),
      comentarios: getComentarios()
    }, null, 2);
  }

  function importarTudo(json) {
    var dados = JSON.parse(json);
    if (!dados || !Array.isArray(dados.poetisas)) {
      throw new Error('Arquivo inválido: não contém a lista de poetisas.');
    }
    setPoetisas(dados.poetisas);
    if (Array.isArray(dados.comentarios)) setComentarios(dados.comentarios);
    return dados.poetisas.length;
  }

  return {
    slugify: slugify,
    iniciaisDe: iniciaisDe,
    fotoDireta: fotoDireta,
    getPoetisas: getPoetisas,
    salvarPoetisa: salvarPoetisa,
    excluirPoetisa: excluirPoetisa,
    resetarPoetisas: resetarPoetisas,
    getPoetisa: getPoetisa,
    getComentarios: getComentarios,
    adicionarComentario: adicionarComentario,
    moderarComentario: moderarComentario,
    excluirComentario: excluirComentario,
    comentariosPublicados: comentariosPublicados,
    exportarTudo: exportarTudo,
    importarTudo: importarTudo
  };
})();
