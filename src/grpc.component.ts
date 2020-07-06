// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, ProviderMap, Server, CoreBindings, Application} from '@loopback/core';
import {inject, Constructor} from '@loopback/context';
import {GrpcBindings} from './keys';
import {GrpcServer} from './grpc.server';
import {GrpcSequence} from './grpc.sequence';
import {GeneratorProvider} from './providers/generator.provider';
import {GrpcComponentConfig} from './types';
import {ServerProvider} from './providers/server.provider';
/**
 * Grpc Component for LoopBack 4.
 */
export class GrpcComponent implements Component {
  /**
   * Export GrpcProviders
   */
  providers: ProviderMap = {
    [GrpcBindings.GRPC_SERVER.toString()]: ServerProvider,
    [GrpcBindings.GRPC_GENERATOR.toString()]: GeneratorProvider,
  };
  /**
   * Export Grpc Server
   */
  servers: {[name: string]: Constructor<Server>} = {
    GrpcServer,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(CoreBindings.APPLICATION_CONFIG.deepProperty('grpc')) config: GrpcComponentConfig,
  ) {
    // Bind host, port, certs, proto path, package and sequence
    app.bind(GrpcBindings.HOST).to(config.host ?? '127.0.0.1');
    app.bind(GrpcBindings.PORT).to(config.port ?? 3000);
    app.bind(GrpcBindings.PROTO_PATTERN).to(config.protoPattern);
    app.bind(GrpcBindings.PROTO_IGNORES).to(config.protoIgnores);
    app.bind(GrpcBindings.PROTO_OUT_DIR).to(config.protoOutDir);
    app.bind(GrpcBindings.CWD).to(config.cwd ?? process.cwd());
    app.bind(GrpcBindings.CERTS).to(config.certs);
    app.bind(GrpcBindings.GRPC_SEQUENCE).toClass(config.sequence ?? GrpcSequence);
  }
}
