const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const database = require('./database')


const app = express()
const upload = multer({ dest: 'images/' })

app.set('view engine', 'ejs')

function someMiddleWare(req, res, next) {

    console.log("new request at path", req.path)
    next()
}

app.get("/", async (req, res) => {
    const images = await database.getImages()
    res.render("index", { images })
  })



app.post('/saveImage', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path
  const description = req.body.description

  const addImages = await database.addImage(imagePath, description)
  console.log(addImages)
  const images = await database.getImages()

  console.log(description, imagePath)
  res.render("index", { images })
})

app.get('/images/:imageName', (req, res) => {

  const imageName = req.params.imageName
  const readStream = fs.createReadStream(`images/${imageName}`)
  readStream.pipe(res)
})

app.listen(8080, () => console.log("listening on port 8080"))