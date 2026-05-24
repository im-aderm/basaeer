/**
 * Enterprise-grade table styling utilities for Basaer dashboard.
 * All tables should use these utilities for consistent ERP/SIS-style density.
 *
 * Standard: 12px fonts, compact rows (py-1.5), table-fixed layout,
 * whitespace-nowrap overflow-hidden text-ellipsis, border-primary/20 borders.
 */

// Table root
export const TABLE_ROOT = "w-full border-collapse table-fixed"

// Header
export const TABLE_HEADER = "text-[12px] font-semibold text-primary/80 uppercase tracking-wide bg-primary/5 border-b border-primary/20"
export const TABLE_HEADER_CELL = "px-3 py-2 whitespace-nowrap cursor-pointer select-none hover:bg-primary/10 transition-colors"
export const TABLE_HEADER_CELL_NO_SORT = "px-3 py-2 whitespace-nowrap"

// Body
export const TABLE_BODY = "divide-y divide-primary/20"

// Rows
export const TABLE_ROW = "hover:bg-primary/[0.03] transition-colors"

// Cells
export const TABLE_CELL = "px-3 py-1.5 text-[12px] whitespace-nowrap overflow-hidden text-ellipsis text-foreground/80"
export const TABLE_CELL_PRIMARY = "px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-foreground"
export const TABLE_CELL_ACTIONS = "px-3 py-1.5 text-[12px] whitespace-nowrap text-right"

// Stat cards
export const STAT_CARD = "p-4 rounded-2xl bg-white/75 backdrop-blur-sm border border-primary/20"
export const STAT_LABEL = "text-[12px] font-medium text-foreground/60"
export const STAT_VALUE = "text-[16px] font-bold text-primary"

// Status tabs
export const STATUS_TAB = "px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors"
export const STATUS_TAB_ACTIVE = "bg-primary text-white"
export const STATUS_TAB_INACTIVE = "bg-muted/50 text-foreground/60 hover:bg-muted hover:text-foreground"

// Sort indicator
export const SORT_ICON = "inline-block ml-1 text-[10px] opacity-60"

// Pagination
export const PAGINATION_BAR = "flex items-center justify-between px-3 py-2 border-t border-primary/20"
export const PAGINATION_INFO = "text-[12px] text-foreground/60"
export const PAGINATION_BUTTON = "px-3 py-1 text-[12px] font-medium rounded-md border border-primary/20 hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
export const PAGINATION_BUTTON_ACTIVE = "px-3 py-1 text-[12px] font-medium rounded-md bg-primary text-white"
