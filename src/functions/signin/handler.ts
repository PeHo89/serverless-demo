import 'source-map-support/register';

import { middyfy } from '@libs/lambda';
import { SigninDto } from './signin.dto';
import * as AWS from "aws-sdk";
import { verifyHash } from '@libs/security';
import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '@libs/types';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function signin(event): Promise<any> {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: '<access_token>'
    }),
  };

  const signinDto: SigninDto = event.body;

  const result = await dynamoDB.scan({
    TableName: "user",
    FilterExpression: "#email = :email",
    ExpressionAttributeNames:{
        "#email": "email"
    },
    ExpressionAttributeValues: {
        ":email": signinDto.email
    }
  }).promise();

  if (result.Count !== 1) {
    response.statusCode = 409;
    response.body = JSON.stringify({ message: 'Invalid credentials' });
    return response;
  }

  const passwordsMatch = await verifyHash(signinDto.password, result.Items[0].password);

  if (!passwordsMatch) {
    response.statusCode = 409;
    response.body = JSON.stringify({ message: 'Invalid credentials' });
    return response;
  }

  const id = result.Items[0].id;
  const email = result.Items[0].email;

  const payload: JWTPayload = { id, email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET);

  response.body = JSON.stringify({ accessToken });

  return response;
}

export const main = middyfy(signin);
