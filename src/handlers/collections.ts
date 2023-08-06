import {
  ColumnInfo,
  ColumnType,
  SchemaResponse,
  TableInfo,
} from "@hasura/dc-api-types";
import { Config } from "../config";

import { getQdrantClient } from "../qdrant";

const builtInProperties: ColumnInfo[] = [
  {
    name: "id",
    nullable: false,
    type: "uuid",
    insertable: true,
  },
  {
    name: "payload",
    nullable: false,
    type: "object",
    insertable: true,
  },
  {
    name: "vector",
    nullable: true,
    insertable: true,
    // type: { element_type: "number", nullable: false, type: "array" },
    type: "vector",
  },
];
export const builtInPropertiesKeys = builtInProperties.map((p) => p.name);

export async function getSchema(config: Config): Promise<SchemaResponse> {
  const qdrantClient = getQdrantClient(config);

  const schema = await qdrantClient.getCollections();
  // note: we may run into issues if there is a class <X> and a class <X>Properties
  return {
    tables: schema.collections!.map((c): TableInfo => {
      const columns: ColumnInfo[] = [
        // built-in properties will override any custom properties with the same name
        ...builtInProperties,
      ];

      return {
        name: [c.name!],
        updatable: true,
        insertable: true,
        deletable: true,
        type: "table",
        columns,
        primary_key: ["id"],
      };
    }),
  };
}
