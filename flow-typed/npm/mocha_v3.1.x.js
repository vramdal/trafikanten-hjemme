// flow-typed signature: 5f3dd89c049243ddb5d45e60e5615827
// flow-typed version: d0062bf209/mocha_v3.1.x/flow_>=v0.22.x

type TestFunction = ((done: (error?: any) => void) => void | Promise<mixed>);

//noinspection ES6ConvertVarToLetConst
declare var describe : {
    (name:string, spec:() => void): void;
    only(description:string, spec:() => void): void;
    skip(description:string, spec:() => void): void;
    timeout(ms:number): void;
};

//noinspection ES6ConvertVarToLetConst,JSUnusedGlobalSymbols
declare var context : typeof describe;

//noinspection ES6ConvertVarToLetConst
declare var it : {
    (name:string, spec?:TestFunction): void;
    only(description:string, spec:TestFunction): void;
    skip(description:string, spec:TestFunction): void;
    timeout(ms:number): void;
};

//noinspection JSUnusedGlobalSymbols
declare function before(method : TestFunction):void;
//noinspection JSUnusedGlobalSymbols
declare function beforeEach(method : TestFunction):void;
//noinspection JSUnusedGlobalSymbols
declare function after(method : TestFunction):void;
//noinspection JSUnusedGlobalSymbols
declare function afterEach(method : TestFunction):void;
