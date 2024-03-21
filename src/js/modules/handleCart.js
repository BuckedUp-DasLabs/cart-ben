import buy from "./buy.js";

const createInputRadio = ({ productId, variantId, text, variantPrice = "" }) => {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const labelText = document.createElement("span");
  const labelPrice = document.createElement("span");
  const input = document.createElement("input");
  wrapper.appendChild(input);
  wrapper.appendChild(label);
  const labelBall = document.createElement("span");
  labelBall.classList.add("label-ball");
  label.appendChild(labelBall);
  label.appendChild(labelText);
  labelPrice.classList.add("label-price")

  wrapper.classList.add("button-wrapper");
  labelText.classList.add("label-text");
  label.setAttribute("for", `${productId}-${variantId}`);
  label.setAttribute("role", "button");
  labelText.innerHTML = text.split("(")[0].trim();
  labelPrice.innerHTML = "(" + text.split("(")[1];
  !labelPrice.innerHTML.includes("undefined") && labelText.appendChild(labelPrice)
  input.id = `${productId}-${variantId}`;
  input.value = `${variantId}`;
  input.type = "radio";
  input.setAttribute("hidden", "");

  input.name = productId;
  input.setAttribute("price", variantPrice);
  input.setAttribute("label-text", text);

  return [wrapper, input];
};

const createButton = (variant) => {
  const button = document.createElement("button");
  button.type = "button";
  button.value = variant.id;
  button.classList.add("cart__variant-button");
  const title = document.createElement("span");
  title.innerHTML = variant.name;
  const img = document.createElement("img");
  img.src = variant.images[0];
  img.alt = variant.name;
  button.appendChild(title);
  button.appendChild(img);
  return button;
};

const createDropdown = (title) => {
  const dropdown = document.createElement("div");
  const p = document.createElement("p");
  const svg =
    '<svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5981 15.5C11.4434 17.5 8.55662 17.5 7.40192 15.5L1.33975 5C0.185047 3 1.62842 0.499998 3.93782 0.499998L16.0622 0.499999C18.3716 0.5 19.815 3 18.6603 5L12.5981 15.5Z" fill="black"/></svg>';
  dropdown.setAttribute("role", "button");
  dropdown.classList.add("cart__dropdown");
  p.innerHTML = title;
  dropdown.appendChild(p);
  dropdown.insertAdjacentHTML("beforeend", svg);
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.remove("shake");
    if (e.target.tagName !== "INPUT") dropdown.classList.toggle("active");
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) || e.target.tagName === "INPUT") dropdown.classList.remove("active");
  });
  return dropdown;
};

const handleSimpleProduct = ({ prod, productInfo, img }) => {
  let dropdown = undefined;
  const variantsWrapper = document.createElement("div");
  dropdown = createDropdown(prod.values[0].name);
  productInfo.appendChild(dropdown);
  variantsWrapper.classList.add("cart__dropdown__variants");
  prod.values.forEach((variant) => {
    const [wrapper, button] = createInputRadio({
      productId: prod.id,
      variantId: variant.id,
      text: variant.name,
      variantPrice: variant.price,
    });
    variantsWrapper.appendChild(wrapper);
    variantsWrapper.querySelector("input").checked = true;
    button.addEventListener("change", () => {
      img.src = variant.images[0];
      img.alt = variant.name;
      dropdown.querySelector("p").innerHTML = button.getAttribute("label-text");
    });
  });
  dropdown.appendChild(variantsWrapper);
};

