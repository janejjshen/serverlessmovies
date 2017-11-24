# Serverless DynamoDB CRUD API Example

Jane Shen (janeshen@amazon.com)

## Overview

This repository provides sample code to develop and deploy a serverless Create, Read, Update, Delete (CRUD) API on a movies database, leveraging AWS Lambda, API Gateway, DynamoDB and the Amazon Serverless Application Model (SAM) framework. 

## Source
The source contains the code and template to deploy the application:

1. `index.js`: The code file for the CRUD Lambda functions.
2. `samTemplate.yaml`: The SAM template to deploy the application

## Get Started
To get started on deploying the application, follow the steps:
1. Compress index.js, and upload the zip file to a S3 bucket of your choice.
2. Open AWS cli, and execute:
`aws cloudformation package --template-file samTemplate.yaml --output-template-file serverless-output.yaml --s3-bucket [YourS3BucketName]`
Note you'll need to supply "YourS3BucketName" with the S3 bucket you're uploaded the zip file to.
3. In AWS Cli, execute:
- `aws cloudformation deploy --template-file serverless-output.yaml --stack-name Movies --capabilities CAPABILITY_IAM --parameter-overrides S3Bucket=[YourS3BucketName] CodeZipKey=[YourZipFileName]`
Note you'll need to supply your S3 bucket name and zip file names as parameters.
4. Open the AWS Console, navigate to "API Gateways" and examine the "movies" API that has been created.

## Sample Requests:
1. Create a movie:
`POST`

```json
{
    "year" : "2017",
    "title": "My Movie"
}
```

2. Get a movie:
`GET`
?title="My Movie"&year=2017

3. Update a movie:
`POST`
```json
{
    "year" : "2017",
    "title": "My Movie",
    "info": "Here is some new info about my movie."
}

```

4. Delete a movie:
`POST`
```json
{
    "year" : "2017",
    "title": "My Movie"
}
```

