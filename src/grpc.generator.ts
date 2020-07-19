// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {execSync} from 'child_process';
import * as glob from 'glob';
import {loadSync} from '@grpc/proto-loader';
import {GrpcObject, loadPackageDefinition} from '@grpc/grpc-js';
import {dirname, resolve} from 'path';
import {GrpcComponentConfig} from './types';
import {inject, CoreBindings} from '@loopback/core';

/**
 * GRPC TypeScript generator.
 * This class will iterate over a directory generating
 * corresponding typescript files from proto files.
 * Required for `@grpc` configuration and strict development.
 */
export class GrpcGenerator {
  /**
   * proto instances directory loaded during
   * boot time and later being used by implemented grpc
   * controllers.
   */
  private protos: {[name: string]: GrpcObject} = {};
  /**
   * @param - config
   */
  constructor(@inject(CoreBindings.APPLICATION_CONFIG.deepProperty('grpc')) protected config: GrpcComponentConfig) {}

  /**
   * This method will find and load all protos
   * contained within the project directory. Saving in memory
   * instances for those found protos for later usage.
   *
   * @returns {void}
   * @memberof GrpcGenerator
   */
  public execute(): void {
    this.getProtoPaths().forEach((protoPath: string) => {
      const protoName: string = protoPath.split('/').pop() ?? '';
      this.protos[protoName] = this.loadProto(protoPath);
      this.generate(protoPath);
    });
  }

  /**
   * This method will return a proto instance
   * from the proto list directory, previously loaded during
   * boot time.
   *
   * @param name
   *
   */
  public getProto(name: string): GrpcObject {
    return this.protos[name];
  }

  /**
   * This method receive a proto file path and
   * load that proto using the official grpc library.
   *
   * @param {string} protoPath
   * @returns {GrpcObject}
   * @memberof GrpcGenerator
   */
  public loadProto(protoPath: string): GrpcObject {
    const packageDef = loadSync(protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const proto = loadPackageDefinition(packageDef);
    return proto;
  }

  /**
   * This method will getProtoPaths a directory look ahead and
   * typescript files generations from found proto files.
   *
   * @returns {string[]}
   * @memberof GrpcGenerator
   */
  public getProtoPaths(): string[] {
    const pattern = this.config.protoPattern ?? '**/*.proto';
    const ignores = this.config.protoIgnores ?? ['**/node_modules/**'];
    const options: glob.IOptions = {
      cwd: this.config.cwd ?? process.cwd(),
      ignore: ignores,
      nodir: true,
      absolute: true,
    };
    return glob.sync(pattern, options);
  }

  /**
   * This method will generate a typescript
   * file representing the provided proto file by calling
   * google's proto compiler and using `@mean-experts`'s
   * protoc-ts plugin.
   *
   * @private
   * @param {string} proto
   * @returns {Buffer}
   * @memberof GrpcGenerator
   */
  private generate(proto: string): Buffer {
    const root = dirname(proto);
    const outDir = this.config.protoOutDir ?? root;
    const isWin = process.platform === 'win32';
    const compilers = resolve(__dirname, '../', 'compilers');
    const protoc = `${compilers}/${process.platform}/bin/protoc${isWin ? '.exe' : ''}`;
    const protocGen = require.resolve(`@mean-expert/protoc-ts/bin/protoc-gen-ts${isWin ? '.cmd' : ''}`);
    return execSync(`${protoc} --plugin=protoc-gen-ts=${protocGen} --ts_out service=true:${outDir} -I ${root} ${proto}`);
  }
}
