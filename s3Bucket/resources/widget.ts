import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
import {S3BucketLambdaStack} from "./s3-bucket-stack";
import * as cdk from "aws-cdk-lib";
import {S3BucketStack2} from "../lib/s3_bucket-stack";
const app = new cdk.App();

// The following code uses the AWS SDK for JavaScript (v3).
// For more information, see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html.
const s3Client = new S3Client({});

/**
 * @param {string} bucketName
 */
const listObjectNames = async (bucketName:string) => {
    const command = new ListObjectsCommand({ Bucket: bucketName });
    const { Contents } = await s3Client.send(command);

    if (Contents === undefined) {
        return;
    }
    if (!Contents.length) {
        const err = new Error(`No objects found in ${bucketName}`);
        err.name = "EmptyBucketError";
        throw err;
    }

    // Map the response to a list of strings representing the keys of the Amazon Simple Storage Service (Amazon S3) objects.
    // Filter out any objects that don't have keys.
    return Contents.map(({ Key }) => Key).filter((k) => !!k);
};

/**
 * @typedef {{ httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', path: string }} LambdaEvent
 */


const parseRequest = (lambdaEvent:any)  => {
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

    switch(lambdaEvent.path) {
        case "/s3-service":
            const bucketName = body.params.BucketName
            const s3Stack = new S3BucketLambdaStack(app, 'S3BucketStack', {
                env: {region: region, account: account}
            });
            s3Stack.generateS3Bucket(bucketName)
            break;
    }

    return;
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

const handleGetRequest = async () => {

   // S3BucketStack.generateS3Bucket('')

/*    if (process.env.BUCKET === "undefined") {
        const err = new Error(`No bucket name provided.`);
        err.name = "MissingBucketName";
        throw err;
    }

    if (process.env.BUCKET === undefined) {
        return;
    } */
    const objects = await listObjectNames("image-caching-frontenddistributiontos3s3bucket3a1-jdzpp40gc4gh");

    return buildResponseBody(200, objects);
};

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