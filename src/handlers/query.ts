import {
  Query,
  QueryRequest,
  QueryResponse,
} from "@hasura/dc-api-types";
import { Config } from "../config";
import { builtInPropertiesKeys } from "./collections";
import { getQdrantClient } from "../qdrant";

export async function executeQuery(
  query: QueryRequest,
  config: Config
): Promise<QueryResponse> {
  if (query.type !== "table") {
    throw new Error("Only table requests are supported");
  }
  // handle requests by primary key
  if (
    query.query.where?.type === "binary_op" &&
    query.query.where.operator === "equal" &&
    query.query.where.column.name === "id" &&
    query.query.where.value.type === "scalar"
  ) {
    return executeQueryById(
      query.query.where.value.value,
      query.table[0],
      query.query,
      config
    );
  }
  else {
    return executeQueryAll(
      query.table[0],
      query.query,
      config
    );
  }
}

async function executeQueryAll(table: string, query: Query, config: Config) {
  const qdrantClient = getQdrantClient(config);
  const response = await qdrantClient.scroll(table, {
    with_vector: true,
    with_payload: true,
  });
  const rows = response.points.map((row: any) =>
    Object.fromEntries(
      Object.entries(query.fields!).map(([alias, field], index) => {
        if (
          field.type === "column" &&
          builtInPropertiesKeys.includes(field.column)
        ) {
          const value = row[alias as keyof typeof row];
          return [alias, value];
        }
        const value = row[alias as keyof typeof row];
        return [alias, value];
      })
    )
  );
  return { rows };
}

  

async function executeQueryById(
  id: string,
  table: string,
  query: Query,
  config: Config
) {
  const qdrantClient = getQdrantClient(config);
  let withVector = false;
  if (query.fields && "vector" in query.fields) {
    withVector = true;
  }

  const response = await qdrantClient.retrieve(table, {
    ids: [expressionQueryType(query)],
    with_vector: withVector,
    with_payload: true,
  });

  return {
    rows: [
      Object.fromEntries(
        Object.entries(query.fields!).map(([alias, field]) => {
          if (field.type === "column") {
            if (builtInPropertiesKeys.includes(field.column)) {
                const value = response[0][field.column as keyof typeof response[0]];
                return [alias, value];
            }
          } else if (field.type === "array" && field.field.type === "column") {
            if (builtInPropertiesKeys.includes(field.field.column)) {
              // return [
              //   alias,
              //   response[field.field.column as keyof typeof response],
              // ];
            }
          }
          throw new Error(`field of type ${field.type} not supported`);
        })
      ) as Record<string, QueryResponse>, // assertion not safe, but necessary. I hate typescript
    ],
  };
}


function expressionQueryType(query: any){
  console.log(query);
  switch (query.where.value.value_type) {
    case "uuid":
      return Number(query.where.value.value);
    default:
      throw new Error(`Unknown scalar type: ${query.where.value.value_type}`);
  }
}
