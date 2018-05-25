// @flow

export type ContentFetcher<DataType> = () => Promise<DataType>;
