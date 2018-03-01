const request = (cb) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://ppm.songz.me/merchant/referrals');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onloadend = () => {
    // do something to response
    cb(JSON.parse(xhr.responseText));
  };
  xhr.send('');

};

request( ({links}) => {
  const link = links[1] || links[0];
  document.querySelector('#isu-link').href = link.href;
});
