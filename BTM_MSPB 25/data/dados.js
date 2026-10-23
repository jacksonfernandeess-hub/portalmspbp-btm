/* DADOS DA APRESENTAÇÃO — edite aqui e a apresentação se atualiza.
   Regra: valor null = o item não aparece na tela.
   "confirmar: true" = dado com fonte, mas que precisa de confirmação oficial antes do BTM. */
window.DADOS = {
  indicadores: [
    { valor: 3,     formato: 'ordinal', rotulo: 'maior destino turístico da Bahia', fonte: 'Material ACEC (apresentação original)', confirmar: true },
    { valor: 26,    formato: 'inteiro', rotulo: 'ilhas formam o arquipélago', fonte: 'Prefeitura de Cairu / imprensa', confirmar: false },
    { valor: null,  formato: 'mil',     rotulo: 'visitantes por ano', fonte: 'Divergente: material ACEC (500 mil), Prefeitura (mais de 600 mil), prefeito (cerca de 800 mil). Preencher com o número oficial.', confirmar: true },
    { valor: 18,    formato: 'pct',     rotulo: 'dos visitantes vêm do exterior', fonte: 'Prefeitura de Cairu, dados 2026 (82% brasileiros), via A Tarde', confirmar: false },
    { valor: 300,   formato: 'inteiro', rotulo: 'meios de hospedagem', fonte: 'Material ACEC (apresentação original)', confirmar: true },
    { valor: 12,    formato: 'mil',     rotulo: 'leitos em todo o arquipélago', fonte: 'Material ACEC (apresentação original)', confirmar: true },
    { valor: 326,   formato: 'inteiro', rotulo: 'bares e restaurantes', fonte: 'Material ACEC (apresentação original)', confirmar: true }
  ],
  acesso: [
    { modal: 'Aéreo', cor: 'var(--sol)', minutos: 30, rotulo: 'menos de 30 min', fonte: 'A Tarde, citando ANAC (rota mais rápida do Brasil)', confirmar: true },
    { modal: 'Catamarã · Morro', minutos: 150, rotulo: 'cerca de 2h30', fonte: 'Imprensa/guias de viagem', confirmar: true, cor: 'var(--teal)' },
    { modal: 'Lancha direta · Boipeba', minutos: 135, rotulo: '2h a 2h30', fonte: 'A Tarde (Issa a Bordo), Correio, Travel.com.br: lancha de 40 pés, até 60 passageiros, Terminal Marítimo de Salvador → Boipeba, operação autorizada pela Agerba desde o fim de 2024', confirmar: true, cor: 'var(--teal)' },
    { modal: 'Semiterrestre', cor: 'var(--coral)', minutos: 210, rotulo: 'cerca de 3h30', fonte: 'Imprensa/guias de viagem', confirmar: true }
  ],
  idade: [
    { faixa: 'Menos de 18', pct: 8.3 }, { faixa: '18 a 22', pct: 6.4 }, { faixa: '23 a 30', pct: 21.7, central: true },
    { faixa: '31 a 40', pct: 24.9, central: true }, { faixa: '41 a 50', pct: 17.5, central: true },
    { faixa: '51 a 60', pct: 12.8 }, { faixa: '60 ou mais', pct: 8.3 }
  ],
  premios: [
    { titulo: 'Travelers’ Choice 2022', subtitulo: 'Melhores praias do mundo · Tripadvisor', destaque: 4,
      lista: ['Grace Bay · Turks e Caicos', 'Varadero · Cuba', 'Turquoise Bay · Austrália', 'Quarta Praia · Morro de São Paulo', 'Eagle Beach · Aruba',
              'Radhanagar · Índia', 'Baía do Sancho · Fernando de Noronha', 'Trunk Bay · Ilhas Virgens', 'Baía dos Golfinhos · Pipa', 'Isola dei Conigli · Itália'] },
    { titulo: 'Travelers’ Choice 2023', subtitulo: 'Melhores praias da América do Sul · Tripadvisor', destaque: 3,
      lista: ['Baía do Sancho · Fernando de Noronha', 'Ipanema · Rio de Janeiro', 'Quarta Praia · Morro de São Paulo', 'Baía dos Golfinhos · Pipa', 'Praia da Pitinga · Arraial d’Ajuda',
              'El Doradillo · Argentina', 'Galápagos · Equador', 'Genipabu · Extremoz', 'Geribá · Búzios', 'San Luis · Colômbia'] }
  ],
  /* GÊNERO (slide 07) — pesquisa original */
  genero: { mulheres: 56, homens: 44, rodape: 'Gênero e faixa etária: pesquisa de perfil do visitante  ·  Exterior: Prefeitura de Cairu, 2026' },
  /* ORIGEM DOS VISITANTES (slide 05) — percentuais da pesquisa original; não alterar sem fonte.
     A barra de cada estado é proporcional ao maior valor. */
  origem: {
    estados: [
      { uf: 'BA', nome: 'Bahia', pct: 23.80 },
      { uf: 'SP', nome: 'São Paulo', pct: 14.87 },
      { uf: 'MG', nome: 'Minas Gerais', pct: 9.74 },
      { uf: 'RJ', nome: 'Rio de Janeiro', pct: 7.44 },
      { uf: 'RS', nome: 'Rio Grande do Sul', pct: 6.26 },
      { uf: 'DF', nome: 'Distrito Federal', pct: 4.98 }
    ],
    exterior: { pct: 18, fonte: 'Prefeitura de Cairu, dados 2026 (via A Tarde)' },
    rodape: 'Estados: pesquisa de perfil do visitante  ·  Exterior: Prefeitura de Cairu, 2026  ·  Contorno do mapa simplificado'
  },
  palestrantes: [
    { nome: ['Jackson', 'Fernandes'], cargos: ['Presidente da ACEC', 'Vice-presidente do<br>COMTUR Cairu', 'Empresário de Turismo<br>e Hospitalidade'] },
    { nome: ['Alexandre', 'Pereira'], cargos: ['CEO da IBDTUR', 'Ex-secretário de Turismo<br>de Fortaleza', 'Ex-presidente<br>da ANSEDITUR'] }
  ]
};
