import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Poem {
    id: bigint;
    title: string;
    content: string;
    dateCreated: Time;
    author: string;
}
export type Time = bigint;
export interface backendInterface {
    getAllPoems(): Promise<Array<Poem>>;
    getPoemById(id: bigint): Promise<Poem>;
    submitPoem(title: string, content: string, author: string): Promise<void>;
}
