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
    name: "creationTimeUnix",
    nullable: false,
    type: "int",
  },
  {
    name: "lastUpdateTimeUnix",
    nullable: false,
    type: "int",
  },
  {
    name: "vector",
    nullable: true,
    insertable: true,
    // type: { element_type: "number", nullable: false, type: "array" },
    type: "vector",
  },
];

export async function getSchema(config: Config): Promise<SchemaResponse> {
  const qdrantClient = getQdrantClient(config);

  const schema = await qdrantClient.getCollections();
  console.log("schema", schema.collections[0]);
  // note: we may run into issues if there is a class <X> and a class <X>Properties
  return {
    tables: schema.collections!.map((c): TableInfo => {
      const columns: ColumnInfo[] = [];
    //   [
    //     ...c.properties!.map((p) => ({
    //       name: p.name!,
    //       nullable: true,
    //       insertable: true,
    //       updatable: true,
    //       type: (p.dataType!),
    //     })),
    //     // built-in properties will override any custom properties with the same name
    //     ...builtInProperties,
    //   ];

      return {
        name: [c.name!],
        description: c.name, // TODO
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
