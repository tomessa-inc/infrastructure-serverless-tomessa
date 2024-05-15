import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CfnOutput} from "aws-cdk-lib";

const lambdaRoleArn = cdk.Fn.importValue("lambdaRoleArn");
const apiGatewayRoleArn = cdk.Fn.importValue("apiGatewayRoleArn");


export class IAMRoleStack extends cdk.Stack {
  private _lambdaRole:  cdk.aws_iam.Role;
  private _apiGatewayRole:  cdk.aws_iam.Role;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this._initialize()

  }

  public static getLambdaRole(construct:Construct, name:string) {
    return cdk.aws_iam.Role.fromRoleArn(
        construct,
        `${name}-lambda-role`,
        lambdaRoleArn,
        {
          mutable: false,
        },
    );
  }

  public static getApiGatewayRole(construct:Construct, name:string) {
    return cdk.aws_iam.Role.fromRoleArn(
        construct,
        `${name}-apigateway-role`,
        apiGatewayRoleArn,
        {
          mutable: false,
        },
    );
  }


  private _generateLambdaRole() {
    this._lambdaRole = new cdk.aws_iam.Role(this, "lambda-role", {
      roleName: "lambda-role",
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });
  }

  private _generateLamdaPolicy() {
    this._lambdaRole.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
    });
  }

  private _generateAPIGatewayRole() {
    this._apiGatewayRole = new cdk.aws_iam.Role(this, "apigateway-role", {
      roleName: "apigateway-role",
      assumedBy: new cdk.aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
  }

  private _generateAPIGatewayPolicy() {
    this._apiGatewayRole.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs",
    });
  }



  private _initialize() {
    this._generateLambdaRole();
    this._generateLamdaPolicy();
    this._generateAPIGatewayRole();
    this._generateAPIGatewayPolicy();
    this._generateOutputs();
  }

  private _generateOutputs() {
    new CfnOutput(this, "lambdaRoleArn", {
      value: this._lambdaRole.roleArn,
      exportName: "lambdaRoleArn",
    });

    new CfnOutput(this, "apiGatewayRoleArn", {
      value: this._apiGatewayRole.roleArn,
      exportName: "apiGatewayRoleArn",
    });
  }
}