const handleComplexProduct = ({ prod, productInfo, img }) => {
  const primaryOption = prod.options[0];
  const secondaryOption = prod.options[1];
  const stock = prod.stock;
  primaryOption.values.forEach((color) => {
    secondaryOption.values.forEach((size) => {
      if (stock[`[${color.id},${size.id}]`] <= 0) delete stock[`[${color.id},${size.id}]`];
      if (stock[`[${size.id},${color.id}]`] <= 0) delete stock[`[${size.id},${color.id}]`];
    });
  });

  const createBase = (text) => {
    const dropdown = createDropdown(text);
    const variantsWrapper = document.createElement("div");
    variantsWrapper.classList.add("cart__dropdown__variants");
    return [dropdown, variantsWrapper];
  };

  const [primaryDropdown, primaryVariantsWrapper] = createBase(primaryOption.values[0].name);
  const secondaryVariantsWrapper = document.createElement("div");
  secondaryVariantsWrapper.classList.add("cart__secondary-wrapper");
  primaryVariantsWrapper.setAttribute("primary", prod.id);
  secondaryVariantsWrapper.setAttribute("secondary", prod.id);

  const getNewName = (value) => {
    switch (value) {
      case "Small":
        return "S";
      case "Medium":
        return "M";
      case "Large":
        return "L";
      case "X-Large":
        return "XL";
      default:
        return value;
    }
  };

  const placeHolders = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"].map((size) => {
    const wrapper = document.createElement("div");
    const textWrapper = document.createElement("div");
    const text = document.createElement("span");
    wrapper.classList.add("button-wrapper");
    wrapper.classList.add("button-wrapper--placeholder");
    textWrapper.classList.add("placeholder__text-wrapper");
    text.classList.add("label-text");
    text.innerHTML = size;
    text.setAttribute("size", size);
    wrapper.appendChild(textWrapper);
    textWrapper.appendChild(text);
    return wrapper;
  });

  const updateSecondaryOptions = (primarySelected) => {
    const prevSelected = secondaryVariantsWrapper.querySelector(["input:checked"]);
    secondaryVariantsWrapper.innerHTML = "";
    placeHolders.forEach((placeholder) => secondaryVariantsWrapper.appendChild(placeholder));
    secondaryOption.values.forEach((size) => {
      if (prod.stock[`[${primarySelected},${size.id}]`] || prod.stock[`[${size.id},${primarySelected}]`]) {
        const [wrapper, button] = createInputRadio({ productId: secondaryOption.id, variantId: size.id, text: getNewName(size.name) });
        if (prevSelected?.value == size.id) button.checked = true;
        const placeholder = placeHolders.find((placeHolder) => placeHolder.querySelector(`[size="${getNewName(size.name).split("(")[0].trim()}"]`));
        secondaryVariantsWrapper.insertBefore(wrapper, placeholder);
        button.addEventListener("change",()=>{secondaryVariantsWrapper.classList.remove("shake")})
        placeholder.remove();
      }
    });
  };

  primaryOption.values.forEach((option) => {
    const [wrapper, button] = createInputRadio({
      productId: primaryOption.id,
      variantId: option.id,
      text: option.name,
    });
    button.addEventListener("change", () => {
      for (let value of prod.options[0].values) {
        if (value.id == button.value) {
          img.src = value.images[0];
          img.alt = button.getAttribute("label-text");
          primaryDropdown.querySelector("p").innerHTML = button.getAttribute("label-text");
          break;
        }
      }
      updateSecondaryOptions(button.value);
    });
    primaryVariantsWrapper.appendChild(wrapper);
  });

  img.src = primaryOption.values[0].images[0];
  img.alt = primaryOption.values[0].name;

  primaryVariantsWrapper.querySelector("input").checked = true;
  primaryDropdown.appendChild(primaryVariantsWrapper);

  updateSecondaryOptions(primaryOption.values[0].id);

  productInfo.appendChild(primaryDropdown);
  productInfo.appendChild(secondaryVariantsWrapper);
};

