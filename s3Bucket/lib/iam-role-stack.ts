import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CfnOutput} from "aws-cdk-lib";

const lambdaRoleArn = cdk.Fn.importValue("lambdaRoleArn");

export class IAMRoleStack extends cdk.Stack {
  private _lambdaRole:  cdk.aws_iam.Role;
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

  private _initialize() {
    this._generateLambdaRole();
    this._generateLamdaPolicy();
    this._generateOutputs();
  }

  private _generateOutputs() {
    new CfnOutput(this, "lambdaRoleArn", {
      value: this._lambdaRole.roleArn,
      exportName: "lambdaRoleArn",
    });
  }
}
