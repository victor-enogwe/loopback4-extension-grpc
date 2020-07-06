// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {ServerUnaryCall, ServerReadableStream, ServerDuplexStream, ServerWritableStream} from '@grpc/grpc-js';
import {GrpcBindings} from './keys';
import debugFactory from 'debug';

const debug = debugFactory('loopback:grpc');

/**
 * Interface that describes a GRPC Sequence
 */
export interface GrpcSequenceInterface {
  unaryCall<Req, Res>(request: ServerUnaryCall<Req, Res>): Promise<Res>;
  clientStreamingCall<Req, Res>(clientStream: ServerReadableStream<Req, Res>): Promise<Res>;
  processServerStream<Req, Res>(stream: ServerWritableStream<Req, Res>): void;
  processBidiStream<Req, Res>(stream: ServerDuplexStream<Req, Res>): void;
}

/**
 * GRPC Sequence
 */
export class GrpcSequence implements GrpcSequenceInterface {
  constructor(
    @inject(GrpcBindings.GRPC_CONTROLLER) protected controller: {[method: string]: Function},
    @inject(GrpcBindings.GRPC_METHOD_NAME) protected method: string,
  ) {}

  async unaryCall<Req, Res>(call: ServerUnaryCall<Req, Res>): Promise<Res> {
    // Do something before call
    debug('Calling %s.%s', this.controller.constructor.name, this.method, call.request);
    const reply = await this.controller[this.method](call.request);
    // Do something after call
    return reply;
  }

  /**
   * grpc client streaming call
   *
   * @template Req
   * @template Res
   * @param {ServerReadableStream<Req, Res>} clientStream
   * @returns {Promise<Res>}
   * @memberof GrpcSequence
   */
  async clientStreamingCall<Req, Res>(clientStream: ServerReadableStream<Req, Res>): Promise<Res> {
    debug('Calling %s.%s', this.controller.constructor.name, this.method);
    const reply = await this.controller[this.method](clientStream);
    return reply;
  }

  /**
   * grpc process server stream
   *
   * @template Req
   * @template Res
   * @param {ServerWritableStream<Req, Res>} stream
   * @memberof GrpcSequence
   */
  processServerStream<Req, Res>(stream: ServerWritableStream<Req, Res>): void {
    debug('Calling %s.%s', this.controller.constructor.name, this.method);
    this.controller[this.method](stream);
  }

  /**
   * grpc process stream
   *
   * @template Req
   * @template Res
   * @param {ServerDuplexStream<Req, Res>} stream
   * @memberof GrpcSequence
   */
  processBidiStream<Req, Res>(stream: ServerDuplexStream<Req, Res>): void {
    debug('Calling %s.%s', this.controller.constructor.name, this.method);
    this.controller[this.method](stream);
  }
}
