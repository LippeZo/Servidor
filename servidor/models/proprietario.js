const Sequelize = require('sequelize');
const dataBase = require('./db');

const proprietario = dataBase.define('proprietario',{
    nomeProprietario:{
        type: Sequelize.STRING
    },
    ocupacao:{
        type: Sequelize.STRING
    },
    numero:{
        type: Sequelize.STRING
    },
    dependentes:{
        type: Sequelize.STRING
    },
    nomePropriedade:{
        type: Sequelize.STRING
    },
    cep:{
        type: Sequelize.STRING
    },
    estado:{
        type: Sequelize.STRING
    },
    cidade:{
        type: Sequelize.STRING
    },
    municipio:{
        type: Sequelize.STRING
    },
    latitude:{
        type: Sequelize.STRING
    },
    longitude:{
        type: Sequelize.STRING
    },
    altitude:{
        type: Sequelize.STRING
    },
    DAP:{
        type: Sequelize.STRING
    },
    CAF:{
        type: Sequelize.STRING
    },
    programasSociais:{
        type: Sequelize.STRING
    },
    infoAdicionais:{
        type: Sequelize.STRING
    }
})

module.exports = proprietario;