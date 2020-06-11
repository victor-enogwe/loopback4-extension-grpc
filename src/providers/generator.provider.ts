// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Provider} from '@loopback/context';
import {GrpcGenerator} from '../grpc.generator';
import {CoreBindings, ApplicationConfig} from '@loopback/core';
/**
 * This provider will return a GRPC TypeScript Generator
 * This can be used to generate typescript files and service declarations
 * from proto files on run time.
 */
export class GeneratorProvider implements Provider<GrpcGenerator> {
  private generator: GrpcGenerator;
  constructor(
    @inject(CoreBindings.APPLICATION_CONFIG)
    protected config: ApplicationConfig,
  ) {
    this.generator = new GrpcGenerator(config.grpc);
  }
  public value(): GrpcGenerator {
    return this.generator;
  }
}
