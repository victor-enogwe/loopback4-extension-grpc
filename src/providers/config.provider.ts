import {Provider} from '@loopback/core';
import {GrpcComponentConfig} from '../types';

export function configProvider(config: GrpcComponentConfig) {
  return class GrpcConfig implements Provider<GrpcComponentConfig> {
    public value(): GrpcComponentConfig {
      return config;
    }
  };
}
