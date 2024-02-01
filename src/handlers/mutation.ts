import {
    ColumnInsertFieldValue,
  MutationRequest,
  MutationResponse,
  QueryRequest,
  QueryResponse,
} from "@hasura/dc-api-types";
import { Config } from "../config";
import def from "ajv/dist/vocabularies/discriminator";
import { builtInPropertiesKeys } from "./collections";
import { getQdrantClient } from "../qdrant";
import { executeQueryById } from "./query";

export async function executeMutation(
  mutation: MutationRequest,
  config: Config
): Promise<MutationResponse> {
  const response: MutationResponse = {
    operation_results: [],
  };
  const qdrantClient = getQdrantClient(config);
  
  for (const operation of mutation.operations) {

    switch (operation.type) {
      case "insert":
        // construct list of points
        let points: any = [];
        for (const row of operation.rows) {
          points.push({
            id: Number(row.id),
            vector: JSON.parse(row.vector as string),
            payload: JSON.parse(row.payload as string),
          });
        }

        await qdrantClient.upsert(operation.table[0], {points: points});
        response.operation_results.push({
          affected_rows: operation.rows.length,
        });
        break;
      case "delete":
        break;
    }
  }
  return response;
}
