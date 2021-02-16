import 'source-map-support/register';

import { middyfy } from '@libs/lambda';

async function user(event): Promise<any> {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: event.requestContext.authorizer.user
    }),
  };
  return response;
}

export const main = middyfy(user);
