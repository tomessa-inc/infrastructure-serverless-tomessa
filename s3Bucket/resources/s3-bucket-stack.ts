import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CfnOutput, RemovalPolicy} from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";


export class S3BucketLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


    }

    public generateS3Bucket(bucketName:string) {
        console.log("in generation")
        const check = new s3.Bucket(this, `s3-bucket-${bucketName}`, {
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

       // console.log("the check")
     //   console.log(check);
     //   console.log('we are done')
    }


}
