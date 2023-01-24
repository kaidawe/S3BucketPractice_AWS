
const S3Client = require('@aws-sdk/client-s3').S3Client
const PutObjectCommand = require('@aws-sdk/client-s3').PutObjectCommand
const GetObjectCommand = require('@aws-sdk/client-s3').GetObjectCommand
const DeleteObjectCommand = require('@aws-sdk/client-s3').DeleteObjectCommand
const presigner = require('@aws-sdk/s3-request-presigner').getSignedUrl

const dotenv = require('dotenv')

dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

async function uploadImage(imageBuffer, imageName, mimetype) {
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: imageBuffer,
      ContentType: mimetype
    }
  
    // Upload the image to S3
    const command = new PutObjectCommand(params)
    const data = await s3Client.send(command)
  
    return data
  }

  exports.uploadImage = uploadImage

async function getSignedUrl(fileName) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName
  })

  const signedUrl = await presigner(s3Client, command, { expiresIn: 60 * 60 * 24 })

  return signedUrl
}
exports.getSignedUrl = getSignedUrl


async function deleteImage(imageId) {
    const params = {
        Bucket: bucketName,
        Key: imageId
    }
    const command = new DeleteObjectCommand(params)
    await s3Client.send(command)
}

exports.deleteImage = deleteImage