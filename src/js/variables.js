const fetchUrl = `https://ar5vgv5qw5.execute-api.us-east-1.amazonaws.com/list/`;
const postUrl = `https://ar5vgv5qw5.execute-api.us-east-1.amazonaws.com/upsell/${urlParams.get("order_uuid")}`
const finishUrl = `https://ar5vgv5qw5.execute-api.us-east-1.amazonaws.com/upsell/${urlParams.get("order_uuid")}/finish`
const postApi = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const responseLog = await response.json();
    if (response.status == 500 || response.status == 400) window.location.href = "https://buckedup.com";
    if (!response.ok) {
      throw new Error("Api post error.");
    }
    return responseLog;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default postApi;


export { fetchUrl, postUrl, finishUrl, postApi }