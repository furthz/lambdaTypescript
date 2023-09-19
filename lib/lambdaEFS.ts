
import { IVpc, Peer, Port, SecurityGroup, SubnetSelection } from "aws-cdk-lib/aws-ec2";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { FileSystem, AccessPoint } from "aws-cdk-lib/aws-efs"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { Duration } from "aws-cdk-lib";

export interface LambdaProjectEFSProps {
    functionName: string;
    runtime: Runtime;
    pathCode: string;
    handler: string;
    vpc: IVpc;
    //subnets: SubnetSelection;
    fileSystemId: string;
    fileSystemSecurityGroupName: string;
    accessPointId: string;
    duration?: number;
}

export class LambdaProjectEFS extends Construct {
    constructor(scope: Construct, id: string, props: LambdaProjectEFSProps) {
        super(scope, id);

        //Crear el Role para acceder a la vpc
        const roleExec = new Role(this, 'roleExec', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            roleName: `RoleLambdaVPC`
        });

        roleExec.addToPolicy(new PolicyStatement({
            actions: [
                "ec2:CreateNetworkInterface",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DeleteNetworkInterface",
                "ec2:AssignPrivateIpAddresses",
                "ec2:UnassignPrivateIpAddresses"
            ],
            resources: ['*'],
            effect: Effect.ALLOW
        }));

        roleExec.addToPolicy(new PolicyStatement({
            actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
            ],
            resources: ['*'],
            effect: Effect.ALLOW
        }));

        roleExec.addToPolicy(new PolicyStatement({
            actions: [
                "elasticfilesystem:ClientRootAccess",
                "elasticfilesystem:ClientWrite",
                "elasticfilesystem:ClientMount"
            ],
            resources: ['*'],
            effect: Effect.ALLOW
        }));

        const sgEfs = new SecurityGroup(this, 'sgEfs', {
            securityGroupName: 'efssg',
            vpc: props.vpc,
        });

        sgEfs.addIngressRule(Peer.ipv4("0.0.0.0/0"), Port.tcp(2049), 'acceso al efs');

        // Importar EFS
        const efsSystem = FileSystem.fromFileSystemAttributes(this, 'efsLambda', {
            fileSystemId: props.fileSystemId,
            securityGroup: SecurityGroup.fromLookupByName(this, 'sgEFS', props.fileSystemSecurityGroupName, props.vpc),
        });

        // Importar Access Point
        const lambdaFS = lambda.FileSystem.fromEfsAccessPoint(
            AccessPoint.fromAccessPointAttributes(this, 'AP', {
                accessPointId: props.accessPointId,
                fileSystem: efsSystem
            }), '/mnt/efs')

        const func = new Function(this, 'Lambda', {
            functionName: props.functionName,
            runtime: props.runtime,
            code: Code.fromAsset(props.pathCode),
            handler: props.handler,
            vpc: props.vpc,
            allowPublicSubnet: true,
            timeout: Duration.seconds(props.duration!),
            //vpcSubnets: props.subnets,
            securityGroups: [sgEfs],
            filesystem: lambdaFS,
            environment: {
                "DAYS_TO_REMOVE": "1",
                "PATH_FS": '/mnt/efs'
            }
        });
    }
}