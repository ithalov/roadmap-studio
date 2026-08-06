# Roadmap Studio

Roadmap Studio e um aplicativo desktop local-first para organizar roadmaps, fases, tarefas e subtarefas. O produto usa React, TypeScript estrito, Tauri 2 e SQLite para manter os dados no dispositivo e preparar futuras funcoes de sincronizacao.

## Principais recursos

- Dashboard com progresso, tarefas pendentes, atividade recente, produtividade, metas e modulos configuraveis.
- Projetos com categorias, status, favoritos, progresso automatico, arquivamento e lixeira.
- Editor visual de fases e tarefas com Kanban, filtros, prioridades e arrastar e soltar.
- Importacao de roadmaps em JSON.
- Wallpaper premium e sistema de badges configuraveis.
- Atualizacao automatica por GitHub Releases.

## Arquitetura

```text
src/
  app/                 Roteamento, providers e cache global
  components/          Componentes de interface reutilizaveis
  database/            Conexao SQLite, migracoes, repositorios e seed
  features/            Modulos de dominio (roadmaps, tarefas, fases, dashboard)
  pages/               Telas conectadas ao roteamento
  services/            Inicializacao e servicos de aplicacao
  styles/              Estilos globais
src-tauri/             Aplicativo nativo, plugins e configuracao do bundle
```

Os componentes React nao executam SQL diretamente. Toda persistencia passa por repositories, que validam entradas com Zod e registram alteracoes locais para futuras sincronizacoes.

## Dados e migracoes

O banco e SQLite, aberto pelo plugin oficial do Tauri. Na inicializacao, `DatabaseBootstrapService` executa todas as migracoes antes de renderizar a interface. Isso impede que a aplicacao consulte colunas que ainda nao existem.

As tabelas principais sao `roadmaps`, `phases`, `tasks`, `subtasks`, `tags`, `history`, `settings` e `kanban_settings`. As preferencias de wallpaper e badges ficam em `settings`.

## Desenvolvimento local

```powershell
npm install
npm run tauri:dev
```

Para validar a aplicacao:

```powershell
npm test
npm run build
cargo check --manifest-path src-tauri\Cargo.toml
```

Para gerar o instalador MSI local:

```powershell
npm run tauri:build
```

O MSI fica em `src-tauri/target/release/bundle/msi/`.

## Release e atualizacao automatica

Uma tag no formato `vX.Y.Z` dispara `.github/workflows/release.yml`. O workflow gera o MSI, assina o artefato do updater, publica a GitHub Release e atualiza `latest.json`.

Segredos exigidos no repositorio:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` somente se a chave possuir senha

O aplicativo consulta o manifesto publico da ultima release e mostra o aviso de atualizacao quando ha uma versao mais nova.

## Convencoes

- TypeScript estrito, sem `any`.
- Validacao com Zod antes de persistir.
- Alteracoes de entidades marcam `sync_status` como `pending`.
- Novas alteracoes de banco exigem uma migration incremental e segura para bases existentes.
- Antes de publicar uma versao, executar testes, build e `cargo check`.
