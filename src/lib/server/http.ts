import { NextResponse } from "next/server";

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });

export const bad = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export const fail = (e: unknown) => {
  console.error("[api]", e);
  const message = e instanceof Error ? e.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
};

const rand36 = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 36).toString(36)).join("");

export const genId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${rand36(5)}`;

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}
