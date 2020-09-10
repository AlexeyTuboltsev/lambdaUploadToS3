//stolen from https://medium.com/@olotintemitope/how-to-upload-files-to-amazon-s3-using-nodejs-lambda-and-api-gateway-bae665127907

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const moment = require("moment")
const fileType = require("file-type");
AWS.config.update({region: 'us-east-1'});

const BUCKET_NAME = process.env.BUCKET_NAME

function getFile({ext, mime}, buffer){
  const timeStamp = moment().format("YYYY-MM-DD-HH-mm-ss");

  const fileName = `testFile_${timeStamp}.${ext}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer
  };

  const meta = {
    size: buffer.toString('ascii').length,
    type: mime,
    name:fileName,
  }

  return {
    params,
    meta
  }
}


exports.handler = async (event, context) => {
  const request = event.body;
  const base64String = request.split(';base64,').pop()
  const buffer = new Buffer(base64String, 'base64');
  const fileMime = await fileType.fromBuffer(buffer)

  if (fileMime === null || fileMime === undefined){
    return context.fail("invalid file type")
  }

  const {params,meta} = getFile(fileMime,buffer)
  console.log("params,meta",params,meta)
  return s3.putObject(params,(err,data)=>{
    if(err){
      console.log(err);
      return context.fail(err)
    }
    return console.log("file_url", meta.full_path)
  }).promise()
};

// {
//     "Sid": "Stmt1468366974000",
//     "Effect": "Allow",
//     "Action": "s3:*",
//     "Resource": [
//         "arn:aws:s3:::my-bucket-name-goes-here/optional-path-before-allow/*"
//     ]
// }