
function getCookies(cookieString) {
  const cookiesArray = cookieString.split('; ').map(ele => ele.split('='));

  const cookies = cookiesArray.reduce((total, next) => {
    const [key, val] = next;
    // eslint-disable-next-line no-param-reassign
    total[key] = val;
    return total;
  }, {});
  return cookies;
}

function baile(listaUsers) {
  const newListaUsers = JSON.parse(JSON.stringify(listaUsers));
  for (let posInicial = newListaUsers.length - 1; posInicial > 0; posInicial -= 1) {
    const posRandom = Math.floor(Math.random() * (posInicial + 1));

    const tmp = newListaUsers[posInicial].nickname;
    newListaUsers[posInicial].nickname = newListaUsers[posRandom].nickname;
    newListaUsers[posRandom].nickname = tmp;
  }
  return newListaUsers;
}

module.exports = {
  getCookies,
  baile,
};
