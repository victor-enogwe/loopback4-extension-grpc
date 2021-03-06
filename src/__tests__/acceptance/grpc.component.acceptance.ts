// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, inject, CoreBindings} from '@loopback/core';
import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {loadSync} from '@grpc/proto-loader';
import {grpc, GrpcBindings, GrpcComponent, GrpcSequenceInterface, GrpcComponentConfig} from '../..';
import {Greeter, HelloReply, HelloRequest, TestRequest, TestReply} from './greeter.proto';
import {GrpcSequence} from '../../grpc.sequence';
import path from 'path';
import {loadPackageDefinition, Client, credentials, ServerUnaryCall} from '@grpc/grpc-js';
import {ServiceClientConstructor, GrpcObject} from '@grpc/grpc-js/build/src/make-client';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
Only run this on grpc typescript generation issues
Comment all tests to do so.
const app: Application = givenApplication();
(async () => {
  await app.start();
  await app.stop();
})();
**/
describe('GrpcComponent', () => {
  // LoopBack GRPC Service
  it('creates a grpc service', async () => {
    // Define Greeter Service Implementation
    class GreeterCtrl implements Greeter.Service {
      // Tell LoopBack that this is a Service RPC implementation
      @grpc(Greeter.SayHello)
      sayHello(request: HelloRequest): HelloReply {
        return {
          message: 'Hello ' + request.name,
        };
      }

      @grpc(Greeter.SayTest)
      sayTest(request: TestRequest): TestReply {
        return {
          message: 'Test ' + request.name,
        };
      }
    }
    // Load LoopBack Application
    const app: Application = givenApplication();
    app.controller(GreeterCtrl);
    await app.start();
    // Make GRPC Client Call
    const result: HelloReply = await asyncCall({
      client: getGrpcClient(app),
      method: 'sayHello',
      data: {name: 'World'},
    });
    expect(result.message).to.eql('Hello World');
    await app.stop();
  });
  // LoopBack GRPC Service
  it('creates a grpc service with custom sequence', async () => {
    // Define Greeter Service Implementation
    class GreeterCtrl implements Greeter.Service {
      // Tell LoopBack that this is a Service RPC implementation
      @grpc(Greeter.SayHello)
      sayHello(request: HelloRequest): HelloReply {
        const reply: HelloReply = {message: 'Hello ' + request.name};
        return reply;
      }

      @grpc(Greeter.SayTest)
      sayTest(request: TestRequest): TestReply {
        return {
          message: 'Test ' + request.name,
        };
      }
    }

    class MySequence extends GrpcSequence {
      constructor(
        @inject(GrpcBindings.GRPC_CONTROLLER) protected controller: {[method: string]: Function},
        @inject(GrpcBindings.GRPC_METHOD_NAME) protected method: string,
      ) {
        super(controller, method);
      }
      // tslint:disable-next-line:no-any
      async unaryCall(call: ServerUnaryCall<any, any>): Promise<any> {
        // Do something before call
        const reply = await this.controller[this.method](call.request);
        reply.message += ' Sequenced';
        // Do something after call
        return reply;
      }
    }

    // Load LoopBack Application
    const app: Application = givenApplication(MySequence);
    app.controller(GreeterCtrl);
    await app.start();
    // Make GRPC Client Call
    const result: HelloReply = await asyncCall({
      client: getGrpcClient(app),
      method: 'sayHello',
      data: {name: 'World'},
    });
    expect(result.message).to.eql('Hello World Sequenced');
    await app.stop();
  });
});
/**
 * Returns GRPC Enabled Application
 **/
function givenApplication(sequence?: Constructor<GrpcSequenceInterface>): Application {
  const GrpcConfig: GrpcComponentConfig = {host: '127.0.0.1', port: 8080, protoOutDir: path.resolve(__dirname)};
  if (sequence) {
    GrpcConfig.sequence = sequence;
  }
  const app = new Application({grpc: GrpcConfig});

  app.component(GrpcComponent);
  return app;
}
/**
 * Returns GRPC Client
 **/
function getGrpcClient(app: Application) {
  const packageDef = loadSync(path.join(__dirname, '../../../', 'fixtures/greeter.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = loadPackageDefinition(packageDef);
  const client = proto.greeterpackage as GrpcObject;
  const {port, host} = app.getSync(CoreBindings.APPLICATION_CONFIG.deepProperty('grpc'));
  return new (client.Greeter as ServiceClientConstructor)(`${host}:${port}`, credentials.createInsecure());
}
/**
 * Callback to Promise Wrapper
 **/
async function asyncCall(input: {client: Client; method: string; data: any}): Promise<HelloReply> {
  const client = input.client as any;
  return new Promise<HelloReply>((resolve, reject) =>
    client[input.method](input.data, (err: any, response: HelloReply) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    }),
  );
}
