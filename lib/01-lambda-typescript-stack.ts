import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaProject } from './lambda';
import path = require('path');
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import { LambdaProjectEFS } from './lambdaEFS';

export class LambdaTypescriptStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new LambdaProject(this, 'HolaMundo', {
      functionName: 'HolaMundo',
      handler: 'hello-world.handler',
      pathCode: `${path.join(__dirname, '../code/lambda01/dist')}`,
      runtime: Runtime.NODEJS_18_X
    });

    const vpcBase = Vpc.fromLookup(this, 'vpcBase', {
      vpcId: 'vpc-04b16f39af4e19337'
    })

    new LambdaProjectEFS(this, 'EFSLambda', {
      functionName: 'EfsClean',
      handler: 'index.handler',
      pathCode: `${path.join(__dirname, '../code/efsClean/dist')}`,
      runtime: Runtime.NODEJS_18_X,
      vpc: vpcBase,
      duration: 60,
      fileSystemId: 'fs-031a660428c99334e',
      fileSystemSecurityGroupName: 'default',
      accessPointId: 'fsap-07fa1846622cbc3ca'
    })
  }
}
