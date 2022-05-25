type Stream = ReadableStream | WritableStream | TransformStream | AsyncGenerator<any>;

declare module "pipeline-fp-utils" {
    function map(g: Stream): Stream;
    function mergeObjects(g: Stream): Stream;
    function toJsonLine(g: Stream): Stream;
    function tap(g: Stream): Stream;
    function fromCallback(g: Stream): Stream;
    function filter(g: Stream): Stream;
    function fromArray(g: Array<any>): Stream;
}