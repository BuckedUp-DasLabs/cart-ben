const obj = {
  step_count: step_count,
  page_id: page_id,
  version_id: version_id,
};

const setDataLayer = ({ event, action, value, currency }) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ...obj,
    event: event,
    action: action,
    value: value,
    currency: currency,
    transaction_id: undefined,
  });
};

const setKlaviyo = (name, item, titles) => {
  const currentTime = new Date();
  try {
    klaviyo.push([
      "track",
      name,
      { ...obj, ...item, products: titles, pagepath: window.location.pathname, pageurl: window.location.href, time: currentTime.getTime() },
    ]);
  } catch (err) {
    console.warn("failed klaviyo\n", err);
  }
};

const dataLayerStart = (data) => {
  const titles = data.map((items) => items.title);
  const item = { event: "pageview", action: "load", value: 0 };
  setDataLayer(item);
  setTimeout(() => {
    setKlaviyo("Page View", item, titles);
  }, 200);
};

const dataLayerNoThanks = (data) => {
  const titles = data.map((items) => items.name);
  const item = { event: "interaction", action: "click", value: 0 };
  setDataLayer(item);
  setKlaviyo("User Refused", item, titles);
};

const dataLayerRedirect = (data) => {
  const titles = data.map((items) => items.title);
  const item = { event: "offerview", action: "viewaction", value: 0 };
  setDataLayer(item);
  setKlaviyo("User Redirect Engagement", item, titles);
};

const dataLayerBuy = (data, price) => {
  const titles = data.map((items) => items.name);
  const currentCurrency = data[0].price.match(/([A-Za-z]+)? ?\$(\d+\.\d+)/)[1] || "USD";
  const item = { event: "interaction", action: "purchase", value: price.toFixed(2), currency: currentCurrency };
  setDataLayer(item);
  setKlaviyo("User Bought", item, titles);
};

export { dataLayerStart, dataLayerRedirect, dataLayerBuy, dataLayerNoThanks };
