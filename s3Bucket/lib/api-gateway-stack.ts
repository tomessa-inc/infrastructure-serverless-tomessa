import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {LambdaStack} from "./lambda-stack";

export class ApiGatewayStack extends cdk.Stack {
    private _restApi: apigateway.RestApi
    private _lambdaIntegration: cdk.aws_apigateway.LambdaIntegration;
    private _apiResource:cdk.aws_apigateway.Resource
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        this.initialize();
    }

    private async initialize() {
        this.generateLambdaIntegration
        this.generateRestApi();
        this.generateRootMethod();
        await this.generateResource("s3-service");
        this.generateMethod();
    }

    private generateRestApi() {
        this._restApi = new apigateway.RestApi(this, "widgets-api", {
            restApiName: "CDK Service",
            description: "This service generate resources through AWS CDK."

        });
    }

    private generateLambdaIntegration() {
        this._lambdaIntegration = new apigateway.LambdaIntegration(LambdaStack.getDockerImageFunction(this, 'lambda-integration'), {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        });
    }

    private generateRootMethod() {
        this._restApi.root.addMethod("POST",  this._lambdaIntegration); // GET
    }

    private async generateResource(path:string) {
        this._apiResource = this._restApi.root.addResource("s3-service");
        this.generateMethod();
    }

    private generateMethod() {
        this._apiResource.addMethod("POST",  this._lambdaIntegration); // GET
    }
}
