const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser")
const moment = require('moment')
const session = require('express-session')
const flash = require('connect-flash')
const Pagamento = require("./models/Pagamento")
const path = require("path");

//Formatar datas
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY')
        }
    }
}))
app.set('view engine', 'handlebars')

//body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//sessão
app.use(session({
    secret: 'celkeonesession',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

//Middleware
app.use((req, res, next) => {
    res.locals.sucess_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next();
})

app.use(express.static(path.join(__dirname, "public")))
//rotas
app.get('/pagamento', function (req, res) {
    Pagamento.findAll({ order: [['id', 'DESC']] }).then(function (pagamentos) {
        Pagamento.findAndCountAll({}).then(function (qntPag) {
            res.render('pagamento', { pagamentos: pagamentos.map(id => id.toJSON()) });
        })
    })
});

//carregar formulario cadastrar pagamento
app.get('/cad-pagamento', function (req, res) {
    res.render('cad-pagamento');
});

app.post('/add-pagamento', function (req, res) {
    Pagamento.create({
        nome: req.body.nome,
        valor: req.body.valor
    }).then(function () {
        req.flash("success_msg", "Pagamento cadastrado com sucesso!")
        res.redirect('/pagamento')

    }).catch(function (erro) {
        req.flash("error_msg", "erro: Pagamento não foi cadastrado com sucesso!")

    })

})
//carregar formulário editar pagamento

app.get('/edit-pagamento/:id', function (req, res) {
    Pagamento.findByPk(req.params.id)
        .then(post => {
            res.render('edit-pagamento', {
                id: req.params.id,
                nome: post.nome,
                valor: post.valor
            })
        })
        .catch(function (erro) {
            req.flash("error_msg", "Erro: Pagamento não encontrado!")
        })

})

//Editar no BD
app.post('/update-pagamento/:id', function (req, res) {
    Pagamento.update({
        nome: req.body.nome,
        valor: req.body.valor
    }, {
        where: { id: req.params.id }
    }).then(function () {
        req.flash("sucess_msg", "Pagamento editado  com sucesso!")
        res.redirect('/pagamento')
    }).catch(function (erro) {
        req.flash("error_msg", "Erro: Pagamento não editado com sucesso!")
    })
})
//visualizar detalhes do pagamento

app.get('/vis-pagamento/:id', function (req, res) {
    Pagamento.findByPk(req.params.id)
        .then(post => {
            res.render('vis-pagamento', {
                id: req.params.id,
                nome: post.nome,
                valor: post.valor
            })
        })
        .catch(function (erro) {
            req.flash("error_msg", "Erro: Pagamento não encontrado!")
        })

})
app.get('/del-pagamento/:id', function (req, res) {
    Pagamento.destroy({
        where: { 'id': req.params.id }
    }).then(function () {
        req.flash("sucess_msg", "Pagamento apagado com sucesso")
        res.redirect('/pagamento');
        // res.send("apagado com sucesso!");
    }).catch(function (erro) {
        req.flash("error_msg", "Pagamento não foi apagado com sucesso")
        // res.send("erro: pagamento não foi apagado com sucesso"   + erro);
    })
})


app.listen(8080);