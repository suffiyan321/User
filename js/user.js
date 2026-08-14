var productsList = [];
var userCart = JSON.parse(localStorage.getItem('techcore_cart')) || [];
var selectedCategory = 'ALL';

function initUserStore() {
  verifyUserSession();
  updateCartBadge();
  loadUserProducts();
}

function handleSignIn() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (!email || !password) return alert("Email aur Password bharein!");

  db.auth.signInWithPassword({ email: email, password: password }).then(function(res) {
    if (res.error) alert("Error: " + res.error.message);
    else {
      window.location.href = "index.html";
    }
  });
}

function handleSignUp() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (!email || !password) return alert("Email aur Password bharein!");

  db.auth.signUp({ email: email, password: password }).then(function(res) {
    if (res.error) alert("Error: " + res.error.message);
    else {
      alert("Sign Up Ho Gaya! Ab login karein.");
      window.location.href = "login.html";
    }
  });
}

function loadUserProducts() {
  db.from('products').select('*').then(function(res) {
    if (!res.error) {
      productsList = res.data || [];
      if (document.getElementById('storeCategoryFilter')) renderCategories();
      if (document.getElementById('userCardGrid')) drawUserCards();
    }
  });
}

function renderCategories() {
  var storeFilter = document.getElementById('storeCategoryFilter');
  if (!storeFilter) return;
  var categories = [];
  for (var i = 0; i < productsList.length; i++) {
    var rawCat = productsList[i].category;
    if (rawCat && rawCat.trim() !== "") {
      var formattedCat = rawCat.trim();
      formattedCat = formattedCat.charAt(0).toUpperCase() + formattedCat.slice(1);
      if (categories.indexOf(formattedCat) === -1) categories.push(formattedCat);
    }
  }
  storeFilter.innerHTML = '<button onclick="filterStoreCat(\'ALL\')" style="padding:8px 16px; border-radius:6px; background:#2563eb; color:white; border:none; cursor:pointer;">All</button>';
  for (var j = 0; j < categories.length; j++) {
    storeFilter.innerHTML += '<button onclick="filterStoreCat(\'' + categories[j] + '\')" style="padding:8px 16px; border-radius:6px; background:#161b22; color:white; border:1px solid #30363d; cursor:pointer; margin-left:6px;">' + categories[j] + '</button>';
  }
}

function filterStoreCat(cat) {
  selectedCategory = cat;
  drawUserCards();
}

function drawUserCards() {
  var grid = document.getElementById('userCardGrid');
  if(!grid) return;
  grid.innerHTML = "";

  for (var i = 0; i < productsList.length; i++) {
    var item = productsList[i];
    var currentItemCat = (item.category || '').trim();
    currentItemCat = currentItemCat.charAt(0).toUpperCase() + currentItemCat.slice(1);

    if (selectedCategory !== 'ALL' && currentItemCat !== selectedCategory) continue;

    var imgUrl = (item.image && item.image.trim() !== "") ? item.image : DEFAULT_IMG;

    grid.innerHTML += "<div style='background:#161b22; border:1px solid #30363d; border-radius:10px; padding:15px; display:flex; flex-direction:column;'>" +
      "<img src='" + imgUrl + "' style='width:100%; height:180px; object-fit:cover; border-radius:6px; margin-bottom:12px;' onerror=\"this.src='" + DEFAULT_IMG + "'\">" +
      "<p style='color:#2563eb; font-size:0.75rem; font-weight:700; text-transform:uppercase;'>" + (item.category || 'GENERAL') + "</p>" +
      "<h3 style='margin:4px 0; font-size:1.1rem; color:#fff;'>" + item.title + "</h3>" +
      "<p style='color:#c9d1d9; font-size:0.85rem; margin-bottom:15px; flex:1;'>" + (item.description || '') + "</p>" +
      "<div style='display:flex; justify-content:space-between; align-items:center;'>" +
        "<span style='font-weight:800; font-size:1.2rem; color:#fff;'>$" + item.price + "</span>" +
        "<button style='background:#2563eb; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;' onclick='addToCart(" + item.id + ")'>Add to Cart</button>" +
      "</div>" +
    "</div>";
  }
}

function addToCart(productId) {
  var product = null;
  for (var i = 0; i < productsList.length; i++) {
    if (productsList[i].id == productId) { product = productsList[i]; break; }
  }
  if (!product) return;

  var existingIndex = -1;
  for (var j = 0; j < userCart.length; j++) {
    if (userCart[j].id == productId) { existingIndex = j; break; }
  }

  if (existingIndex > -1) {
    userCart[existingIndex].qty += 1;
  } else {
    userCart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });
  }

  saveCart();
  alert("🛒 " + product.title + " added to cart!");
}

