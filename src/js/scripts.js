import fetchProduct from "./modules/handleProduct/fetchProduct.js";
import toggleLoading from "./modules/toggleLoading.js";
import { dataLayerNoThanks, dataLayerStart } from "./modules/dataLayer.js";
import { createCart } from "./modules/handleCart.js";
import postApi, { finishUrl } from "./variables.js";

const buyButtons = [];
const noThanksButtons = [];
buyButtonsIds.forEach((id) => {
  let buyButton;
  if (typeof id !== "string") {
    buyButton = document.querySelector(id.id);
    id.products && buyButton.setAttribute("products", id.products);
    id.discountCode && buyButton.setAttribute("discountCode", id.discountCode);
  } else buyButton = document.querySelector(id);
  buyButtons.push(buyButton);
});

noThanksButtonsIds.forEach((id) => {
  noThanksButtons.push(document.querySelector(id));
});

const sortObjectsBasedOnOrder = (referenceArray, arrayToSort) => {
  const sortedArray = [];
  referenceArray.forEach(id => {
      const foundObject = arrayToSort.find(obj => obj.id == id);
      if (foundObject) {
          sortedArray.push(foundObject);
      }
  });
  arrayToSort.splice(0, arrayToSort.length, ...sortedArray);
};

const main = async () => {
  toggleLoading();
  let [data, orderBumpData] = await Promise.all([fetchProduct({ ids: productsID }), fetchProduct({ ids: Object.keys(orderBumpIds), isOrderBump: true })]);
  sortObjectsBasedOnOrder(productsID,data.data)
  if(data.noStock){
    alert("Product not found.");
    window.location.href = "https://buckedup.com";
    return
  }
  if (data.error.hasError) {
    console.error(data.error.message);
    if (data.error.redirect) {
      window.location.href = "https://buckedup.com";
    }
    return;
  }
  data = data.data;
  dataLayerStart(data);
  const updateCartProducts = createCart(data, orderBumpData);
  buyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      let btnData;
      const btnProducts = JSON.parse(btn.getAttribute("products"));
      if (btnProducts) {
        const filteredData = data.filter((prod) => prod.id in btnProducts);
        const increasedData = [];
        filteredData.forEach((prod) => {
          increasedData.push(prod);
          const quantity = btnProducts[prod.id].quantity;
          if (quantity > 1) {
            for (let i = 1; i < quantity; i++) {
              const copy = { ...prod, id: `${prod.id}id${i}` };
              increasedData.push(copy);
            }
          }
        });
        btnData = increasedData;
      } else btnData = data;
      if (!btn.hasAttribute("disabled")) {
        updateCartProducts(btnData, btn.getAttribute("discountCode"));
      }
    });
  });
  noThanksButtons.forEach((btn) => {
    btn?.addEventListener("click", async () => {
      toggleLoading();
      dataLayerNoThanks(data);
      if (isFinalPage) {
        const response = await postApi(finishUrl, null);
        console.log(response);
      }
      window.location.href = noThanksRedirect;
    });
  });
  toggleLoading();
};

main();