const createQtty = (inputId = undefined, maxQtty = undefined, addButton = undefined, price = undefined) => {
  const updateTitle = (qtty) => {
    if (price) {
      const separetedString = addButton.innerHTML.split("$");
      separetedString[1] = (price * qtty).toFixed(2);
      addButton.innerHTML = separetedString.join("$");
    }
  };

  const plusBtn = document.createElement("button");
  plusBtn.classList.add("btn-plus");
  plusBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>';

  const minusBtn = document.createElement("button");
  minusBtn.classList.add("btn-minus");
  minusBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-440v-80h560v80H200Z"/></svg>';

  const qttyInput = document.createElement("input");
  qttyInput.id = inputId || "cart-qtty-input";
  qttyInput.value = 1;
  qttyInput.type = "number";
  qttyInput.addEventListener("input", () => {
    if (qttyInput.value <= 0) {
      qttyInput.value = 1;
      updateTitle(qttyInput.value);
    }
    if (maxQtty && qttyInput.value > maxQtty) {
      qttyInput.value = maxQtty;
      updateTitle(qttyInput.value);
    }
  });

  plusBtn.addEventListener("click", () => {
    if (!maxQtty || qttyInput.value < maxQtty) {
      qttyInput.value = +qttyInput.value + 1;
      updateTitle(qttyInput.value);
    }
  });
  minusBtn.addEventListener("click", () => {
    if (qttyInput.value > 1) {
      qttyInput.value = +qttyInput.value - 1;
      updateTitle(qttyInput.value);
    }
  });

  const qttyWrapper = document.createElement("div");
  qttyWrapper.classList.add("qtty-wrapper");
  qttyWrapper.appendChild(minusBtn);
  qttyWrapper.appendChild(qttyInput);
  qttyWrapper.appendChild(plusBtn);
  return [qttyWrapper, qttyInput];
};

const increasePlaceholders = (prodWrapper) => {
  const placeHoldersDiv = prodWrapper.querySelector(".cart__placeholders");
  const placeHolder = placeHoldersDiv.querySelector(".cart__variant-placeholder");
  placeHoldersDiv.appendChild(placeHolder.cloneNode(true));
};

const handleOneCardProduct = ({ productInfo }) => {
  const placeHoldersDiv = document.createElement("div");
  placeHoldersDiv.classList.add("cart__placeholders");
  const placeHolder = document.createElement("div");
  placeHolder.classList.add("cart__variant-placeholder");
  const title = document.createElement("p");
  title.innerHTML = "Your Choice";
  const img = document.createElement("div");
  placeHolder.appendChild(title);
  placeHolder.appendChild(img);
  placeHoldersDiv.appendChild(placeHolder);
  productInfo.appendChild(placeHoldersDiv);
};

const createPlaceholders = ({ prod, selectionDiv }) => {
  selectionDiv = document.createElement("div");
  selectionDiv.classList.add("cart__variant-selection");
  const title = document.createElement("p");
  title.innerHTML = `Select your variants: `;
  selectionDiv.appendChild(title);
  const selectionContainer = document.createElement("div");
  selectionContainer.classList.add("cart__variant-selection__container");
  selectionDiv.appendChild(selectionContainer);
  prod.variants.forEach((variant) => {
    const btn = createButton(variant);
    selectionContainer.appendChild(btn);
    btn.addEventListener("click", () => {
      const prodContainer = document.querySelector(`[prod-id="${prod.id.split("id")[0]}"] .cart__placeholders`);
      if (btn.parentElement.classList.contains("cart__variant-selection__container")) {
        const placeholder = prodContainer.querySelector('.cart__variant-placeholder:not([style*="display: none"])');
        const firstChild = prodContainer.querySelector("*");
        const clone = btn.cloneNode(true);
        clone.addEventListener("click", () => {
          prodContainer.querySelector('.cart__variant-placeholder[style*="display: none"]').style.display = "";
          selectionDiv.style.display = "";
          clone.remove();
        });
        prodContainer.insertBefore(clone, firstChild);
        placeholder.style.display = "none";
        selectionContainer.classList.remove("shake");
        if (!prodContainer.querySelector('.cart__variant-placeholder:not([style*="display: none"])')) selectionDiv.style.display = "none";
      }
    });
  });
  return selectionDiv;
};

