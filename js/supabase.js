var SUPABASE_URL = 'https://nwnslrnfupveuyhrwutu.supabase.co';
var SUPABASE_KEY = 'sb_publishable_fnzv3qWAyDg60BTa4T0GaA_cMtraFpY';
var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

var ADMIN_EMAIL = "admin@gmail.com";
var DEFAULT_IMG = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";

function handleLogout() {
  db.auth.signOut().then(function() {
    window.location.href = 'login.html';
  });
}

function verifyUserSession() {
  db.auth.getSession().then(function(res) {
    if (!res.data.session) {
      window.location.href = 'login.html';
      return;
    }
    var userEmail = res.data.session.user.email.trim().toLowerCase();
    
    var emailSpan = document.getElementById('userEmailText');
    if (emailSpan) emailSpan.innerText = userEmail;
  });
}