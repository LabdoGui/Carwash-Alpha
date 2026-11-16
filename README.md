# Carwash

**Qualidade e Brilho Impecável para o seu Veículo**

Site e aplicativo Android (PWA) para agendar lavagem de carros e motos nas unidades FMU de São Paulo.
Trabalho escolar feito com HTML, CSS e JavaScript puro: sem frameworks, sem servidor próprio e sem custo.

## Ver o site

- **Site:** https://rococo-licorice-04fdcc.netlify.app
- **Código-fonte comentado:** https://rococo-licorice-04fdcc.netlify.app/codigo-fonte.html (também há um link no rodapé da tela de login).
- **Apresentação com todas as telas:** [docs/Carwash_Prototipo_Site_e_App.pdf](docs/Carwash_Prototipo_Site_e_App.pdf)

## O que o app faz

| Área | Funções |
|---|---|
| Cliente | Cadastro com nome social e aceite das regras de uso, veículos com placa Mercosul, agendamento (serviço, unidade no mapa ou na lista, dia e horário), "Nossas unidades" com mapa, fotos da região, tour 360° e "Como chegar", preferência de colaborador, pagamento por Pix ou no local, comprovante em PDF, "Meus agendamentos" com status ao vivo, cancelar, reagendar, estorno, reclamação e Fale conosco |
| Colaborador | Entra escolhendo o nome, busca a lavagem pelo código e atualiza o andamento (Iniciando, Em Lavagem, Com Problema, Concluído) |
| Administrador | Indicadores do dia, pátio em tempo real, agendamentos, clientes, colaboradores, solicitações, lucros e agendamentos por unidade, problemas por mês e por unidade, formas de pagamento e exportação para Excel (.xlsx) |

## Senhas de demonstração

| Acesso | Senha |
|---|---|
| Administrador | `Admin@2026` |
| Colaboradores | nome + `@2026` (ex.: `Eziel@2026`, `Guilherme@2026`, `Murilo@2026`, `Eduarda@2026`, `Lucas@2026`) |

No painel admin, o botão "Carregar dados de demonstração" preenche o sistema com clientes e agendamentos de exemplo.

## Estrutura

```
index.html            estrutura da página (carrega o CSS e os scripts)
codigo-fonte.html     mapa do código, com visualizador de cada arquivo
manifest.webmanifest  app instalável no Android
sw.js                 service worker (funciona sem internet)
css/estilo.css        todo o visual (modo claro e escuro)
js/                   programação, um arquivo por assunto
  config.js           serviços, preços, unidades (endereço, mapa, fotos, 360°), horários, colaboradores, senhas e chave Pix
  banco-local.js      dados guardados no navegador (localStorage)
  regras-de-negocio.js, telas-cliente.js, tela-colaborador.js,
  telas-unidades.js   escolha do local, "Nossas unidades" e página de cada unidade
  mapa-e-tour360.js   mapa (Leaflet + OpenStreetMap) e tour 360° (Pannellum)
  painel-admin.js, painel-admin-telas.js, exportar-excel.js,
  pix.js, comprovante-pdf.js, eventos.js, navegacao.js, app.js ...
img/ icons/ logo/     logotipo e ícones
docs/                 apresentação em PDF
LEIA-ME.txt           explicação completa da estrutura
```

## Observações

- Os dados ficam no navegador de cada aparelho (localStorage). Para compartilhar entre celulares, o próximo passo é um banco de dados gratuito (ex.: Supabase).
- O Pix está em modo demonstração (chave fictícia). Para usar uma chave real, edite `PIX_KEY`, `PIX_NAME` e `PIX_CITY` em `js/config.js`.
- **Unidades:** endereço, posição no mapa, fotos e foto 360° de cada unidade ficam em `UNIT_INFO`, em `js/config.js`. Sem fotos próprias, o app mostra fotos de lugares conhecidos perto da unidade (Wikipédia/Wikimedia Commons); sem foto 360°, o tour usa o Google Street View do endereço. O mapa, as fotos e o tour precisam de internet; sem conexão, o app mostra um aviso e o resto continua funcionando.
- O QR Code usa a biblioteca de código aberto de Kazuhiko Arase (licença MIT). O mapa usa a biblioteca Leaflet com o mapa público do OpenStreetMap, e o tour 360° usa o Pannellum; as duas são carregadas da internet só quando a tela de locais abre. Todo o resto foi escrito para o projeto.
