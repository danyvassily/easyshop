// Récupérez l'identifiant de commande à partir de l'URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("orderId");

// Affichez l'identifiant de commande dans la page Confirmation
document.getElementById("orderId").textContent = orderId;

// Effacez le panier de localStorage
localStorage.removeItem("cart");
