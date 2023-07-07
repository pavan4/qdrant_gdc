import { Config } from "./config";
import { QdrantClient } from "@qdrant/js-client-rest";

export function getQdrantClient(config: Config) {
  
  return new QdrantClient({url: config.scheme + "://" + config.host});
}
