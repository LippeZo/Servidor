express = require('express')
servidor = express()

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "luismarinho501@gmail.com",
        pass: "emhp uhjl yswh powi"
    }
})

const jwt = require('jsonwebtoken');

const HOST = '192.168.0.77'
const PORT = 3000
const SECRET = 'embrapa'

const byrypt = require('bcrypt')

const sequelize = require('./models/db')
const Usuario = require('./models/usuario')
const Proprietario = require('./models/proprietario')
const Codigo = require('./models/codigo')

servidor.use(express.json())
servidor.use(express.urlencoded({extended: true}))


servidor.get("/",function(req,res){
    res.send('Tudo certo por aqui')
})


function verifyJWT(req,res,next){
    const token = req.headers['x-access-token'];
    jwt.verify(token,SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).end()
        }
        else{
            req.userId = decoded.userId
            next()
        }
    })
}


servidor.post('/cadastrar_usuario',async function(req,res){
    try{
        console.log('tentativa de criação usuario')
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
        console.error("ERRO AO CRIAR USUARIO:"+error)
        res.status(500).send('erro ao criar usuário')
    }

})


servidor.post("/cadastrar_proprietario",async function(req,res){
    try{
        console.log('tentativa de cadastro de proprietario!')
        await sequelize.sync()
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
        res.status(200).send("proprietario criado")
    }
    catch(error){
        console.error('erro ao criar proprietario'+error)
        res.status(401).send('erro ao criar proprietario')
    }
});


servidor.post('/login', async function(req, res) {
    try {
        const user = await Usuario.findOne({ where: { email: req.body.email } })
        if (user) {
            const match = await byrypt.compare(req.body.senha, user.senha)
            if (match) {
                const token = jwt.sign({userId: user.id},SECRET,{expiresIn: 240})
                console.log('usuário encontrado no banco de dados')
                return res.json({auth: true, token})
            } else {
                 res.status(401).send('Senha incorreta')
            }
        } else {
            res.status(404).send('Usuário não encontrado')
        }
    } catch (error) {
        console.error("ERRO AO PROCURAR USUÁRIO: " + error)
        res.status(500).send('Erro ao procurar usuário')
    }
});



servidor.get("/listar_proprietarios", verifyJWT, async function(req, res){
    try {
        await sequelize.sync()
        const proprietarios = await Proprietario.findAll()  

        const proprietariosData = proprietarios.map(proprietario => ({
            nome: proprietario.nomeProprietario,
            ocupacao: proprietario.ocupacao
        }))

        res.status(200).send(proprietariosData)
    } catch (error) {
        console.error('Erro ao listar proprietarios: ' + error)
        res.status(500).send('Erro ao listar proprietarios')
    }
})

servidor.post("/recuperar_senha", async function(req, res) {
    try {
        const user = await Usuario.findOne({ where: { email: req.body.email }});
        if (user) {
            const codigo_verificacao = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000; // Gera um código numérico aleatório de 5 algarismos
            const configEmail = {
                from: "luismarinho501@gmail.com",
                to: req.body.email,
                subject: "Recuperação de senha",
                html: `<p>Seu código de recuperação de senha é ${codigo_verificacao}</p>`
            };

            await transporter.sendMail(configEmail);

            await cadastrar_codigo(codigo_verificacao, user.id);
            console.log('Email enviado e código cadastrado');

            res.status(200).send(true);
        } else {
            res.status(404).send("Usuário não está presente no banco");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Erro de conexão ou falha ao enviar e-mail');
    }
});


const cadastrar_codigo = async (token, id) => {

    console.log("Tentativa de criação de código")
    console.log(id)
    console.log(token)
    
    try {
        const date = new Date()
        const dateVenc = new Date(date.getTime() + 10 * 60000) // Adiciona 10 minutos
        const vencimentoFormatado = `${dateVenc.getFullYear()}-${dateVenc.getMonth() + 1}-${dateVenc.getDate()} ${dateVenc.getHours()}:${dateVenc.getMinutes()}:${dateVenc.getSeconds()}`

        await Codigo.create({
            idUsuario: id,
            vencimentoToken: vencimentoFormatado,
            token: token
        })
    } catch (e) {
        console.error(e)
    }
}

    servidor.post("/verificar_codigo", async function(req,res){

        try{
            console.log(req.body.token)
            const codigo_enviado = await Codigo.findOne({ where: { token: req.body.token }})
            const tempo_atual = new Date()

            if(codigo_enviado != null && tempo_atual.getTime() < codigo_enviado.vencimentoToken.getTime()){
                res.status(200).send('codigo')
            }
            else{
                res.status(404).send('o tempo expirou')
            }
        }catch{
            res.status(401).send('falha de conexão com o banco ou o código não existe')
        }

    })


    servidor.post("/alterar_senha", async function(req,res){
        try{
            console.log('tentativa de alteração de senha')
            const conta = await Usuario.findOne( {where: { email: req.body.email}})
            const nova_hashePassowrd = await byrypt.hash(req.body.senha,10);
            if(conta != null){
                conta.senha = nova_hashePassowrd
                conta.save()
                res.status(200).send('senha alterada com sucesso')
            }
            else{
                res.status(404).send('usuário não encontrado')
            }
        }catch{
            res.status(401).send('erro de conexao')
        }
    })


servidor.listen(PORT,HOST,()=>{
    console.log('Servidor criado com sucesso')
})