const createProduct = ({ prod, isVariant = false, isOrderBump = false, inCartContainer = undefined, data = undefined }) => {
  // const prevProdWrapper = document.querySelector(`[prod-id="${prod.id.split("id")[0]}"]`);
  let selectionDiv = undefined;
  // if (prod.oneCard && !prevProdWrapper) {
  //   selectionDiv = createPlaceholders({
  //     prod,
  //     selectionDiv,
  //   });
  // } else if (prod.oneCard) {
  //   increasePlaceholders(prevProdWrapper);
  //   return undefined;
  // }
  const isNormalProduct = !prod.options || !prod.options[0]?.values || Object.hasOwn(prod.options[0]?.values[0], "in_stock");
  const productWrapper = document.createElement("div");
  productWrapper.classList.add("cart__product");
  productWrapper.setAttribute("prod-id", prod.id);

  const productContainer = document.createElement("div");
  productContainer.classList.add("cart__product__container");

  productWrapper.appendChild(productContainer);
  if (selectionDiv) productWrapper.appendChild(selectionDiv);

  const productInfo = document.createElement("div");
  productInfo.classList.add("cart__product__info");

  const title = document.createElement("p");
  title.classList.add("cart__product__title");
  title.innerHTML = isVariant || prod.name;
  productInfo.appendChild(title);
  if (isVariant) {
    const variantTitle = document.createElement("p");
    variantTitle.classList.add("cart__product__variant-title");
    variantTitle.innerHTML = prod.name;
    productInfo.appendChild(variantTitle);
  }

  let img = undefined;
  // if (!prod.oneCard) {
  img = document.createElement("img");
  if (isVariant) {
    img.src = prod.images[0];
    img.alt = prod.name;
  } else {
    if (prod.values) {
      img.src = prod.values[0].images[0];
      img.alt = prod.values[0].name;
    } else {
      img.src = prod.image;
      img.alt = prod.name;
    }
  }
  productContainer.appendChild(img);
  // }

  productContainer.appendChild(productInfo);
  if (!isNormalProduct) handleComplexProduct({ prod, productInfo, img });
  else if (!isVariant && prod.values?.length > 1) {
    if (!prod.oneCard) handleSimpleProduct({ prod, productInfo, img });
    // else handleOneCardProduct({ prod, productInfo });
  }

  if (isOrderBump) {
    const addWrapper = document.createElement("div");
    addWrapper.classList.add("add-wrapper");
    const addButton = document.createElement("button");
    addButton.classList.add("add-button");
    const price = orderBumpIds[prod.id.split("ob")[0]].price;
    addButton.innerHTML = `Add to cart for only +$${price}`;
    addWrapper.appendChild(addButton);
    let qttyWrapper, qttyInput;
    if (prod.hasQtty) {
      const maxQtty = typeof prod.hasQtty === "number" ? prod.hasQtty : false;
      [qttyWrapper, qttyInput] = createQtty(`qtty-${prod.id}`, maxQtty, addButton, price);
      addWrapper.appendChild(qttyWrapper);
    }
    addButton.addEventListener("click", () => {
      addButton.remove();
      inCartContainer.appendChild(productWrapper);
      data.push(prod);
    });
    productInfo.appendChild(addWrapper);
  }

  return productWrapper;
};

