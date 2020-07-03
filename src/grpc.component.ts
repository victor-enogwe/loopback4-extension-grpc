// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, ProviderMap, Server, CoreBindings, Application, ApplicationConfig} from '@loopback/core';
import {inject, Constructor} from '@loopback/context';
import {GrpcBindings} from './keys';
import {ServerProvider} from './providers/server.provider';
import {GrpcServer} from './grpc.server';
import {GrpcSequence} from './grpc.sequence';
import {GeneratorProvider} from './providers/generator.provider';
import {GrpcService} from './types';
/**
 * Grpc Component for LoopBack 4.
 */
export class GrpcComponent implements Component {
  static namespace?: string;
  /**
   * Export GrpcProviders
   */
  providers: ProviderMap = {
    [GrpcBindings.GRPC_SERVER.toString()]: ServerProvider,
    [GrpcBindings.GRPC_GENERATOR]: GeneratorProvider,
  };
  /**
   * Export Grpc Server
   */
  servers: {[name: string]: Constructor<Server>} = {
    GrpcServer,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(CoreBindings.APPLICATION_CONFIG, {optional: true}) config: ApplicationConfig,
  ) {
    const configuration: GrpcService = GrpcComponent.namespace ? config.grpc[GrpcComponent.namespace] : config.grpc;
    // Bind host, port, certs, proto path, package and sequence
    app.bind(GrpcBindings.HOST).to(configuration.host ?? '127.0.0.1');
    app.bind(GrpcBindings.PORT).to(configuration.port ?? 3000);
    app.bind(GrpcBindings.PROTO_PATTERN).to(configuration.protoPattern);
    app.bind(GrpcBindings.PROTO_IGNORES).to(configuration.protoIgnores);
    app.bind(GrpcBindings.PROTO_OUT_DIR).to(configuration.protoOutDir);
    app.bind(GrpcBindings.CWD).to(configuration.cwd ?? process.cwd());
    app.bind(GrpcBindings.CERTS).to(configuration.certs);
    app.bind(GrpcBindings.GRPC_SEQUENCE).toClass(configuration.sequence ?? GrpcSequence);
  }
}
