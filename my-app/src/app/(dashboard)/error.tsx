"use client";

export default function Error({ reset }: { reset: () => void }) {
  return <section className="panel"><h1>Couldn’t load this page</h1><button className="button" onClick={reset}>Try again</button></section>;
}
