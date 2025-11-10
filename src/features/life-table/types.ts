export interface User {
  weeksLived: number;
  totalWeeks: number;
}

export interface LifeTableProps {
  user: User;
}

export interface TableData {
  totalRows: number;
  currentWeekRow: number;
  rowHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  fullWidth: number;
  fullHeight: number;
}

export interface LifeTableCanvasProps {
  user: User;
  tableData: TableData;
}
