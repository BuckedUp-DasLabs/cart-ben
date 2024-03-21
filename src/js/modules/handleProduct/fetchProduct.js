import { fetchUrl } from "../../variables.js";

const handleLoad = async ({ ids, country }) => {
  const data = { data: [], noStock: false, error: false };
  const handleStock = () => {
    data.data.forEach((product) => {
      if (product.options.length === 0) {
        if (product.stock["[]"] <= 0) {
          console.warn("Out of stock: ", product.id);
          data.noStock = true;
        }
        return;
      }
      const isNormalProduct = Object.hasOwn(product.options[0].values[0], "in_stock");
      if (!isNormalProduct) {
        if (Object.values(product.stock).every((val) => val <= 0)) {
          console.warn("Out of stock: ", product.id);
          data.noStock = true;
          return;
        }
        const mainOption = product.options[0];
        const secondaryOption = product.options[1];
        for (let mainValue of mainOption.values) {
          let hasStock = false;
          for (let secondValue of secondaryOption.values) {
            if (
              (product.stock[`[${mainValue.id},${secondValue.id}]`] !== undefined && product.stock[`[${mainValue.id},${secondValue.id}]`] > 0) ||
              (product.stock[`[${secondValue.id},${mainValue.id}]`] !== undefined && product.stock[`[${secondValue.id},${mainValue.id}]`] > 0)
            ) {
              hasStock = true;
            }
          }
          if (!hasStock) mainOption.values = mainOption.values.filter((value) => value.id !== mainValue.id);
        }
        return;
      }
      for (let option of product.options) {
        if (!option.values.length == 0) {
          option.values = option.values.filter((value) => value.in_stock);
          if (option.values.length <= 0) {
            console.warn("Out of stock: ", product.id);
            data.noStock = true;
          }
        }
      }
    });
  };

  const fetchEveryProduct = (ids) => {
    const fetchApi = async (id) => {
      let url = `${fetchUrl}${id}`;
      if (country) url = url + `?country=${country}`;
      try {
        const response = await fetch(url);
        if (response.status === 404) throw new Error("Product Not Found.");
        if (response.status == 500 || response.status == 400) throw new Error("Sorry, there was a problem.");
        const apiData = await response.json();
        // if (typeof id === "string"){
        //   if(id.includes("oneCard")) apiData.product.oneCard = true;
        //   if(id.includes("whole")) apiData.product.isWhole = true;
        // }
        data.data.push(apiData.product);
      } catch (error) {
        data.error = { hasError: true, message: error.message };
        if (error.message === "Sorry, there was a problem.") data.error["redirect"] = true;
      }
    };

    return Promise.all(ids.map((id) => fetchApi(id)));
  };
  await fetchEveryProduct(ids);
  handleStock();
  return data;
};

export default handleLoad;
