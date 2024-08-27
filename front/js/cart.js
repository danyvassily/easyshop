// Récupère le panier depuis localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartItemsContainer = document.getElementById("cart__items");

let totalPrice = 0;
let totalQuantity = 0;

// Crée un élément de panier
function createCartItem(item, product) {
  const existingArticle = cartItemsContainer.querySelector(
    `.cart__item[data-id="${item.id}"][data-color="${item.color}"]`
  );

  if (existingArticle) {
    // Met à jour la quantité et le prix si l'article existe déjà
    const quantityElement = existingArticle.querySelector(".itemQuantity");
    const priceElement = existingArticle.querySelector(".cart__item__content__description p:last-child");
    const newQuantity = parseInt(quantityElement.value) + parseInt(item.quantity);
    quantityElement.value = newQuantity;
    priceElement.textContent = `${newQuantity * product.price} €`;
  } else {
    // Crée un nouvel article de panier
    const article = document.createElement("article");
    article.classList.add("cart__item");
    article.setAttribute("data-id", item.id);
    article.setAttribute("data-color", item.color);
    article.innerHTML = `
      <div class="cart__item__img">
        <img src="${product.imageUrl}" alt="${product.altTxt}">
      </div>
      <div class="cart__item__content">
        <div class="cart__item__content__description">
          <h2>${product.name}</h2>
          <p>${item.color}</p>
          <p>${item.quantity * product.price} €</p>
        </div>
        <div class="cart__item__content__settings">
          <div class="cart__item__content__settings__quantity">
            <p>Qté : </p>
            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
          </div>
          <div class="cart__item__content__settings__delete">
            <p class="deleteItem">Supprimer</p>
          </div>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(article);

    // Ajoute des gestionnaires d'événements pour la modification de quantité et la suppression d'article
    article.querySelector(".itemQuantity").addEventListener("change", handleQuantityChange);
    article.querySelector(".deleteItem").addEventListener("click", handleDeleteItem);
  }

  // Met à jour le total de la quantité et du prix
  totalQuantity += parseInt(item.quantity);
  totalPrice += product.price * item.quantity;

  document.getElementById("totalQuantity").innerText = totalQuantity;
  document.getElementById("totalPrice").innerText = totalPrice.toFixed(2);
}

// Gère le changement de quantité
function handleQuantityChange(event) {
  const quantity = parseInt(event.target.value);
  const cartItem = event.target.closest(".cart__item");
  const id = cartItem.dataset.id;
  const color = cartItem.dataset.color;

  const product = cart.find((item) => item.id === id && item.color === color);
  const previousQuantity = product.quantity;
  product.quantity = quantity;

  localStorage.setItem("cart", JSON.stringify(cart));

  fetch(`http://localhost:3000/api/products/${id}`)
    .then((res) => res.json())
    .then((data) => {
      const priceChange = data.price * (quantity - previousQuantity);
      const quantityChange = quantity - previousQuantity;
      updateCartTotal(priceChange, quantityChange);
    })
    .catch((error) => console.error("Error fetching product details:", error));
}

// Gère la suppression d'un article
function handleDeleteItem(event) {
  const cartItem = event.target.closest(".cart__item");
  const id = cartItem.dataset.id;
  const color = cartItem.dataset.color;

  const index = cart.findIndex((item) => item.id === id && item.color === color);
  const quantity = cart[index].quantity;
  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));
  cartItem.remove();

  fetch(`http://localhost:3000/api/products/${id}`)
    .then((res) => res.json())
    .then((data) => {
      const priceChange = -data.price * quantity;
      const quantityChange = -quantity;
      updateCartTotal(priceChange, quantityChange);
    })
    .catch((error) => console.error("Error fetching product details:", error));
}

// Met à jour le total du panier
function updateCartTotal(priceChange, quantityChange) {
  totalPrice += priceChange;
  totalQuantity += quantityChange;

  document.getElementById("totalPrice").textContent = totalPrice.toFixed(2);
  document.getElementById("totalQuantity").textContent = totalQuantity;
}

// Récupère les détails des produits et crée les éléments de panier
function fetchProductDetails(item) {
  return fetch(`http://localhost:3000/api/products/${item.id}`)
    .then((res) => res.json())
    .then((data) => {
      createCartItem(item, data);
      return { price: data.price * item.quantity, quantity: item.quantity };
    })
    .catch((error) => console.error("Error fetching product details:", error));
}

// Charge les articles du panier
Promise.all(cart.map(fetchProductDetails)).then(() => {
  document.getElementById("totalPrice").textContent = totalPrice.toFixed(2);
  document.getElementById("totalQuantity").textContent = totalQuantity;
});

// Gère la soumission du formulaire de commande
document.querySelector(".cart__order__form").addEventListener("submit", (event) => {
  event.preventDefault();

  const contact = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    email: document.getElementById("email").value,
  };

  if (!validateForm(contact)) return;

  const products = cart.map((item) => item.id);

  fetch("http://localhost:3000/api/products/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contact, products }),
  })
    .then((res) => res.json())
    .then((data) => {
      window.location.href = `confirmation.html?orderId=${data.orderId}`;
    })
    .catch((error) => console.error("Error confirming order:", error));
});

// Valide le formulaire de commande
function validateForm({ firstName, lastName, address, city, email }) {
  const firstNameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/;
  const lastNameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/;
  const addressRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ\s,'-]+$/;
  const cityRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s-]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
}
