import { describe, expect, it } from "vitest";
import { aggregateDaily, round4 } from "../src/domain/aggregateDaily.js";
import { NEW_YORK, TOKYO, series } from "./fixtures.js";

describe("round4", () => {
  it("rounds half-up to 4 decimal places for small values", () => {
    expect(round4(1.00005)).toBe(1.0001);
    expect(round4(1.23454)).toBe(1.2345);
    expect(round4(0.00015)).toBe(0.0002);
  });

  it("rounds realistic stock prices to 4 decimal places", () => {
    expect(round4(187.123449)).toBe(187.1234);
    expect(round4(187.12346)).toBe(187.1235);
    expect(round4(187.33999633789062)).toBe(187.34);
  });
});

describe("aggregateDaily", () => {
  it("groups candles into exchange-local days and averages each day", () => {
    const { timestamps, quote } = series([
      { at: "2024-06-03T14:00:00Z", low: 10, high: 12, volume: 100 },
      { at: "2024-06-03T18:00:00Z", low: 20, high: 24, volume: 50 },
      { at: "2024-06-04T14:00:00Z", low: 30, high: 40, volume: 7 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-06-03", lowAverage: 15, highAverage: 18, volume: 150 },
      { day: "2024-06-04", lowAverage: 30, highAverage: 40, volume: 7 },
    ]);
  });

  it("puts a candle just after midnight UTC on the previous New York day", () => {
    const { timestamps, quote } = series([
      { at: "2024-01-15T20:00:00Z", low: 10, high: 11, volume: 5 },
      { at: "2024-01-16T00:30:00Z", low: 20, high: 21, volume: 7 },
      { at: "2024-01-16T15:00:00Z", low: 30, high: 31, volume: 9 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-01-15", lowAverage: 15, highAverage: 16, volume: 12 },
      { day: "2024-01-16", lowAverage: 30, highAverage: 31, volume: 9 },
    ]);
  });

  it("groups by the given exchange timezone, not New York", () => {
    const { timestamps, quote } = series([
      // 10:00 on June 3 in Tokyo.
      { at: "2024-06-03T01:00:00Z", low: 10, high: 11, volume: 5 },
      // 00:30 on June 4 in Tokyo, but still June 3 in New York and UTC.
      { at: "2024-06-03T15:30:00Z", low: 20, high: 21, volume: 7 },
    ]);

    expect(aggregateDaily(timestamps, quote, TOKYO)).toEqual([
      { day: "2024-06-03", lowAverage: 10, highAverage: 11, volume: 5 },
      { day: "2024-06-04", lowAverage: 20, highAverage: 21, volume: 7 },
    ]);
  });

  it("keeps calendar days correct across a daylight-saving change", () => {
    const { timestamps, quote } = series([
      // 23:30 EST on March 9. A fixed EDT offset would file this on March 10.
      { at: "2024-03-10T04:30:00Z", low: 7, high: 8, volume: 4 },
      // 01:30 EST, still before the spring-forward at 07:00 UTC.
      { at: "2024-03-10T06:30:00Z", low: 1, high: 2, volume: 10 },
      // 03:30 EDT, after the spring-forward.
      { at: "2024-03-10T07:30:00Z", low: 3, high: 4, volume: 10 },
      // 23:30 EDT on March 10, which is already March 11 in UTC.
      { at: "2024-03-11T03:30:00Z", low: 5, high: 6, volume: 10 },
      // 00:30 EDT on March 11. A fixed EST offset would file this on March 10.
      { at: "2024-03-11T04:30:00Z", low: 9, high: 10, volume: 1 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-03-09", lowAverage: 7, highAverage: 8, volume: 4 },
      { day: "2024-03-10", lowAverage: 3, highAverage: 4, volume: 30 },
      { day: "2024-03-11", lowAverage: 9, highAverage: 10, volume: 1 },
    ]);
  });

  it("skips null candles when averaging a day", () => {
    const { timestamps, quote } = series([
      { at: "2024-06-03T14:00:00Z", low: 10, high: 12, volume: 100 },
      { at: "2024-06-03T15:00:00Z", low: null, high: null, volume: null },
      { at: "2024-06-03T16:00:00Z", low: 20, high: null, volume: 50 },
      { at: "2024-06-03T18:00:00Z", low: 30, high: 36, volume: 50 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-06-03", lowAverage: 20, highAverage: 24, volume: 150 },
    ]);
  });

  it("drops a day whose candles are all null", () => {
    const { timestamps, quote } = series([
      { at: "2024-06-03T14:00:00Z", low: 10, high: 12, volume: 100 },
      { at: "2024-06-04T14:00:00Z", low: null, high: null, volume: null },
      { at: "2024-06-04T18:00:00Z", low: null, high: 20, volume: 5 },
      { at: "2024-06-05T14:00:00Z", low: 8, high: 9, volume: 3 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-06-03", lowAverage: 10, highAverage: 12, volume: 100 },
      { day: "2024-06-05", lowAverage: 8, highAverage: 9, volume: 3 },
    ]);
  });

  it("returns an empty list when there are no candles", () => {
    expect(aggregateDaily([], { low: [], high: [], volume: [] }, NEW_YORK)).toEqual([]);
  });

  it("rounds averages to 4 decimal places", () => {
    const { timestamps, quote } = series([
      { at: "2024-06-03T14:00:00Z", low: 1.11111, high: 1.00005, volume: 1 },
      { at: "2024-06-03T18:00:00Z", low: 1.11119, high: 1.00005, volume: 1 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-06-03", lowAverage: 1.1112, highAverage: 1.0001, volume: 2 },
    ]);
  });

  it("keeps a zero-volume candle and does not treat it as null", () => {
    const { timestamps, quote } = series([
      { at: "2024-06-03T14:00:00Z", low: 10, high: 12, volume: 0 },
      { at: "2024-06-03T18:00:00Z", low: 30, high: 36, volume: 50 },
      { at: "2024-06-03T19:00:00Z", low: 99, high: 100, volume: null },
      { at: "2024-06-04T14:00:00Z", low: 8, high: 9, volume: 0 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-06-03", lowAverage: 20, highAverage: 24, volume: 50 },
      { day: "2024-06-04", lowAverage: 8, highAverage: 9, volume: 0 },
    ]);
  });

  it("rounds summed volume to an integer", () => {
    const { timestamps, quote } = series([
      { at: "2024-06-03T14:00:00Z", low: 1, high: 2, volume: 10.4 },
      { at: "2024-06-03T18:00:00Z", low: 1, high: 2, volume: 10.4 },
    ]);

    const [day] = aggregateDaily(timestamps, quote, NEW_YORK);
    expect(day?.volume).toBe(21);
  });

  it("returns days sorted oldest first even when timestamps are not", () => {
    const { timestamps, quote } = series([
      { at: "2024-06-05T14:00:00Z", low: 5, high: 6, volume: 1 },
      { at: "2024-06-03T14:00:00Z", low: 3, high: 4, volume: 1 },
      { at: "2024-06-04T14:00:00Z", low: 4, high: 5, volume: 1 },
    ]);

    expect(aggregateDaily(timestamps, quote, NEW_YORK)).toEqual([
      { day: "2024-06-03", lowAverage: 3, highAverage: 4, volume: 1 },
      { day: "2024-06-04", lowAverage: 4, highAverage: 5, volume: 1 },
      { day: "2024-06-05", lowAverage: 5, highAverage: 6, volume: 1 },
    ]);
  });
});
