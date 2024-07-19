express = require('express');
servidor = express();

const jwt = require('jsonwebtoken');

const HOST = '192.168.0.77';
const PORT = 3000;
const SECRET = 'embrapa';

const byrypt = require('bcrypt');

const sequelize = require('./models/db');
const Usuario = require('./models/usuario');
const Proprietario = require('./models/proprietario');

servidor.use(express.json());
servidor.use(express.urlencoded({extended: true}));


servidor.get("/",function(req,res){
    res.send('Tudo certo por aqui');
})


function verifyJWT(req,res,next){
    const token = req.headers['x-access-token'];
    jwt.verify(token,SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).end();
        }
        else{
            req.userId = decoded.userId;
            next();
        }
    })
}


servidor.post('/cadastrar_usuario',async function(req,res){
    try{
        console.log('tentativa de criação usuario');
        const hashePassowrd = await byrypt.hash(req.body.senha,10);
        await sequelize.sync();
        const novoUsuario = await Usuario.create({
            tipoUsuario: req.body.tipoUsuario,
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            cpf: req.body.cpf,
            email: req.body.email,
            estado: req.body.estado,
            cidade: req.body.cidade,
            senha: hashePassowrd
        },
    )
    res.status(200).send("usuário criado")
    }catch(error){
        console.error("ERRO AO CRIAR USUARIO:"+error);
        res.status(500).send('erro ao criar usuário');
    }

})


servidor.post("/cadastrar_proprietario",async function(req,res){
    try{
        console.log('tentativa de cadastro de proprietario!');
        await sequelize.sync();
        const novoProprietario = await Proprietario.create({
            nomeProprietario: req.body.nomeProprietario,
            ocupacao: req.body.ocupacao,
            numero: req.body.numero,
            dependentes: req.body.dependentes,
            nomePropriedade: req.body.nomePropriedade,
            cep: req.body.cep,
            estado: req.body.estado,
            cidade: req.body.cidade,
            municipio: req.body.municipio,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            altitude: req.body.altitude,
            DAP: req.body.DAP,
            CAF: req.body.CAF,
            programasSociais: req.body.programasSociais,
            infoAdicionais: req.body.infoAdicionais
        });
        res.status(200).send("proprietario criado");
    }
    catch(error){
        console.error('erro ao criar proprietario'+error);
        res.status(401).send('erro ao criar proprietario');
    }
});


servidor.post('/login', async function(req, res) {
    try {
        const user = await Usuario.findOne({ where: { email: req.body.email } });
        if (user) {
            const match = await byrypt.compare(req.body.senha, user.senha);
            if (match) {
                const token = jwt.sign({userId: user.id},SECRET,{expiresIn: 240});
                console.log('usuário encontrado no banco de dados');
                return res.json({auth: true, token});
            } else {
                 res.status(401).send('Senha incorreta');
            }
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    } catch (error) {
        console.error("ERRO AO PROCURAR USUÁRIO: " + error);
        res.status(500).send('Erro ao procurar usuário');
    }
});



servidor.get("/listar_proprietarios", verifyJWT, async function(req, res){
    try {
        await sequelize.sync();
        const proprietarios = await Proprietario.findAll();  

        const proprietariosData = proprietarios.map(proprietario => ({
            nome: proprietario.nomeProprietario,
            ocupacao: proprietario.ocupacao
        }));

        res.status(200).send(proprietariosData);
    } catch (error) {
        console.error('Erro ao listar proprietarios: ' + error);
        res.status(500).send('Erro ao listar proprietarios');
    }
});


servidor.listen(PORT,HOST,()=>{
    console.log('Servidor criado com sucesso');
});
