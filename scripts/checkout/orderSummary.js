import {
  cart,
  removeFromCart,
  updateQuantity,
  updateDeliveryOption,
} from "../../data/cart.js";
import formatCurrency from "../utils/money.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import {
  deliveryOptions,
  getDeliveryOption,
  calculateDeliveryDate,
} from "../../data/deliveryOptions.js";
import { getProduct } from "../../data/products.js";
import { renderPaymentSummary } from "./paymentSummary.js";
import { renderCheckoutHeader } from "./checkoutHeader.js";

export const renderOrderSummary = () => {
  let cartSummaryHTML = "";
  cart.forEach((cartItem) => {
    let product = getProduct(cartItem.productId);

    // find the matching deliveryOption

    // normalize the data
    const deliveryOptionId = cartItem.deliveryOptionId;
    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const dateString = calculateDeliveryDate(deliveryOption);

    cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${product.id}">
            <div class="delivery-date">Delivery date: ${dateString}</div>

            <div class="cart-item-details-grid">
              <img
                class="product-image"
                src="${product.image}"
              />

              <div class="cart-item-details">
                <div class="product-name">
                  ${product.name}
                </div>
                <div class="product-price">$${formatCurrency(
                  product.priceCents
                )}</div>
                <div class="product-quantity">
                  <span> Quantity: <span class="quantity-label js-quantity-label">${
                    cartItem.quantity
                  }</span> </span>
                  <input class="quantity-input js-quantity-input-${
                    product.id
                  }"/>
                  <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id="${
                    product.id
                  }">Save</span>
                  <span class="update-quantity-link link-primary js-update-quantity-link" data-product-id=${
                    product.id
                  }>
                    Update
                  </span>
                  <span class="delete-quantity-link link-primary js-delete-quantity-link" data-product-id=${
                    product.id
                  }>
                    Delete
                  </span>
                </div>
              </div>

              <div class="delivery-options">
                <div class="delivery-options-title">
                  Choose a delivery option:
                </div>
                ${deliveryOptionsHTML(product, cartItem)}
                
                
               
              </div>
            </div>
          </div>
    `;
  });

  function deliveryOptionsHTML(product, cartItem) {
    let html = "";

    deliveryOptions.forEach((deliveryOption) => {
      const dateString = calculateDeliveryDate(deliveryOption);

      const priceString =
        deliveryOption.priceCents === 0
          ? "FREE"
          : `$${formatCurrency(deliveryOption.priceCents)}-`;

      const isChecked = cartItem.deliveryOptionId === deliveryOption.id;

      html += `
  <div class="delivery-option js-delivery-option" data-product-id="${
    product.id
  }" data-delivery-option-id=${deliveryOption.id}>
    <input
      type="radio"
      ${isChecked ? "checked" : ""}
      class="delivery-option-input"
      name="delivery-option-${product.id}"
    />
    <div>
      <div class="delivery-option-date">${dateString}</div>
      <div class="delivery-option-price">${priceString} Shipping</div>
    </div>
  </div>
    
    `;
    });

    return html;
  }
  document.querySelector(".js-order-summary").innerHTML = cartSummaryHTML;

  document.querySelectorAll(".js-delete-quantity-link").forEach((link) => {
    const productId = link.dataset.productId;
    link.addEventListener("click", () => {
      removeFromCart(productId);
      renderOrderSummary();
      renderPaymentSummary();
      renderCheckoutHeader();
    });
  });

  document.querySelectorAll(".js-update-quantity-link").forEach((link) => {
    const productId = link.dataset.productId;
    link.addEventListener("click", () => {
      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      container.classList.add("is-editing-quantity");
    });
  });

  document.querySelectorAll(".js-save-quantity-link").forEach((link) => {
    const productId = link.dataset.productId;
    const quantityInput = document.querySelector(
      `.js-quantity-input-${productId}`
    );
    link.addEventListener("click", () => {
      handleUpdateQuantity(productId, quantityInput);
    });
    quantityInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleUpdateQuantity(productId, quantityInput);
      }
    });
  });
  function handleUpdateQuantity(productId, quantityInput) {
    const container = document.querySelector(
      `.js-cart-item-container-${productId}`
    );
    container.classList.remove("is-editing-quantity");
    const newQuantity = Number(quantityInput.value);
    updateQuantity(productId, newQuantity);
    renderOrderSummary();
    renderPaymentSummary();
    renderCheckoutHeader();
  }

  document.querySelectorAll(".js-delivery-option").forEach((element) => {
    element.addEventListener("click", () => {
      const { deliveryOptionId, productId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
};
