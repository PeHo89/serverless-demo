import 'source-map-support/register';

import { middyfy } from '@libs/lambda';
import { SignupDto } from './signup.dto';
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { createHash } from '@libs/security';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function signup(event): Promise<any> {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Welcome on board!'
    }),
  };

  const signupDto: SignupDto = event.body;

  const result = await dynamoDB.scan({
    TableName: "user",
    FilterExpression: "#email = :email",
    ExpressionAttributeNames:{
        "#email": "email"
    },
    ExpressionAttributeValues: {
        ":email": signupDto.email
    }
  }).promise();

  if (result.Count !== 0) {
    response.statusCode = 409;
    response.body = JSON.stringify({ message: 'Email already exits' });
    return response;
  }

  dynamoDB.put({
    TableName: "user",
    Item: {
      id: uuidv4(),
      ...signupDto,
      password: await createHash(signupDto.password, 12),
    }
  }).promise();

  return response;
}

export const main = middyfy(signup);
