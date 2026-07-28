# FinApp — guia de lançamento

App de finanças pessoais (frontend pronto) + contas e dados na nuvem via **Supabase**.

- **Sem configurar nada:** o app já funciona, salvando **só no aparelho** (localStorage).
- **Configurando o Supabase:** vira **multiusuário** — cada pessoa cria conta, faz login e vê os próprios dados em qualquer aparelho.

## Arquivos
- `index.html` — o app completo (interface, telas, assistente Fin).
- `config.js` — onde você cola a URL e a chave pública do Supabase.
- `cloud.js` — login + sincronização (não precisa mexer).
- `supabase-schema.sql` — cria a tabela e a segurança por usuário.

## Passo a passo (uma vez)

### 1. Criar o projeto no Supabase (grátis)
1. Entre em https://supabase.com → **New project**.
2. Guarde a senha do banco (não vai neste código).
3. Em **Project Settings → API**, copie:
   - **Project URL** (ex: `https://xxxx.supabase.co`)
   - **anon public** key (essa pode ficar no frontend; **não** use a `service_role`).

### 2. Criar a tabela
No painel: **SQL Editor → New query** → cole o conteúdo de `supabase-schema.sql` → **Run**.

### 3. Ligar o app ao Supabase
Abra `config.js` e preencha:
```js
window.FINAPP_CONFIG = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi...'   // anon public
};
```
Pronto — ao abrir o app, ele passa a exigir **login/cadastro** e sincroniza na nuvem.

> Dica: em **Authentication → Providers → Email**, você pode desligar "Confirm email" durante os testes pra entrar na hora. Reative antes de abrir pro público.

### 4. Publicar na internet (escolha uma)
É um site estático (HTML/JS), então é simples:
- **Netlify** ou **Vercel:** arraste a pasta `FinApp` em https://app.netlify.com/drop (ou `vercel` na pasta). Sai um link público na hora.
- Depois dá pra apontar um **domínio próprio** (ex: `finapp.com.br`).

Em produção, no Supabase, adicione a URL do site em **Authentication → URL Configuration**.

## Testar localmente
Precisa servir por http (não abrir o arquivo direto), por causa do login:
```bash
npx serve .
```
Abra o endereço que aparecer (ex: http://localhost:3000).

## Próximos passos recomendados
- **Segurança/LGPD:** dado financeiro é sensível — deixe "Confirm email" ligado, use senhas fortes e, se crescer, políticas de retenção/exclusão.
- **Evoluir o modelo de dados:** hoje o estado é salvo como um JSON por usuário (simples e rápido). Se precisar de relatórios no servidor, migrar para tabelas normalizadas (transações, cartões, metas…).
- **Fonte:** a Onest (embutida) é a alternativa livre à TT Norms Pro. Com a licença da TT Norms Pro, dá pra trocar pelo arquivo oficial.
