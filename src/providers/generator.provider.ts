import {Provider} from '@loopback/core';
import {GrpcGenerator as GrpcGen} from '../grpc.generator';
import {GrpcComponentConfig} from '../types';

export function generatorProvider(config: GrpcComponentConfig) {
  const generator = new GrpcGen(config);
  return class GrpcGenerator implements Provider<GrpcGen> {
    public value(): GrpcGen {
      return generator;
    }
  };
}
