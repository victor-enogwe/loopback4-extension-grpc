// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, ControllerClass} from '@loopback/core';
import {GrpcSequenceInterface} from './grpc.sequence';
import {GrpcSecureOptions} from './keys';

export declare type ControllerInstance = {
  [name: string]: unknown;
} & object;

export interface GrpcComponentConfig {
  controllers?: ControllerClass<ControllerInstance>[];
  cwd?: string;
  generateProtoTs?: boolean;
  /**
   * glob pattern for proto files, default to `**\/*proto`
   */
  protoPattern?: string;
  /**
   * An array of glob patterns to ignore for proto files,
   * default to ['**\/node_modules\/**]
   */
  protoIgnores?: string[];
  protoOutDir?: string;
  host?: string;
  port?: number;
  sequence?: Constructor<GrpcSequenceInterface>;
  certs?: GrpcSecureOptions;
}

export interface GrpcMethod {
  PROTO_NAME: string;
  PROTO_PACKAGE: string;
  SERVICE_NAME: string;
  METHOD_NAME: string;
  REQUEST_STREAM: boolean;
  RESPONSE_STREAM: boolean;
}
