const params = new URLSearchParams(window.location.search).get("id");
const url = `http://localhost:3000/api/products/${params}`;

// Récupère les détails du produit depuis l'API
fetch(url)
  .then((res) => res.json())
  .then((data) => {
    // Affiche les détails du produit sur la page
    document.querySelector(".item__img").innerHTML = `<img src="${data.imageUrl}" alt="${data.altTxt}">`;
    document.getElementById("title").innerHTML = data.name;
    document.getElementById("price").innerHTML = data.price;
    document.getElementById("description").innerHTML = data.description;

    // Remplit le menu déroulant des couleurs
    const colorsDropdown = document.getElementById("colors");
    data.colors.forEach((color) => {
      colorsDropdown.innerHTML += `<option value="${color.toLowerCase()}">${color}</option>`;
    });
  })
  .catch((error) => console.error("Error fetching products:", error));

// Ajoute un gestionnaire d'événements pour le bouton "Ajouter au panier"
document.getElementById("addToCart").addEventListener("click", addToCart);

function addToCart() {
  const id = params;
  const color = document.getElementById("colors").value;
  const quantity = document.getElementById("quantity").value;

  // Vérifie que l'utilisateur a sélectionné une couleur et une quantité valides
  if (!color || !quantity || quantity < 1 || quantity > 100) {
    alert("Veuillez sélectionner une couleur et une quantité valides.");
    return;
  }

  // Crée un objet pour le produit sélectionné
  const product = { id, color, quantity };

  // Récupère le panier depuis localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Vérifie si le produit est déjà dans le panier
  const existingProduct = cart.find((item) => item.id === id && item.color === color);

  if (existingProduct) {
    // Met à jour la quantité si le produit est déjà dans le panier
    existingProduct.quantity = parseInt(existingProduct.quantity) + parseInt(quantity);
  } else {
    // Ajoute le produit au panier
    cart.push(product);
  }

  // Stocke le panier mis à jour dans localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Redirige l'utilisateur vers la page Panier
  window.location.href = "cart.html";
}
