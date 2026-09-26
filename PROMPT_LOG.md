# Prompt Log

## Entry 1 - Turning notes into a phased plan
**Prompt:**
> here's my notes for the project:
>
> stock app project notes
>
> i need a full stack app that pulls intraday stock data from yahoo finance and shows it grouped by day. for the stack i'm going with node + typescript (express) for the backend and react + vite + typescript for the frontend, probably recharts for the chart.
>
> the backend should have one endpoint, something like GET /api/stocks/:symbol/daily. it calls yahoo at https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}?interval=15m&range=1mo. It takes the 15 min candles and groups them by day, consider the timezone yahoo gives. for each day, lowAverage is the average of all the lows that day, highAverage is the average of all the highs, and volume is the total volume for the day. round the averages to 4 decimals, and volume is a whole number.
>
> the output has to look exactly like this:
> [ { "day": "2009-01-30", "lowAverage": 40.2958, "highAverage": 49.7534, "volume": 49073348 } ]
>
> Consider edge cases and validation to make sure output is clean. For example, validate the symbol before calling yahoo or errors if yahoo down and more.
>
> the frontend just needs an input box and a button to search a symbol. it should show a table (day, low avg, high avg, volume) and a chart of the averages, with a loading state while fetching and an error message for bad symbols or if the request fails.
>
> Can implement unit tests for the grouping/averaging logic at minimum to make sure app works after updates.
>
> it's an MVP but they said to assume it'll grow, so the structure should make it easy to add more endpoints later.
>
> can you turn this into a proper implementation plan broken into phases? so i can build and test it one step at a time. If something in my notes is unclear or you think i missed something, point it out and ask questions.
> Also create a PROMPT_LOG.md that contains
> A log of the AI prompts you used during this exercise. For each entry
> include:
> The prompt you sent
> A brief note on why you chose that prompt (what were you trying to learn or achieve?)
> What you kept, changed, or rejected from the AI output and why
> leave blanks for where it asks for my input
>
> you can add this prompt log thing into the implementation plan

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 2 - Answering the AI's clarifying questions
**Prompt:**
> Timezone: exchange-local. Symbols: everything Yahoo supports. Nulls: skip null candles, drop all-null days. Extras (cache, FE tests, API tests, README, rate limiting): add these ideas at the end of the MVP, and we can think about implementing them later.

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 3 - Phase 0: Repo setup and prompt log
**Prompt:**
> implement phase 0 from the implementation plan md. only do this phase, don't start the next one. when you're done, tell me what files you made and how to run the check.

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 4 - Phase 1: Backend skeleton
**Prompt:**
> phase 0 is done and working. now implement phase 1. stop after this phase and tell me how to verify it.

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 5 - Phase 2: Grouping logic and unit tests
**Prompt:**
> phase 1 is done and working. now implement phase 2. stop after this phase and tell me how to verify it.

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 6 - Phase 2: Fill gaps in the grouping tests
**Prompt:**
> ok can you check the tests and again and make sure they cover what is needed? For example, I don't see it checking for 0 volume. Look at all the tests again and let me know what you change/added

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 7 - Phase 3: Symbol validation and Yahoo client
**Prompt:**
> phase 2 is done and working. now implement phase 3. stop after this phase and tell me how to verify it.

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 8 - Phase 4: Wire the daily stocks endpoint
**Prompt:**
> phase 3 is done and working. now implement phase 4. stop after this phase and tell me how to verify it.

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____

---

## Entry 9 - Phase 5: Frontend skeleton and API layer
**Prompt:**
> phase 4 is done and working. now implement phase 5. stop after this phase and tell me how to verify it.

**Why I chose this prompt:** _____

**What I kept / changed / rejected and why:** _____
