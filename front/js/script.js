let url = "http://localhost:3000/api/products/";

function fetchzer() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let myhtml = "";

      for (let product of data) {
        myhtml += `
          <a href="./product.html?id=${product._id}">
            <article>
              <img src="${product.imageUrl}" alt="${product.altTxt}">
              <h3 class="productName">${product.name}</h3>
              <p class="productDescription">${product.description}</p>
              <p class="productColors">${product.colors.join(",")}</p>
              <p class="productPrice">€${product.price}</p>
            </article>
          </a>
        `;
      }

      document.getElementById("items").innerHTML = myhtml;
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
}

fetchzer();
