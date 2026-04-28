import { NextResponse } from "next/server";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!(BigInt.prototype as unknown as Record<string, unknown>).toJSON) {
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function () {
      return String(this);
    },
    writable: true,
    configurable: true,
  });
}

export function success(data: unknown, status = 200) {
  return NextResponse.json({ code: 0, message: "ok", data }, { status });
}

export function error(message: string, status = 400, code = -1) {
  return NextResponse.json({ code, message, data: null }, { status });
}

export function notFound(message = "资源不存在") {
  return error(message, 404);
}

export function paginate(items: unknown[], page: number, pageSize: number, total: number) {
  return success({ items, page, pageSize, total });
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function validate<T>(schema: z.ZodType<T>, data: unknown): { data: T } | { error: NextResponse } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data };
  }
  const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return { error: error(message, 400) };
}
