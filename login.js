// Lightweight localStorage registration + login with invite secret
// WARNING: client-side only. Not secure for sensitive usage.

// Set this to your secret word. Only people who know this can register.
// Change it to something private before deployment.
const OWNER_SECRET = "komar"; // <<< CHANGE THIS

// Utility: SHA-256 hash (returns hex)
async function sha256Hex(message) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function getUsers(){
  try{
    return JSON.parse(localStorage.getItem('komar_users')||'[]');
  }catch(e){ return []; }
}
function saveUsers(u){
  localStorage.setItem('komar_users', JSON.stringify(u));
}
function setSession(username){
  localStorage.setItem('komar_session', username);
}
function getSession(){
  return localStorage.getItem('komar_session');
}
function clearSession(){
  localStorage.removeItem('komar_session');
}

// UI helpers
function $(id){ return document.getElementById(id); }
function showApp(){
  const loginScreen = $('login-screen');
  const appContent = $('app-content');
  if(loginScreen) loginScreen.style.display = 'none';
  if(appContent) appContent.style.visibility = 'visible';
}
function showLogin(){
  const loginScreen = $('login-screen');
  const appContent = $('app-content');
  if(loginScreen) loginScreen.style.display = '';
  if(appContent) appContent.style.visibility = 'hidden';
}

// Build login UI controls and logic
document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = $('login-screen');
  if(!loginScreen) return;
  const message = $('login-message');

  // Create form HTML with register toggle
  loginScreen.innerHTML = `
      <div id="login-card" class="card p-8 w-96">
          <h2 id="auth-title" class="text-2xl font-bold mb-6 text-center" style="color: var(--terminal-green); text-shadow: 0 0 5px rgba(0, 255, 65, 0.8);">
              // AUTH REQUIRED
          </h2>
          <input type="text" id="login-input" placeholder="LOGIN" class="w-full p-3 mb-4 bg-transparent border-b border-gray-600 focus:border-yellow-500 outline-none text-xl" style="color: var(--terminal-green); font-family: monospace;" />
          <input type="password" id="password-input" placeholder="PASSWORD" class="w-full p-3 mb-2 bg-transparent border-b border-gray-600 focus:border-yellow-500 outline-none text-xl" style="color: var(--terminal-green); font-family: monospace;" />
          <input type="text" id="secret-input" placeholder="SECRET WORD (required for registration)" class="w-full p-3 mb-4 bg-transparent border-b border-gray-600 focus:border-yellow-500 outline-none text-sm" style="color: var(--terminal-green); font-family: monospace; display:none" />
          <div class="flex gap-2">
            <button id="login-button" class="btn w-1/2 py-3 text-lg">[ LOGIN ]</button>
            <button id="register-toggle" class="btn w-1/2 py-3 text-lg">[ REGISTER ]</button>
          </div>
          <p id="login-message" class="text-center mt-4 text-red-500 font-semibold"></p>
      </div>
  `;

  const loginButton = $('login-button');
  const registerToggle = $('register-toggle');
  const loginInput = $('login-input');
  const passwordInput = $('password-input');
  const secretInput = $('secret-input');
  const authTitle = $('auth-title');

  let registerMode = false;

  function setMode(reg){
    registerMode = !!reg;
    if(registerMode){
      authTitle.textContent = '// REGISTER';
      registerToggle.textContent = '[ BACK ]';
      loginButton.textContent = '[ CREATE ]';
      secretInput.style.display = '';
      message.textContent = 'Please provide the secret word to register.';
      message.style.color = 'var(--terminal-green)';
    } else {
      authTitle.textContent = '// AUTH REQUIRED';
      registerToggle.textContent = '[ REGISTER ]';
      loginButton.textContent = '[ LOGIN ]';
      secretInput.style.display = 'none';
      message.textContent = '';
    }
  }

  setMode(false);

  registerToggle.addEventListener('click', (e)=>{
    setMode(!registerMode);
  });

  // Logout link if session exists
  const session = getSession();
  if(session){
    // show app immediately
    showApp();
    // inject simple logout control in header (if desired)
    return;
  }

  loginButton.addEventListener('click', async ()=>{
    const user = loginInput.value.trim();
    const pass = passwordInput.value;
    const secret = secretInput.value.trim();

    if(!user || !pass){
      message.textContent = 'Введите логин и пароль.';
      message.style.color = 'red';
      return;
    }

    const users = getUsers();

    if(registerMode){
      // require secret to match OWNER_SECRET
      if(secret !== OWNER_SECRET){
        message.textContent = 'Неверное секретное слово.';
        message.style.color = 'red';
        return;
      }
      // check existing
      if(users.find(u=>u.username===user)){
        message.textContent = 'Пользователь с таким именем уже существует.';
        message.style.color = 'red';
        return;
      }
      const hash = await sha256Hex(pass);
      users.push({ username: user, passHash: hash });
      saveUsers(users);
      setSession(user);
      message.textContent = 'Регистрация успешна. Вход выполнен.';
      message.style.color = 'var(--terminal-green)';
      setTimeout(()=> showApp(), 400);
      return;
    } else {
      // login flow
      const hash = await sha256Hex(pass);
      const found = users.find(u=>u.username===user && u.passHash===hash);
      if(found){
        setSession(user);
        message.textContent = 'ACCESS GRANTED.';
        message.style.color = 'var(--terminal-green)';
        setTimeout(()=> showApp(), 300);
        return;
      } else {
        message.textContent = 'ACCESS DENIED. Incorrect login or password.';
        message.style.color = 'red';
        return;
      }
    }
  });

  // Enter key support
  passwordInput.addEventListener('keypress', function(e){
    if(e.key === 'Enter') loginButton.click();
  });
});
