# FinApp — estado do projeto (retomada rápida)

> Ponto de retomada pra qualquer conversa nova. Leia isto + os arquivos da pasta.

## O que é
App web de finanças pessoais (mobile-first, claro/escuro), com onboarding, cartões,
gastos/entradas, metas, grupos (split), calendário, relatório anual com gráficos em
motion, assistente "Fin" (perguntas em linguagem natural que calculam nos dados),
salvamento automático e **contas na nuvem via Supabase** (multiusuário).

## Arquivos (pasta C:\Users\alves\FinApp)
- `index.html` — o app inteiro (HTML/CSS/JS puro, sem framework). Frontend + PWA.
- `config.js` — chaves do Supabase (URL + anon key JÁ preenchidas).
- `cloud.js` — login (email/senha) + sincronização por usuário.
- `sw.js` + `manifest.webmanifest` + `icon-192/512.png` — PWA (instalar no celular).
- `supabase-schema.sql` — tabela `finapp_state` (JSON por usuário) + RLS + grant.
- `PUBLICAR.md` — guia de deploy (Netlify) e instalar no celular.
- `README.md` — visão geral e passos do Supabase.

## Arquitetura
- Frontend guarda tudo num objeto `state`; `persist()` salva no localStorage e, se
  configurado, no Supabase (tabela `finapp_state`, 1 linha JSON por usuário, RLS).
- `config.js` vazio → modo local (localStorage). Preenchido → exige login + nuvem.
- O artifact/demo (sem contas) fica em: scratchpad/finapp.html (mesmo corpo, sem cloud).

## Supabase (projeto da usuária)
- URL: https://mdwtqhaecfmgrwbpgutj.supabase.co
- Tabela `finapp_state` criada; `grant ... to authenticated` aplicado; RLS ok.
- Auth por email/senha ligado. **Confirm email ainda LIGADO** (mailer_autoconfirm=false)
  e o envio de e-mail é o de teste do Supabase (limite baixo, cai no spam).
- Pendência p/ público: conectar SMTP real (ex.: Resend) p/ e-mails de confirmação/reset.
- Senha exige forte (maiúscula+minúscula+número+símbolo).

## Status de deploy
- Roda local em http://localhost:4200 (config "finapp-web" no launch.json).
- Já publicado no Netlify pela usuária (versão anterior). **Sempre que mudar o app,
  re-arrastar a pasta FinApp em app.netlify.com/drop.**

## Modelo de renda (importante)
- "Fontes de renda" (Configurações) = renda fixa mensal, conta automática.
- "Adicionar rápido → Entrada" = recebimento avulso na data (transação pos).
- Somam-se. Pra não duplicar: cada renda em UM lugar só. (A usuária prefere registrar
  o salário manualmente todo mês → deve remover "Salário" das fontes fixas.)

## Últimas mudanças feitas
- Paleta "Pigeon" (violeta #834AFF + verde/rosa/laranja/amarelo), visual clean, 1 acento.
- Fonte Onest embutida (alternativa livre à TT Norms Pro, que é paga).
- Persistência (localStorage) + reset em Configurações.
- Cloud/login (Supabase) + PWA (instalável).
- Seletor Gasto/Entrada no "Adicionar rápido"; rendas em Configurações.

## Próximos passos possíveis
- Conectar SMTP (Resend) no Supabase p/ e-mails reais.
- Automatizar deploy (GitHub + Netlify) em vez do arrastar-e-soltar.
- Entrada com data de hoje pré-preenchida + teclado numérico (2 toques).
- Evoluir dados do Supabase de "1 JSON por usuário" p/ tabelas normalizadas (se precisar).
