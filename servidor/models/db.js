const Sequelize = require('sequelize');
const sequelize = new Sequelize('usuarios','root','501204',{
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;