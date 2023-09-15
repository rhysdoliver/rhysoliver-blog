---
title: Using Mock Service Worker in Lambdas
date: "2023-09-14T18:00:00.000Z"
description: "A better way to mock requests and do synthetic testing"
---

[Mock Service Worker](https://mswjs.io) is a developer tool to mock api requests at the network level, allowing for tests and development to closer reflect the real behaviour of deployed applications. Kent Dodds has a [great guide](https://kentcdodds.com/blog/stop-mocking-fetch) and details on why MSW may be preferrable over mocking fetch when writing tests.

Sometimes in deployed environments such as dev, it may be required to isolate the environment from external influences. This can allow testing of deployed infrastructure and code to test that internally everything is working as expected, when external services are also working. This can be especially important in serverless architecture as there will be differences between local and deployed environements. MSW can be used for local development, so why not a deployed environment too!


Using MSW with a Lambda function can appear to be a challenge intially, given the temporary nature of a Lambda and MSW running as a background listener. Thankfully when using MSW with Node, all that is happening under the hood is a hijacking of some core node modules.

To get MSW running in a deployed node environment we can loosely follow the MSW Getting started guide for the [node implementation](https://mswjs.io/docs/getting-started/integrate/node). But, instead of integrating with Jest using the setup file, we can create two helper functions to start and stop our MSW instance during our lambda execution. Stopping is really important, as future lambda invocations can reuse previous execution environments. So if msw was enabled, it would continue to mock requests in these future invocations where we may not want to mock anymore.

Another very important note is MSW behaves in such a way where once server.close() is called, that server instance can never be started again, calling server.listen() again will do nothing. So, we must create a new instance of the server everytime our lambda runs. The overhead is minimal as MSW is not doing anything heavy to kick off the server.

```typescript
import { type SetupServer, setupServer } from 'msw/node'
import { handlers } from '~/mocks/handlers'

type StartMSW = () => SetupServer

export const startMSW: StartMSW = () => {
    const server = setupServer(handlers);
    server.listen()
    return server
}

type StopMSW = (server: SetupServer) => void

export const stopMSW: StopMSW = (server) => {
    server.close()
}
```

These two functions can now be used at the start and end of your lambda execution to enable mocking in your deployed environment.

Now, we want to have control of when we do and don't want MSW to start. Given we will be deploying this same code to environments where we don't want MSW to intercept network requests, lets add an environment variable to control the start, and optionally close the server if it was opened.

```typescript
import { type SetupServer, setupServer } from 'msw/node'
import { handlers } from '~/mocks/handlers'

type StartMSW = () => SetupServer | null

export const startMSW: StartMSW = () => {
    // Don't start unless we explicitly want to
    if (!process.env.MSW_STATUS==='enabled') return null
    const server = setupServer(handlers);
    server.listen()
    return server
}

type StopMSW = (server?: SetupServer) => void

export const stopMSW: StopMSW = (server) => {
    if (!server) return
    server.close()
}
```

Nice, now we can control the usage of MSW via an environment variable in the lambda function. Allowing our production deployment to make real requests, with little risk of accidentally switching it on and also little impact on performance.

You may think that having to add the start and stop to any lambda function we want to enable mocking in seems like a bad approach, and you'd be right. So, instead of having two functions to import and add to the start and end of every lambda, we can create a decorator function to wrap our Lambda in.

A decorator function can intercept the start of our lambda, do some things, allow the lambda to run and again intercept the lambda output before completing its lifecycle.

We can setup a decorator in the following way. The output of the function being a lambda function. This example is for a Lambda integration with a REST API Gateway.

```typescript
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Callback,
  Context,
} from 'aws-lambda'
import type { DefaultBodyType, MockedRequest, RestHandler } from 'msw'
import { setupServer, type SetupServer } from 'msw/node'
import { handlers as baseMswHandlers } from '../../mocks/handlers'

export const mswDecorator = (
  lambdaHandlerToDecorate: APIGatewayProxyHandler,
  mswHandlers: RestHandler<MockedRequest<DefaultBodyType>>[] = baseMswHandlers
) => {
  return async (
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
  ) => {
    // Pre Handler code
    //   Start MSW if required
    let server: SetupServer | null = null
    const mswEnabled = process.env.MSW_STATUS === 'enabled'
    if (mswEnabled) {
      server = setupServer(...mswHandlers)
      server.listen()
      console.info('MSW running')
    } else {
      console.debug('MSW skipped')
    }

    const response = (await lambdaHandlerToDecorate(
      event,
      context,
      callback
    )) as APIGatewayProxyResult
    // Post Handler code
    //   Stop MSW if started
    if (server) {
      server.close()
      console.info('MSW listener closed')
    }

    return response
  }
}
```

As you can see, we can place all of our logic on deciding if we want to mock requests or not within this decorator. This leaves our actual lambda code to only be concerned with business logic.

We can also easily extend this logic to enable other ways to enable MSW in our deployment. For example, a request header could be used to enable mocking on specific requests for things like synthetic tests. 

To use this decorator in a Lambda function we would write something similar to the following. We still have to remember to enable mocking on this lambda, but the details are abstracted away and we know cleanup will be handled.

```typescript
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { mswDecorator } from '../utils/mswDecorator'

export const decoratedHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  
    console.log(event);
    // Business logic lives here
    // Any calls to external services will be mocked
    // As long as a handler exists

    return {
    statusCode: 200,
    body: JSON.stringify({
        message: 'Awesome Mocked Endpoint',
    }),
    }
}

// Enable mocking for this handler
export const handler = mswDecorator(decoratedHandler)
```

Enabling mocking in this way enables a far superior way of testing, as without MSW we would have to write mocks for both our test environment as well as on our deployed code. This solution gives us a single source of truth for the mocked responses we get, meaning if they ever changed we only have one place to update instead of two.