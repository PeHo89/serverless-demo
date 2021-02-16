import 'source-map-support/register';

import { middyfy } from '@libs/lambda';
import * as AWS from "aws-sdk";
import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '@libs/types';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function authorize(event, _context, callback): Promise<any> {
  // event.authorizationToken = "Bearer eyJhbGciOiJIU..."
  const accessToken = event.authorizationToken.split(' ')[1];

  let payload: JWTPayload;

  try {
    payload = jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch(error) {
    callback('Unauthorized');
  }

  const result = await dynamoDB.get({
    TableName: 'user',
    Key: {
      id: payload.id
    }
  }).promise();

  if (!result.Item) {
    callback('Unauthorized');
  }

  const policy = {
    principalId: result.Item.id,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
      ],
    },
    context: { user: result.Item },
  };

  callback(null, policy);
}

export const main = middyfy(authorize);
