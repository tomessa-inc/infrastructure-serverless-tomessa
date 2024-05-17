import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import {IAMRoleStack} from "./iam-role-stack";
import { Architecture, Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import {CfnOutput} from "aws-cdk-lib";
const dockerImageFunctionArn = cdk.Fn.importValue("dockerImageFunctionArn");

let layer:any;

export class LambdaStack extends cdk.Stack {
    private _dockerImageFunction: cdk.aws_lambda.DockerImageFunction;
    private _layer = cdk.aws_lambda.LayerVersion;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        this.initialize();
    }

    private initialize() {
        this.generateImageFunction();
        this.generateOutputs();
    }


    private generateImageFunction() {

        this._dockerImageFunction = new lambda.DockerImageFunction(this, "SourceDockerImageFunction", {
            code: lambda.DockerImageCode.fromImageAsset("resources", {
                cmd: ["widget.handler"],
                entrypoint: ["/lambda-entrypoint.sh"],
            }),
            role: IAMRoleStack.getLambdaRole(this, 'lambda-bucket'),
            functionName: "lambda-wrapper-function-aws-cdk",
            architecture: Architecture.X86_64,
            layers: [
                // Adding the above Layer to our Lambda
                layer
            ]
        });
    }

    private generateLayer() {
        layer = new LayerVersion(this, "layer_cdk", {
            compatibleRuntimes: [ Runtime.NODEJS_20_X ],
            compatibleArchitectures: [ Architecture.X86_64 ],
            code: Code.fromAsset('layer-cdk')
        });
    }


    private generateOutputs() {
        new CfnOutput(this, "dockerImageFunctionArn", {
            value: this._dockerImageFunction.functionArn,
            exportName: "dockerImageFunctionArn",
        });
    }

    public static getDockerImageFunction(construct:Construct, id:string) {
    //   return lambda.DockerImageFunction.fromFunctionArn(construct, `SourceDockerImageFunction-${id}`, dockerImageFunctionArn)
        return lambda.DockerImageFunction.fromFunctionAttributes(construct, `SourceDockerImageFunction-${id}`, {
            functionArn: dockerImageFunctionArn,
            role: IAMRoleStack.getLambdaRole(construct, 'lambda-bucket-image'),
        })
    }
}