const createCart = (data, orderBumpData) => {
  const cartWrapper = document.createElement("div");
  const cartOverlay = document.createElement("div");
  const cart = document.createElement("div");
  cartWrapper.classList.add("cart-wrapper");
  cartOverlay.classList.add("cart-overlay");
  cart.classList.add("cart");
  cartWrapper.appendChild(cartOverlay);
  cartWrapper.appendChild(cart);
  document.body.appendChild(cartWrapper);

  const cartHead = document.createElement("div");
  const cartTitle = document.createElement("p");
  const closeCartButton = document.createElement("button");
  cartHead.classList.add("cart__head");
  cartTitle.classList.add("cart__head__title");
  closeCartButton.classList.add("cart__head__close-button");
  cartTitle.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM208-800h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Z"/></svg>
  Cart`;
  closeCartButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';
  cartHead.appendChild(cartTitle);
  cartHead.appendChild(closeCartButton);
  cart.append(cartHead);

  const productsContainer = document.createElement("div");
  const inCartContainer = document.createElement("div");
  const orderBumpsContainer = document.createElement("div");
  productsContainer.classList.add("cart__prod-container");
  inCartContainer.classList.add("cart__in-cart-container");
  orderBumpsContainer.classList.add("cart__order-bumps-container");
  const bumpAtTop = Object.keys(orderBumpIds).some((id) => orderBumpIds[id].inTop);
  if (bumpAtTop) {
    orderBumpsContainer.classList.add("at-top");
    productsContainer.appendChild(orderBumpsContainer);
    productsContainer.appendChild(inCartContainer);
  } else {
    productsContainer.appendChild(inCartContainer);
    productsContainer.appendChild(orderBumpsContainer);
  }
  cart.appendChild(productsContainer);

  [cartOverlay, closeCartButton].forEach((el) => {
    el.addEventListener("click", () => {
      cartWrapper.classList.toggle("active");
      document.body.classList.toggle("no-scroll");
    });
  });

  const cartFoot = document.createElement("div");
  cartFoot.classList.add("cart__foot");

  let buyButton = document.createElement("button");
  buyButton.classList.add("buy-button");
  buyButton.innerHTML = "BUY NOW";

  cartFoot.appendChild(buyButton);

  if (hasQtty) {
    cartFoot.appendChild(createQtty()[0]);
  }

  cart.appendChild(cartFoot);

  const replaceElement = (el) => {
    const elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
    return elClone;
  };

  const updateCartProducts = (data, btnDiscount) => {
    inCartContainer.innerHTML = "";
    orderBumpsContainer.innerHTML = "";
    buyButton = replaceElement(buyButton);
    data.forEach((prod) => {
      const prodWrapper = document.createElement("div");
      prodWrapper.classList.add("cart__prod-wrapper");
      const prodWrapperTitle = document.createElement("p");
      prodWrapperTitle.classList.add("cart__prod-wrapper__title");
      prodWrapperTitle.innerHTML = prod.name;
      prodWrapper.appendChild(prodWrapperTitle);
      // if (prod.isWhole) {
      // prod.options.forEach((option) => {
      //   option.values.forEach((value) => {
      //     inCartContainer.appendChild(createProduct({ prod: value, isVariant: prod.name }));
      //   });
      // });
      // } else {
      const isNormalProduct = !prod.options || !prod.options[0]?.values || Object.hasOwn(prod.options[0]?.values[0], "in_stock");
      if (prod.options.length === 0 || !isNormalProduct) {
        const prodCard = createProduct({ prod });
        inCartContainer.appendChild(prodCard);
      } else {
        prod.options.forEach((option) => {
          const prodCard = createProduct({ prod: option });
          if (prod.options.length == 1) inCartContainer.appendChild(prodCard);
          else {
            prodWrapper.appendChild(prodCard);
          }
        });
        if (prod.options.length > 1) {
          inCartContainer.appendChild(prodWrapper);
        }
      }
      // }
    });
    // orderBumpData.forEach((prod) => {
    //   orderBumpsContainer.appendChild(createProduct({ prod, isOrderBump: true, inCartContainer, data }));
    // });
    buyButton.addEventListener("click", async () => {
      buyButton.toggleAttribute("disabled");
      const result = await buy(data, btnDiscount);
      if (!result) buyButton.toggleAttribute("disabled");
    });
    cartWrapper.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  };

  return updateCartProducts;
};

export { createCart };
