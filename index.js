const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'eu-central-1'});
const crypto = require('crypto');
const fileType = require("file-type");

const BUCKET_NAME = process.env.BUCKET_NAME
const BUCKET_IMG_PATH = process.env.BUCKET_IMG_PATH

function generateRandomString(strLength){
  return crypto.randomBytes(strLength).toString('hex')
}

exports.handler = async (event, context) => {
  const { file, itemId } = event;
  const base64String = file.split(';base64,').pop()
  const buffer = new Buffer.from(base64String, 'base64');
  const fileMime = await fileType.fromBuffer(buffer)

  if (fileMime === null || fileMime === undefined){
    return context.fail("invalid file type")
  }
  const fileName = `${generateRandomString(8)}.${fileMime.ext}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: `${BUCKET_IMG_PATH}/${fileName}`,
    ContentType: fileMime.mime,
    Body: buffer
  };

  return s3.putObject(params,(err,data)=>{
    if(err){
      console.log(err);
      return context.fail(err)
    }
    return
  }).promise()
    .then(()=> ({fileName, itemId}))
};
