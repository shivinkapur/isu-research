const cid = "AeWPOmuBjFfAm4pHzdPsqvM3vGVujZBC2dWLu08ry42YWunCEY3wimXVOFfq3tWG5kjcd0bZSDW5z-on";
const url = `https://www.sandbox.paypal.com/signin/authorize?client_id=${cid}&response_type=code&scope=https://uri.paypal.com/services/offers/containers/readwrite+https://uri.paypal.com/services/offers/containers/read+profile+email+address+phone+https%3A%2F%2Furi.paypal.com%2Fservices%2Fpaypalattributes&redirect_uri=https://ppm.songz.me/merchant/oauth`

loginButton.onclick = () => {
  window.open(url, '_blank');
};
