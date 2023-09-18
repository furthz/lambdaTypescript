import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaProject } from './lambda';
import path = require('path');
import { Runtime } from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class LambdaTypescriptStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new LambdaProject(this, 'HolaMundo', {
      functionName: 'HolaMundo',
      handler: 'hello-world.handler',
      pathCode: `${path.join(__dirname, '../code/lambda01/dist')}`,
      runtime: Runtime.NODEJS_18_X
    })
  }
}
