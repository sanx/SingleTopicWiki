Single Article Wiki System
====

Requirements
----

Node.js >= 0.11 (for support for JS generators, which we use for cleaner asynchronous complexity handling).

Quick start
----

    cd ~
    git clone https://github.com/sanx/SingleTopicWiki.git
    cd SingleTopicWiki
    npm install
    node --harmony index.js

Once you complete the steps above, you will have an instance of the Wiki running locally.
The supported endpoints can be tested with these `curl` commands:

Read article:

`curl "http://localhost:3000/Latest_plane_crash"`

Write article:

`curl -d '<html><body><h1>updated content</h1></body></html>' "http://localhost:3000/Latest_plane_crash"`


Design
----

The system was designed around the following constraints:

*   The article should be persisted as a regular file on the file system.

The system is designed for maximum throughput by means of the following design decisions:

*   The contents of the article are cached in memory on the server, with a global TTL/TimeToRefresh setting to ensure freshness.
*   Koa server is used, which uses generators, and the functionality to persist data is implemented using Q promises, which is
    easy to follow/understand. Koa can use promises as generators by means of the `co` library, and that buys us higher concurrency
    with concise code.

Next steps (most important to least important)
----

*   Write stress/functional test suite
*   Write unit test suite
*   Invoke expensive function to simulate data massage on every request and re-run stress tests
*   Implement user authentication for writes
