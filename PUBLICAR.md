# Publicar o FinApp (e instalar no celular)

O app hoje só roda em `localhost` (seu PC). Pra abrir no celular, ele precisa estar **na internet**. É grátis e leva ~5 min.

## 1. Colocar online (Netlify — jeito mais fácil, arrastar e soltar)
1. Entre em **https://app.netlify.com/drop**
2. **Arraste a pasta `FinApp` inteira** para dentro da página (a pasta com `index.html`, `config.js`, `cloud.js`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`).
3. Em segundos aparece um link público, tipo `https://algum-nome.netlify.app`.
4. (Opcional) Crie uma conta grátis pra esse site ficar salvo e você poder trocar o nome do link.

> Alternativa: **Vercel** (vercel.com) faz o mesmo. Qualquer hospedagem de site estático serve.

## 2. Abrir e instalar no celular
Abra o link `https://...netlify.app` no navegador do celular. Depois:

**Android (Chrome):** toque no menu **⋮** → **"Adicionar à tela inicial"** / **"Instalar app"**.

**iPhone (Safari):** toque no botão **Compartilhar** (quadrado com seta) → **"Adicionar à Tela de Início"**.

Pronto: vira um **ícone na tela** e abre em tela cheia, como um app. ✅

## 3. Antes de abrir pro público (recomendado)
- **Domínio próprio** (opcional): dá pra apontar algo como `finapp.com.br` no Netlify.
- **E-mails de verdade:** hoje a confirmação de e-mail usa o envio de teste do Supabase (limitado, cai no spam). Para o público, conecte um serviço de e-mail (ex.: **Resend** — grátis no início) em Supabase → **Authentication → Emails → SMTP**. Aí a confirmação de cadastro e o "esqueci a senha" chegam sempre.
- **Confirm email:** deixe **ligado** em produção (segurança).
- **Supabase → Authentication → URL Configuration:** adicione a URL do site (o link do Netlify).

## Observações
- `config.js` vai junto e é **seguro** publicar (a chave `anon` é pública, feita pro navegador).
- Nunca publique a chave `service_role` nem a senha do banco.
- App Store / Google Play é outro caminho (mais trabalhoso e pago) — o PWA acima cobre "instalar no celular" sem custo.
