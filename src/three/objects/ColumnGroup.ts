import { PositionedRow } from "@/layouts/types";
import { T } from "@/utils/functions";
import { Group } from "three";
import { GridGroup, GridGroupUserData } from "./GridGroup";
import createModuleGroup from "./ModuleGroup";
import { UserDataTypeEnum } from "./types";
import { DefaultGetters } from "@/tasks/defaultory";

export type ColumnGroupUserData = {
  type: typeof UserDataTypeEnum.Enum.ColumnGroup;
  columnIndex: number;
  length: number;
  startColumn?: boolean;
  endColumn?: boolean;
};

export class ColumnGroup extends Group {
  userData: ColumnGroupUserData;

  constructor(userData: ColumnGroupUserData) {
    super();
    this.userData = userData;
  }
}

export const createColumnGroup =
  ({
    positionedRows,
    columnIndex,
    startColumn = false,
    endColumn = false,
    ...defaultGetters
    // houseTransformsGroup,
  }: DefaultGetters & {
    positionedRows: PositionedRow[];
    columnIndex: number;
    startColumn?: boolean;
    endColumn?: boolean;
    // houseTransformsGroup: HouseTransformsGroup;
  }): T.Task<ColumnGroup> =>
  async () => {
    const gridGroups = await (async function () {
      const gridGroups: Array<GridGroup> = [];

      for (const { positionedModules, y, levelIndex } of positionedRows) {
        let length = 0;

        const gridGroupUserData: GridGroupUserData = {
          type: UserDataTypeEnum.Enum.GridGroup,
          levelIndex,
          length,
          height: positionedModules[0].module.height,
        };

        const gridGroup = new GridGroup(gridGroupUserData);

        for (const {
          z,
          module,
          moduleIndex: gridGroupIndex,
        } of positionedModules) {
          const moduleGroup = await createModuleGroup({
            module,
            gridGroupIndex,
            z,
            flip: endColumn,
            ...defaultGetters,
          });

          gridGroup.position.setY(y);
          gridGroup.add(moduleGroup);

          length += module.length;
        }

        gridGroup.userData = gridGroupUserData;

        gridGroups.push(gridGroup);
      }
      return gridGroups;
    })();

    const columnGroupUserData: ColumnGroupUserData = {
      type: UserDataTypeEnum.Enum.ColumnGroup,
      columnIndex,
      length: positionedRows[0].rowLength,
      startColumn,
      endColumn,
    };

    const columnGroup = new ColumnGroup(columnGroupUserData);

    columnGroup.add(...gridGroups);

    return columnGroup as ColumnGroup;
  };

// export const createColumnGroups = ({
//   systemId,
//   houseId,
//   houseLayout,
//   houseTransformsGroup,
// }: {
//   systemId: string;
//   houseId: string;
//   houseTransformsGroup: HouseTransformsGroup;
//   houseLayout: ColumnLayout;
// }): T.Task<ColumnGroup[]> =>
//   pipe(
//     houseLayout,
//     A.traverseWithIndex(T.ApplicativeSeq)(
//       (i, { positionedRows, z, columnIndex }) => {
//         const startColumn = i === 0;
//         const endColumn = i === houseLayout.length - 1;

//         const task = createColumnGroup({
//           systemId,
//           houseId,
//           positionedRows,
//           startColumn,
//           endColumn,
//           columnIndex,
//           houseTransformsGroup,
//         });

//         return pipe(
//           task,
//           T.map(columnGroup => {
//             columnGroup.position.set(0, 0, z);
//             return columnGroup;
//           })
//         );
//       }
//     )
//   );
