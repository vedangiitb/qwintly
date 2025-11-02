import { Tiktoken } from "@dqbd/tiktoken/lite";
import registry from "@dqbd/tiktoken/registry.json";
import models from "@dqbd/tiktoken/model_to_encoding.json";

// The purpose of this file is to get number of tokens in request response

// fetch wasm manually
const wasm = await fetch("/tiktoken/tiktoken_bg.wasm");
const wasmBuffer = await wasm.arrayBuffer();

export const countTextTokens = await (Tiktoken as any).fromRegistry(
  registry,
  models,
  new Uint8Array(wasmBuffer)
);
