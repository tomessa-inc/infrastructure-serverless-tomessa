import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {IAMRoleStack} from "./iam-role-stack";
import { Architecture, Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class S3BucketStack2 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'S3BucketQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const bucket = new s3.Bucket(this, "WidgetStore");



    const handler = new lambda.DockerImageFunction(this, "WidgetHandler", {
      code: lambda.DockerImageCode.fromImageAsset("resources", {
      cmd: [ "widget.handler" ],
      entrypoint: ["/lambda-entrypoint.sh"],
    }),
      role: IAMRoleStack.getLambdaRole(this, 'lambda-bucket'),
      functionName: "lambda-s3",
      architecture: Architecture.X86_64
    });


    bucket.grantReadWrite(handler);

    const api = new apigateway.RestApi(this, "widgets-api", {
      restApiName: "Widget Service",
      description: "This service serves widgets."

    });


    const getWidgetsIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

      api.root.addMethod("POST", getWidgetsIntegration); // GET /
  }
}
