zip -r ./lambdaUploadToS3.zip ./node_modules ./index.js
echo "...starting upload"
aws lambda update-function-code --function-name save-image-to-s3 --zip-file fileb://lambdaUploadToS3.zip  --region us-east-1
echo "--DONE--"
