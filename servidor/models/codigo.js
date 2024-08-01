const Sequelize = require('sequelize');
const dataBase = require('./db');

const codigo = dataBase.define('codigo',{
    idUsuario:{
        type: Sequelize.STRING
    },
    dataSolic:{
        type: Sequelize.STRING
    },
    vencimentoToken:{
        type: Sequelize.STRING
    },
    token:{
        type: Sequelize.STRING
    }
})

module.exports = codigo;