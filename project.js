const { Pool } = require('pg');
const express= require('express');
const app=express();
app.use(express.json())
require('dotenv').config();
const port=process.env.PORT;
const multer=require('multer');
const path=require('path');

var nombre=''
const destinationPath = path.join(__dirname, './uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
      nombre+=file.originalname
    },
  });
  
  const upload = multer({ storage: storage });



const pool = new Pool({
    user: 'default',
    host: 'ep-silent-paper-63077386.us-east-1.postgres.vercel-storage.com',
    database: 'verceldb',
    password: 'ft0PKSHR9XJT',
    port: 5432,
    ssl: {rejectUnauthorized: false}
});

const API_KEY=process.env.API_KEY;


const apikeyvalidation=(req,res,next)=>{
    const userapikey=req.get('x-api-key');
    if (userapikey && userapikey===API_KEY){
        next();
    } else {
        res.status(401).send('Invalid API key');
    }
};

app.use(apikeyvalidation)

app.listen(port, ()=>{
    console.log('The app is running on port: ', port)
})


app.get('/users', function(req,resp){
    const listUsersQuery = `SELECT * FROM projectc;`;
    pool.query(listUsersQuery)
    .then(res => {
    return resp.status(200).send(
        {
            users:res.rows,
            code:'Busqueda exitosa'
        })
    })
    .catch(err=>{
        console.error(err);
        resp.status(400)
        resp.send('Hubo un error al buscar la informacion')
    }) 
})


app.get('/users/:id', function(req,resp){
            const id=req.params.id;
            const select = `SELECT *FROM projectc WHERE id='${id}';`;
            pool.query(select)
            .then(res => {
                return resp.status(200).send({
                    users:res.rows,
                    code:'Busqueda exitosa'
                }) 
            })
            .catch(err=>{
                console.error(err);
                resp.status(400)
                resp.send('Hubo un error al buscar la informacion')
            }) 
})

app.put('/users/:id', function(req,resp){
    const id=req.params.id;
    const update = `UPDATE projectc SET Name='${req.body.name}', Numero_identificacion='${req.body.numero_identificacion}', Fecha_nacimiento='${req.body.fecha_nacimiento}',Imagen='${req.body.imagen}', Motivo_consulta='${req.body.motivo_consulta}', Diagnostico='${req.body.diagnostico}', Doctor='${req.body.doctor}', Fecha_consulta='${req.body.fecha_consulta}' WHERE id='${id}';`;
    pool.query(update)
    .then(res => {
        console.log(res.rows)
        return resp.status(201).send({
            code:'Informacion cambiada'
        })  
    })
    .catch(err=>{
    console.error(err);
    resp.status(400)
    resp.send('Hubo un error al actualizar la informacion')
}) 
})



app.delete('/users/:id', function(req,resp){
    const id=req.params.id;
    const Delete= `DELETE FROM projectc WHERE id='${id}';`;
    pool.query(Delete)
    .then(res => {
        console.log(res.rows)
        return resp.status(204).send({
            code:'Informacion eliminada'
        })
    })
    .catch(err=>{
        console.error(err);
        resp.status(400)
        resp.send('Hubo un error al eliminar la informacion')
    }) 
})


   

app.post('/users', function(req, resp){
    const insertar= `INSERT INTO projectc (Name, Numero_identificacion, fecha_nacimiento, Imagen, Motivo_consulta, Diagnostico, Doctor, Fecha_consulta) VALUES('${req.body.name}','${req.body.numero_identificacion}','${req.body.fecha_nacimiento}','${req.body.imagen}','${req.body.motivo_consulta}','${req.body.diagnostico}','${req.body.doctor}','${req.body.fecha_consulta}');`;
    pool.query(insertar)
    .then(res=>{
    console.log(res.rows)
    return resp.status(201).send({
        code:'Student insert'
    })})
.catch(err=>{
        console.error(err);
        resp.status(400)
        resp.send('Hubo un error al insertar la informacion')
    })
})

app.put('/users/image/:id', upload.single('file'),(req,resp)=>{
    const id=req.params.id;
    const ruta=path.join(__dirname, './uploads',nombre)
    const update = `UPDATE projectc SET Imagen='${ruta}' WHERE Id=${id};`
    console.log(update)
    pool.query(update)
    .then(res => {
        console.log(res.rows)
        return resp.status(201).send({
            code:'Enlace de archivo actualizado'
        })  
    })
    .catch(err=>{
    console.error(err);
    resp.status(400)
    resp.send('Hubo un error al actualizar la informacion')
}) 
})
