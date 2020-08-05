// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, inject, CoreBindings, Application, config as configuration} from '@loopback/core';
import {ControllerClass, Server as LbServer, Context} from '@loopback/core';
import {MetadataInspector} from '@loopback/metadata';
import {
  Server as RpcServer,
  ServerUnaryCall,
  ServerCredentials,
  ServiceDefinition,
  handleUnaryCall,
  GrpcObject,
  Server,
} from '@grpc/grpc-js';
import {GRPC_METHODS} from './decorators/grpc.decorator';
import {GrpcGenerator} from './grpc.generator';
import {GrpcBindings, GrpcSecureOptions} from './keys';
import {GrpcMethod, GrpcComponentConfig} from './types';

import debugFactory from 'debug';
import {GrpcSequence} from './grpc.sequence';
const debug = debugFactory('loopback:grpc');

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This Class provides a LoopBack Server implementing gRPC
 */
export class GrpcServer extends Context implements LbServer {
  protected _listening = false;
  protected server: RpcServer = new Server();
  protected generator: GrpcGenerator;
  protected host: string;
  protected port: number;
  protected secureOptions?: GrpcSecureOptions;

  /**
   * @memberof GrpcServer
   * Creates an instance of GrpcServer.
   *
   * @param app - The application instance (injected via
   * CoreBindings.APPLICATION_INSTANCE).
   * @param server - The actual GRPC Server module (injected via
   * @param options - The configuration options (injected via
   *
   */
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) protected app: Application,
    @configuration('config') protected rpcConfig: GrpcComponentConfig,
  ) {
    super(app);
    // Bind host, port, certs, proto path, package and sequence
    this.host = rpcConfig.host ?? '127.0.0.1';
    this.port = rpcConfig.port ?? 3000;
    this.secureOptions = rpcConfig.certs;
    this.generator = new GrpcGenerator(rpcConfig);
    this.bind(GrpcBindings.GRPC_SEQUENCE).toClass(rpcConfig.sequence ?? GrpcSequence);
    this.migrateSchema();
  }

  public get listening() {
    return this._listening;
  }

  public set listening(value: boolean) {
    this._listening = value;
  }

  migrateSchema() {
    // Execute TypeScript Generator. (Must be first one to load)
    this.generator.execute();
    for (const b of this.find('controllers.*')) {
      const controllerName = b.key.replace(/^controllers\./, '');
      const ctor = b.valueConstructor;
      if (!ctor) throw new Error(`The controller ${controllerName} was not bound via .toClass()`);
      this._setupControllerMethods(ctor);
    }
  }

  async start(): Promise<void> {
    let creds = ServerCredentials.createInsecure();
    if (this.secureOptions !== undefined) {
      const {rootCerts, keyCertPairs, checkClientCertificate} = this.secureOptions;
      creds = ServerCredentials.createSsl(rootCerts, keyCertPairs, checkClientCertificate);
    }
    const host = `${this.host}:${this.port}`;
    await new Promise((resolve, reject) => this.server.bindAsync(host, creds, (error, port) => (error ? reject(error) : resolve(port))));
    this.server.start();
    this.listening = true;
  }

  async stop(): Promise<void> {
    this.server.forceShutdown();
    this.listening = false;
  }

  private _setupControllerMethods(ctor: ControllerClass) {
    const controllerMethods = MetadataInspector.getAllMethodMetadata<GrpcMethod>(GRPC_METHODS, ctor.prototype) ?? {};
    const services = new Map<ServiceDefinition<any>, {[method: string]: handleUnaryCall<ServerUnaryCall<any, any>, any>}>();

    for (const methodName in controllerMethods) {
      const config = controllerMethods[methodName];
      debug('Config for method %s', methodName, config);

      const proto: GrpcObject = this.generator.getProto(config.PROTO_NAME);
      debug('Proto for %s', config.PROTO_NAME, proto);

      if (!proto) throw new Error(`Grpc Server: No proto file was provided.`);

      const pkgMeta = proto[config.PROTO_PACKAGE] as GrpcObject;
      debug('Package for %s', config.PROTO_PACKAGE, pkgMeta);

      const serviceMeta = pkgMeta[config.SERVICE_NAME] as any;
      debug('Service for %s', config.SERVICE_NAME, serviceMeta);

      const serviceDef: ServiceDefinition<any> = serviceMeta.service;
      if (!services.has(serviceDef)) {
        services.set(serviceDef, {
          [config.METHOD_NAME]: this.setupGrpcCall(ctor, methodName),
        });
      } else {
        const methods = services.get(serviceDef)!;
        methods[config.METHOD_NAME] = this.setupGrpcCall(ctor, methodName);
      }
    }

    for (const [service, methods] of services.entries()) {
      if (debug.enabled) {
        debug('Adding service:', service, Object.keys(methods));
      }
      this.server.addService(service, methods);
    }
  }
  /**
   * Set up gRPC call
   * @param prototype
   * @param methodName
   */
  private setupGrpcCall<T>(ctor: ControllerClass, methodName: string): handleUnaryCall<ServerUnaryCall<any, any>, any> {
    return (call: ServerUnaryCall<any, any>, callback: (err: any, value?: T) => void) => {
      const handleUnary = async (): Promise<T> => {
        this.bind(GrpcBindings.CONTEXT).to(this);
        this.bind(GrpcBindings.GRPC_CONTROLLER).toClass(ctor).inScope(BindingScope.SINGLETON);
        this.bind(GrpcBindings.GRPC_METHOD_NAME).to(methodName);
        const sequence = await this.get<GrpcSequence>(GrpcBindings.GRPC_SEQUENCE);
        return sequence.unaryCall(call);
      };

      return handleUnary()
        .then((result) => callback(null, result))
        .catch((error) => callback(error));
    };
  }
}
