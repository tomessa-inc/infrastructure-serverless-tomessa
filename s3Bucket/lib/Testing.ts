import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CfnOutput, RemovalPolicy} from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
//import fetch from 'node-fetch';
import axios from 'axios';
import { inspect } from 'util' // or directly
const circle = require('circular-json')

const apiGatewayRoleArn = cdk.Fn.importValue("apiGatewayRoleArn");

export class TestingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.initialize()
    }

    async initialize() {
        await this.test()
    }




    async test() {
     //   const test:Construct = this;
        //JSON.stringify(test)
        // JSON.stringifyJSON.stringify(scope)
        console.log('the this')
        console.log(this);
        console.log(circle.stringify(this));
      //  `${Buffer.from(this).toString('base64')}`;
   //     console.log('the inspect')
     //   console.log(inspect(this));
    //    const thisStatement = JSON.stringify(inspect(this));

     //   const base64Content = `${Buffer.from(thisStatement).toString('base64')}`;

        axios.post('https://72mbyi42th.execute-api.us-east-1.amazonaws.com/prod', {
            params: {
                Construct: circle.stringify(this),
                BucketName: "tomvisions-test-bucket",
                Name: "test-bucket"
            }
        })
            .then(function (response) {
                // handle success
                console.log(response);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
                // always executed
            });
      //  const response = await fetch('https://8msnj1ikz8.execute-api.us-east-1.amazonaws.com/prod', {method: 'POST', body: `content=${thisStatement}`});

    }

    public static getLambdaRole(construct:Construct, name:string) {
        return cdk.aws_iam.Role.fromRoleArn(
            construct,
            `${name}-lambda-role`,
            apiGatewayRoleArn,
            {
                mutable: false,
            },
        );
    }

    public static  generateS3Bucket(construct:Construct, bucketName:string) {
        return new s3.Bucket(construct, `s3-bucket-${bucketName}`, {
            bucketName: bucketName,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            /**
             * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new bucket, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
             */
            removalPolicy: RemovalPolicy.DESTROY,

            /**
             * For sample purposes only, if you create an S3 bucket then populate it, stack destruction fails.  This
             * setting will enable full cleanup of the demo.
             */
            autoDeleteObjects: true, // NOT recommended for production code

        });
    }


}
