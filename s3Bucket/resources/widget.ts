import {S3BucketLambdaStack} from "./s3-bucket-stack";
import * as cdk from "aws-cdk-lib";
//const execa = require('execa')
import { execaNode } from "execa"
import * as fs from 'fs-extra';
import { randomUUID } from 'crypto';

//const app = new cdk.App();
const assemblyDir = `/tmp/cdk.out.${randomUUID()}`;
const app = new cdk.App({ outdir: assemblyDir });
// The following code uses the AWS SDK for JavaScript (v3).
// For more information, see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html.
app.synth();

/**
 * @typedef {{ httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', path: string }} LambdaEvent
 */


const parseRequest = async (lambdaEvent:any)  => {
    if (lambdaEvent.httpMethod !== "POST") {
        return buildResponseBody(500, "Protocol not supported" );
    }

    const body = JSON.parse(lambdaEvent.body)
    const account = body.params.account
    const region = body.params.region ?? "us-east-1"
    const identifier = body.params.identifier


    if (  identifier === "") {
        return buildResponseBody(500, "Identifier is missing" );
    }

    console.log('about to start')
    switch(lambdaEvent.path) {
        case "/s3-service":
            try {
                console.log('intry ')
                const bucketName = body.params.BucketName
                const s3Stack = new S3BucketLambdaStack(app, 'S3BucketStack', {
                    env: {region: region, account: account}
                });
                s3Stack.generateS3Bucket(bucketName);

                await execaNode('cdk', ['deploy', '--app', assemblyDir, '--all', '--require-approval=never'], {
                    stdout: process.stdout,
                    stderr: process.stderr,
                });
            } finally {
                // Clean up.
                await fs.remove(assemblyDir);
            }

 //           s3Stack.generateS3Bucket(bucketName)
            break;
    }


    return buildResponseBody(200, "The bucket was created successfully" );
}

/**
 *
 * @param {LambdaEvent} lambdaEvent
 *//*
const routeRequest = (lambdaEvent:any) => {

    if (lambdaEvent.httpMethod === "POST" && lambdaEvent.path === "/") {
        const body = JSON.parse(lambdaEvent.body)
        console.log('body')

        console.log(body)


   //     const construct = JSON.parse(body.params.Construct);
        const construct =  JSON.parse(body.params.Construct);
        console.log('construct')

        console.log(construct)
        const bucketName = body.params.BucketName
        console.log('bucket name')
        console.log(bucketName);
        console.log('the check')
        const bucketMade = S3BucketLambdaStack.generateS3Bucket(construct, bucketName)
        console.log(bucketMade);
        const thisStatement = JSON.stringify(inspect(bucketMade));
        console.log('the statement')
        console.log(thisStatement)
        return buildResponseBody(200, thisStatement );
    }



    const error = new Error(
        `Unimplemented HTTP method: ${lambdaEvent.httpMethod}`,
    );
    error.name = "UnimplementedHTTPMethodError";
    throw error;
}; */

/**
 * @typedef {{statusCode: number, body: string, headers: Record<string, string> }} LambdaResponse
 */

/**
 *
 * @param {number} status
 * @param {Record<string, string>} headers
 * @param {Record<string, unknown>} body
 *
 * @returns {LambdaResponse}
 */
const buildResponseBody = (status:any, body:any, headers = {}) => {
    return {
        statusCode: status,
        headers,
        body,
    };
};

/**
 *
 * @param {LambdaEvent} event
 */
export const handler = async (event:Event) => {
    try {

        return await parseRequest(event);
    } catch (err) {
        console.error(err);

        if (err.name === "MissingBucketName") {
            return buildResponseBody(400, err.message);
        }

        if (err.name === "EmptyBucketError") {
            return buildResponseBody(204, []);
        }

        if (err.name === "UnimplementedHTTPMethodError") {
            return buildResponseBody(400, err.message);
        }

        return buildResponseBody(500, err.message || "Unknown server error");
    }
};