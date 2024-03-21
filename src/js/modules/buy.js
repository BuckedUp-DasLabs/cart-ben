import { finishUrl, postUrl, postApi } from "../variables.js";
import toggleLoading from "./toggleLoading.js";
import { dataLayerRedirect, dataLayerBuy } from "./dataLayer.js";

const getVariantId = (optionId, prodId) => {
  const sizesWrapper = document.querySelector(`[prod-id="${prodId}"]`)?.querySelector(".cart__secondary-wrapper");
  const input = document.querySelector(`[name="${optionId}"]:checked`);
  if (!input) return { result: false, wrapper: sizesWrapper };
  return { result: input.value };
};

const hasOptions = (prod) => {
  return prod.options.length > 0;
};

//updates order
const buy = async (data) => {
  const body = { order_uuid: urlParams.get("order_uuid"), items: {} };
  let notSelected = false;
  let totalPrice = 0;
  const quantity = 1;

  // const btnProducts = JSON.parse(btn.getAttribute("products"));
  // const filterProd = (product) => {
  //   if (Object.keys(btnProducts).includes(product.id)) {
  //     product.quantity = btnProducts[product.id].quantity;
  //     return true;
  //   }
  //   return false;
  // };
  // if (btnProducts) {
  //   data = data.filter((product) => filterProd(product));
  //   hiddenProd = hiddenProd.filter((product) => filterProd(product));
  // }

  const getPrice = (price, productQuantity = undefined) => +price.split("$")[1] * (productQuantity || quantity);
  for (let product of data) {
    totalPrice = totalPrice + getPrice(product.price, product.quantity);
    body.items[product.id] = { product_id: product.id, quantity: 1, options: {} };
    // if (product.isWhole) {
    //   product.options.forEach((option) => {
    //     body.items[product.id].options[option.id] = [];
    //     option.values.forEach((value) => {
    //       body.items[product.id].options[option.id].push(value.id);
    //     });
    //   });
    // } else {
    const isNormalProduct = !product.options || !product.options[0]?.values || Object.hasOwn(product.options[0]?.values[0], "in_stock");
    for (let option of product.options) {
      let currentVariant;
      currentVariant = getVariantId(option.id, product.id);
      if (!currentVariant.result) {
        currentVariant.wrapper.classList.add("shake");
        notSelected = true;
        continue;
      }
      body.items[product.id].options[option.id] = currentVariant.result;
      totalPrice = totalPrice + getPrice(option.values.find((obj) => obj.id == currentVariant.result).price, product.quantity);
    }
    // }
  }
  if (notSelected) {
    alert("Select your choices");
    return;
  }
  toggleLoading();
  body.items = Object.values(body.items);
  if (!isFirstPage) {
    if (country) body.country = country;
    const response = await postApi(postUrl, body);
    console.log(response);
    if (!response) window.location.href = buyRedirect;
    if (isFinalPage) {
      const response = await postApi(finishUrl, null);
      console.log(response);
      if (!response) window.location.href = buyRedirect;
    }
    dataLayerBuy(data, totalPrice);
    window.location.href = redirectUrl;
    return;
  }
  let string = "";
  body.items.forEach((product, i) => {
    string = string + `&products[${i}][id]=${product.product_id}&products[${i}][quantity]=${product.quantity}`;
    for (let optionKey in product.options) {
      string = string + `&products[${i}][options][${optionKey}]=${product.options[optionKey]}`;
    }
  });
  dataLayerRedirect(data);
  window.location.href = `https://${country ? country + "." : ""}buckedup.com/cart/add?${string}&clear=true&${urlParams}`;
};

export default buy;
