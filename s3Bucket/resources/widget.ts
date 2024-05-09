import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
import {S3BucketLambdaStack} from "./s3-bucket-stack";
import {inspect} from "util";

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

/**
 *
 * @param {LambdaEvent} lambdaEvent
 */
const routeRequest = (lambdaEvent:any) => {
    if (lambdaEvent.httpMethod === "POST" && lambdaEvent.path === "/") {
        const body = JSON.parse(lambdaEvent.body)
        console.log('body')

        console.log(body)
        const construct = JSON.parse(body.params.Construct);
        console.log('construct')

        console.log(construct)
        const bucketName = body.params.BucketName
        console.log('bucket name')
        console.log(bucketName);
        const name = body.params.Name
        console.log('the check')
        const bucketMade = S3BucketLambdaStack.generateS3Bucket(construct, bucketName)
        const thisStatement = JSON.stringify(inspect(bucketMade));

        return buildResponseBody(200, thisStatement );
    }



    const error = new Error(
        `Unimplemented HTTP method: ${lambdaEvent.httpMethod}`,
    );
    error.name = "UnimplementedHTTPMethodError";
    throw error;
};

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
export const handler = async (event:any) => {
    try {
        return await routeRequest(event);
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