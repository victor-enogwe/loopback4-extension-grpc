// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, ProviderMap, Server, CoreBindings, Application, ServiceOrProviderClass} from '@loopback/core';
import {inject, Constructor} from '@loopback/core';
import {GrpcBindings} from './keys';
import {GrpcServer} from './grpc.server';
import {GrpcSequence} from './grpc.sequence';
import {GrpcComponentConfig} from './types';
import {ServerProvider} from './providers/server.provider';
import {GrpcGenerator} from './grpc.generator';
/**
 * Grpc Component for LoopBack 4.
 */
export class GrpcComponent implements Component {
  /**
   * Export GrpcProviders
   */
  providers: ProviderMap = {
    [GrpcBindings.GRPC_SERVER.toString()]: ServerProvider,
  };
  /**
   * Export Grpc Server
   */
  servers: {[name: string]: Constructor<Server>} = {
    GrpcServer,
  };

  services: ServiceOrProviderClass[] = [GrpcGenerator];

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
