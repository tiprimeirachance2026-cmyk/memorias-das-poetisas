# LEIA-ME — Memórias das Poetisas da Literatura de Cordel

Site estático (HTML + CSS + JS puro) do acervo digital das poetisas da
literatura de cordel brasileira. **Somente frontend visual** — sem backend,
sem dependências externas, sem etapa de build.

## Como abrir

É só abrir o `index.html` no navegador. Para testar com servidor local
(recomendado, evita bloqueios de alguns navegadores):

```bash
python3 -m http.server 8080
# depois acesse http://localhost:8080
```

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Início — hero, destaques, **Comentários** (no lugar das Vozes do Cordel), apoio |
| `sobre.html` | Proposta, metodologia e equipe |
| `biografias.html` | Catálogo: busca + filtro A–Z + modal com biografia e **capas/folhetos** |
| `contato.html` | Informações institucionais + formulário |
| `admin.html` | Painel de edição (senha na linha 1 de `admin.js`) |
| `styles.css` | Todo o visual (identidade "folheto": papel, tinta, anil e sol) |
| `data.js` | Camada de dados: seed + `localStorage` (leitura/gravação) |
| `script.js` | Comportamento do site público |
| `admin.js` | Comportamento do painel |
| `fonts/` | Tipografia **Jackson Xilogravura**, criada por Jackson |
| `logos/`, `elementos/` | Apoiadores e ornamentos |

## Painel adm

- Acesso: `admin.html` — senha padrão **`cordel2026`** (troque na constante
  `SENHA_ADM` na primeira linha do `admin.js`).
- O que dá para fazer: adicionar/editar/excluir **poetisas** (foto, nome,
  biografia, subtítulo, resumo e **capas dos folhetos**), moderar
  **comentários** (publicar/excluir), **exportar/importar** o acervo em
  `.json` e restaurar o acervo original.
- ⚠️ **A senha é apenas um filtro de tela.** Sem backend, qualquer pessoa
  com acesso ao código consegue vê-la. Para um painel realmente protegido é
  preciso um servidor (ver “Evolução futura”).

## Onde ficam os dados

Tudo fica no `localStorage` do navegador de quem edita:

- `mpc_poetisas` — acervo
- `mpc_comentarios` — comentários enviados
- `mpc_contatos` — mensagens do formulário de contato
- `mpc_adm_sessao` — sessão aberta do painel

Por isso: **as alterações feitas num navegador não aparecem em outro**. Para
levar o acervo para outro computador ou publicar, use *Dados → Exportar
acervo* (`.json`) e depois *Importar* no destino.

## Manutenção

1. **Conteúdo** — cadastrar poetisas pelo painel; validar nome, biografia e
   imagens antes de publicar comentários. Não preencher lacunas com suposições.
2. **Backup** — exportar o `.json` do painel a cada rodada de cadastro e
   guardar cópia (pasta institucional/nuvem). Restaurar é importar o arquivo.
3. **Senhas/links** — conferir crédito do rodapé e senha do painel a cada
   semestre.
4. **Imagens** — usar links diretos (Google Drive com compartilhamento
   “qualquer pessoa com o link”); o painel converte automaticamente.
5. **Publicação** — o site são só arquivos: atualizar é substituir a pasta
   na hospedagem. Sem `npm`, sem dependências, sem build para quebrar.
6. **Responsáveis** — definir no departamento quem é dono do domínio, quem
   aprova comentários e quem guarda o backup.

## Quanto custa o domínio

Valores de referência consultados em outubro/2026 (confirmar no ato):

| Opção | Custo | Observação |
|---|---|---|
| **`.com.br` (Registro.br)** | **R$ 40,00/ano** — fixo, registro e renovação | Menor preço do mercado; 5 anos avulsos saem por R$ 174 (~R$ 34,80/ano) |
| `.com.br` em revendedores | R$ 36 a R$ 70/ano | Atenção ao preço de renovação depois do 1º ano |
| `.com` internacional | ~US$ 10 a 15/ano (~R$ 55 a 80) | 1º ano costuma ter promoção (~US$ 5–10); renovação é mais cara |

- **Hospedagem**: site estático cabe em qualquer plano gratuito
  (GitHub Pages, Netlify, Vercel Hobby) ou na hospedagem institucional da UFPB.
- **Banco de dados**: não existe hoje — R$ 0. Se um backend for adicionado
  depois, opções gratuitas cobrem com folga este volume.
- Recomendação: registrar em **conta institucional**, com renovação
  automática e e-mail da instituição no cadastro.

## Evolução futura (quando sair do “somente visual”)

O código já está preparado: `data.js` é a única porta de entrada/saída de
dados. Basta trocar as funções da `Loja` por chamadas a uma API
(Firebase, Supabase, PHP etc.) — as páginas não precisam mudar. Nesse momento
também entram: autenticação real do painel, envio de e-mail do contato e
moderação de comentários com servidor.

## Requisitos atendidos (verificados)

- [x] Projeto novo em `memorias-das-poetisas/` — o antigo (`ufpb-main`) não foi tocado.
- [x] Identidade **diferente** da antiga (folheto: papel/tinta/anil/sol, sombras sólidas, sem glass).
- [x] Tipografia **Jackson Xilogravura** carregada em todas as páginas.
- [x] 5 páginas + painel, todas sem erros de console (teste automatizado).
- [x] Comentários: envio → `pendente` → moderação → publicação no site (fluxo testado).
- [x] CRUD de poetisas com iniciais automáticas, foto e capas (criar/editar/excluir testado).
- [x] Busca, filtro A–Z, modal de biografia com capas e lightbox.
- [x] Apoio na ordem **CNPq, DCI, PPGCI, ACVPB**.
- [x] Créditos no rodapé: apenas Samuel Lucas, Miguel Fernandes e Jackson.
- [x] Exportar/importar/restaurar `.json` funcionando.
- [x] Nenhuma informação pessoal sensível (CPF, e-mails) no conteúdo do site.
- [x] `LEIA-ME.md` com manutenção e custo de domínio.

## Créditos

- **Samuel Lucas** — desenvolvimento — <https://portsamuellmsa.vercel.app/>
- **Miguel Fernandes** — desenvolvimento — <https://miguel-fernandes-portfolio.vercel.app/>
- **Jackson** — design, ilustração e tipografia (fonte *Jackson Xilogravura*)