function saveCart() {
  localStorage.setItem('techcore_cart', JSON.stringify(userCart));
  updateCartBadge();
}

function updateCartBadge() {
  var totalCount = 0;
  for (var i = 0; i < userCart.length; i++) totalCount += userCart[i].qty;
  var badge = document.getElementById('cartCountBadge');
  if (badge) badge.innerText = totalCount;
}

function renderCartView() {
  var cartDiv = document.getElementById('cartItemsList');
  if (!cartDiv) return;
  cartDiv.innerHTML = "";

  if (userCart.length === 0) {
    cartDiv.innerHTML = "<p style='text-align:center; padding:30px; color:#c9d1d9;'>Your cart is empty.</p>";
    if(document.getElementById('cartTotalPrice')) document.getElementById('cartTotalPrice').innerText = "$0.00";
    return;
  }

  var grandTotal = 0;
  for (var i = 0; i < userCart.length; i++) {
    var item = userCart[i];
    var itemTotal = item.price * item.qty;
    grandTotal += itemTotal;
    var imgUrl = (item.image && item.image.trim() !== "") ? item.image : DEFAULT_IMG;

    cartDiv.innerHTML += "<div style='display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #30363d;'>" +
      "<div style='display:flex; align-items:center; gap:15px;'>" +
        "<img src='" + imgUrl + "' style='width:50px; height:50px; border-radius:6px; object-fit:cover;' onerror=\"this.src='" + DEFAULT_IMG + "'\">" +
        "<div><h4 style='color:#fff;'>" + item.title + "</h4><p style='color:#c9d1d9; font-size:0.85rem;'>$" + item.price + " each</p></div>" +
      "</div>" +
      "<div style='display:flex; align-items:center; gap:12px;'>" +
        "<button onclick='changeCartQty(" + item.id + ", -1)' style='background:#30363d; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;'>-</button>" +
        "<b style='color:#fff;'>" + item.qty + "</b>" +
        "<button onclick='changeCartQty(" + item.id + ", 1)' style='background:#30363d; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;'>+</button>" +
        "<span style='font-weight:700; color:#fff; margin:0 15px;'>$" + itemTotal.toFixed(2) + "</span>" +
        "<button onclick='removeFromCart(" + item.id + ")' style='background:rgba(248,81,73,0.2); color:#f85149; border:1px solid #f85149; padding:4px 10px; border-radius:4px; cursor:pointer;'>Remove</button>" +
      "</div>" +
    "</div>";
  }

  if(document.getElementById('cartTotalPrice')) document.getElementById('cartTotalPrice').innerText = "$" + grandTotal.toFixed(2);
}

function changeCartQty(id, delta) {
  for (var i = 0; i < userCart.length; i++) {
    if (userCart[i].id == id) {
      userCart[i].qty += delta;
      if (userCart[i].qty <= 0) userCart.splice(i, 1);
      break;
    }
  }
  saveCart();
  renderCartView();
}

function removeFromCart(id) {
  userCart = userCart.filter(function(item) { return item.id != id; });
  saveCart();
  renderCartView();
}

function confirmCartOrder() {
  var name = document.getElementById('cName').value;
  var phone = document.getElementById('cPhone').value;
  var address = document.getElementById('cAddress').value;
  var paymentMethod = document.getElementById('cPayment').value;
  var email = document.getElementById('userEmailText') ? document.getElementById('userEmailText').innerText : "";

  if (!name || !phone || !address) return alert("Poori detail bharein!");

  var itemsSummary = [], grandTotal = 0;
  for (var i = 0; i < userCart.length; i++) {
    itemsSummary.push(userCart[i].title + " x" + userCart[i].qty);
    grandTotal += (userCart[i].price * userCart[i].qty);
  }

  var orderObj = {
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    shipping_address: address,
    product_title: itemsSummary.join(", "),
    amount: grandTotal,
    status: 'Pending',
    payment_method: paymentMethod
  };

  db.from('orders').insert([orderObj]).then(function(res) {
    if (res.error) {
      alert("Error placing order: " + res.error.message);
    } else {
      alert("🎉 Order Successfully Placed!");
      userCart = [];
      saveCart();
      window.location.href = "index.html";
    }
  });
}