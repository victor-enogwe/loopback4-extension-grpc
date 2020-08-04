// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context} from '@loopback/core';
import {KeyCertPair} from '@grpc/grpc-js';
import {GrpcSequenceInterface} from './grpc.sequence';

export interface GrpcSecureOptions {
  rootCerts: Buffer;
  keyCertPairs: KeyCertPair[];
  checkClientCertificate: boolean;
}

/**
 * Binding keys used by this component.
 */
export namespace GrpcBindings {
  export const CONFIG = BindingKey.create<string>('grpc.config');
  export const GRPC_SEQUENCE = BindingKey.create<GrpcSequenceInterface>('grpc.sequence');
  export const GRPC_CONTROLLER = BindingKey.create<{[method: string]: Function}>('grpc.controller');
  export const GRPC_METHOD_NAME = BindingKey.create<string>('grpc.method.name');
  export const CONTEXT = BindingKey.create<Context>('grpc.context');
}
