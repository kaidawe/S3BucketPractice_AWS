const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const s3 = require('./s3')
const crypto = require('crypto')
const getSignedUrl = require('@aws-sdk/s3-request-presigner').getSignedUrl
const sharp = require('sharp')
const DeleteObjectCommand = require('@aws-sdk/client-s3').DeleteObjectCommand

const database = require('./database')

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const app = express()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


app.set('view engine', 'ejs')


app.get("/", async (req, res) => {
    const images = await database.getImages()
    for (const image of images) {
      image.url = await s3.getSignedUrl(image.file_name)}

    res.render("index", { images })
  })



app.post('/saveImage', upload.single('image'), async (req, res) => {

  const fileBuffer = await sharp(req.file.buffer)
  .resize({ height: 200, width: 500, fit: "contain" })
  .toBuffer()

  const description = req.body.description
  const mimetype = req.file.mimetype
  const fileName = generateFileName()
  

  // upload to S3
  const s3Result = await s3.uploadImage(fileBuffer, fileName, mimetype)


  //Database
  const addImages = await database.addImage(fileName, description)
  const images = await database.getImages()

  console.log(description, fileName)
  res.redirect('/')  
})


app.post('/deleteImage/:id', async (req, res) => {
  const id = +req.params.id

  // get the image from the database
  const image = await database.getImage(id)
  // you need the image name for s3

  await s3.deleteImage(image.file_name)
  await database.deleteImage(id)
  res.redirect('/')
})

app.listen(8080, () => console.log("listening on port 8080"))