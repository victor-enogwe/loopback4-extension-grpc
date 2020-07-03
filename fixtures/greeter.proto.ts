export namespace Greeter {
  /**
   * @interface Greeter.Service
   * @description Greeter interface that provides types
   * for methods from the given gRPC Greeter Service.
   */
  export interface Service {
    /**
     * @method Greeter.Service.sayHello
     * @description Greeter method declaration * from the given gRPC Greeter service.
     */
    sayHello(request: HelloRequest): Promise<HelloReply>;
    /**
     * @method Greeter.Service.sayTest
     * @description Greeter method declaration * from the given gRPC Greeter service.
     */
    sayTest(request: TestRequest): Promise<TestReply>;
  }
  /**
   * @namespace Greeter.SayHello
   * @description Greeter method configuration * from the given gRPC Greeter service.
   */
  export namespace SayHello {
    export const PROTO_NAME: string = 'greeter.proto';
    export const PROTO_PACKAGE: string = 'greeterpackage';
    export const SERVICE_NAME: string = 'Greeter';
    export const METHOD_NAME: string = 'SayHello';
    export const REQUEST_STREAM: boolean = false;
    export const RESPONSE_STREAM: boolean = false;
  }
  /**
   * @namespace Greeter.SayTest
   * @description Greeter method configuration * from the given gRPC Greeter service.
   */
  export namespace SayTest {
    export const PROTO_NAME: string = 'greeter.proto';
    export const PROTO_PACKAGE: string = 'greeterpackage';
    export const SERVICE_NAME: string = 'Greeter';
    export const METHOD_NAME: string = 'SayTest';
    export const REQUEST_STREAM: boolean = false;
    export const RESPONSE_STREAM: boolean = false;
  }
}
/**
 * @interface HelloRequest
 * @description HelloRequest interface that provides properties
 * and typings from the given gRPC HelloRequest Message.
 */
export interface HelloRequest {
  name: string;
}
/**
 * @interface HelloReply
 * @description HelloReply interface that provides properties
 * and typings from the given gRPC HelloReply Message.
 */
export interface HelloReply {
  message: string;
}
/**
 * @interface TestRequest
 * @description TestRequest interface that provides properties
 * and typings from the given gRPC TestRequest Message.
 */
export interface TestRequest {
  name: string;
}
/**
 * @interface TestReply
 * @description TestReply interface that provides properties
 * and typings from the given gRPC TestReply Message.
 */
export interface TestReply {
  message: string;
}
