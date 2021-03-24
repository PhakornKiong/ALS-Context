declare namespace NodeJS {
  interface Process {
    namespace: Record<string, unknown>;
  }
}
