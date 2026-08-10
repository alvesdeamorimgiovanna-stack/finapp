/* ============================================================
   FinApp · camada de nuvem + login (Supabase)
   - Sem chaves em config.js: não faz nada (app segue no localStorage).
   - Com chaves: exige login e sincroniza o `state` na nuvem, por usuário.
   Depende de: window.supabase (CDN), e das globais do app: state, boot, persist.
   ============================================================ */
(function () {
  var cfg = window.FINAPP_CONFIG || {};
  window.FINAPP_CLOUD_ENABLED = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  if (!window.FINAPP_CLOUD_ENABLED) return; // modo local, nada a fazer

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  var userId = null, saveTimer = null;

  window.CLOUD = {
    enabled: true,
    // chamado pelo persist() do app — sobe o estado (debounced)
    save: function (data) {
      if (!userId) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        sb.from('finapp_state').upsert({ user_id: userId, data: data }).then(function (r) {
          if (r.error) console.warn('[cloud] save', r.error.message);
        });
      }, 800);
    },
    logout: function () { sb.auth.signOut().then(function () { location.reload(); }); }
  };

  // ---- UI de login (injetada) ----
  function showLogin(msg) {
    var el = document.getElementById('cloudLogin');
    if (el) el.remove();
    var box = document.createElement('div');
    box.id = 'cloudLogin';
    box.innerHTML =
      '<div class="cl-card">' +
      '  <div class="cl-logo">Fin<b>App</b></div>' +
      '  <div class="cl-sub">Entre para acessar suas finanças em qualquer aparelho.</div>' +
      '  <input id="clEmail" type="email" placeholder="seu@email.com" autocomplete="email">' +
      '  <input id="clPass" type="password" placeholder="sua senha (mín. 6)" autocomplete="current-password">' +
      '  <button id="clLogin" class="cl-btn primary">Entrar</button>' +
      '  <button id="clSignup" class="cl-btn ghost">Criar conta</button>' +
      '  <div id="clMsg" class="cl-msg">' + (msg || '') + '</div>' +
      '</div>';
    document.body.appendChild(box);
    var email = box.querySelector('#clEmail'), pass = box.querySelector('#clPass'), out = box.querySelector('#clMsg');
    function creds() { return { email: (email.value || '').trim(), password: pass.value || '' }; }
    // traduz erros comuns do Supabase para algo legível
    function friendly(err) {
      if (!err) return 'Algo deu errado. Tente de novo.';
      var m = (err.message || err.error_description || err.msg || '').toString();
      var code = (err.code || err.error || '').toString();
      var low = (m + ' ' + code).toLowerCase();
      if (low.indexOf('failed to fetch') >= 0 || low.indexOf('networkerror') >= 0 || low.indexOf('load failed') >= 0 || low.indexOf('fetch') >= 0)
        return 'Sem conexão com o servidor. Verifique sua internet — tente outra rede (4G/Wi‑Fi) ou desative bloqueadores/escudos e tente de novo.';
      if (low.indexOf('already registered') >= 0 || low.indexOf('already been registered') >= 0 || code === 'user_already_exists')
        return 'Esse e-mail já tem conta. Toque em "Entrar".';
      if (low.indexOf('invalid login') >= 0 || code === 'invalid_credentials')
        return 'E-mail ou senha incorretos.';
      if (low.indexOf('email not confirmed') >= 0 || code === 'email_not_confirmed')
        return 'Confirme o e-mail pelo link que enviamos e depois entre.';
      if (low.indexOf('weak') >= 0 || code === 'weak_password')
        return 'Senha fraca: use maiúscula, minúscula, número e símbolo.';
      if (low.indexOf('rate') >= 0 || low.indexOf('too many') >= 0)
        return 'Muitas tentativas. Espere um minuto e tente de novo.';
      if (low.indexOf('database error') >= 0 || low.indexOf('sending') >= 0 || low.indexOf('email') >= 0 || m === '{}' || m === '')
        return 'Erro no envio do e-mail de confirmação. Verifique a configuração de e-mail (SMTP) no Supabase.';
      return m || ('Erro (' + (code || 'desconhecido') + ')');
    }
    box.querySelector('#clLogin').onclick = function () {
      out.textContent = 'Entrando…';
      sb.auth.signInWithPassword(creds()).then(function (r) {
        if (r.error) out.textContent = friendly(r.error);
      }).catch(function (e) { out.textContent = 'Sem conexão com o servidor. Tente de novo.'; console.warn('[cloud] login', e); });
    };
    box.querySelector('#clSignup').onclick = function () {
      var c = creds();
      if (!c.email) { out.textContent = 'Digite seu e-mail.'; return; }
      if (c.password.length < 6) { out.textContent = 'A senha precisa de pelo menos 6 caracteres.'; return; }
      out.textContent = 'Criando conta…';
      sb.auth.signUp(c).then(function (r) {
        if (r.error) { out.textContent = friendly(r.error); console.warn('[cloud] signup', r.error); }
        else if (r.data && r.data.session) out.textContent = 'Conta criada! Entrando…';
        else out.textContent = 'Conta criada! Confirme pelo link no seu e-mail e depois toque em "Entrar".';
      }).catch(function (e) { out.textContent = 'Sem conexão com o servidor. Tente de novo.'; console.warn('[cloud] signup', e); });
    };
    pass.onkeydown = function (e) { if (e.key === 'Enter') box.querySelector('#clLogin').click(); };
  }
  function hideLogin() { var el = document.getElementById('cloudLogin'); if (el) el.remove(); }

  // ---- carrega o estado do usuário e inicia o app ----
  function startApp() {
    sb.from('finapp_state').select('data').eq('user_id', userId).maybeSingle().then(function (r) {
      if (r.data && r.data.data) {
        try { Object.assign(state, r.data.data); } catch (e) {}
      }
      hideLogin();
      document.getElementById('app').style.display = 'block';
      boot();
    });
  }

  // ---- fluxo de auth ----
  document.getElementById('app').style.display = 'none';
  document.getElementById('ob').style.display = 'none';

  sb.auth.getSession().then(function (r) {
    if (r.data.session) { userId = r.data.session.user.id; startApp(); }
    else showLogin('');
  });
  sb.auth.onAuthStateChange(function (_event, session) {
    if (session && session.user.id !== userId) { userId = session.user.id; startApp(); }
    if (!session) { userId = null; }
  });
})();
