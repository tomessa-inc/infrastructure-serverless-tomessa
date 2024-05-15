import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {LambdaStack} from "./lambda-stack";
import {CfnOutput} from "aws-cdk-lib";

export class ApiGatewayStack extends cdk.Stack {
    private _restApi: apigateway.RestApi
    private _lambdaIntegration: cdk.aws_apigateway.LambdaIntegration;
    private _apiResource:cdk.aws_apigateway.Resource
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        this.initialize();
    }

    private async initialize() {
        this.generateLambdaIntegration();
        this.generateRestApi();
        this.generateRootMethod();
        await this.generateResource("s3-service");
      //  this.generateMethod();


    }

    private generateRestApi() {
        this._restApi = new apigateway.RestApi(this, "rest-api-cdk", {
            restApiName: "CDK Service",
            description: "This service generate resources through AWS CDK."

        });
    }

    private generateLambdaIntegration() {
        const boo = LambdaStack.getDockerImageFunction(this, 'lambda-integration')
        console.log('boo')
        console.log(boo)
        this._lambdaIntegration = new apigateway.LambdaIntegration(boo, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        });
        new CfnOutput(this, "testFunction", {
            value: boo.functionArn,
            exportName: "testFunction",
        });

    }

    private generateRootMethod() {
        this._restApi.root.addMethod("POST",  this._lambdaIntegration); // GET
    }

    private async generateResource(path:string) {
        this._apiResource = this._restApi.root.addResource(`${path}`);
        this.generateMethod();
    }

    private generateMethod() {
        this._apiResource.addMethod("POST",  this._lambdaIntegration); // GET
    }
}
