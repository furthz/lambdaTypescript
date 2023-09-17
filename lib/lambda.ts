import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface LambdaProjectProps {
    functionName: string;
    runtime: Runtime;
    pathCode: string;
    handler: string;
}

export class LambdaProject extends Construct {
    constructor(scope: Construct, id: string, props: LambdaProjectProps) {
        super(scope, id);
        const func = new Function(this, 'Lambda', {
            functionName: props.functionName,
            runtime: props.runtime,
            code: Code.fromAsset(props.pathCode),
            handler: props.handler
        });

        new LambdaRestApi(this, 'apigw', {
            handler: func
        })
    }
}