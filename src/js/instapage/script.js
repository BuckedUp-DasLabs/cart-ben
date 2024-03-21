const urlParams = new URLSearchParams(window.location.search);
const step_count = "";
const page_id = "";
const version_id = "";
const urlParamsCookies = ["click_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

const hasQtty = false;

const isFirstPage = true;
const isFinalPage = false;
const country = null;
const buyRedirect = ``;
const discountCode = "ksamb1";

const params = { cc: discountCode };
for (let key in params) {
  urlParams.set(key, params[key]);
}

const productsID = [1372,935,924];
const orderBumpIds = {};
const buyButtonsIds = ["#BTN-1"];
const noThanksButtonsIds = ["#BTN-2"];
const redirectUrl = `https://.com?${urlParams}`;
const noThanksRedirect = `https://.com?${urlParams}`;

//stop here.
const origin = window.location.pathname.replace("/", "").replace("/", "");
const cookieConfig = "path=/; domain=.buckedup.com;max-age=3600";
document.cookie = `offer_id=${discountCode};${cookieConfig}`;
document.cookie = `page_id=${page_id};${cookieConfig}`;
urlParamsCookies.forEach((param) => {
  document.cookie = `${param}=${urlParams.get(param)};${cookieConfig}`;
});
localStorage.setItem("first_page", origin);

// const productsID = ["9037941342514", "8820417003826-oneCard", 8858111377714, 8768929825074];
// const orderBumpIds = { 8820417003826: { title: "Test", price: 10.99, hasQtty: 5 } };
// const buyButtonsIds = ["#BTN-1"];
// const discountCode = "";