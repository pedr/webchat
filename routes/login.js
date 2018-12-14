
const logar = (req, res) => {
  console.log(req.body);
  console.log('FUNCIONOU');
  res.redirect('/');
};

const get = (req, res) => {
  res.sendFile('/login.html');
};

module.exports = {
  logar,
  get,
};
