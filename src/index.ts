import { MongoClient } from "mongodb";

const MONGO_URI = "";

const client = new MongoClient(MONGO_URI);

async function main() {
  await client.connect();

  try {
    const started = new Date();

    console.log("executing...");

    const data = await client
      .db("profillic_prod")
      .collection("papers")
      .aggregate([
        {
          $search: {
            index: "papers_search",
            text: {
              query: "self driven car",
              path: ["unique_authors", "entry.title.#", "entry.summary.#"],
            },
            count: {
              type: "total",
            },
          },
        },
        {
          $limit: 10,
        },
        {
          $facet: {
            count: [
              {
                $replaceWith: "$$SEARCH_META.count",
              },
              {
                $limit: 1,
              },
            ],
            data: [
              {
                $limit: 10,
              },
            ],
          },
        },
      ])
      .toArray();

    console.log(
      "Execution time:",
      (new Date().getTime() - started.getTime()) / 1000,
      "seconds"
    );
  } finally {
    await client.close();
  }
}

main();
