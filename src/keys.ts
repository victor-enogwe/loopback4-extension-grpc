// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {Server, KeyCertPair} from '@grpc/grpc-js';
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
  export const GRPC_SERVER = BindingKey.create<Server>('grpc.server');
  export const GRPC_SEQUENCE = BindingKey.create<GrpcSequenceInterface>('grpc.sequence');
  export const GRPC_CONTROLLER = 'grpc.controller';
  export const GRPC_METHOD = 'grpc.method';
  export const GRPC_METHOD_NAME = BindingKey.create<string>('grpc.method.name');
  export const GRPC_GENERATOR = 'grpc.generator';
  export const CONTEXT = BindingKey.create<Context>('grpc.context');
  export const HOST = BindingKey.create<string | undefined>('grpc.host');
  export const PORT = BindingKey.create<number | undefined>('grpc.port');
  export const CWD = BindingKey.create<string | undefined>('grpc.cwd');
  export const PROTO_PATTERN = BindingKey.create<string | undefined>('grpc.protoPattern');
  export const PROTO_IGNORES = BindingKey.create<string[] | undefined>('grpc.protoIgnores');
  export const PROTO_OUT_DIR = BindingKey.create<string | undefined>('grpc.protoOutDir');
  export const CERTS = BindingKey.create<GrpcSecureOptions | undefined>('grpc.certs');
}
