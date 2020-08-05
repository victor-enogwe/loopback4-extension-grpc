// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, ProviderMap, Server, CoreBindings, Application} from '@loopback/core';
import {inject, Constructor} from '@loopback/core';
import {GrpcServer} from './grpc.server';
import {GrpcComponentConfig} from './types';

/**
 * Grpc Component for LoopBack 4.
 */
export class GrpcComponent implements Component {
  /**
   * Export GrpcProviders
   */
  providers: ProviderMap;
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
    for (const serverKey in this.servers) {
      app.configure(`servers.${serverKey}`).to({config});
    }
  }
}
