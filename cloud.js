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
    box.querySelector('#clLogin').onclick = function () {
      out.textContent = 'Entrando…';
      sb.auth.signInWithPassword(creds()).then(function (r) {
        if (r.error) out.textContent = 'Não deu: ' + r.error.message;
      });
    };
    box.querySelector('#clSignup').onclick = function () {
      var c = creds();
      if (c.password.length < 6) { out.textContent = 'A senha precisa de pelo menos 6 caracteres.'; return; }
      out.textContent = 'Criando conta…';
      sb.auth.signUp(c).then(function (r) {
        if (r.error) out.textContent = 'Não deu: ' + r.error.message;
        else out.textContent = 'Conta criada! Se pedir, confirme pelo e-mail e depois entre.';
      });
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
