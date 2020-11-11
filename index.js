var fs = require('fs')
var express = require('express');
var exphbs  = require('express-handlebars');
var Handlebars = require('handlebars');
var multer  = require('multer');

var scripts = {formulario: './src/formulario.js'}

const PUERTO = 8080;
var app = express();
var hbs = exphbs.create();
var upload = multer({ dest: './uploads/imagenes' })

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(`${__dirname}/uploads`));

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

const equipos = JSON.parse(fs.readFileSync('./equipos.json'));

app.get('/', function (req, res) {
    res.render('home', {
        layout: 'main',
        data: {
            equipos,
        }
    });
});

app.get('/ver/:index', (req, res) => {
    res.render('ver', {
        layout: 'main',
        data: {
            equipo: equipos[req.params.index]
        }
    })
})

app.get('/agregar/equipo', (req, res) => {
    res.render('form', {
        layout: 'main'
    })
})

app.use(express.urlencoded());
app.use(express.json());

app.post('/agregar/equipo', upload.single('imagen'), (req, res) => {
    const nuevoEquipo = req.body;
    if (req.file != undefined) {
        nuevoEquipo['crestUrl'] =  '/imagenes/' + req.file.filename;
    }
    equipos.push(nuevoEquipo);
    fs.writeFile('./equipos.json', JSON.stringify(equipos), () => {});

    res.redirect('/agregar/equipo/exito')
})

app.get('/agregar/equipo/exito', (req, res) => {
    res.render('mensaje', {
        equipoNuevo: true,
        index: Math.max(Object.keys(equipos).length) - 1
    })
})

app.post('/eliminar/equipo/:index', (req, res) => {
    fs.unlink('./uploads/' + equipos[req.params.index].crestUrl, () => {});
    equipos.splice(Number(req.params.index), 1);

    fs.writeFile('./equipos.json', JSON.stringify(equipos), () => {});

    res.redirect('/')
});

app.get('/editar/equipo/:index', (req, res) => {
    res.render('form', {
        layout: 'form',
        script: scripts.formulario,
        data: {
            index: req.params.index,
            nombre: equipos[req.params.index].name,
            pais: equipos[req.params.index].area.name,
            direccion: equipos[req.params.index].address,
            email: equipos[req.params.index].email,
            website: equipos[req.params.index].website,
            telefono: equipos[req.params.index].phone,
            esEquipoExistente: true,
        }
    })
});

app.post('/editar/equipo/:index', upload.single('imagen'), (req, res) => {
    const equipo = equipos[req.params.index]
    equipo.name = req.body.name
    equipo.area.name = req.body.area.name
    equipo.address = req.body.address
    equipo.email = req.body.email
    equipo.website = req.body.website
    equipo.phone = req.body.phone
    if (req.file != undefined) {
        equipo.crestUrl = '/imagenes/' + req.file.filename
    }

    fs.writeFile('./equipos.json', JSON.stringify(equipos), () => {});

    res.render('mensaje', {
        equipoNuevo: false,
        index: req.params.index
    })
})

app.listen(PUERTO);