const getIndex = (req, res) => {
  res.render('index');  // renderiza views/index.ejs
};

module.exports = {
  getIndex,
};
