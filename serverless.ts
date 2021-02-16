import type { AWS } from '@serverless/typescript';

import { signup, signin, authorize, user } from './src/functions';

const serverlessConfiguration: AWS = {
  service: 'demo-ts',
  org: 'message',
  app: 'demo-ts-app',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    profile: 'peho',
    memorySize: 256,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      JWT_SECRET: 'mysupersecuresecret#123'
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
        ],
        Resource: "arn:aws:dynamodb:us-east-1:673824303910:table/user",
      },
    ],
  },
  functions: { signup, signin, authorize, user },
  resources: {
    Resources: {
      userTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "user",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
